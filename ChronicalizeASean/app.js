/* ChronicalizeASean – client-side timeline */

const CONFIG = {
  CLIENT_ID: '423584880836-r8jfae1q0e84j94elnriakohr5b9to9m.apps.googleusercontent.com',
  SPREADSHEET_ID: localStorage.getItem('timeline_sheet_id') || '',
  // Single spreadsheet — events live in named tabs, people in the 'People' tab of the same file.
  // PEOPLE_SPREADSHEET_ID is intentionally removed; use CONFIG.SPREADSHEET_ID for everything.
  SHEET_NAME: localStorage.getItem('timeline_sheet_tab') || 'Western canon',
  PEOPLE_SHEET_NAME: localStorage.getItem('timeline_people_tab') || 'People',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
  TIMELINE_PADDING: 72,
  AXIS_Y: 160,
  SVG_HEIGHT: 340,
  ZOOM_STEP: 0.25,
  ZOOM_MIN: 0.3,
  ZOOM_MAX: 6,
};

const EVENT_SCHEMA = [
  { key: 'id',          required: false, meaning: 'Stable unique id. Leave blank on new rows; the app fills a UUID.' },
  { key: 'version',     required: false, meaning: 'Integer, default 1. Bump if you care about merge conflicts.' },
  { key: 'parent_id',   required: false, meaning: 'id of the parent event. Leave blank for a root event. Enables unlimited-depth sub-events (e.g. Roman Empire → Punic Wars → Battle of Zama).' },
  { key: 'event_name',  required: true,  meaning: 'Short title shown on the timeline and in the detail panel.' },
  { key: 'date_start',  required: true,  meaning: 'YYYY-MM-DD (or YYYY/MM/DD). BCE: leading minus, e.g. -0753-04-21.' },
  { key: 'date_end',    required: false, meaning: 'YYYY-MM-DD if the event has duration (a war, an empire). Leave blank for a point.' },
  { key: 'description', required: false, meaning: 'What happened. Shows in the panel and popover.' },
  { key: 'sources',     required: false, meaning: 'URL or citation. Clicking the title opens this.' },
  { key: 'image_url',   required: false, meaning: 'Direct image URL for the popover.' },
  { key: 'emoji',       required: false, meaning: 'Marker on the axis. Default 📌.' },
  { key: 'category',    required: false, meaning: 'War, Law, Empire, Revolution, etc. Colors the marker.' },
  { key: 'tags',        required: false, meaning: 'Space-separated #hashtags. Shared tags draw connection lines.' },
  { key: 'people',      required: false, meaning: 'Space-separated @handles of people involved (e.g. @julius_caesar @augustus). Links to People sheet records.' },
  { key: 'location',    required: false, meaning: 'Free-text place name (city, region, empire). Used for filtering and display.' },
  { key: 'importance',  required: false, meaning: '1–10. Bigger emoji = more important. Default 5.' },
];
const PEOPLE_SCHEMA = [
  { key: 'id',          required: false, meaning: 'Stable unique id. Auto-filled if blank.' },
  { key: 'handle',      required: false, meaning: 'Lowercase @handle used to link this person from event people fields (e.g. julius_caesar → @julius_caesar). Auto-derived from name if blank.' },
  { key: 'name',        required: true,  meaning: 'Person’s name as you want it listed.' },
  { key: 'date_birth',  required: false, meaning: 'YYYY-MM-DD. BCE uses a leading minus.' },
  { key: 'date_death',  required: false, meaning: 'YYYY-MM-DD. Blank if still living or unknown.' },
  { key: 'role',        required: false, meaning: 'Monarch, general, jurist, philosopher, etc.' },
  { key: 'event_ids',   required: false, meaning: 'Comma-separated event id values this person is tied to (legacy; prefer @handle links in events).' },
  { key: 'nationality', required: false, meaning: 'Country, empire, or civilisation (e.g. Roman, Macedonian, British).' },
  { key: 'description', required: false, meaning: 'Why they matter on this timeline.' },
  { key: 'sources',     required: false, meaning: 'URL or citation.' },
  { key: 'image_url',   required: false, meaning: 'Direct image URL.' },
  { key: 'emoji',       required: false, meaning: 'Optional marker.' },
  { key: 'tags',        required: false, meaning: 'Space-separated #hashtags.' },
];
const FIELDS = EVENT_SCHEMA.map(c => c.key);
const PEOPLE_FIELDS = PEOPLE_SCHEMA.map(c => c.key);

// Produces the human-readable header row written to row 1 of each sheet.
// * = required (must fill in)    (auto) = app fills this, leave blank when adding rows manually
// Date fields include the format so users know what to type.
// normalizeHeaderCell() strips all suffixes when reading back, so these labels are safe.
function schemaHeader(schema) {
  return schema.map(c => {
    let label = c.key;
    if (c.required) {
      label += ' *';          // required — must fill in
    } else if (['id', 'version'].includes(c.key)) {
      label += ' (auto)';     // auto-filled by the app — leave blank
    } else if (c.key === 'date_start' || c.key === 'date_end' || c.key === 'date_birth' || c.key === 'date_death') {
      label += ' (YYYY-MM-DD)'; // format reminder for date columns
    } else if (c.key === 'parent_id') {
      label += ' (id of parent event)';
    } else if (c.key === 'people') {
      label += ' (@handle1 @handle2)';
    } else if (c.key === 'tags') {
      label += ' (#tag1 #tag2)';
    } else if (c.key === 'importance') {
      label += ' (1-10)';
    } else if (c.key === 'handle') {
      label += ' (auto)';     // auto-derived from name if blank
    }
    return label;
  });
}
function normalizeHeaderCell(h) {
  return String(h || '').trim().toLowerCase().replace(/\s*\*+\s*$/, '').replace(/\s+/g, '_');
}
const DATE_RE = /^-?\d{1,6}-\d{2}-\d{2}$/;
const SVG_NS = 'http://www.w3.org/2000/svg';
// E(id, name, start, end, desc, src, emoji, cat, tags, imp, parentId, people, location)
// parentId / people / location are optional — existing call sites omit them safely.
function E(id, name, start, end, desc, src, emoji, cat, tags, imp, parentId, people, location) {
  return {
    id, version: 1,
    parent_id: parentId || '',
    event_name: name,
    date_start: start, date_end: end || '',
    description: desc, sources: src || '', image_url: '',
    emoji, category: cat, tags,
    people: people || '',
    location: location || '',
    importance: imp || 5,
  };
}

const TL_EMPIRES = [
  E('e1','Neo-Assyrian Empire','-0911-01-01','-0612-01-01','Near-Eastern superpower from Adad-nirari II through Ashurbanipal. Ends when Nineveh falls.','https://en.wikipedia.org/wiki/Neo-Assyrian_Empire','🦁','Empire','#empire #assyria #mesopotamia',9),
  E('e2','Fall of Nineveh','-0612-01-01','','Babylonians and Medes sack the Assyrian capital.','https://en.wikipedia.org/wiki/Battle_of_Nineveh_(612_BC)','🔥','Empire','#empire #assyria #collapse',9),
  E('e3','Achaemenid Persian Empire','-0550-01-01','-0330-01-01','Cyrus II through Darius III. First empire on a continental scale in the Western canon’s Near East.','https://en.wikipedia.org/wiki/Achaemenid_Empire','🦅','Empire','#empire #persia #achaemenid',9),
  E('e4','Alexander takes Persepolis','-0330-01-01','','Macedon ends the first Persian empire.','https://en.wikipedia.org/wiki/Alexander_the_Great','🐎','Empire','#empire #macedonia #persia',8),
  E('e5','Hellenistic kingdoms','-0331-01-01','-0030-01-01','Alexander’s successors until Rome absorbs the last, Ptolemaic Egypt.','https://en.wikipedia.org/wiki/Hellenistic_period','🏛️','Empire','#empire #greece #hellenistic',8),
  E('e6','Roman Republic (imperial century)','-0264-01-01','-0027-01-01','First Punic War to Actium: Rome becomes the Mediterranean state.','https://en.wikipedia.org/wiki/Roman_Republic','🐺','Empire','#empire #rome #republic',9),
  E('e7','Roman Empire (West)','-0027-01-01','0476-09-04','Augustus to the deposition of Romulus Augustulus.','https://en.wikipedia.org/wiki/Roman_Empire','🛡️','Empire','#empire #rome',10),
  E('e8','Byzantine Empire','0330-05-11','1453-05-29','Constantine’s New Rome to Mehmed II taking Constantinople.','https://en.wikipedia.org/wiki/Byzantine_Empire','👑','Empire','#empire #byzantium #rome',9),
  E('e9','Arab Caliphates','0632-06-08','1258-02-10','Rashidun through Abbasid until the Mongol sack of Baghdad.','https://en.wikipedia.org/wiki/Caliphate','🌙','Empire','#empire #caliphate #islam',9),
  E('e10','Holy Roman Empire','0800-12-25','1806-08-06','Charlemagne’s coronation to Francis II’s abdication under Napoleon.','https://en.wikipedia.org/wiki/Holy_Roman_Empire','🦅','Empire','#empire #hre #germany',8),
  E('e11','Mongol Empire','1206-01-01','1368-01-01','Temüjin’s kurultai through Yuan collapse in China. Largest contiguous land empire.','https://en.wikipedia.org/wiki/Mongol_Empire','🐎','Empire','#empire #mongol',8),
  E('e12','Ottoman Empire','1299-01-01','1922-11-01','Frontier beylik to the end of the sultanate after WWI.','https://en.wikipedia.org/wiki/Ottoman_Empire','🌙','Empire','#empire #ottoman',9),
  E('e13','Spanish Empire','1492-10-12','1898-12-10','Atlantic outburst to the Spanish–American War.','https://en.wikipedia.org/wiki/Spanish_Empire','⛵','Empire','#empire #spain',9),
  E('e14','Romanov Russia','1613-07-11','1917-03-15','Mikhail Romanov to the February Revolution.','https://en.wikipedia.org/wiki/House_of_Romanov','🐻','Empire','#empire #russia #romanov',8),
  E('e15','British Empire','1707-05-01','1997-07-01','Union with Scotland through the Hong Kong handover.','https://en.wikipedia.org/wiki/British_Empire','🇬🇧','Empire','#empire #britain',10),
  E('e16','Indian Independence / end of the Raj','1947-08-15','','Parliament ends British rule in India.','https://en.wikipedia.org/wiki/Indian_Independence_Act_1947','🇮🇳','Empire','#empire #britain #decolonization',9),
];

const TL_CANON = [
  E('w01','Code of Hammurabi','-1754-01-01','','Babylonian law stela: case law, lex talionis, a king who claims the gods wrote the rules.','https://en.wikipedia.org/wiki/Code_of_Hammurabi','🪨','Law','#law #mesopotamia #canon',8),
  E('w02','Neo-Assyrian Empire','-0911-01-01','-0612-01-01','Iron-age Near Eastern empire; Nineveh as world city until it isn’t.','https://en.wikipedia.org/wiki/Neo-Assyrian_Empire','🦁','Empire','#empire #assyria',8),
  E('w03','Fall of Nineveh','-0612-01-01','','Medes and Babylonians sack Assyria’s capital.','https://en.wikipedia.org/wiki/Battle_of_Nineveh_(612_BC)','🔥','Empire','#empire #assyria #war',8),
  E('w04','Achaemenid Persian Empire','-0550-01-01','-0330-01-01','Cyrus to Alexander. The empire Greece defines itself against.','https://en.wikipedia.org/wiki/Achaemenid_Empire','🦅','Empire','#empire #persia',9),
  E('w05','Battle of Marathon','-0490-09-01','','Athenian hoplites beat a Persian landing.','https://en.wikipedia.org/wiki/Battle_of_Marathon','🛡️','War','#war #greece #persia',8),
  E('w06','Thermopylae and Salamis','-0480-08-01','-0480-09-30','Spartan delay at the pass; Athenian fleet at Salamis. Xerxes fails.','https://en.wikipedia.org/wiki/Battle_of_Salamis','⚔️','War','#war #greece #persia',8),
  E('w07','Peloponnesian War','-0431-01-01','-0404-01-01','Athens vs Sparta. Thucydides writes the book on power and plague.','https://en.wikipedia.org/wiki/Peloponnesian_War','🏛️','War','#war #greece',8),
  E('w08','Alexander the Great','-0336-01-01','-0323-06-11','Macedon to the Indus. The Hellenistic world starts when he dies in Babylon.','https://en.wikipedia.org/wiki/Alexander_the_Great','🐎','Empire','#empire #macedonia #war',9),
  E('w09','Persepolis falls','-0330-01-01','','End of Achaemenid Persia.','https://en.wikipedia.org/wiki/Persepolis','🔥','Empire','#empire #persia #macedonia',7),
  E('w10','Punic Wars','-0264-01-01','-0146-01-01','Rome vs Carthage. Cannae, Zama, then Carthage destroyed.','https://en.wikipedia.org/wiki/Punic_Wars','⚓','War','#war #rome #carthage',9),
  E('w11','Caesar crosses the Rubicon','-0049-01-10','','Alea iacta est. Civil war, then monarchy in all but name.','https://en.wikipedia.org/wiki/Crossing_the_Rubicon','🎲','War','#war #rome #civilwar',8),
  E('w12','Assassination of Julius Caesar','-0044-03-15','','Ides of March. The Republic’s last act is a stabbing in the Theatre of Pompey.','https://en.wikipedia.org/wiki/Assassination_of_Julius_Caesar','🗡️','Politics','#rome #politics',8),
  E('w13','Battle of Actium / Principate','-0031-09-02','-0027-01-16','Octavian beats Antony and Cleopatra; 27 BCE he is Augustus.','https://en.wikipedia.org/wiki/Battle_of_Actium','🐺','Empire','#empire #rome',10),
  E('w14','Roman Empire (West)','-0027-01-16','0476-09-04','From Augustus to Romulus Augustulus. The spine of the Western canon.','https://en.wikipedia.org/wiki/Roman_Empire','🛡️','Empire','#empire #rome',10),
  E('w15','Edict of Milan','0313-02-01','','Constantine and Licinius: Christianity is legal in the empire.','https://en.wikipedia.org/wiki/Edict_of_Milan','✝️','Law','#law #rome #christianity',8),
  E('w16','Council of Nicaea','0325-05-20','0325-07-25','First ecumenical council. Creed, calendar, Church as imperial institution.','https://en.wikipedia.org/wiki/First_Council_of_Nicaea','⛪','Law','#law #christianity #rome',8),
  E('w17','Sack of Rome (Alaric)','0410-08-24','','Visigoths in the city. Augustine writes The City of God in the aftershock.','https://en.wikipedia.org/wiki/Sack_of_Rome_(410)','🏚️','War','#war #rome #collapse',8),
  E('w18','Fall of the Western Roman Empire','0476-09-04','','Odoacer deposes Romulus Augustulus.','https://en.wikipedia.org/wiki/Fall_of_the_Western_Roman_Empire','📉','Empire','#empire #rome #collapse',10),
  E('w19','Justinian’s Corpus Juris Civilis','0529-04-07','0534-11-16','Digest, Code, Institutes. Pipeline from Roman law to Europe’s civil codes.','https://en.wikipedia.org/wiki/Corpus_Juris_Civilis','📜','Law','#law #byzantium #rome',9),
  E('w20','Battle of Tours','0732-10-10','','Charles Martel stops an Umayyad raid in Francia.','https://en.wikipedia.org/wiki/Battle_of_Tours','⚔️','War','#war #francia #islam',7),
  E('w21','Charlemagne crowned Emperor','0800-12-25','','Leo III crowns a Frank in St. Peter’s.','https://en.wikipedia.org/wiki/Charlemagne','👑','Empire','#empire #hre #francia',9),
  E('w22','Battle of Hastings','1066-10-14','','Norman Conquest. English state, language, and aristocracy rebuilt.','https://en.wikipedia.org/wiki/Battle_of_Hastings','🏹','War','#war #england #normandy',9),
  E('w23','First Crusade','1096-08-01','1099-07-15','Urban II at Clermont to the capture of Jerusalem.','https://en.wikipedia.org/wiki/First_Crusade','✝️','War','#war #crusade',8),
  E('w24','Magna Carta','1215-06-15','','Runnymede. King John, barons, due process clauses cited for 800 years.','https://en.wikipedia.org/wiki/Magna_Carta','🖋️','Law','#law #england #magnacarta #rights',10),
  E('w25','Hundred Years’ War','1337-05-24','1453-10-19','Crécy, Poitiers, Agincourt, Joan of Arc, then English collapse on the Continent.','https://en.wikipedia.org/wiki/Hundred_Years%27_War','⚔️','War','#war #england #france',9),
  E('w26','Black Death in Europe','1347-10-01','1353-12-31','Yersinia pestis. Labor, piety, and the Church never look the same.','https://en.wikipedia.org/wiki/Black_Death','💀','Crisis','#crisis #plague #europe',9),
  E('w27','Fall of Constantinople','1453-05-29','','Mehmed II takes the city. End of Byzantium; Greek texts move west.','https://en.wikipedia.org/wiki/Fall_of_Constantinople','🕌','Empire','#empire #ottoman #byzantium #war',9),
  E('w28','Gutenberg printing press','1440-01-01','','Movable type in Mainz. Scripture and pamphlets at scale.','https://en.wikipedia.org/wiki/Johannes_Gutenberg','🖨️','Invention','#invention #print',8),
  E('w29','Wars of the Roses','1455-05-22','1487-06-16','York vs Lancaster. Towton, Tewkesbury, Bosworth. Tudor England is the settlement.','https://en.wikipedia.org/wiki/Wars_of_the_Roses','🌹','War','#war #england #roses #civilwar',9),
  E('w30','Battle of Bosworth Field','1485-08-22','','Richard III dies. Henry Tudor is Henry VII.','https://en.wikipedia.org/wiki/Battle_of_Bosworth_Field','👑','War','#war #england #roses',8),
  E('w31','Columbus reaches the Caribbean','1492-10-12','','Castile’s Atlantic wager. The Western hemisphere enters European politics.','https://en.wikipedia.org/wiki/Voyages_of_Christopher_Columbus','⛵','Empire','#empire #spain #atlantic',9),
  E('w32','Spanish Empire','1492-10-12','1898-12-10','American silver, the Habsburgs, then a long contraction.','https://en.wikipedia.org/wiki/Spanish_Empire','🇪🇸','Empire','#empire #spain',8),
  E('w33','Ninety-five Theses','1517-10-31','','Luther at Wittenberg. The Reformation as a media and political event.','https://en.wikipedia.org/wiki/Ninety-five_Theses','🔨','Religion','#religion #reformation #germany',9),
  E('w34','Spanish Armada','1588-08-08','','Philip II’s invasion fleet fails. English Protestant state survives.','https://en.wikipedia.org/wiki/Spanish_Armada','🚢','War','#war #spain #england',8),
  E('w35','Thirty Years’ War','1618-05-23','1648-10-24','Defenestration of Prague to Westphalia. Germany gutted; sovereignty becomes the keyword.','https://en.wikipedia.org/wiki/Thirty_Years%27_War','⚔️','War','#war #germany #westphalia',10),
  E('w36','English Civil Wars','1642-08-22','1651-09-03','King vs Parliament. Charles I executed 1649; Cromwell; then the Restoration.','https://en.wikipedia.org/wiki/English_Civil_War','⚔️','War','#war #england #civilwar #parliament',8),
  E('w37','Peace of Westphalia','1648-10-24','','Treaties of Münster and Osnabrück. Territorial sovereignty and the Westphalian state system.','https://en.wikipedia.org/wiki/Peace_of_Westphalia','🕊️','Law','#law #westphalia #treaty #rights',10),
  E('w38','Glorious Revolution','1688-11-05','1689-02-13','William and Mary. Parliament wins the argument about who can be king.','https://en.wikipedia.org/wiki/Glorious_Revolution','🇬🇧','Politics','#politics #england #parliament',8),
  E('w39','English Bill of Rights','1689-12-16','','After 1688: free speech in Parliament, regular parliaments, no standing army without consent.','https://en.wikipedia.org/wiki/Bill_of_Rights_1689','⚖️','Law','#law #england #billofrights #rights',10),
  E('w40','War of the Spanish Succession','1701-07-01','1714-09-07','Who gets Spain. Utrecht redraws the map; Britain takes Gibraltar.','https://en.wikipedia.org/wiki/War_of_the_Spanish_Succession','👑','War','#war #spain #britain #france',7),
  E('w41','Seven Years’ War','1756-05-17','1763-02-10','Prussia, Britain, France, India, Canada. Peace of Paris.','https://en.wikipedia.org/wiki/Seven_Years%27_War','🌍','War','#war #britain #france #prussia',9),
  E('w42','American Revolutionary War','1775-04-19','1783-09-03','Lexington to Yorktown to Paris.','https://en.wikipedia.org/wiki/American_Revolutionary_War','🇺🇸','War','#war #usa #revolution #britain',10),
  E('w43','US Declaration of Independence','1776-07-04','','Congress adopts Jefferson’s text. A war aim written as a rights claim.','https://en.wikipedia.org/wiki/United_States_Declaration_of_Independence','📜','Law','#law #usa #rights #revolution',10),
  E('w44','US Constitution signed','1787-09-17','','Philadelphia Convention. A second founding after the Articles fail.','https://en.wikipedia.org/wiki/Constitution_of_the_United_States','🇺🇸','Law','#law #usa #constitution',9),
  E('w45','French Revolution','1789-07-14','1799-11-09','Bastille to Brumaire. Rights of Man, Terror, then Napoleon.','https://en.wikipedia.org/wiki/French_Revolution','🇫🇷','Revolution','#revolution #france #rights',10),
  E('w46','Declaration of the Rights of Man','1789-08-26','','French National Constituent Assembly. Liberty, property, resistance to oppression.','https://en.wikipedia.org/wiki/Declaration_of_the_Rights_of_Man_and_of_the_Citizen','🇫🇷','Law','#law #france #rights',9),
  E('w47','US Bill of Rights ratified','1791-12-15','','First ten amendments. The English list, federalized.','https://en.wikipedia.org/wiki/United_States_Bill_of_Rights','⚖️','Law','#law #usa #billofrights #rights',10),
  E('w48','Napoleonic Wars','1803-05-18','1815-11-20','Austerlitz to Waterloo. The map of Germany and the nation-state are both products.','https://en.wikipedia.org/wiki/Napoleonic_Wars','🪖','War','#war #france #napoleon',10),
  E('w49','Battle of Waterloo','1815-06-18','','Wellington and Blücher end Napoleon’s Hundred Days.','https://en.wikipedia.org/wiki/Battle_of_Waterloo','🐴','War','#war #britain #france #napoleon',8),
  E('w50','Congress of Vienna','1814-09-01','1815-06-09','Concert of Europe. Restoration as a security system.','https://en.wikipedia.org/wiki/Congress_of_Vienna','🕊️','Law','#law #treaty #europe',8),
  E('w51','Revolutions of 1848','1848-02-22','1849-08-31','Paris, Vienna, Berlin, Rome, Budapest. Liberal nationalism’s failed dress rehearsal.','https://en.wikipedia.org/wiki/Revolutions_of_1848','✊','Revolution','#revolution #europe',8),
  E('w52','American Civil War','1861-04-12','1865-04-09','Fort Sumter to Appomattox. Slavery, union, and industrial war.','https://en.wikipedia.org/wiki/American_Civil_War','🇺🇸','War','#war #usa #civilwar #slavery',10),
  E('w53','Franco-Prussian War / German Empire','1870-07-19','1871-01-18','Sedan, siege of Paris, proclamation at Versailles.','https://en.wikipedia.org/wiki/Franco-Prussian_War','🇩🇪','War','#war #germany #france #empire',8),
  E('w54','World War I','1914-07-28','1918-11-11','July crisis to the Armistice. Four empires crack.','https://en.wikipedia.org/wiki/World_War_I','🪖','War','#war #ww1 #europe',10),
  E('w55','Russian Revolution','1917-03-08','1917-11-07','February then October.','https://en.wikipedia.org/wiki/Russian_Revolution','🇷🇺','Revolution','#revolution #russia',9),
  E('w56','Treaty of Versailles','1919-06-28','','German settlement in the Hall of Mirrors.','https://en.wikipedia.org/wiki/Treaty_of_Versailles','📝','Law','#law #treaty #ww1',8),
  E('w57','World War II','1939-09-01','1945-09-02','Poland to Tokyo Bay. The Western canon’s central catastrophe.','https://en.wikipedia.org/wiki/World_War_II','💥','War','#war #ww2',10),
  E('w58','D-Day','1944-06-06','','Normandy landings. Western Allied return to France.','https://en.wikipedia.org/wiki/Normandy_landings','⚓','War','#war #ww2',8),
  E('w59','UN Charter signed','1945-06-26','','San Francisco. Collective security with a veto.','https://en.wikipedia.org/wiki/Charter_of_the_United_Nations','🌐','Law','#law #un #treaty',8),
  E('w60','Universal Declaration of Human Rights','1948-12-10','','UNGA Resolution 217 A. Postwar rights vocabulary in 30 articles.','https://en.wikipedia.org/wiki/Universal_Declaration_of_Human_Rights','🌍','Law','#law #rights #un',9),
  E('w61','NATO founded','1949-04-04','','Washington Treaty. Western alliance as a peacetime institution.','https://en.wikipedia.org/wiki/NATO','🛡️','Law','#law #nato #coldwar',7),
  E('w62','Korean War','1950-06-25','1953-07-27','UN police action that is a war. Cold War turns hot in Asia.','https://en.wikipedia.org/wiki/Korean_War','🇰🇷','War','#war #coldwar #korea',8),
  E('w63','Suez Crisis','1956-10-29','1956-11-07','Britain, France, Israel vs Nasser — and Eisenhower.','https://en.wikipedia.org/wiki/Suez_Crisis','🇪🇬','War','#war #suez #britain #coldwar',7),
  E('w64','Cuban Missile Crisis','1962-10-16','1962-10-28','Thirteen days. Closest the Cold War comes to strategic nuclear use.','https://en.wikipedia.org/wiki/Cuban_Missile_Crisis','☢️','War','#war #coldwar #nuclear #usa',9),
  E('w65','Civil Rights Act (US)','1964-07-02','','Public accommodations and employment. Reconstruction’s delayed statute.','https://en.wikipedia.org/wiki/Civil_Rights_Act_of_1964','✊','Law','#law #usa #civilrights #rights',8),
  E('w66','Fall of Saigon','1975-04-30','','End of the Vietnam War as an American project.','https://en.wikipedia.org/wiki/Fall_of_Saigon','🇻🇳','War','#war #vietnam #coldwar',7),
  E('w67','Fall of the Berlin Wall','1989-11-09','','The image that ends the Cold War in the Western imagination.','https://en.wikipedia.org/wiki/Fall_of_the_Berlin_Wall','🧱','Politics','#politics #coldwar #germany',9),
  E('w68','Dissolution of the Soviet Union','1991-12-26','','Alma-Ata and the flag over the Kremlin.','https://en.wikipedia.org/wiki/Dissolution_of_the_Soviet_Union','🇷🇺','Empire','#empire #ussr #coldwar',9),
  E('w69','September 11 attacks','2001-09-11','','Al-Qaeda in New York and Washington.','https://en.wikipedia.org/wiki/September_11_attacks','🏛️','War','#war #usa #terrorism',9),
  E('w70','Iraq War','2003-03-20','2011-12-18','US-led invasion to the formal withdrawal.','https://en.wikipedia.org/wiki/Iraq_War','⚔️','War','#war #iraq #usa',8),
  E('w71','Russian invasion of Ukraine','2022-02-24','','Full-scale war in Europe. The post-1991 settlement is no longer assumed.','https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine','🌻','War','#war #ukraine #russia #europe',9),
];

const TL_PEOPLE = [
  { id: 'p1', name: 'Hammurabi', date_birth: '-1810-01-01', date_death: '-1750-01-01', role: 'King', event_ids: 'w01', description: 'Babylonian king associated with the law stela.', sources: 'https://en.wikipedia.org/wiki/Hammurabi', image_url: '', emoji: '🪨', tags: '#law #mesopotamia' },
  { id: 'p2', name: 'Alexander III of Macedon', date_birth: '-0356-07-20', date_death: '-0323-06-11', role: 'King / general', event_ids: 'w08,w09', description: 'Conqueror of the Achaemenid empire.', sources: 'https://en.wikipedia.org/wiki/Alexander_the_Great', image_url: '', emoji: '🐎', tags: '#macedonia #war' },
  { id: 'p3', name: 'Gaius Julius Caesar', date_birth: '-0100-07-12', date_death: '-0044-03-15', role: 'General / dictator', event_ids: 'w11,w12', description: 'Crosses the Rubicon; dies on the Ides of March.', sources: 'https://en.wikipedia.org/wiki/Julius_Caesar', image_url: '', emoji: '🗡️', tags: '#rome' },
  { id: 'p4', name: 'Augustus', date_birth: '-0063-09-23', date_death: '0014-08-19', role: 'Emperor', event_ids: 'w13,w14', description: 'First Roman emperor.', sources: 'https://en.wikipedia.org/wiki/Augustus', image_url: '', emoji: '🐺', tags: '#rome #empire' },
  { id: 'p5', name: 'Charlemagne', date_birth: '0742-04-02', date_death: '0814-01-28', role: 'Emperor', event_ids: 'w21', description: 'Crowned Emperor of the Romans in 800.', sources: 'https://en.wikipedia.org/wiki/Charlemagne', image_url: '', emoji: '👑', tags: '#hre #francia' },
  { id: 'p6', name: 'William I of England', date_birth: '1028-01-01', date_death: '1087-09-09', role: 'King', event_ids: 'w22', description: 'Norman Conquest, 1066.', sources: 'https://en.wikipedia.org/wiki/William_the_Conqueror', image_url: '', emoji: '🏹', tags: '#england' },
  { id: 'p7', name: 'Henry VII of England', date_birth: '1457-01-28', date_death: '1509-04-21', role: 'King', event_ids: 'w29,w30', description: 'Wins Bosworth; ends the Wars of the Roses.', sources: 'https://en.wikipedia.org/wiki/Henry_VII_of_England', image_url: '', emoji: '🌹', tags: '#england #roses' },
  { id: 'p8', name: 'George Washington', date_birth: '1732-02-22', date_death: '1799-12-14', role: 'General / president', event_ids: 'w42,w43', description: 'Commander of the Continental Army; first US president.', sources: 'https://en.wikipedia.org/wiki/George_Washington', image_url: '', emoji: '🇺🇸', tags: '#usa #revolution' },
  { id: 'p9', name: 'Thomas Jefferson', date_birth: '1743-04-13', date_death: '1826-07-04', role: 'Statesman', event_ids: 'w43', description: 'Principal author of the Declaration of Independence.', sources: 'https://en.wikipedia.org/wiki/Thomas_Jefferson', image_url: '', emoji: '📜', tags: '#usa #rights' },
  { id: 'p10', name: 'Napoleon Bonaparte', date_birth: '1769-08-15', date_death: '1821-05-05', role: 'Emperor / general', event_ids: 'w48,w49', description: 'Ends the Revolution by becoming it; loses at Waterloo.', sources: 'https://en.wikipedia.org/wiki/Napoleon', image_url: '', emoji: '🪖', tags: '#france #war' },
];

const TL_CRISES = [
  E('c1','Dutch Tulip Mania','1636-11-01','1637-02-05','Contract prices for tulip bulbs go vertical, then collapse in weeks. Not “the economy died,” but the template for narrative bubbles.','https://en.wikipedia.org/wiki/Tulip_mania','🌷','Crisis','#crisis #bubble #netherlands #speculation',9),
  E('c2','Mississippi Bubble (John Law)','1719-01-01','1720-05-01','Paper shares in Law’s Compagnie des Indes and a flood of banknotes. Paris discovers that liquidity is not the same as value.','https://en.wikipedia.org/wiki/Mississippi_Company','🇫🇷','Crisis','#crisis #bubble #france #banking',8),
  E('c3','South Sea Bubble','1720-01-01','1720-09-01','South Sea Company stock mania in London; Newton loses money; Parliament passes the Bubble Act. Twin of Mississippi.','https://en.wikipedia.org/wiki/South_Sea_Company','🚢','Crisis','#crisis #bubble #britain #speculation',9),
  E('c4','Waterloo and the bond market','1815-06-18','1815-06-19','Battle of Waterloo. Nathan Rothschild’s later legend (carrier pigeons, gilt coup) is mostly myth; the real point is how fast war news repriced sovereign debt.','https://en.wikipedia.org/wiki/Battle_of_Waterloo','🐴','Crisis','#crisis #war #bonds #britain #waterloo',8),
  E('c5','Panic of 1873','1873-09-18','1879-01-01','Jay Cooke fails; railroad boom busts. Long Depression in the US/Europe. First truly transatlantic industrial crash.','https://en.wikipedia.org/wiki/Panic_of_1873','🚂','Crisis','#crisis #railroads #depression #usa',8),
  E('c6','Panic of 1907','1907-10-14','1907-11-15','Knickerbocker Trust run. J.P. Morgan locks the bankers in a room. Direct ancestor of the Federal Reserve (1913).','https://en.wikipedia.org/wiki/Panic_of_1907','🏦','Crisis','#crisis #banking #usa #fed',8),
  E('c7','Wall Street Crash','1929-10-24','1932-07-08','Black Thursday through the 1932 bottom. Credit, farms, trade, and gold-standard politics turn a crash into the Great Depression.','https://en.wikipedia.org/wiki/Wall_Street_Crash_of_1929','📉','Crisis','#crisis #depression #usa #stocks',10),
  E('c8','Nixon shock (gold window closes)','1971-08-15','','USD–gold convertibility ends. The postwar Bretton Woods monetary order is over; fiat and floating FX become the default.','https://en.wikipedia.org/wiki/Nixon_shock','💵','Crisis','#crisis #fx #usd #brettonwoods',8),
  E('c9','Latin American debt crisis','1982-08-12','1989-12-31','Mexico’s default weekend. Petrodollar recycling in reverse; “lost decade” in Latin America; Baker/Brady plans later.','https://en.wikipedia.org/wiki/Latin_American_debt_crisis','🌎','Crisis','#crisis #debt #mexico #emerging',7),
  E('c10','US Savings & Loan crisis','1986-01-01','1995-12-31','Thrifts gamble after deregulation and deposit insurance. ~1,000 institutions fail; RTC cleanup. A domestic dress rehearsal for “private gains, socialized losses.”','https://en.wikipedia.org/wiki/Savings_and_loan_crisis','🏠','Crisis','#crisis #banking #usa #sandl #realestate',9),
  E('c11','Black Monday','1987-10-19','','Dow −22.6% in a day. Portfolio insurance and futures. The crash that did not become 1929 — Fed liquidity under Greenspan.','https://en.wikipedia.org/wiki/Black_Monday_(1987)','📊','Crisis','#crisis #stocks #usa #fed',8),
  E('c12','European ERM / Sterling crisis','1992-09-16','','Black Wednesday. Soros vs the Bank of England is the cartoon; the mechanics are an unsustainable peg and German rates after reunification.','https://en.wikipedia.org/wiki/Black_Wednesday','💷','Crisis','#crisis #fx #britain #eu',7),
  E('c13','Tequila crisis','1994-12-20','1995-03-01','Peso devaluation, tesobonos, US/IMF package. Sudden-stop prototype for the 1990s emerging-market sequence.','https://en.wikipedia.org/wiki/1994_Mexican_peso_crisis','🇲🇽','Crisis','#crisis #fx #mexico #emerging',7),
  E('c14','Asian Financial Crisis','1997-07-02','1998-06-30','Baht float, then Indonesia, Korea, Thailand IMF programs. Fixed FX + short-term dollar debt + crony credit. “Asian contagion.”','https://en.wikipedia.org/wiki/1997_Asian_financial_crisis','🌏','Crisis','#crisis #asia #fx #imf #contagion',10),
  E('c15','Russia default & LTCM','1998-08-17','1998-09-23','GKO default and ruble devaluation. LTCM’s relative-value book blows up; New York Fed orchestrates a creditor bail-in.','https://en.wikipedia.org/wiki/1998_Russian_financial_crisis','🧮','Crisis','#crisis #russia #hedgefund #ltcm #contagion',9),
  E('c16','Dot-com bust','2000-03-10','2002-10-09','NASDAQ peak to trough. Capex hangover, telecom debt, and the end of “clicks over cash.”','https://en.wikipedia.org/wiki/Dot-com_bubble','💻','Crisis','#crisis #bubble #tech #stocks',8),
  E('c17','Global Financial Crisis','2007-08-09','2009-06-30','BNP freezes funds (Aug 2007) through Lehman (2008-09-15) and the 2009 trough. Shadow banking, CDOs, and too-big-to-fail.','https://en.wikipedia.org/wiki/Financial_crisis_of_2007%E2%80%932008','💥','Crisis','#crisis #banking #usa #gfc #housing',10),
  E('c18','Lehman Brothers collapses','2008-09-15','','The date people mean when they say “2008.” Money markets break; TARP, Fed facilities, and a decade of QE follow.','https://en.wikipedia.org/wiki/Bankruptcy_of_Lehman_Brothers','🏢','Crisis','#crisis #banking #gfc #lehman',10),
  E('c19','Eurozone sovereign crisis','2009-10-01','2012-07-26','Greek revision, Ireland/Portugal/Spain, troika, then Draghi’s “whatever it takes.” Banking union as unfinished business.','https://en.wikipedia.org/wiki/Eurozone_crisis','🇪🇺','Crisis','#crisis #eu #debt #sovereign',9),
  E('c20','COVID crash & freeze','2020-03-09','2020-03-23','Fastest equity drawdown on record, dash-for-cash in Treasuries, then unprecedented fiscal/Fed backstops.','https://en.wikipedia.org/wiki/2020_stock_market_crash','🦠','Crisis','#crisis #pandemic #fed #stocks',8),
  E('c21','SVB / regional bank panic','2023-03-10','2023-03-16','Duration mismatch + uninsured deposits + Twitter. Silicon Valley Bank, Signature, Credit Suisse/UBS shotgun wedding.','https://en.wikipedia.org/wiki/2023_banking_crisis','🏧','Crisis','#crisis #banking #usa #rates',7),
];

const TL_RIGHTS = [
  E('r0','Cyrus Cylinder','-0539-01-01','','Persian conquest of Babylon; later read (sometimes too eagerly) as an early human-rights charter: repatriation, cult restoration.','https://en.wikipedia.org/wiki/Cyrus_Cylinder','🪨','Rights','#rights #persia #antiquity',7),
  E('r1','Magna Carta','1215-06-15','','Runnymede. Not democracy — a peace treaty between king and barons — but due process and scutage clauses get cited for 800 years. Comes *before* Westphalia.','https://en.wikipedia.org/wiki/Magna_Carta','🖋️','Rights','#rights #england #law #magnacarta',10),
  E('r2','Dutch Act of Abjuration','1581-07-26','','Plakkaat van Verlatinghe: a people formally dump a sovereign for tyranny. Intellectual cousin of 1776.','https://en.wikipedia.org/wiki/Act_of_Abjuration','🇳🇱','Rights','#rights #netherlands #sovereignty',7),
  E('r3','Peace of Westphalia','1648-10-24','','Treaties of Münster and Osnabrück. Cuius regio, cuius religio in a new key: territorial sovereignty, religious settlement, and the “Westphalian” state system later rights law has to live inside.','https://en.wikipedia.org/wiki/Peace_of_Westphalia','🕊️','Rights','#rights #westphalia #sovereignty #treaty',10),
  E('r4','Habeas Corpus Act','1679-05-27','','England: you must produce the body. Arbitrary detention gets a procedure, not just a slogan.','https://en.wikipedia.org/wiki/Habeas_Corpus_Act_1679','⛓️','Rights','#rights #england #law #habeas',8),
  E('r5','English Bill of Rights','1689-12-16','','After the Glorious Revolution: Parliament, Protestants, and a list of things William and Mary may not do. Direct ancestor of the US Bill of Rights.','https://en.wikipedia.org/wiki/Bill_of_Rights_1689','🇬🇧','Rights','#rights #england #parliament #billofrights',9),
  E('r6','Virginia Declaration of Rights','1776-06-12','','George Mason. Inherent rights, free press, no general warrants. Jefferson and Madison are downstream of this draft.','https://en.wikipedia.org/wiki/Virginia_Declaration_of_Rights','📜','Rights','#rights #usa #virginia #enlightenment',8),
  E('r7','US Declaration of Independence','1776-07-04','','A rights claim used as a war aim: consent, inalienable rights, and a long indictment. Universal language, particular revolt.','https://en.wikipedia.org/wiki/United_States_Declaration_of_Independence','🇺🇸','Rights','#rights #usa #independence #enlightenment',10),
  E('r8','Virginia Statute for Religious Freedom','1786-01-16','','Jefferson: conscience is not a civil privilege the state grants. Model for the First Amendment.','https://en.wikipedia.org/wiki/Virginia_Statute_for_Religious_Freedom','⛪','Rights','#rights #usa #religion #jefferson',8),
  E('r9','Declaration of the Rights of Man and of the Citizen','1789-08-26','','French National Constituent Assembly. Liberty, property, resistance to oppression — then the Revolution tests every clause.','https://en.wikipedia.org/wiki/Declaration_of_the_Rights_of_Man_and_of_the_Citizen','🇫🇷','Rights','#rights #france #revolution #enlightenment',10),
  E('r10','US Bill of Rights ratified','1791-12-15','','First ten amendments. Speech, arms, quartering, search, silence, counsel, jury, bail — the English list, federalized.','https://en.wikipedia.org/wiki/United_States_Bill_of_Rights','⚖️','Rights','#rights #usa #constitution #billofrights',10),
  E('r11','British Slavery Abolition Act','1833-08-28','','Empire-wide (with exceptions and apprenticeship). Compensation to owners, not the enslaved — the contradiction is the history.','https://en.wikipedia.org/wiki/Slavery_Abolition_Act_1833','💔','Rights','#rights #slavery #britain #abolition',9),
  E('r12','US 13th Amendment','1865-12-06','','Abolition in the Constitution, with the punishment clause that still structures US incarceration debates.','https://en.wikipedia.org/wiki/Thirteenth_Amendment_to_the_United_States_Constitution','🔗','Rights','#rights #usa #slavery #amendment',9),
  E('r13','First Geneva Convention','1864-08-22','','Solferino → Dunant → wounded soldiers as legal persons. Start of IHL as a treaty system.','https://en.wikipedia.org/wiki/First_Geneva_Convention','🔴','Rights','#rights #ihl #geneva #war',8),
  E('r14','19th Amendment (US women’s suffrage)','1920-08-18','','Vote. Built on Seneca Falls (1848) and a century of organizing, not a sudden conversion.','https://en.wikipedia.org/wiki/Nineteenth_Amendment_to_the_United_States_Constitution','🗳️','Rights','#rights #usa #suffrage #women',8),
  E('r15','UN Charter','1945-06-26','','San Francisco. “We the peoples,” and a Security Council veto that has defined the gap between text and practice.','https://en.wikipedia.org/wiki/Charter_of_the_United_Nations','🌐','Rights','#rights #un #treaty',8),
  E('r16','Universal Declaration of Human Rights','1948-12-10','','Eleanor Roosevelt’s committee, 30 articles, not a treaty. Still the gravitational center of the postwar rights vocabulary.','https://en.wikipedia.org/wiki/Universal_Declaration_of_Human_Rights','🌍','Rights','#rights #un #udhr',10),
  E('r17','European Convention on Human Rights','1950-11-04','','A regional court with teeth. Strasbourg becomes a verb.','https://en.wikipedia.org/wiki/European_Convention_on_Human_Rights','⚖️','Rights','#rights #europe #echr #court',8),
  E('r18','Civil Rights Act (US)','1964-07-02','','Public accommodations, employment, federal leverage. The 14th Amendment finally gets a statute that moves.','https://en.wikipedia.org/wiki/Civil_Rights_Act_of_1964','✊','Rights','#rights #usa #civilrights',9),
  E('r19','ICCPR & ICESCR adopted','1966-12-16','','The UDHR splits into two covenants: civil-political and economic-social. Entry into force 1976.','https://en.wikipedia.org/wiki/International_Covenant_on_Civil_and_Political_Rights','📑','Rights','#rights #un #treaty #iccpr',8),
  E('r20','Convention on the Rights of the Child','1989-11-20','','Almost universally ratified (US notable holdout). Children as rights-holders, not just objects of welfare.','https://en.wikipedia.org/wiki/Convention_on_the_Rights_of_the_Child','🧒','Rights','#rights #un #children #treaty',7),
];

const TL_INVENTIONS = [
  E('i1','Writing (cuneiform)','-3200-01-01','','Uruk: tokens become signs. Bureaucracy, debt, and literature become possible.','https://en.wikipedia.org/wiki/Cuneiform','📝','Invention','#invention #writing #mesopotamia',10),
  E('i2','The wheel (Potter’s / vehicle)','-3500-01-01','','Late Neolithic Near East. Rotary motion as a civilizational cheat code.','https://en.wikipedia.org/wiki/Wheel','🛞','Invention','#invention #wheel #transport',9),
  E('i3','Paper (Cai Lun, traditional)','0105-01-01','','Han China. Cheap, portable surface for administration and later print.','https://en.wikipedia.org/wiki/Cai_Lun','📄','Invention','#invention #paper #china',8),
  E('i4','Movable type (Bi Sheng)','1040-01-01','','Ceramic type in Song China, centuries before Gutenberg.','https://en.wikipedia.org/wiki/Bi_Sheng','🔤','Invention','#invention #print #china',8),
  E('i5','Gutenberg printing press','1440-01-01','','Mainz. Scale, vernacular scripture, scientific correspondence, pamphlets that start wars.','https://en.wikipedia.org/wiki/Johannes_Gutenberg','🖨️','Invention','#invention #print #europe',10),
  E('i6','Telescope (Lipperhey patent)','1608-10-02','','Dutch patent filing; Galileo points it at Jupiter two years later.','https://en.wikipedia.org/wiki/History_of_the_telescope','🔭','Invention','#invention #science #optics',8),
  E('i7','Watt steam engine patent','1769-01-05','','Separate condenser. The industrial revolution’s muscle.','https://en.wikipedia.org/wiki/Watt_steam_engine','⚙️','Invention','#invention #steam #industry',10),
  E('i8','Smallpox vaccine (Jenner)','1796-05-14','','Cowpox as a weapon against smallpox. Public health becomes an engineering problem.','https://en.wikipedia.org/wiki/Edward_Jenner','💉','Invention','#invention #medicine #vaccine',9),
  E('i9','Voltaic pile','1800-03-20','','Continuous current. Chemistry and physics get a power supply.','https://en.wikipedia.org/wiki/Voltaic_pile','🔋','Invention','#invention #electricity #science',8),
  E('i10','Photography (Daguerre)','1839-08-19','','The French state buys the process and gives it to the world. Reality becomes copyable.','https://en.wikipedia.org/wiki/Daguerreotype','📷','Invention','#invention #photo #media',8),
  E('i11','Electrical telegraph (Morse line)','1844-05-24','','Washington–Baltimore. “What hath God wrought.” Distance collapses for news and markets.','https://en.wikipedia.org/wiki/Morse_code','📡','Invention','#invention #telecom #morse',8),
  E('i12','Telephone (Bell patent)','1876-03-07','','Speech on a wire. The network becomes the product.','https://en.wikipedia.org/wiki/Invention_of_the_telephone','📞','Invention','#invention #telecom #bell',8),
  E('i13','Practical incandescent light (Edison)','1879-10-21','','Menlo Park. Night becomes optional for factories and cities.','https://en.wikipedia.org/wiki/Incandescent_light_bulb','💡','Invention','#invention #electricity #edison',8),
  E('i14','Benz Patent-Motorwagen','1886-01-29','','Automobile as a filed invention, not a hobby cart.','https://en.wikipedia.org/wiki/Benz_Patent-Motorwagen','🚗','Invention','#invention #auto #transport',8),
  E('i15','Radio (Marconi transatlantic)','1901-12-12','','Signal claimed across the Atlantic. Wireless as infrastructure.','https://en.wikipedia.org/wiki/Guglielmo_Marconi','📻','Invention','#invention #radio #telecom',8),
  E('i16','Wright Flyer','1903-12-17','','12 seconds at Kitty Hawk. Controlled, powered, heavier-than-air.','https://en.wikipedia.org/wiki/Wright_Flyer','✈️','Invention','#invention #flight #transport',9),
  E('i17','Haber–Bosch ammonia','1913-09-09','','First industrial plant. Half the planet’s protein is downstream of this; so are explosives.','https://en.wikipedia.org/wiki/Haber_process','🌾','Invention','#invention #chemistry #agriculture',10),
  E('i18','Penicillin (Fleming)','1928-09-28','','Mold that kills bacteria. Antibiotics rewrite infant mortality and surgery.','https://en.wikipedia.org/wiki/Penicillin','🧫','Invention','#invention #medicine #antibiotic',9),
  E('i19','Transistor (Bell Labs)','1947-12-23','','Bardeen, Brattain, Shockley. The switch that becomes the computer.','https://en.wikipedia.org/wiki/Transistor','🔷','Invention','#invention #semiconductor #computing',10),
  E('i20','Sputnik 1','1957-10-04','','Orbit. The space age as a political fact and a radio beep.','https://en.wikipedia.org/wiki/Sputnik_1','🛰️','Invention','#invention #space #ussr',8),
  E('i21','ARPANET IMP goes live','1969-10-29','','First packet host-to-host. The internet is still a defense research network.','https://en.wikipedia.org/wiki/ARPANET','🕸️','Invention','#invention #internet #computing',9),
  E('i22','Personal computer (Altair / hobbyist wave)','1975-01-01','','Altair 8800 on the cover of Popular Electronics. Computing leaves the glass house.','https://en.wikipedia.org/wiki/Altair_8800','🖥️','Invention','#invention #computing #pc',8),
  E('i23','World Wide Web (public)','1991-08-06','','Berners-Lee’s files on the CERN info.cern.ch server. Hypertext on the internet.','https://en.wikipedia.org/wiki/World_Wide_Web','🌐','Invention','#invention #internet #web',10),
  E('i24','iPhone','2007-01-09','','Multi-touch computer in a pocket. Mobile internet as the default client.','https://en.wikipedia.org/wiki/IPhone_(1st_generation)','📱','Invention','#invention #mobile #computing',8),
  E('i25','CRISPR gene editing (Doudna/Charpentier)','2012-06-28','','A programmable cut. Biology becomes more like software, with all the dual-use that implies.','https://en.wikipedia.org/wiki/CRISPR_gene_editing','🧬','Invention','#invention #biology #crispr',9),
];

const BUILTIN = {
  canon: { title: 'Western canon', records: TL_CANON },
  empires: { title: 'Empires', records: TL_EMPIRES },
  crises: { title: 'Financial crises', records: TL_CRISES },
  rights: { title: 'Human rights', records: TL_RIGHTS },
  inventions: { title: 'Major inventions', records: TL_INVENTIONS },
};

const EMOJI_CATALOG = [
  ['📌','pin'],['📅','date'],['⏳','time'],['🗺️','map'],['📜','scroll law'],['⚖️','law justice'],['🕊️','peace'],['⚔️','war'],['🛡️','shield'],['🔥','fire'],
  ['💥','crash'],['🏦','bank'],['💸','money'],['💰','wealth'],['📉','stocks down'],['📊','chart'],['💵','dollar'],['💷','pound'],['🏠','housing'],['🌷','tulip bubble'],
  ['🚢','ship trade'],['🚂','rail'],['✈️','flight'],['🚗','car'],['🛰️','satellite'],['📡','radio'],['💻','computer'],['🖥️','pc'],['📱','phone'],['☎️','telephone'],
  ['💡','light'],['⚙️','engine'],['🔋','battery'],['📷','photo'],['🖨️','print'],['📝','writing'],['📄','paper'],['🔤','type'],['🔭','telescope'],['🧬','gene'],
  ['🧫','lab'],['💉','vaccine'],['🌾','farm'],['🦠','pandemic'],['🌍','world'],['🌎','americas'],['🌏','asia'],['🌐','un web'],['✊','protest'],['🗳️','vote'],
  ['🇺🇸','usa'],['🇬🇧','britain'],['🇫🇷','france'],['🇳🇱','netherlands'],['🇲🇽','mexico'],['🇮🇳','india'],['🇪🇺','eu'],['🏛️','politics'],['🐺','rome'],['🦅','persia'],
  ['🦁','assyria'],['🐻','russia'],['🌙','ottoman islam'],['🕌','mosque'],['⛪','religion'],['🖋️','magna carta'],['🪨','stone'],['🧒','children'],['💔','abolition'],['🔗','chain'],
  ['🔴','geneva'],['🎓','intellect'],['🍷','decadence'],['🏕️','pioneers'],['🐴','waterloo'],['🧮','ltcm math'],['🏢','lehman'],['🏧','bank run'],['🔷','transistor'],['🕸️','internet'],
  ['⭐','star'],['🏆','peak'],['⚠️','warning'],['❓','question'],['✅','check'],['❌','no'],['🎯','target'],['🧠','idea'],['🔬','science'],['🛠️','tool'],
];

const STATE = {
  records: [],
  filtered: [],
  tokenClient: null,
  accessToken: null,
  userProfile: null,
  zoom: 1,
  showConnections: false,
  filterText: '',
  filterCategory: '',
  filterTag: '',
  activePopoverId: null,
  dateFrom: localStorage.getItem('timeline_date_from') || '',
  dateTo: localStorage.getItem('timeline_date_to') || '',
  screensaver: false,
  ssIndex: 0,
  ssPaused: false,
  ssTimer: null,
  ssSpeed: 5000,
  ssProgressRaf: null,
  ssProgressStart: 0,
  lastClickedId: null,
  activeKey: localStorage.getItem('timeline_active_key') || 'builtin:canon',
  localCustom: JSON.parse(localStorage.getItem('timeline_custom') || '{}'),
  sheetTabs: [],
  peopleTabs: [],
  activeGid: null,
  peopleGid: null,
  layoutMode: localStorage.getItem('timeline_layout') || 'wrap',
  wrapRows: localStorage.getItem('timeline_wrap_rows') || 'auto',
  sliceGrain: localStorage.getItem('timeline_slice_grain') || 'all',
  people: JSON.parse(localStorage.getItem('timeline_people') || 'null') || TL_PEOPLE,
};

const CATEGORY_COLORS = {};
const COLOR_PALETTE = ['#3b82f6','#ec4899','#22c55e','#f59e0b','#8b5cf6','#06b6d4','#ef4444','#f97316','#14b8a6','#a855f7'];

function categoryColor(cat) {
  if (!cat) return COLOR_PALETTE[0];
  if (!CATEGORY_COLORS[cat]) {
    CATEGORY_COLORS[cat] = COLOR_PALETTE[Object.keys(CATEGORY_COLORS).length % COLOR_PALETTE.length];
  }
  return CATEGORY_COLORS[cat];
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function cloneRecords(list) {
  return list.map(r => ({ ...r }));
}

/* Dates: store YYYY-MM-DD (optional leading minus). Display YYYY/MM/DD. Never MM/DD/YYYY. */
function normalizeDateInput(raw) {
  const s = (raw || '').trim().replace(/\//g, '-');
  if (!s) return '';
  const m = s.match(/^(-?\d{1,6})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  const y = m[1];
  const mo = m[2].padStart(2, '0');
  const d = m[3].padStart(2, '0');
  return `${y}-${mo}-${d}`;
}

function parseDate(str) {
  const s = normalizeDateInput(str);
  if (!DATE_RE.test(s)) return null;
  const m = s.match(/^(-?\d{1,6})-(\d{2})-(\d{2})$/);
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const dt = new Date(Date.UTC(2000, mo - 1, d));
  dt.setUTCFullYear(y);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatDateDisplay(str) {
  const s = normalizeDateInput(str);
  if (!DATE_RE.test(s)) return str || '';
  const m = s.match(/^(-?)(\d{1,6})-(\d{2})-(\d{2})$/);
  const sign = m[1];
  const y = m[2].padStart(4, '0');
  const out = `${y}/${m[3]}/${m[4]}`;
  return sign ? `${out} BCE` : out;
}

function formatDateRange(start, end) {
  const s = formatDateDisplay(start);
  if (!s) return '';
  return end ? `${s} – ${formatDateDisplay(end)}` : s;
}

function formatTickYear(date) {
  const y = date.getUTCFullYear();
  if (y < 0) return `${Math.abs(y)} BCE`;
  return String(y);
}

function validateRecord(rec) {
  const errors = [];
  if (!rec.event_name || !rec.event_name.trim()) errors.push('event_name is required');
  rec.date_start = normalizeDateInput(rec.date_start);
  rec.date_end   = normalizeDateInput(rec.date_end);
  if (!DATE_RE.test(rec.date_start) || !parseDate(rec.date_start)) errors.push('date_start must be YYYY-MM-DD');
  if (rec.date_end && (!DATE_RE.test(rec.date_end) || !parseDate(rec.date_end))) errors.push('date_end must be YYYY-MM-DD');
  // parent_id is intentionally not validated against existing records here —
  // it may reference a record that hasn't been pushed/imported yet.
  // people is a space-separated list of @handles — free-form, no validation needed.
  return errors;
}

/* ── persistence ── */
function persistLocal() {
  if (STATE.activeKey.startsWith('builtin:') || STATE.activeKey.startsWith('local:')) {
    const store = JSON.parse(localStorage.getItem('timeline_edits') || '{}');
    store[STATE.activeKey] = STATE.records;
    localStorage.setItem('timeline_edits', JSON.stringify(store));
  }
  localStorage.setItem('timeline_active_key', STATE.activeKey);
  localStorage.setItem('timeline_custom', JSON.stringify(STATE.localCustom));
  localStorage.setItem('timeline_sheet_id', CONFIG.SPREADSHEET_ID || '');
  localStorage.setItem('timeline_sheet_tab', CONFIG.SHEET_NAME || '');
  localStorage.setItem('timeline_people_tab', CONFIG.PEOPLE_SHEET_NAME || '');
  // Remove the old separate-people-file key so it never resurrects a stale ID
  localStorage.removeItem('timeline_people_sheet_id');
  localStorage.setItem('timeline_layout', STATE.layoutMode);
  localStorage.setItem('timeline_wrap_rows', String(STATE.wrapRows));
  localStorage.setItem('timeline_slice_grain', STATE.sliceGrain);
  localStorage.setItem('timeline_people', JSON.stringify(STATE.people || []));
}

function dropStaleGlubbCache() {
  const store = JSON.parse(localStorage.getItem('timeline_edits') || '{}');
  const old = store['builtin:empires'];
  if (Array.isArray(old) && old.some(r => r && (r.id === 'g5' || /Age of Affluence/i.test(r.event_name || '')))) {
    delete store['builtin:empires'];
    localStorage.setItem('timeline_edits', JSON.stringify(store));
  }
  if ((localStorage.getItem('timeline_active_key') || '') === 'builtin:empires' && !old) {
    /* keep empires if they switched; default new sessions use canon */
  }
}

function loadActiveTimeline() {
  const key = STATE.activeKey;
  const edits = JSON.parse(localStorage.getItem('timeline_edits') || '{}');
  if (edits[key] && Array.isArray(edits[key])) {
    STATE.records = edits[key].map(r => ({ ...r }));
    return;
  }
  if (key.startsWith('builtin:')) {
    const id = key.slice(8);
    STATE.records = cloneRecords(BUILTIN[id]?.records || []);
    return;
  }
  if (key.startsWith('local:')) {
    const name = key.slice(6);
    STATE.records = cloneRecords(STATE.localCustom[name] || []);
    return;
  }
  if (key.startsWith('sheet:')) {
    const title = key.slice(6);
    const hit = Object.values(BUILTIN).find(t => t.title === title);
    STATE.records = hit ? cloneRecords(hit.records) : [];
  }
}

function populateTimelineSelect() {
  const sel = document.getElementById('timeline-select');
  const cur = STATE.activeKey;
  let html = '<optgroup label="Built-in">';
  Object.entries(BUILTIN).forEach(([id, t]) => {
    html += `<option value="builtin:${esc(id)}">${esc(t.title)}</option>`;
  });
  html += '</optgroup>';
  const locals = Object.keys(STATE.localCustom);
  if (locals.length) {
    html += '<optgroup label="Local">';
    locals.forEach(n => { html += `<option value="local:${esc(n)}">${esc(n)}</option>`; });
    html += '</optgroup>';
  }
  if (STATE.sheetTabs.length) {
    html += '<optgroup label="Google Sheet tabs">';
    STATE.sheetTabs.forEach(t => {
      html += `<option value="sheet:${esc(t.title)}">${esc(t.title)}</option>`;
    });
    html += '</optgroup>';
  }
  sel.innerHTML = html;
  if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
  else if (sel.options.length) {
    STATE.activeKey = sel.options[0].value;
    sel.value = STATE.activeKey;
  }
}

async function switchTimeline(key) {
  stopScreensaver();
  STATE.activeKey = key;
  if (key.startsWith('sheet:')) {
    CONFIG.SHEET_NAME = key.slice(6);
    const tab = STATE.sheetTabs.find(t => t.title === CONFIG.SHEET_NAME);
    STATE.activeGid = tab ? tab.sheetId : null;
    persistLocal();
    refreshOpenSheetHref();
    await syncFromSheet();
    return;
  }
  STATE.activeGid = null;
  loadActiveTimeline();
  persistLocal();
  refreshOpenSheetHref();
  applyFilters();
  renderTimeline();
}

/* ── Google auth ── */
function initGoogleAuth() {
  if (!CONFIG.CLIENT_ID) return;
  if (typeof google === 'undefined' || !google.accounts) {
    setTimeout(initGoogleAuth, 400);
    return;
  }
  STATE.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: handleTokenResponse,
    error_callback: (err) => {
      hideSpinner();
      showToast('Google Auth error: ' + (err.message || err.type), 'error');
    },
  });
}

function requestToken(interactive = true) {
  if (!STATE.tokenClient) { showToast('Google Auth not initialized — check CLIENT_ID / GIS script', 'error'); return; }
  showSpinner();
  STATE.tokenClient.requestAccessToken({ prompt: interactive ? 'select_account' : '' });
}

function handleTokenResponse(response) {
  hideSpinner();
  if (response.error) {
    showToast('Sign-in failed: ' + response.error, 'error');
    return;
  }
  STATE.accessToken = response.access_token;
  fetchUserProfile();
  renderAuthUI(true);
  if (CONFIG.SPREADSHEET_ID) {
    listSheetTabs().then(() => {
      populateTimelineSelect();
      syncFromSheet();
    });
  } else {
    showToast('Signed in. Connect a Sheet to sync, or keep using built-in timelines.', 'info');
  }
}

function fetchUserProfile() {
  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + STATE.accessToken },
  })
    .then(r => r.json())
    .then(profile => {
      STATE.userProfile = profile;
      renderAuthUI(true);
      showToast('Signed in as ' + (profile.name || 'Google user'), 'success');
    })
    .catch(() => { renderAuthUI(true); });
}

function signOut() {
  if (STATE.accessToken && typeof google !== 'undefined') {
    google.accounts.oauth2.revoke(STATE.accessToken, () => {});
  }
  STATE.accessToken = null;
  STATE.userProfile = null;
  STATE.sheetTabs = [];
  renderAuthUI(false);
  populateTimelineSelect();
  showToast('Signed out', 'info');
}

function renderAuthUI(loggedIn) {
  const loginBtn = document.getElementById('login-btn');
  const userInfo = document.getElementById('user-info');
  const authCont = document.getElementById('auth-container');
  const syncBtn = document.getElementById('sync-btn');
  const pushBtn = document.getElementById('push-btn');
  if (loggedIn) {
    authCont.classList.add('hidden');
    userInfo.classList.remove('hidden');
    if (STATE.userProfile) {
      document.getElementById('user-avatar').src = STATE.userProfile.picture || '';
      document.getElementById('user-name').textContent = STATE.userProfile.name || '';
    }
  } else {
    authCont.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
  const canSync = loggedIn && !!CONFIG.SPREADSHEET_ID;
  syncBtn.classList.toggle('hidden', !canSync);
  pushBtn.classList.toggle('hidden', !canSync);
  refreshOpenSheetHref();
}

function extractSpreadsheetId(input) {
  const s = (input || '').trim();
  const fromUrl = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (fromUrl) return fromUrl[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(s)) return s;
  return '';
}

function refreshOpenSheetHref() {
  const a = document.getElementById('open-sheet-btn');
  if (a) {
    if (CONFIG.SPREADSHEET_ID) {
      const gid = STATE.activeGid != null ? `#gid=${STATE.activeGid}` : '';
      a.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit${gid}`;
      a.removeAttribute('aria-disabled');
      a.classList.remove('hidden');
    } else {
      a.href = '#';
      a.setAttribute('aria-disabled', 'true');
      a.classList.add('hidden');
    }
  }
  // People Sheet button — same spreadsheet, jumps to People tab via #gid
  const p = document.getElementById('open-people-sheet-btn');
  if (p) {
    if (CONFIG.SPREADSHEET_ID) {
      const gid = STATE.peopleGid != null ? `#gid=${STATE.peopleGid}` : '';
      p.href = `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit${gid}`;
      p.classList.remove('hidden');
      p.removeAttribute('aria-disabled');
    } else {
      p.href = '#';
      p.setAttribute('aria-disabled', 'true');
      p.classList.add('hidden');
    }
  }
}

function openGoogleSheet(e) {
  if (!CONFIG.SPREADSHEET_ID) {
    if (e) e.preventDefault();
    openSheetConnectModal();
    showToast('Connect a spreadsheet first — paste a URL/ID or create one.', 'warning');
    return false;
  }
  refreshOpenSheetHref();
  const a = document.getElementById('open-sheet-btn');
  if (e && e.currentTarget === a) return true;
  window.open(a.href, '_blank', 'noopener,noreferrer');
  return false;
}

/* ── Sheets API ── */
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

async function sheetsRequest(url, options = {}) {
  if (!STATE.accessToken) { showToast('Sign in with Google first', 'error'); return null; }
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + STATE.accessToken,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    showToast('Session expired or missing permission. Sign in again (consent).', 'warning');
    STATE.accessToken = null;
    requestToken(true);
    return null;
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return {};
  return res.json();
}

async function listSheetTabs() {
  if (!CONFIG.SPREADSHEET_ID) return;
  const url = `${SHEETS_BASE}/${CONFIG.SPREADSHEET_ID}?fields=spreadsheetId,sheets.properties`;
  const data = await sheetsRequest(url);
  if (!data) return;
  STATE.sheetTabs = (data.sheets || []).map(s => ({
    title: s.properties.title,
    sheetId: s.properties.sheetId,
  }));
  const match = STATE.sheetTabs.find(t => t.title === CONFIG.SHEET_NAME);
  if (match) STATE.activeGid = match.sheetId;
  else if (STATE.sheetTabs[0]) {
    CONFIG.SHEET_NAME = STATE.sheetTabs[0].title;
    STATE.activeGid = STATE.sheetTabs[0].sheetId;
  }
  // Track the People tab gid from the same spreadsheet
  const peopleTab = STATE.sheetTabs.find(t => t.title === CONFIG.PEOPLE_SHEET_NAME);
  STATE.peopleGid = peopleTab ? peopleTab.sheetId : null;
  refreshOpenSheetHref();
}

async function createSpreadsheetSeeded() {
  // ── Duplicate guard: if we already have an ID, verify it's still reachable ──
  if (CONFIG.SPREADSHEET_ID) {
    try {
      const check = await sheetsRequest(
        `${SHEETS_BASE}/${CONFIG.SPREADSHEET_ID}?fields=spreadsheetId`
      );
      if (check && check.spreadsheetId) {
        // File still exists — just open it, don't create another one
        hideSpinner();
        showToast('Spreadsheet already exists — opening it now.', 'info');
        await listSheetTabs();
        populateTimelineSelect();
        renderAuthUI(true);
        refreshOpenSheetHref();
        window.open(
          `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`,
          '_blank', 'noopener'
        );
        return;
      }
    } catch (_) {
      // 404 / 403 — file was deleted or access revoked; fall through and create fresh
      CONFIG.SPREADSHEET_ID = '';
    }
  }

  showSpinner();
  try {
    // One spreadsheet with all event tabs + the People tab
    const sheetDefs = [
      ...Object.values(BUILTIN).map(t => ({ properties: { title: t.title } })),
      { properties: { title: 'People' } },
    ];
    const body = {
      properties: { title: 'ChronicalizeASean' },
      sheets: sheetDefs,
    };
    const created = await sheetsRequest(SHEETS_BASE, { method: 'POST', body: JSON.stringify(body) });
    if (!created) return;

    CONFIG.SPREADSHEET_ID = created.spreadsheetId;
    persistLocal();
    await listSheetTabs();

    // Write all event tabs
    for (const t of Object.values(BUILTIN)) {
      await writeSheetTab(CONFIG.SPREADSHEET_ID, t.title, t.records, EVENT_SCHEMA);
    }

    // Write the People tab in the same spreadsheet
    await writeSheetTab(CONFIG.SPREADSHEET_ID, 'People', STATE.people || TL_PEOPLE, PEOPLE_SCHEMA);

    CONFIG.SHEET_NAME = BUILTIN.canon.title;
    STATE.activeKey = 'sheet:' + CONFIG.SHEET_NAME;
    persistLocal();

    populateTimelineSelect();
    renderAuthUI(true);
    await syncFromSheet();
    refreshOpenSheetHref();
    hideSpinner();
    showToast('Created spreadsheet with all timelines + People tab. Opening now…', 'success');
    window.open(
      `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit`,
      '_blank', 'noopener'
    );
  } catch (e) {
    hideSpinner();
    showToast('Could not create spreadsheet: ' + e.message, 'error');
  }
}

// listPeopleTabs is no longer needed — the People tab lives in the same spreadsheet
// as all event tabs. listSheetTabs() now resolves STATE.peopleGid automatically.
// This stub is kept so any lingering call sites don't throw.
async function listPeopleTabs() {
  await listSheetTabs();
}

async function writeSheetTab(spreadsheetId, sheetName, records, schema) {
  const sid = spreadsheetId;
  const cols = schema.map(c => c.key);
  const lastCol = String.fromCharCode(64 + cols.length);
  const range = encodeURIComponent(sheetName + '!A:' + lastCol);
  await sheetsRequest(`${SHEETS_BASE}/${sid}/values/${range}:clear`, { method: 'POST', body: JSON.stringify({}) });
  const values = [schemaHeader(schema), ...records.map(r => cols.map(f => String(r[f] ?? '')))];
  await sheetsRequest(
    `${SHEETS_BASE}/${sid}/values/${encodeURIComponent(sheetName + '!A1')}?valueInputOption=RAW`,
    { method: 'PUT', body: JSON.stringify({ values }) }
  );
  // Apply formatting after writing — best-effort, don't fail the whole write if it errors
  try { await formatSheetHeaders(sid, sheetName, schema, 0); } catch (_) {}
}

// Applies header formatting to a sheet tab:
//   - Freezes row 1 so it stays visible while scrolling
//   - Bolds the header row and sets a dark background with white text
//   - Writes a per-column note containing the field's meaning and any hints
//   - Auto-resizes all columns to fit their content
//
// sheetId   : numeric Google Sheet tab id (from listSheetTabs)
// startColIndex : 0-based index of the first column to format (0 for a full write, or
//                 existingRow.length when appending missing columns)
async function formatSheetHeaders(spreadsheetId, sheetName, schema, startColIndex) {
  // Resolve the numeric sheetId for this tab name
  const meta = await sheetsRequest(
    SHEETS_BASE + '/' + spreadsheetId + '?fields=sheets.properties'
  );
  if (!meta) return;
  const tabMeta = (meta.sheets || []).find(s => s.properties.title === sheetName);
  if (!tabMeta) return;
  const sheetId = tabMeta.properties.sheetId;
  const numCols = schema.length;

  const requests = [];

  // 1. Freeze row 1 (only set when formatting from column 0 — full write)
  if (startColIndex === 0) {
    requests.push({
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
        fields: 'gridProperties.frozenRowCount',
      },
    });
  }

  // 2. Bold + dark background (#1e293b slate-800) + white text for the header row
  requests.push({
    repeatCell: {
      range: {
        sheetId,
        startRowIndex: 0, endRowIndex: 1,
        startColumnIndex: startColIndex, endColumnIndex: startColIndex + (numCols - startColIndex),
      },
      cell: {
        userEnteredFormat: {
          backgroundColor: { red: 0.118, green: 0.161, blue: 0.231 }, // #1e293b
          textFormat: {
            bold: true,
            foregroundColor: { red: 1, green: 1, blue: 1 },
            fontSize: 10,
          },
          wrapStrategy: 'CLIP',
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,wrapStrategy)',
    },
  });

  // 3. Per-column notes: field meaning + any format hints from the label
  schema.slice(startColIndex).forEach((col, i) => {
    const colIdx = startColIndex + i;
    let note = col.meaning || '';
    // Append explicit hints for key special fields
    if (col.key === 'date_start' || col.key === 'date_end' || col.key === 'date_birth' || col.key === 'date_death') {
      note += '\n\nFormat: YYYY-MM-DD\nBCE dates use a leading minus: -0264-01-01\ndate_end can be left blank for point-in-time events.';
    } else if (col.key === 'id' || col.key === 'version' || col.key === 'handle') {
      note += '\n\nLeave blank — the app fills this automatically.';
    } else if (col.key === 'parent_id') {
      note += '\n\nPaste the id value of the parent event.\nLeave blank for a top-level (root) event.\nExample chain: Roman Empire → Punic Wars → Battle of Zama';
    } else if (col.key === 'people') {
      note += '\n\nSpace-separated @handles from the People tab.\nExample: @julius_caesar @augustus';
    } else if (col.key === 'tags') {
      note += '\n\nSpace-separated hashtags.\nExample: #war #rome #empire\nShared tags draw connection lines on the timeline.';
    } else if (col.key === 'importance') {
      note += '\n\nNumber from 1 to 10.\nHigher = larger emoji on the timeline. Default: 5.';
    } else if (col.key === 'emoji') {
      note += '\n\nSingle emoji character. Default: 📌';
    }
    if (!note) return;
    requests.push({
      updateCells: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: colIdx, endColumnIndex: colIdx + 1 },
        rows: [{ values: [{ note }] }],
        fields: 'note',
      },
    });
  });

  // 4. Auto-resize all columns so labels aren't truncated
  requests.push({
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: 'COLUMNS',
        startIndex: startColIndex,
        endIndex: startColIndex + (numCols - startColIndex),
      },
    },
  });

  await sheetsRequest(SHEETS_BASE + '/' + spreadsheetId + ':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests }),
  });
}

// Reads the current header row and appends any schema columns that are missing.
// Safe to call on every sync — it's a no-op when headers are already up to date.
async function ensureSheetHeaders(spreadsheetId, sheetName, schema) {
  const expectedKeys = schema.map(c => c.key);
  const lastExpectedCol = String.fromCharCode(64 + expectedKeys.length);
  const rangeEnc = encodeURIComponent(sheetName + '!A1:' + lastExpectedCol);
  const data = await sheetsRequest(SHEETS_BASE + '/' + spreadsheetId + '/values/' + rangeEnc);
  if (!data) return;

  const existingRow = (data.values && data.values[0]) || [];
  const existingKeys = existingRow.map(normalizeHeaderCell);

  const missing = expectedKeys.filter(k => !existingKeys.includes(k));
  if (!missing.length) return; // nothing to do

  // Append missing headers to the right of whatever is already there
  const startColIndex = existingRow.length; // 0-based
  const startColLetter = String.fromCharCode(65 + startColIndex);
  const endColLetter   = String.fromCharCode(65 + startColIndex + missing.length - 1);
  const appendRange = encodeURIComponent(sheetName + '!' + startColLetter + '1:' + endColLetter + '1');

  // Use the same rich label convention as schemaHeader()
  const missingSchema = missing.map(k => schema.find(c => c.key === k)).filter(Boolean);
  const headerLabels = schemaHeader(missingSchema);

  await sheetsRequest(
    SHEETS_BASE + '/' + spreadsheetId + '/values/' + appendRange + '?valueInputOption=RAW',
    { method: 'PUT', body: JSON.stringify({ values: [headerLabels] }) }
  );

  // Format the newly-added columns to match the existing header style
  try { await formatSheetHeaders(spreadsheetId, sheetName, missingSchema, startColIndex); } catch (_) {}

  console.info('[ChronicalizeASean] Added missing columns to "' + sheetName + '": ' + missing.join(', '));
}

async function syncFromSheet() {
  if (!CONFIG.SPREADSHEET_ID) { showToast('No spreadsheet connected', 'warning'); return; }
  showSpinner();
  try {
    // Forward-migrate headers in case the schema has grown since the sheet was created
    await ensureSheetHeaders(CONFIG.SPREADSHEET_ID, CONFIG.SHEET_NAME, EVENT_SCHEMA);

    // Derive last column letter from schema length so range never goes stale when columns are added
    const lastCol = String.fromCharCode(64 + FIELDS.length);
    const range = encodeURIComponent(`${CONFIG.SHEET_NAME}!A1:${lastCol}`);
    const data = await sheetsRequest(`${SHEETS_BASE}/${CONFIG.SPREADSHEET_ID}/values/${range}`);
    if (!data) return;
    const rows = data.values || [];
    if (rows.length < 2) {
      STATE.records = [];
      applyFilters();
      renderTimeline();
      hideSpinner();
      showToast('Sheet tab is empty', 'info');
      return;
    }
    const header = rows[0].map(normalizeHeaderCell);
    const incoming = rows.slice(1).map(row => {
      const rec = {};
      FIELDS.forEach(f => {
        const idx = header.indexOf(f);
        rec[f] = idx >= 0 ? (row[idx] || '') : '';
      });
      rec.date_start = normalizeDateInput(rec.date_start);
      rec.date_end = normalizeDateInput(rec.date_end);
      rec.version = Number(rec.version) || 1;
      rec.importance = Number(rec.importance) || 5;
      rec.id = rec.id || generateId();
      rec.parent_id  = (rec.parent_id  || '').trim();
      rec.people     = (rec.people     || '').trim();
      rec.location   = (rec.location   || '').trim();
      return rec;
    }).filter(r => r.event_name && parseDate(r.date_start));
    STATE.records = incoming;
    STATE.activeKey = 'sheet:' + CONFIG.SHEET_NAME;
    applyFilters();
    renderTimeline();

    // Also sync the People tab from the same spreadsheet (best-effort — don't fail the whole sync)
    try {
      await ensureSheetHeaders(CONFIG.SPREADSHEET_ID, CONFIG.PEOPLE_SHEET_NAME, PEOPLE_SCHEMA);
      const peopleLastCol = String.fromCharCode(64 + PEOPLE_FIELDS.length);
      const peopleRange = encodeURIComponent(CONFIG.PEOPLE_SHEET_NAME + '!A1:' + peopleLastCol);
      const peopleData = await sheetsRequest(SHEETS_BASE + '/' + CONFIG.SPREADSHEET_ID + '/values/' + peopleRange);
      if (peopleData && (peopleData.values || []).length >= 2) {
        const ph = peopleData.values[0].map(normalizeHeaderCell);
        STATE.people = peopleData.values.slice(1).map(row => {
          const p = {};
          PEOPLE_FIELDS.forEach(f => {
            const idx = ph.indexOf(f);
            p[f] = idx >= 0 ? (row[idx] || '') : '';
          });
          p.id = p.id || generateId();
          return p;
        }).filter(p => p.name);
        persistLocal();
      }
    } catch (_) { /* People tab missing or unreadable — not fatal */ }

    hideSpinner();
    showToast(`Synced ${incoming.length} rows from “${CONFIG.SHEET_NAME}”`, 'success');
  } catch (e) {
    hideSpinner();
    showToast('Sync error: ' + e.message, 'error');
  }
}

async function pushToSheet() {
  if (!CONFIG.SPREADSHEET_ID) { showToast('No spreadsheet connected', 'warning'); return; }
  showSpinner();
  try {
    await writeSheetTab(CONFIG.SPREADSHEET_ID, CONFIG.SHEET_NAME, STATE.records, EVENT_SCHEMA);
    hideSpinner();
    showToast(`Pushed ${STATE.records.length} records to “${CONFIG.SHEET_NAME}”`, 'success');
  } catch (e) {
    hideSpinner();
    showToast('Push error: ' + e.message, 'error');
  }
}

async function addSheetTab(spreadsheetId, title) {
  return sheetsRequest(`${SHEETS_BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] }),
  });
}

function mergeRecords(existing, incoming) {
  const map = {};
  existing.forEach(r => { map[r.id] = r; });
  incoming.forEach(r => { if (r.id) map[r.id] = r; });
  return Object.values(map);
}

function createRecord(data) {
  const rec = {
    id: generateId(),
    version: 1,
    parent_id: (data.parent_id || '').trim(),
    event_name: (data.event_name || '').trim(),
    date_start: normalizeDateInput(data.date_start),
    date_end: normalizeDateInput(data.date_end),
    description: (data.description || '').trim(),
    sources: (data.sources || '').trim(),
    image_url: (data.image_url || '').trim(),
    emoji: (data.emoji || '📌').trim() || '📌',
    category: (data.category || '').trim(),
    tags: (data.tags || '').trim(),
    people: (data.people || '').trim(),
    location: (data.location || '').trim(),
    importance: Math.min(10, Math.max(1, Number(data.importance) || 5)),
  };
  const errors = validateRecord(rec);
  if (errors.length) { errors.forEach(e => showToast(e, 'error')); return null; }
  STATE.records.push(rec);
  afterMutation();
  return rec;
}

function updateRecord(id, data) {
  const idx = STATE.records.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const rec = {
    ...STATE.records[idx],
    parent_id: (data.parent_id || '').trim(),
    event_name: (data.event_name || '').trim(),
    date_start: normalizeDateInput(data.date_start),
    date_end: normalizeDateInput(data.date_end),
    description: (data.description || '').trim(),
    sources: (data.sources || '').trim(),
    image_url: (data.image_url || '').trim(),
    emoji: (data.emoji || '📌').trim() || '📌',
    category: (data.category || '').trim(),
    tags: (data.tags || '').trim(),
    people: (data.people || '').trim(),
    location: (data.location || '').trim(),
    importance: Math.min(10, Math.max(1, Number(data.importance) || 5)),
  };
  const errors = validateRecord(rec);
  if (errors.length) { errors.forEach(e => showToast(e, 'error')); return null; }
  STATE.records[idx] = rec;
  afterMutation();
  return rec;
}

function deleteRecord(id) {
  STATE.records = STATE.records.filter(r => r.id !== id);
  if (STATE.lastClickedId === id) clearEventDetail();
  afterMutation();
}

function afterMutation() {
  if (STATE.activeKey.startsWith('local:')) {
    STATE.localCustom[STATE.activeKey.slice(6)] = STATE.records;
  }
  persistLocal();
  applyFilters();
  renderTimeline();
}

function applyFilters() {
  const txt = STATE.filterText.toLowerCase();
  const cat = STATE.filterCategory;
  const tag = STATE.filterTag;
  const from = parseDate(STATE.dateFrom);
  const to = parseDate(STATE.dateTo);
  STATE.filtered = STATE.records.filter(r => {
    if (cat && r.category !== cat) return false;
    if (tag && !parseTags(r.tags).includes(tag)) return false;
    if (txt && !r.event_name.toLowerCase().includes(txt) && !(r.description || '').toLowerCase().includes(txt)) return false;
    const ds = parseDate(r.date_start);
    const de = parseDate(r.date_end) || ds;
    if (from && de && de < from) return false;
    if (to && ds && ds > to) return false;
    return true;
  });
  updateFilterOptions();
}

function parseTags(tagStr) {
  return (tagStr || '').match(/#[\w]+/g) || [];
}

function updateFilterOptions() {
  const catSel = document.getElementById('category-filter');
  const tagSel = document.getElementById('tag-filter');
  const cats = [...new Set(STATE.records.map(r => r.category).filter(Boolean))].sort();
  const tags = [...new Set(STATE.records.flatMap(r => parseTags(r.tags)))].sort();
  const savedCat = catSel.value;
  const savedTag = tagSel.value;
  catSel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  tagSel.innerHTML = '<option value="">All Tags</option>' + tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  catSel.value = savedCat;
  tagSel.value = savedTag;
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

function renderTimeline() {
  const svg = document.getElementById('timeline-svg');
  svg.innerHTML = '';
  const records = STATE.filtered;
  const empty = document.getElementById('empty-state');
  if (!records.length) {
    empty.classList.remove('hidden');
    updateMinimap(0, 0);
    return;
  }
  empty.classList.add('hidden');

  const dates = records.flatMap(r => [parseDate(r.date_start), r.date_end ? parseDate(r.date_end) : null].filter(Boolean));
  let minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  let maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  if (minDate.getTime() === maxDate.getTime()) maxDate = new Date(minDate.getTime() + 86400000);

  const wrapper = document.getElementById('timeline-wrapper');
  const availH = Math.max(280, wrapper.clientHeight || 400);
  const pad = CONFIG.TIMELINE_PADDING;
  const zoom = STATE.zoom;
  const baseWidth = Math.max(wrapper.clientWidth || window.innerWidth - 40, 640);
  const totalWidth = STATE.layoutMode === 'wrap' ? baseWidth : baseWidth * zoom;
  const axisWidth = totalWidth - pad * 2;
  const minT = minDate.getTime();
  const maxT = maxDate.getTime();
  const totalMs = maxT - minT;

  let numRows = 1;
  if (STATE.layoutMode === 'wrap') {
    if (STATE.wrapRows === 'auto') {
      numRows = Math.max(2, Math.min(8, Math.round(availH / 150)));
      const spanYears = totalMs / (1000 * 60 * 60 * 24 * 365.25);
      if (spanYears > 800) numRows = Math.max(numRows, 4);
      if (spanYears > 2000) numRows = Math.max(numRows, 5);
    } else {
      numRows = Math.max(1, parseInt(STATE.wrapRows, 10) || 3);
    }
  }

  const rowH = STATE.layoutMode === 'wrap' ? Math.max(80, Math.floor(availH / numRows)) : availH;
  const svgH = STATE.layoutMode === 'wrap' ? rowH * numRows : Math.max(availH, 280);
  // axisOffset: axis sits 55% down each row in wrap mode, leaving room for labels above and bars below
  const axisOffset = STATE.layoutMode === 'wrap' ? Math.round(rowH * 0.55) : Math.round(svgH * 0.55);
  const rowMs = totalMs / numRows;

  svg.setAttribute('width', totalWidth);
  svg.setAttribute('height', svgH);

  function rowForTime(t) {
    if (numRows <= 1) return 0;
    const idx = Math.floor((t - minT) / rowMs);
    return Math.min(numRows - 1, Math.max(0, idx));
  }
  function dateToXY(d) {
    if (!d) return { x: pad, y: axisOffset, row: 0 };
    const t = d.getTime();
    const row = rowForTime(t);
    const rowStart = minT + row * rowMs;
    const x = pad + ((t - rowStart) / rowMs) * axisWidth;
    const y = row * rowH + axisOffset;
    return { x, y, row };
  }

  const byRow = Array.from({ length: numRows }, () => []);
  records.forEach(r => {
    const d = parseDate(r.date_start);
    if (!d) return;
    byRow[rowForTime(d.getTime())].push(r);
  });
  const lanesByRow = byRow.map(list => assignLanes(list));

  for (let i = 0; i < numRows; i++) {
    const axisY = i * rowH + axisOffset;
    const rowStart = new Date(minT + i * rowMs);
    const rowEnd = new Date(minT + (i + 1) * rowMs);
    drawTicks(svg, rowStart, rowEnd, axisY, pad, axisWidth, rowMs);
    svg.appendChild(svgEl('line', { x1: pad, y1: axisY, x2: pad + axisWidth, y2: axisY, class: 'axis-line' }));
    // Left label: row start year
    const bandStart = svgEl('text', { x: pad - 8, y: axisY - 10, 'text-anchor': 'end', class: 'tick-label' });
    bandStart.textContent = formatTickYear(rowStart);
    svg.appendChild(bandStart);
    // Right label: row end year (shows continuity across the wrap)
    const bandEnd = svgEl('text', { x: pad + axisWidth + 8, y: axisY - 10, 'text-anchor': 'start', class: 'tick-label' });
    bandEnd.textContent = formatTickYear(rowEnd);
    svg.appendChild(bandEnd);
    if (i < numRows - 1) {
      const y2 = (i + 1) * rowH + axisOffset;
      const xEnd = pad + axisWidth;
      // S-curve runs from the end of this axis line to the start of the next one.
      // Control points pull just 20px outside the axis edges so the curve stays tight.
      const midY = (axisY + y2) / 2;
      svg.appendChild(svgEl('path', {
        d: `M ${xEnd} ${axisY} C ${xEnd + 20} ${axisY}, ${xEnd + 20} ${midY}, ${xEnd} ${midY} M ${pad} ${midY} C ${pad - 20} ${midY}, ${pad - 20} ${y2}, ${pad} ${y2}`,
        fill: 'none', stroke: '#475569', 'stroke-width': 1.5, 'stroke-dasharray': '4 4', class: 'row-join',
      }));
    }
  }

  function posFor(r) {
    const start = parseDate(r.date_start);
    const { x, y, row } = dateToXY(start);
    const lane = (lanesByRow[row] || {})[r.id] || 0;
    return { x, y: y - 22 - lane * 26, axisY: y, row, lane };
  }

  if (STATE.showConnections) {
    const fakeLanes = {};
    records.forEach(r => { fakeLanes[r.id] = (lanesByRow[posFor(r).row] || {})[r.id] || 0; });
    drawConnectionsXY(svg, records, posFor);
  }

  records.forEach(r => {
    if (!r.date_end) return;
    const p1 = posFor(r);
    const end = parseDate(r.date_end);
    const p2 = dateToXY(end);
    const color = categoryColor(r.category);
    const barY = p1.y + 10;
    const barH = 14;

    if (p2.row === p1.row) {
      // Simple case: event starts and ends in the same row
      svg.appendChild(svgEl('rect', {
        x: p1.x, y: barY, width: Math.max(p2.x - p1.x, 4), height: barH,
        fill: color, rx: 3, ry: 3, opacity: 0.55, class: 'duration-bar',
      }));
      return;
    }

    // Multi-row case: draw one bar segment per row the event spans
    const xEnd = pad + axisWidth;

    // Segment on the starting row: from p1.x to the right edge
    svg.appendChild(svgEl('rect', {
      x: p1.x, y: barY, width: Math.max(xEnd - p1.x, 4), height: barH,
      fill: color, rx: 3, ry: 3, opacity: 0.45, class: 'duration-bar',
    }));

    // Full-width segments on any intermediate rows — sit on each row's axis line
    for (let row = p1.row + 1; row < p2.row; row++) {
      const midAxisY = row * rowH + axisOffset;
      svg.appendChild(svgEl('rect', {
        x: pad, y: midAxisY - 7, width: axisWidth, height: barH,
        fill: color, rx: 3, ry: 3, opacity: 0.35, class: 'duration-bar',
      }));
    }

    // Segment on the ending row: from the left edge to p2.x — sit on that row's axis
    const endAxisY = p2.row * rowH + axisOffset;
    svg.appendChild(svgEl('rect', {
      x: pad, y: endAxisY - 7, width: Math.max(p2.x - pad, 4), height: barH,
      fill: color, rx: 3, ry: 3, opacity: 0.45, class: 'duration-bar',
    }));
  });

  records.forEach(r => {
    const p = posFor(r);
    const imp = Math.min(10, Math.max(1, Number(r.importance) || 5));
    const fontSize = 16 + (imp - 1) * 1.6;
    const g = svgEl('g', {
      class: 'emoji-marker',
      transform: `translate(${p.x}, ${p.y})`,
      'data-id': r.id,
      role: 'button',
      tabindex: '0',
      'aria-label': r.event_name,
    });
    const txt = svgEl('text', { x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'middle', 'font-size': fontSize });
    txt.textContent = r.emoji || '📌';
    g.appendChild(txt);
    g.addEventListener('click', (e) => {
      e.stopPropagation();
      selectEvent(r.id, { x: p.x, y: p.y, axisY: p.axisY });
    });
    g.addEventListener('mouseenter', () => showPopoverDelayed(r.id, p.x, p.y));
    g.addEventListener('mouseleave', cancelPopoverDelay);
    g.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectEvent(r.id, { x: p.x, y: p.y, axisY: p.axisY }); }
    });
    svg.appendChild(g);
    svg.appendChild(svgEl('circle', {
      cx: p.x, cy: p.axisY, r: 4, fill: categoryColor(r.category), stroke: '#0f172a', 'stroke-width': 1.5,
    }));
  });

  updateMinimap(totalWidth, baseWidth);
  highlightActiveMarkers();
}

function drawConnectionsXY(svg, records, posFor) {
  const matrix = buildSharedTagMatrix(records);
  const byId = {};
  records.forEach(r => { byId[r.id] = r; });
  Object.entries(matrix).forEach(([key, count]) => {
    const [id1, id2] = key.split('|');
    const r1 = byId[id1]; const r2 = byId[id2];
    if (!r1 || !r2) return;
    const a = posFor(r1); const b = posFor(r2);
    const color = count >= 3 ? '#f59e0b' : count === 2 ? '#8b5cf6' : '#3b82f6';
    const path = svgEl('path', {
      d: `M ${a.x} ${a.y} C ${a.x} ${a.y - 24}, ${b.x} ${b.y - 24}, ${b.x} ${b.y}`,
      fill: 'none', stroke: color, 'stroke-width': count,
      opacity: Math.min(0.55, 0.15 + count * 0.12), class: 'connection-line',
    });
    svg.insertBefore(path, svg.firstChild);
  });
}

function drawTicks(svg, minDate, maxDate, axisY, pad, axisWidth, totalMs) {
  const rangeYears = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365.25);
  const ticks = [];
  let step = 1;
  if (rangeYears >= 4000) step = 500;
  else if (rangeYears >= 1500) step = 200;
  else if (rangeYears >= 600) step = 100;
  else if (rangeYears >= 200) step = 50;
  else if (rangeYears >= 80) step = 10;
  else if (rangeYears >= 20) step = 5;
  else if (rangeYears >= 2) step = 1;

  if (rangeYears >= 2) {
    const startY = minDate.getUTCFullYear();
    const endY = maxDate.getUTCFullYear();
    const first = Math.floor(startY / step) * step;
    for (let y = first; y <= endY + 1; y += step) {
      const dt = new Date(Date.UTC(2000, 0, 1));
      dt.setUTCFullYear(y);
      if (dt >= minDate && dt <= maxDate) ticks.push({ date: dt, label: formatTickYear(dt) });
    }
  } else {
    let m = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1));
    while (m <= maxDate) {
      ticks.push({
        date: new Date(m),
        label: `${m.getUTCFullYear()}/${String(m.getUTCMonth() + 1).padStart(2, '0')}`,
      });
      m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1));
    }
  }

  ticks.forEach(t => {
    const x = pad + ((t.date - minDate) / totalMs) * axisWidth;
    svg.appendChild(svgEl('line', { x1: x, y1: axisY - 6, x2: x, y2: axisY + 6, class: 'tick-line' }));
    const lbl = svgEl('text', { x, y: axisY + 18, 'text-anchor': 'middle', class: 'tick-label' });
    lbl.textContent = t.label;
    svg.appendChild(lbl);
  });
}

function assignLanes(records) {
  const sorted = [...records].sort((a, b) => (parseDate(a.date_start) || 0) - (parseDate(b.date_start) || 0));
  const lanes = {};
  const laneEnds = [];
  sorted.forEach(r => {
    const start = parseDate(r.date_start);
    if (!start) { lanes[r.id] = 0; return; }
    const end = r.date_end ? parseDate(r.date_end) : start;
    let lane = 0;
    const gap = 1000 * 60 * 60 * 24 * 40;
    while (laneEnds[lane] && laneEnds[lane] >= start.getTime() - gap) lane++;
    lanes[r.id] = lane;
    laneEnds[lane] = end.getTime();
  });
  return lanes;
}

function buildTagMap(records) {
  const tagMap = {};
  records.forEach(r => {
    parseTags(r.tags).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(r.id);
    });
  });
  return tagMap;
}

function buildSharedTagMatrix(records) {
  const shared = {};
  Object.values(buildTagMap(records)).forEach(ids => {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = [ids[i], ids[j]].sort().join('|');
        shared[key] = (shared[key] || 0) + 1;
      }
    }
  });
  return shared;
}

function drawConnections(svg, records, dateToX, axisY, lanes) {
  const matrix = buildSharedTagMatrix(records);
  const byId = {};
  records.forEach(r => { byId[r.id] = r; });
  Object.entries(matrix).forEach(([key, count]) => {
    const [id1, id2] = key.split('|');
    const r1 = byId[id1]; const r2 = byId[id2];
    if (!r1 || !r2) return;
    const x1 = dateToX(parseDate(r1.date_start));
    const x2 = dateToX(parseDate(r2.date_start));
    const y1 = axisY - 22 - (lanes[r1.id] || 0) * 28;
    const y2 = axisY - 22 - (lanes[r2.id] || 0) * 28;
    const color = count >= 3 ? '#f59e0b' : count === 2 ? '#8b5cf6' : '#3b82f6';
    const path = svgEl('path', {
      d: `M ${x1} ${y1} C ${x1} ${y1 - 30}, ${x2} ${y2 - 30}, ${x2} ${y2}`,
      fill: 'none', stroke: color, 'stroke-width': count,
      opacity: Math.min(0.7, 0.2 + count * 0.15), class: 'connection-line',
    });
    svg.insertBefore(path, svg.firstChild);
  });
}

function drawClusters(svg, records, dateToX, axisY, lanes) {
  const matrix = buildSharedTagMatrix(records);
  const groups = new Map();
  let groupId = 0;
  Object.entries(matrix).forEach(([key, count]) => {
    if (count < 2) return;
    const [id1, id2] = key.split('|');
    const g1 = groups.get(id1);
    const g2 = groups.get(id2);
    if (!g1 && !g2) { groups.set(id1, groupId); groups.set(id2, groupId); groupId++; }
    else if (g1 && !g2) groups.set(id2, g1);
    else if (!g1 && g2) groups.set(id1, g2);
  });
  const groupRects = {};
  groups.forEach((gid, id) => {
    const r = records.find(rec => rec.id === id);
    if (!r) return;
    const x = dateToX(parseDate(r.date_start));
    const y = axisY - 22 - (lanes[r.id] || 0) * 28;
    if (!groupRects[gid]) groupRects[gid] = { minX: x, maxX: x, minY: y, maxY: y };
    const gr = groupRects[gid];
    gr.minX = Math.min(gr.minX, x - 20);
    gr.maxX = Math.max(gr.maxX, x + 20);
    gr.minY = Math.min(gr.minY, y - 20);
    gr.maxY = Math.max(gr.maxY, y + 20);
  });
  Object.values(groupRects).forEach(gr => {
    svg.insertBefore(svgEl('rect', {
      x: gr.minX - 10, y: gr.minY - 10,
      width: gr.maxX - gr.minX + 20, height: gr.maxY - gr.minY + 20,
      fill: 'rgba(59,130,246,0.06)', stroke: 'rgba(59,130,246,0.2)',
      'stroke-width': 1, rx: 8, ry: 8, class: 'cluster-rect',
    }), svg.firstChild);
  });
}

function renderHeatmapPanel() {
  const records = STATE.filtered;
  const tagMap = buildTagMap(records);
  const byId = {};
  records.forEach(r => { byId[r.id] = r; });
  const sorted = Object.entries(tagMap).filter(([, ids]) => ids.length > 1).sort((a, b) => b[1].length - a[1].length);
  const content = document.getElementById('heatmap-content');
  if (!sorted.length) {
    content.innerHTML = '<p style="color:var(--text-400)">No shared tags found.</p>';
    return;
  }
  content.innerHTML = sorted.map(([tag, ids]) => {
    const names = ids.map(id => byId[id]?.event_name || id).join(', ');
    return `<div class="heatmap-row">
      <span class="heatmap-tag">${esc(tag)}</span>
      <span class="heatmap-count">${ids.length} events</span>
      <span class="heatmap-events" title="${esc(names)}">${esc(names)}</span>
    </div>`;
  }).join('');
}

function updateMinimap(totalWidth, viewWidth) {
  const canvas = document.getElementById('minimap-canvas');
  const viewport = document.getElementById('minimap-viewport');
  const wrapper = document.getElementById('timeline-wrapper');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 200, 40);
  if (!totalWidth) { viewport.style.width = '100%'; viewport.style.left = '0'; return; }
  const records = STATE.filtered;
  if (!records.length) return;
  const dates = records.map(r => parseDate(r.date_start)).filter(Boolean);
  const minT = Math.min(...dates.map(d => d.getTime()));
  const maxT = Math.max(...dates.map(d => d.getTime()));
  records.forEach(r => {
    const d = parseDate(r.date_start);
    if (!d) return;
    const x = ((d.getTime() - minT) / (maxT - minT || 1)) * 196 + 2;
    ctx.fillStyle = categoryColor(r.category);
    ctx.beginPath();
    ctx.arc(x, 20, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  const ratio = viewWidth / totalWidth;
  const scrollRatio = wrapper.scrollLeft / (totalWidth - viewWidth || 1);
  viewport.style.width = Math.max(ratio * 200, 10) + 'px';
  viewport.style.left = scrollRatio * (200 - ratio * 200) + 'px';
}

let _popoverDelayTimer = null;

function showPopoverDelayed(id, svgX, svgY) {
  cancelPopoverDelay();
  _popoverDelayTimer = setTimeout(() => showPopover(id, svgX, svgY), 280);
}
function cancelPopoverDelay() { clearTimeout(_popoverDelayTimer); }

function selectEvent(id, pos) {
  STATE.lastClickedId = id;
  showEventDetail(id);
  highlightActiveMarkers();
  if (pos) showPopover(id, pos.x, pos.y);
  scrollToEvent(id);
}

function highlightActiveMarkers() {
  document.querySelectorAll('.emoji-marker').forEach(g => {
    const id = g.getAttribute('data-id');
    g.classList.toggle('is-active', id === STATE.lastClickedId && !STATE.screensaver);
    g.classList.toggle('is-ss', STATE.screensaver && id === STATE.lastClickedId);
  });
}

function showEventDetail(id) {
  const r = STATE.records.find(rec => rec.id === id);
  if (!r) return;
  document.getElementById('ed-emoji').textContent = r.emoji || '📌';
  const nameEl = document.getElementById('ed-name');
  if (r.sources) {
    nameEl.innerHTML = `<a href="${esc(r.sources)}" target="_blank" rel="noopener">${esc(r.event_name)}</a>`;
  } else {
    nameEl.textContent = r.event_name;
  }
  document.getElementById('ed-dates').textContent = formatDateRange(r.date_start, r.date_end);
  document.getElementById('ed-desc').textContent = r.description || '';
  const tags = parseTags(r.tags);
  document.getElementById('ed-tags').innerHTML = tags.map(t => `<span class="tag-badge">${esc(t)}</span>`).join('');
  const src = document.getElementById('ed-source-link');
  if (r.sources) {
    src.href = r.sources;
    src.classList.remove('hidden');
  } else {
    src.classList.add('hidden');
  }
  const edit = document.getElementById('ed-edit-btn');
  edit.classList.remove('hidden');
  edit.onclick = () => openEditModal(id);
}

function clearEventDetail() {
  STATE.lastClickedId = null;
  document.getElementById('ed-emoji').textContent = '⏳';
  document.getElementById('ed-name').textContent = 'Click an event on the timeline';
  document.getElementById('ed-dates').textContent = 'The last clicked event (and slideshow) shows here.';
  document.getElementById('ed-desc').textContent = '';
  document.getElementById('ed-tags').innerHTML = '';
  document.getElementById('ed-source-link').classList.add('hidden');
  document.getElementById('ed-edit-btn').classList.add('hidden');
  highlightActiveMarkers();
}

function scrollToEvent(id) {
  const g = document.querySelector(`.emoji-marker[data-id="${CSS.escape(id)}"]`);
  const wrapper = document.getElementById('timeline-wrapper');
  if (!g || !wrapper) return;
  const t = g.getAttribute('transform') || '';
  const m = t.match(/translate\(([-0-9.]+)/);
  if (!m) return;
  const x = Number(m[1]);
  wrapper.scrollLeft = Math.max(0, x - wrapper.clientWidth / 2);
}

function showPopover(id, svgX, svgY) {
  const r = STATE.records.find(rec => rec.id === id);
  if (!r) return;
  STATE.activePopoverId = id;
  const popover = document.getElementById('popover');
  const wrapper = document.getElementById('timeline-wrapper');
  const wRect = wrapper.getBoundingClientRect();
  const screenX = wRect.left + svgX - wrapper.scrollLeft;
  const screenY = wRect.top + svgY - wrapper.scrollTop;
  const imgEl = document.getElementById('popover-image');
  if (r.image_url) {
    imgEl.src = r.image_url;
    imgEl.parentElement.style.display = '';
    imgEl.onerror = () => { imgEl.parentElement.style.display = 'none'; };
  } else {
    imgEl.parentElement.style.display = 'none';
  }
  const nameEl = document.getElementById('popover-name');
  nameEl.textContent = r.event_name;
  nameEl.href = r.sources || '#';
  document.getElementById('popover-dates').textContent = formatDateRange(r.date_start, r.date_end);
  const catEl = document.getElementById('popover-category');
  catEl.innerHTML = r.category
    ? `<span class="category-badge" style="background:${categoryColor(r.category)}">${esc(r.category)}</span>` : '';
  const imp = Math.min(10, Math.max(1, Number(r.importance) || 5));
  document.getElementById('popover-importance').innerHTML = Array.from({ length: 10 }, (_, i) =>
    `<span class="importance-pip ${i < imp ? 'filled' : ''}"></span>`
  ).join('');
  const desc = r.description || '';
  document.getElementById('popover-desc').textContent = desc.length > 180 ? desc.slice(0, 180) + '…' : desc;
  document.getElementById('popover-tags').innerHTML = parseTags(r.tags).map(t => `<span class="tag-badge">${esc(t)}</span>`).join('');
  document.getElementById('popover-edit-btn').onclick = () => { hidePopover(); openEditModal(id); };
  document.getElementById('popover-delete-btn').onclick = () => { hidePopover(); confirmDelete(id); };
  popover.classList.remove('hidden');
  const pw = popover.offsetWidth || 280;
  const ph = popover.offsetHeight || 260;
  let left = screenX - pw / 2;
  let top = screenY - ph - 12;
  if (left < 8) left = 8;
  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
  if (top < 8) top = screenY + 24;
  if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
  popover.style.left = left + 'px';
  popover.style.top = top + 'px';
}

function hidePopover() {
  document.getElementById('popover').classList.add('hidden');
  STATE.activePopoverId = null;
}

function setEmojiPreview(emoji) {
  const val = (emoji || '📌').trim() || '📌';
  document.getElementById('field-emoji').value = val;
  document.getElementById('emoji-preview-btn').textContent = val;
}

function renderEmojiGrid(filter) {
  const q = (filter || '').trim().toLowerCase();
  const grid = document.getElementById('emoji-picker-grid');
  const filtered = EMOJI_CATALOG.filter(([e, k]) => !q || k.includes(q) || e.includes(q));
  grid.innerHTML = '';
  (filtered.length ? filtered : EMOJI_CATALOG).forEach(([e, k]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'emoji-pick';
    b.title = k;
    b.textContent = e;
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      setEmojiPreview(e);
      document.getElementById('emoji-picker-panel').classList.add('hidden');
    });
    grid.appendChild(b);
  });
}

function setupEmojiPicker() {
  const panel = document.getElementById('emoji-picker-panel');
  const btn = document.getElementById('emoji-preview-btn');
  const input = document.getElementById('field-emoji');
  const search = document.getElementById('emoji-search-input');
  renderEmojiGrid('');
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) {
      renderEmojiGrid(search.value);
      search.focus();
    }
  });
  input.addEventListener('input', () => {
    const v = input.value.trim() || '📌';
    btn.textContent = v;
  });
  search.addEventListener('input', () => renderEmojiGrid(search.value));
  search.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.emoji-field')) panel.classList.add('hidden');
  });
}

function openCreateModal() {
  document.getElementById('crud-form').reset();
  document.getElementById('field-id').value = '';
  setEmojiPreview('📌');
  document.getElementById('modal-title').textContent = 'Add Event';
  document.getElementById('modal-delete-btn').classList.add('hidden');
  document.getElementById('emoji-picker-panel').classList.add('hidden');
  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('field-event_name').focus();
}

function openEditModal(id) {
  const r = STATE.records.find(rec => rec.id === id);
  if (!r) return;
  document.getElementById('field-id').value = r.id;
  document.getElementById('field-event_name').value = r.event_name || '';
  document.getElementById('field-date_start').value = r.date_start || '';
  document.getElementById('field-date_end').value = r.date_end || '';
  document.getElementById('field-category').value = r.category || '';
  setEmojiPreview(r.emoji || '📌');
  document.getElementById('field-importance').value = r.importance || 5;
  document.getElementById('field-tags').value = r.tags || '';
  document.getElementById('field-description').value = r.description || '';
  document.getElementById('field-sources').value = r.sources || '';
  document.getElementById('field-image_url').value = r.image_url || '';
  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('modal-delete-btn').classList.remove('hidden');
  document.getElementById('modal-delete-btn').onclick = () => { closeCrudModal(); confirmDelete(id); };
  document.getElementById('emoji-picker-panel').classList.add('hidden');
  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('field-event_name').focus();
}

function closeCrudModal() {
  document.getElementById('crud-modal').classList.add('hidden');
  document.getElementById('emoji-picker-panel').classList.add('hidden');
}

function handleCrudSubmit(e) {
  e.preventDefault();
  const data = {
    event_name: document.getElementById('field-event_name').value,
    date_start: document.getElementById('field-date_start').value,
    date_end: document.getElementById('field-date_end').value,
    category: document.getElementById('field-category').value,
    emoji: document.getElementById('field-emoji').value,
    importance: document.getElementById('field-importance').value,
    tags: document.getElementById('field-tags').value,
    description: document.getElementById('field-description').value,
    sources: document.getElementById('field-sources').value,
    image_url: document.getElementById('field-image_url').value,
  };
  data.date_start = normalizeDateInput(data.date_start);
  data.date_end = normalizeDateInput(data.date_end);
  document.getElementById('field-date_start').value = data.date_start;
  document.getElementById('field-date_end').value = data.date_end;
  const dateStartEl = document.getElementById('field-date_start');
  const dateEndEl = document.getElementById('field-date_end');
  dateStartEl.classList.toggle('invalid', data.date_start && !parseDate(data.date_start));
  dateEndEl.classList.toggle('invalid', data.date_end && !parseDate(data.date_end));
  const id = document.getElementById('field-id').value;
  const result = id ? updateRecord(id, data) : createRecord(data);
  if (result) {
    showToast(id ? 'Event updated' : 'Event created', 'success');
    closeCrudModal();
    selectEvent(result.id);
  }
}

function confirmDelete(id) {
  const r = STATE.records.find(rec => rec.id === id);
  document.getElementById('confirm-title').textContent = 'Delete Event';
  document.getElementById('confirm-message').textContent = `Delete “${r ? r.event_name : id}”? This cannot be undone.`;
  document.getElementById('confirm-backdrop').classList.remove('hidden');
  document.getElementById('confirm-ok-btn').onclick = () => {
    deleteRecord(id);
    document.getElementById('confirm-backdrop').classList.add('hidden');
    showToast('Event deleted', 'success');
  };
  document.getElementById('confirm-cancel-btn').onclick = () => {
    document.getElementById('confirm-backdrop').classList.add('hidden');
  };
}

function exportCSV() {
  if (!STATE.records.length) { showToast('No records to export', 'warning'); return; }
  const csv = Papa.unparse(STATE.records.map(r => {
    const row = {};
    FIELDS.forEach(f => { row[f] = r[f] ?? ''; });
    return row;
  }), { columns: FIELDS });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'timeline-export.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast(`Exported ${STATE.records.length} records`, 'success');
}

function importCSV(file) {
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete(result) {
      const imported = [];
      const skipped = [];
      result.data.forEach((row, i) => {
        const norm = {};
        Object.entries(row).forEach(([k, v]) => { norm[String(k).trim().toLowerCase()] = v; });
        const rec = {};
        FIELDS.forEach(f => { rec[f] = String(norm[f] || '').trim(); });
        rec.date_start = normalizeDateInput(rec.date_start);
        rec.date_end = normalizeDateInput(rec.date_end);
        rec.id = rec.id || generateId();
        rec.version = Number(rec.version) || 1;
        rec.importance = Number(rec.importance) || 5;
        rec.parent_id  = (rec.parent_id  || '').trim();
        rec.people     = (rec.people     || '').trim();
        rec.location   = (rec.location   || '').trim();
        const errors = validateRecord(rec);
        if (errors.length) { skipped.push(`Row ${i + 2}: ${errors.join(', ')}`); return; }
        imported.push(rec);
      });
      if (skipped.length) showToast(`Skipped ${skipped.length} invalid row(s). First: ${skipped[0]}`, 'warning');
      if (imported.length) {
        STATE.records = mergeRecords(STATE.records, imported);
        afterMutation();
        showToast(`Imported ${imported.length} record(s)`, 'success');
      } else showToast('No valid records found in CSV', 'error');
    },
    error(err) { showToast('CSV parse error: ' + err.message, 'error'); },
  });
}

function setupDragDrop() {
  const zone = document.getElementById('drop-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drop-highlight'); });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drop-highlight');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drop-highlight');
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) importCSV(file);
    else showToast('Please drop a .csv file', 'warning');
  });
}

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${esc(message)}</span><button type="button" class="toast-dismiss" aria-label="Dismiss">×</button>`;
  toast.querySelector('.toast-dismiss').onclick = () => toast.remove();
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

function showSpinner() { document.getElementById('spinner-overlay').classList.remove('hidden'); }
function hideSpinner() { document.getElementById('spinner-overlay').classList.add('hidden'); }

function setupZoomControls() {
  document.getElementById('zoom-in-btn').addEventListener('click', () => {
    STATE.zoom = Math.min(CONFIG.ZOOM_MAX, STATE.zoom + CONFIG.ZOOM_STEP);
    renderTimeline();
  });
  document.getElementById('zoom-out-btn').addEventListener('click', () => {
    STATE.zoom = Math.max(CONFIG.ZOOM_MIN, STATE.zoom - CONFIG.ZOOM_STEP);
    renderTimeline();
  });
  document.getElementById('zoom-reset-btn').addEventListener('click', () => {
    STATE.zoom = 1;
    renderTimeline();
  });
  document.getElementById('timeline-wrapper').addEventListener('wheel', e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? CONFIG.ZOOM_STEP : -CONFIG.ZOOM_STEP;
      STATE.zoom = Math.min(CONFIG.ZOOM_MAX, Math.max(CONFIG.ZOOM_MIN, STATE.zoom + delta));
      renderTimeline();
    }
  }, { passive: false });
}

function setupDragScroll() {
  const wrapper = document.getElementById('timeline-wrapper');
  let dragging = false, startX = 0, scrollLeft = 0;
  wrapper.addEventListener('mousedown', e => {
    if (e.target.closest('.emoji-marker')) return;
    dragging = true;
    startX = e.pageX - wrapper.offsetLeft;
    scrollLeft = wrapper.scrollLeft;
    wrapper.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', () => { dragging = false; wrapper.style.cursor = 'grab'; });
  wrapper.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    wrapper.scrollLeft = scrollLeft - (e.pageX - wrapper.offsetLeft - startX);
    const svg = document.getElementById('timeline-svg');
    updateMinimap(parseFloat(svg.getAttribute('width') || 0), wrapper.clientWidth);
  });
  wrapper.addEventListener('scroll', () => {
    const svg = document.getElementById('timeline-svg');
    updateMinimap(parseFloat(svg.getAttribute('width') || 0), wrapper.clientWidth);
  });
}

function setupFilters() {
  document.getElementById('search-input').addEventListener('input', e => {
    STATE.filterText = e.target.value;
    applyFilters(); renderTimeline();
  });
  document.getElementById('category-filter').addEventListener('change', e => {
    STATE.filterCategory = e.target.value;
    applyFilters(); renderTimeline();
  });
  document.getElementById('tag-filter').addEventListener('change', e => {
    STATE.filterTag = e.target.value;
    applyFilters(); renderTimeline();
  });
  document.getElementById('clear-filters-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('tag-filter').value = '';
    STATE.filterText = STATE.filterCategory = STATE.filterTag = '';
    applyFilters(); renderTimeline();
  });
  const fromEl = document.getElementById('date-from-input');
  const toEl = document.getElementById('date-to-input');
  fromEl.value = STATE.dateFrom;
  toEl.value = STATE.dateTo;
  const applyRange = () => {
    STATE.dateFrom = normalizeDateInput(fromEl.value);
    STATE.dateTo = normalizeDateInput(toEl.value);
    fromEl.value = STATE.dateFrom;
    toEl.value = STATE.dateTo;
    localStorage.setItem('timeline_date_from', STATE.dateFrom);
    localStorage.setItem('timeline_date_to', STATE.dateTo);
    applyFilters(); renderTimeline();
  };
  fromEl.addEventListener('change', applyRange);
  toEl.addEventListener('change', applyRange);
  document.getElementById('date-range-reset-btn').addEventListener('click', () => {
    fromEl.value = toEl.value = STATE.dateFrom = STATE.dateTo = '';
    localStorage.removeItem('timeline_date_from');
    localStorage.removeItem('timeline_date_to');
    applyFilters(); renderTimeline();
  });
}

function setupConnections() {
  document.getElementById('connections-btn').addEventListener('click', () => {
    STATE.showConnections = !STATE.showConnections;
    document.getElementById('connections-btn').textContent = STATE.showConnections ? '🔗 Hide Connections' : '🔗 Connections';
    document.getElementById('heatmap-panel').classList.toggle('hidden', !STATE.showConnections);
    if (STATE.showConnections) renderHeatmapPanel();
    renderTimeline();
  });
  document.getElementById('heatmap-close-btn').addEventListener('click', () => {
    STATE.showConnections = false;
    document.getElementById('connections-btn').textContent = '🔗 Connections';
    document.getElementById('heatmap-panel').classList.add('hidden');
    renderTimeline();
  });
}

function ssSorted() {
  return [...STATE.filtered].sort((a, b) => (parseDate(a.date_start) || 0) - (parseDate(b.date_start) || 0));
}

function clearSsTimers() {
  if (STATE.ssTimer) { clearTimeout(STATE.ssTimer); STATE.ssTimer = null; }
  if (STATE.ssProgressRaf) { cancelAnimationFrame(STATE.ssProgressRaf); STATE.ssProgressRaf = null; }
}

function stopScreensaver() {
  clearSsTimers();
  STATE.screensaver = false;
  STATE.ssPaused = false;
  document.getElementById('ss-controls').classList.add('hidden');
  document.getElementById('ss-progress-bar').classList.add('hidden');
  document.getElementById('screensaver-btn').textContent = '▶ Slideshow';
  highlightActiveMarkers();
}

function tickProgress() {
  if (!STATE.screensaver || STATE.ssPaused) return;
  const fill = document.getElementById('ss-progress-fill');
  const elapsed = Date.now() - STATE.ssProgressStart;
  fill.style.width = Math.min(100, (elapsed / STATE.ssSpeed) * 100) + '%';
  STATE.ssProgressRaf = requestAnimationFrame(tickProgress);
}

function showSsIndex() {
  const list = ssSorted();
  if (!list.length) { stopScreensaver(); return; }
  STATE.ssIndex = ((STATE.ssIndex % list.length) + list.length) % list.length;
  const r = list[STATE.ssIndex];
  STATE.lastClickedId = r.id;
  hidePopover();
  showEventDetail(r.id);
  highlightActiveMarkers();
  scrollToEvent(r.id);
  document.getElementById('ss-counter').textContent = `${STATE.ssIndex + 1}/${list.length}`;
  document.getElementById('ss-progress-fill').style.width = '0%';
  STATE.ssProgressStart = Date.now();
}

function scheduleSsAdvance() {
  clearSsTimers();
  if (!STATE.screensaver || STATE.ssPaused) return;
  STATE.ssProgressStart = Date.now();
  tickProgress();
  STATE.ssTimer = setTimeout(() => {
    STATE.ssIndex += 1;
    showSsIndex();
    scheduleSsAdvance();
  }, STATE.ssSpeed);
}

function startScreensaver() {
  const list = ssSorted();
  if (!list.length) { showToast('No events to play', 'warning'); return; }
  clearSsTimers();
  STATE.screensaver = true;
  STATE.ssPaused = false;
  STATE.ssIndex = 0;
  document.getElementById('ss-controls').classList.remove('hidden');
  document.getElementById('ss-progress-bar').classList.remove('hidden');
  document.getElementById('screensaver-btn').textContent = '■ Stop';
  document.getElementById('ss-pause-btn').textContent = '⏸';
  showSsIndex();
  scheduleSsAdvance();
}

function toggleSsPause() {
  if (!STATE.screensaver) return;
  STATE.ssPaused = !STATE.ssPaused;
  document.getElementById('ss-pause-btn').textContent = STATE.ssPaused ? '▶' : '⏸';
  if (STATE.ssPaused) clearSsTimers();
  else scheduleSsAdvance();
}

function setupScreensaver() {
  document.getElementById('screensaver-btn').addEventListener('click', () => {
    if (STATE.screensaver) stopScreensaver();
    else startScreensaver();
  });
  document.getElementById('ss-stop-btn').addEventListener('click', stopScreensaver);
  document.getElementById('ss-pause-btn').addEventListener('click', toggleSsPause);
  document.getElementById('ss-next-btn').addEventListener('click', () => {
    if (!STATE.screensaver) return;
    STATE.ssIndex += 1;
    showSsIndex();
    if (!STATE.ssPaused) scheduleSsAdvance();
  });
  document.getElementById('ss-prev-btn').addEventListener('click', () => {
    if (!STATE.screensaver) return;
    STATE.ssIndex -= 1;
    showSsIndex();
    if (!STATE.ssPaused) scheduleSsAdvance();
  });
  const speed = document.getElementById('ss-speed');
  speed.addEventListener('input', () => {
    STATE.ssSpeed = Number(speed.value) * 1000;
    document.getElementById('ss-speed-val').textContent = speed.value + 's';
    if (STATE.screensaver && !STATE.ssPaused) scheduleSsAdvance();
  });
}

function openSheetConnectModal() {
  document.getElementById('sheet-id-input').value = CONFIG.SPREADSHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}/edit` : '';
  document.getElementById('sheet-connect-status').textContent = STATE.accessToken
    ? 'Signed in. Create a file or paste an ID you can edit.'
    : 'Sign in first — Create needs an access token.';
  document.getElementById('sheet-connect-backdrop').classList.remove('hidden');
}

function closeSheetConnectModal() {
  document.getElementById('sheet-connect-backdrop').classList.add('hidden');
}

async function connectExistingSheet() {
  const id = extractSpreadsheetId(document.getElementById('sheet-id-input').value);
  if (!id) { showToast('Paste a spreadsheet URL or ID', 'error'); return; }
  if (!STATE.accessToken) { showToast('Sign in with Google first', 'warning'); return; }
  CONFIG.SPREADSHEET_ID = id;
  persistLocal();
  showSpinner();
  try {
    await listSheetTabs();
    populateTimelineSelect();
    const first = STATE.sheetTabs[0];
    if (first) {
      STATE.activeKey = 'sheet:' + first.title;
      CONFIG.SHEET_NAME = first.title;
    }
    renderAuthUI(true);
    closeSheetConnectModal();
    await syncFromSheet();
    refreshOpenSheetHref();
    hideSpinner();
    showToast('Sheet connected. Use Open Sheet anytime.', 'success');
  } catch (e) {
    hideSpinner();
    showToast('Could not open that spreadsheet: ' + e.message, 'error');
  }
}

function setupSheetConnect() {
  document.getElementById('connect-sheet-btn').addEventListener('click', openSheetConnectModal);
  document.getElementById('open-sheet-btn').addEventListener('click', (e) => {
    if (!CONFIG.SPREADSHEET_ID) {
      e.preventDefault();
      openSheetConnectModal();
      showToast('No spreadsheet connected yet. Create one or paste a URL.', 'warning');
    }
  });
  document.getElementById('open-people-sheet-btn').addEventListener('click', (e) => {
    if (!CONFIG.SPREADSHEET_ID) {
      e.preventDefault();
      openSheetConnectModal();
      showToast('No spreadsheet connected yet. Create one or paste a URL.', 'warning');
    }
  });
  document.getElementById('sheet-connect-close-btn').addEventListener('click', closeSheetConnectModal);
  document.getElementById('sheet-connect-cancel-btn').addEventListener('click', closeSheetConnectModal);
  document.getElementById('sheet-connect-save-btn').addEventListener('click', connectExistingSheet);
  document.getElementById('sheet-create-btn').addEventListener('click', async () => {
    if (!STATE.accessToken) { showToast('Sign in with Google first', 'warning'); return; }
    closeSheetConnectModal();
    await createSpreadsheetSeeded();
  });
}

function setupNewTimeline() {
  const open = () => {
    document.getElementById('new-timeline-name-input').value = '';
    document.getElementById('new-timeline-backdrop').classList.remove('hidden');
    document.getElementById('new-timeline-name-input').focus();
  };
  const close = () => document.getElementById('new-timeline-backdrop').classList.add('hidden');
  document.getElementById('new-timeline-btn').addEventListener('click', open);
  document.getElementById('new-timeline-close-btn').addEventListener('click', close);
  document.getElementById('new-timeline-cancel-btn').addEventListener('click', close);
  document.getElementById('new-timeline-save-btn').addEventListener('click', async () => {
    const name = document.getElementById('new-timeline-name-input').value.trim();
    if (!name) { showToast('Name required', 'error'); return; }
    STATE.localCustom[name] = [];
    if (CONFIG.SPREADSHEET_ID && STATE.accessToken) {
      try {
        showSpinner();
        await addSheetTab(CONFIG.SPREADSHEET_ID, name);
        await writeSheetTab(CONFIG.SPREADSHEET_ID, name, [], EVENT_SCHEMA);
        await listSheetTabs();
        STATE.activeKey = 'sheet:' + name;
        CONFIG.SHEET_NAME = name;
        hideSpinner();
      } catch (e) {
        hideSpinner();
        showToast('Local timeline created; sheet tab failed: ' + e.message, 'warning');
        STATE.activeKey = 'local:' + name;
      }
    } else {
      STATE.activeKey = 'local:' + name;
    }
    persistLocal();
    populateTimelineSelect();
    loadActiveTimeline();
    applyFilters();
    renderTimeline();
    close();
    showToast('Timeline “' + name + '” created', 'success');
  });
}

function setupHelp() {
  const open = () => document.getElementById('help-backdrop').classList.remove('hidden');
  const close = () => document.getElementById('help-backdrop').classList.add('hidden');
  document.getElementById('help-btn').addEventListener('click', open);
  document.getElementById('help-close-btn').addEventListener('click', close);
  document.getElementById('help-ok-btn').addEventListener('click', close);
  document.getElementById('help-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) close();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (!CONFIG.SPREADSHEET_ID) {
    document.getElementById('setup-banner').classList.remove('hidden');
  }
  document.getElementById('setup-banner-dismiss').addEventListener('click', () => {
    document.getElementById('setup-banner').classList.add('hidden');
  });

  loadActiveTimeline();
  populateTimelineSelect();
  applyFilters();
  refreshOpenSheetHref();

  initGoogleAuth();
  document.getElementById('login-btn').addEventListener('click', () => requestToken(true));
  document.getElementById('signout-btn').addEventListener('click', signOut);

  document.getElementById('timeline-select').addEventListener('change', e => switchTimeline(e.target.value));
  document.getElementById('sync-btn').addEventListener('click', syncFromSheet);
  document.getElementById('push-btn').addEventListener('click', pushToSheet);

  document.getElementById('export-btn').addEventListener('click', exportCSV);
  document.getElementById('import-input').addEventListener('change', e => { importCSV(e.target.files[0]); e.target.value = ''; });
  document.getElementById('empty-import-input').addEventListener('change', e => { importCSV(e.target.files[0]); e.target.value = ''; });

  document.getElementById('fab-btn').addEventListener('click', openCreateModal);
  document.getElementById('empty-add-btn').addEventListener('click', openCreateModal);
  document.getElementById('crud-form').addEventListener('submit', handleCrudSubmit);
  document.getElementById('modal-close-btn').addEventListener('click', closeCrudModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeCrudModal);
  document.getElementById('crud-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeCrudModal(); });
  document.getElementById('confirm-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('confirm-backdrop').classList.add('hidden');
  });
  document.getElementById('ed-close-btn').addEventListener('click', () => {
    if (STATE.screensaver) stopScreensaver();
    clearEventDetail();
    hidePopover();
  });

  document.addEventListener('click', e => {
    const popover = document.getElementById('popover');
    if (!popover.classList.contains('hidden') && !popover.contains(e.target) && !e.target.closest('.emoji-marker')) {
      hidePopover();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'Escape') {
      closeCrudModal();
      document.getElementById('confirm-backdrop').classList.add('hidden');
      closeSheetConnectModal();
      document.getElementById('help-backdrop').classList.add('hidden');
      document.getElementById('new-timeline-backdrop').classList.add('hidden');
      hidePopover();
      if (STATE.screensaver) stopScreensaver();
    }
    if (STATE.screensaver) {
      if (e.key === ' ') { e.preventDefault(); toggleSsPause(); }
      if (e.key === 'ArrowRight') { STATE.ssIndex += 1; showSsIndex(); if (!STATE.ssPaused) scheduleSsAdvance(); }
      if (e.key === 'ArrowLeft') { STATE.ssIndex -= 1; showSsIndex(); if (!STATE.ssPaused) scheduleSsAdvance(); }
    }
  });

  setupEmojiPicker();
  setupZoomControls();
  setupDragScroll();
  setupFilters();
  setupConnections();
  setupDragDrop();
  setupScreensaver();
  setupSheetConnect();
  setupNewTimeline();
  setupHelp();
  renderAuthUI(!!STATE.accessToken);
  window.addEventListener('resize', () => renderTimeline());
  renderTimeline();
});
