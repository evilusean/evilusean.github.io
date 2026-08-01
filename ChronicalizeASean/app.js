/* ============================================================
   ChronicalizeASean – app.js
   Sections:
     1. CONFIG & STATE
     2. GOOGLE AUTH
     3. SHEETS API
     4. DATA LAYER
     5. TIMELINE RENDERER
     6. CONNECTION / HEATMAP ENGINE
     7. POPOVER / INTERACTIONS
     8. CRUD MODALS
     9. IMPORT / EXPORT
    10. UI UTILITIES
    11. INIT
   ============================================================ */

/* ============================================================
   1. CONFIG & STATE
   ============================================================ */
const CONFIG = {
  CLIENT_ID: '',        // <-- fill in your Google OAuth Client ID
  SPREADSHEET_ID: '',   // <-- fill in your Google Spreadsheet ID
  SHEET_NAME: 'Timeline',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
  TIMELINE_PADDING: 80, // px on left/right of axis
  AXIS_Y: 160,          // px from top of SVG to the axis line
  SVG_HEIGHT: 340,      // total SVG height
  ZOOM_STEP: 0.25,
  ZOOM_MIN: 0.3,
  ZOOM_MAX: 6,
};

const SAMPLE_EVENTS = [
  { id: 'sample-1', version: 1, event_name: 'September 11 Attacks', date_start: '2001-09-11', date_end: '', description: 'Coordinated terrorist attacks on the United States by al-Qaeda using hijacked airliners.', sources: 'https://en.wikipedia.org/wiki/September_11_attacks', image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/National_Park_Service_9-11_Statue_of_Liberty_and_WTC_fire.jpg/320px-National_Park_Service_9-11_Statue_of_Liberty_and_WTC_fire.jpg', emoji: '🏛️', category: 'Politics', tags: '#terrorism #usa #attacks', importance: 10 },
  { id: 'sample-2', version: 1, event_name: 'Iraq War Begins', date_start: '2003-03-20', date_end: '2011-12-18', description: 'The United States and coalition forces invade Iraq to topple Saddam Hussein.', sources: 'https://en.wikipedia.org/wiki/Iraq_War', image_url: '', emoji: '⚔️', category: 'War', tags: '#war #iraq #usa #middleeast', importance: 9 },
  { id: 'sample-3', version: 1, event_name: 'Facebook Founded', date_start: '2004-02-04', date_end: '', description: 'Mark Zuckerberg launches "TheFacebook" from his Harvard dorm room.', sources: 'https://en.wikipedia.org/wiki/History_of_Facebook', image_url: '', emoji: '📘', category: 'Technology', tags: '#tech #socialmedia #startup', importance: 7 },
  { id: 'sample-4', version: 1, event_name: 'Global Financial Crisis', date_start: '2007-12-01', date_end: '2009-06-30', description: 'The worst financial crisis since the Great Depression, triggered by the U.S. subprime mortgage collapse.', sources: 'https://en.wikipedia.org/wiki/Financial_crisis_of_2007%E2%80%932008', image_url: '', emoji: '💸', category: 'Economics', tags: '#economics #finance #crisis #usa', importance: 9 },
  { id: 'sample-5', version: 1, event_name: 'Barack Obama Elected', date_start: '2008-11-04', date_end: '', description: 'Barack Obama becomes the 44th President and the first African-American president of the United States.', sources: 'https://en.wikipedia.org/wiki/Barack_Obama', image_url: '', emoji: '🇺🇸', category: 'Politics', tags: '#politics #usa #election #history', importance: 9 },
  { id: 'sample-6', version: 1, event_name: 'Arab Spring', date_start: '2010-12-17', date_end: '2012-12-31', description: 'Wave of pro-democracy protests and uprisings across the Arab world.', sources: 'https://en.wikipedia.org/wiki/Arab_Spring', image_url: '', emoji: '✊', category: 'Politics', tags: '#politics #middleeast #revolution #democracy', importance: 8 },
  { id: 'sample-7', version: 1, event_name: 'COVID-19 Pandemic', date_start: '2019-12-31', date_end: '2023-05-05', description: 'A global pandemic caused by SARS-CoV-2, affecting billions of people worldwide.', sources: 'https://en.wikipedia.org/wiki/COVID-19_pandemic', image_url: '', emoji: '🦠', category: 'Health', tags: '#health #pandemic #global #covid', importance: 10 },
  { id: 'sample-8', version: 1, event_name: 'Russia Invades Ukraine', date_start: '2022-02-24', date_end: '', description: 'Russia launches a full-scale military invasion of Ukraine, triggering the largest land war in Europe since WWII.', sources: 'https://en.wikipedia.org/wiki/Russian_invasion_of_Ukraine', image_url: '', emoji: '🌻', category: 'War', tags: '#war #ukraine #russia #europe', importance: 10 },
];

const STATE = {
  records: [],        // all loaded event records
  filtered: [],       // records after search/filter
  tokenClient: null,  // GIS token client
  accessToken: null,  // current OAuth token
  userProfile: null,  // { name, picture }
  zoom: 1,
  showConnections: false,
  filterText: '',
  filterCategory: '',
  filterTag: '',
  activePopoverId: null,
  dragActive: false,
};

/* Category → color map (grows dynamically) */
const CATEGORY_COLORS = {};
const COLOR_PALETTE = [
  '#3b82f6','#ec4899','#22c55e','#f59e0b','#8b5cf6',
  '#06b6d4','#ef4444','#f97316','#14b8a6','#a855f7',
];
function categoryColor(cat) {
  if (!cat) return COLOR_PALETTE[0];
  if (!CATEGORY_COLORS[cat]) {
    const idx = Object.keys(CATEGORY_COLORS).length % COLOR_PALETTE.length;
    CATEGORY_COLORS[cat] = COLOR_PALETTE[idx];
  }
  return CATEGORY_COLORS[cat];
}

/* ============================================================
   2. GOOGLE AUTH
   ============================================================ */
function initGoogleAuth() {
  if (!CONFIG.CLIENT_ID) return;
  if (typeof google === 'undefined' || !google.accounts) {
    // GIS script not loaded yet – retry
    setTimeout(initGoogleAuth, 500);
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
  if (!STATE.tokenClient) { showToast('Google Auth not initialized', 'error'); return; }
  showSpinner();
  if (interactive) {
    STATE.tokenClient.requestAccessToken({ prompt: 'select_account' });
  } else {
    STATE.tokenClient.requestAccessToken({ prompt: '' });
  }
}

function handleTokenResponse(response) {
  hideSpinner();
  if (response.error) {
    showToast('Sign-in failed: ' + response.error, 'error');
    return;
  }
  STATE.accessToken = response.access_token;
  fetchUserProfile();
}

function fetchUserProfile() {
  fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: 'Bearer ' + STATE.accessToken },
  })
    .then(r => r.json())
    .then(profile => {
      STATE.userProfile = profile;
      renderAuthUI(true);
      showToast('Signed in as ' + profile.name, 'success');
    })
    .catch(() => { renderAuthUI(true); });
}

function signOut() {
  if (STATE.accessToken && typeof google !== 'undefined') {
    google.accounts.oauth2.revoke(STATE.accessToken, () => {});
  }
  STATE.accessToken = null;
  STATE.userProfile = null;
  renderAuthUI(false);
  showToast('Signed out', 'info');
}

function renderAuthUI(loggedIn) {
  const loginBtn   = document.getElementById('login-btn');
  const userInfo   = document.getElementById('user-info');
  const sheetActs  = document.getElementById('sheet-actions');
  const authCont   = document.getElementById('auth-container');

  if (loggedIn) {
    authCont.classList.add('hidden');
    userInfo.classList.remove('hidden');
    if (CONFIG.SPREADSHEET_ID) sheetActs.classList.remove('hidden');

    const avatar = document.getElementById('user-avatar');
    const name   = document.getElementById('user-name');
    if (STATE.userProfile) {
      avatar.src = STATE.userProfile.picture || '';
      name.textContent = STATE.userProfile.name || '';
    }
  } else {
    authCont.classList.remove('hidden');
    userInfo.classList.add('hidden');
    sheetActs.classList.add('hidden');
  }
}

/* ============================================================
   3. SHEETS API
   ============================================================ */
const SHEETS_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const FIELDS = ['id','version','event_name','date_start','date_end','description','sources','image_url','emoji','category','tags','importance'];

async function sheetsRequest(url, options = {}) {
  if (!STATE.accessToken) { showToast('Not signed in', 'error'); return null; }
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': 'Bearer ' + STATE.accessToken,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (res.status === 401 || res.status === 403) {
    showToast('Session expired. Re-authenticating…', 'warning');
    STATE.accessToken = null;
    requestToken(false);
    return null;
  }
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function syncFromSheet() {
  if (!CONFIG.SPREADSHEET_ID) { showToast('SPREADSHEET_ID not configured', 'warning'); return; }
  showSpinner();
  try {
    const range = encodeURIComponent(`${CONFIG.SHEET_NAME}!A1:L`);
    const url = `${SHEETS_BASE}/${CONFIG.SPREADSHEET_ID}/values/${range}`;
    const data = await sheetsRequest(url);
    if (!data) return;
    const rows = data.values || [];
    if (rows.length < 2) { hideSpinner(); showToast('Sheet is empty', 'info'); return; }
    const header = rows[0].map(h => h.trim().toLowerCase());
    const incoming = rows.slice(1).map(row => {
      const rec = {};
      FIELDS.forEach(f => {
        const idx = header.indexOf(f);
        rec[f] = idx >= 0 ? (row[idx] || '') : '';
      });
      rec.version = Number(rec.version) || 1;
      rec.importance = Number(rec.importance) || 5;
      return rec;
    });
    // Merge: incoming wins by id
    const merged = mergeRecords(STATE.records, incoming);
    STATE.records = merged;
    applyFilters();
    renderTimeline();
    hideSpinner();
    showToast(`Synced ${incoming.length} rows from sheet`, 'success');
  } catch (e) {
    hideSpinner();
    showToast('Sync error: ' + e.message, 'error');
  }
}

async function pushToSheet() {
  if (!CONFIG.SPREADSHEET_ID) { showToast('SPREADSHEET_ID not configured', 'warning'); return; }
  showSpinner();
  try {
    const sid = CONFIG.SPREADSHEET_ID;
    // 1. Clear the sheet
    await sheetsRequest(`${SHEETS_BASE}/${sid}/values/${encodeURIComponent(CONFIG.SHEET_NAME + '!A:L')}:clear`, { method: 'POST', body: JSON.stringify({}) });
    // 2. Write header + rows
    const values = [FIELDS, ...STATE.records.map(r => FIELDS.map(f => String(r[f] ?? '')))];
    await sheetsRequest(`${SHEETS_BASE}/${sid}/values/${encodeURIComponent(CONFIG.SHEET_NAME + '!A1')}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    });
    hideSpinner();
    showToast(`Pushed ${STATE.records.length} records to sheet`, 'success');
  } catch (e) {
    hideSpinner();
    showToast('Push error: ' + e.message, 'error');
  }
}

function mergeRecords(existing, incoming) {
  const map = {};
  existing.forEach(r => { map[r.id] = r; });
  incoming.forEach(r => { if (r.id) map[r.id] = r; });
  return Object.values(map);
}

/* ============================================================
   4. DATA LAYER
   ============================================================ */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function validateRecord(rec) {
  const errors = [];
  if (!rec.event_name || !rec.event_name.trim()) errors.push('event_name is required');
  if (!DATE_RE.test(rec.date_start)) errors.push('date_start must be YYYY-MM-DD');
  if (rec.date_end && !DATE_RE.test(rec.date_end)) errors.push('date_end must be YYYY-MM-DD');
  return errors;
}

function parseDate(str) {
  if (!str || !DATE_RE.test(str)) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateRange(start, end) {
  const fmt = d => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  const s = fmt(parseDate(start));
  const e = end ? fmt(parseDate(end)) : null;
  if (!s) return '';
  return e ? `${s} – ${e}` : s;
}

function createRecord(data) {
  const rec = {
    id: generateId(),
    version: 1,
    event_name: (data.event_name || '').trim(),
    date_start: (data.date_start || '').trim(),
    date_end: (data.date_end || '').trim(),
    description: (data.description || '').trim(),
    sources: (data.sources || '').trim(),
    image_url: (data.image_url || '').trim(),
    emoji: (data.emoji || '📌').trim() || '📌',
    category: (data.category || '').trim(),
    tags: (data.tags || '').trim(),
    importance: Math.min(10, Math.max(1, Number(data.importance) || 5)),
  };
  const errors = validateRecord(rec);
  if (errors.length) { errors.forEach(e => showToast(e, 'error')); return null; }
  STATE.records.push(rec);
  applyFilters();
  renderTimeline();
  return rec;
}

function updateRecord(id, data) {
  const idx = STATE.records.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const rec = {
    ...STATE.records[idx],
    event_name: (data.event_name || '').trim(),
    date_start: (data.date_start || '').trim(),
    date_end: (data.date_end || '').trim(),
    description: (data.description || '').trim(),
    sources: (data.sources || '').trim(),
    image_url: (data.image_url || '').trim(),
    emoji: (data.emoji || '📌').trim() || '📌',
    category: (data.category || '').trim(),
    tags: (data.tags || '').trim(),
    importance: Math.min(10, Math.max(1, Number(data.importance) || 5)),
  };
  const errors = validateRecord(rec);
  if (errors.length) { errors.forEach(e => showToast(e, 'error')); return null; }
  STATE.records[idx] = rec;
  applyFilters();
  renderTimeline();
  return rec;
}

function deleteRecord(id) {
  STATE.records = STATE.records.filter(r => r.id !== id);
  applyFilters();
  renderTimeline();
}

function applyFilters() {
  const txt  = STATE.filterText.toLowerCase();
  const cat  = STATE.filterCategory;
  const tag  = STATE.filterTag;
  STATE.filtered = STATE.records.filter(r => {
    if (cat && r.category !== cat) return false;
    if (tag && !parseTags(r.tags).includes(tag)) return false;
    if (txt && !r.event_name.toLowerCase().includes(txt) && !r.description.toLowerCase().includes(txt)) return false;
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

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ============================================================
   5. TIMELINE RENDERER
   ============================================================ */
const SVG_NS = 'http://www.w3.org/2000/svg';

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

  // Compute date range
  const dates = records.flatMap(r => [parseDate(r.date_start), r.date_end ? parseDate(r.date_end) : null].filter(Boolean));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  // Ensure at least 1 day span
  if (minDate.getTime() === maxDate.getTime()) {
    maxDate.setUTCDate(maxDate.getUTCDate() + 1);
  }

  const pad = CONFIG.TIMELINE_PADDING;
  const totalMs = maxDate - minDate;
  const axisY = CONFIG.AXIS_Y;
  const svgH  = CONFIG.SVG_HEIGHT;
  const zoom  = STATE.zoom;

  // Width based on zoom
  const baseWidth = Math.max(window.innerWidth - 40, 800);
  const totalWidth = baseWidth * zoom;
  const axisWidth = totalWidth - pad * 2;

  svg.setAttribute('width', totalWidth);
  svg.setAttribute('height', svgH);

  function dateToX(d) {
    if (!d) return pad;
    return pad + ((d - minDate) / totalMs) * axisWidth;
  }

  // Draw tick marks
  drawTicks(svg, minDate, maxDate, axisY, pad, axisWidth, totalMs);

  // Draw axis line
  svg.appendChild(svgEl('line', {
    x1: pad, y1: axisY, x2: pad + axisWidth, y2: axisY,
    class: 'axis-line',
  }));

  // Lane assignment to avoid vertical overlap
  const lanes = assignLanes(records);

  // Draw clusters (events sharing 2+ tags)
  if (STATE.showConnections) {
    drawClusters(svg, records, dateToX, axisY, lanes);
  }

  // Draw duration bars
  records.forEach(r => {
    if (!r.date_end) return;
    const x1 = dateToX(parseDate(r.date_start));
    const x2 = dateToX(parseDate(r.date_end));
    const lane = lanes[r.id] || 0;
    const y = axisY - 12 - lane * 28;
    const color = categoryColor(r.category);
    svg.appendChild(svgEl('rect', {
      x: x1, y: y - 8, width: Math.max(x2 - x1, 4), height: 16,
      fill: color, rx: 3, ry: 3, opacity: 0.55,
      class: 'duration-bar',
    }));
  });

  // Draw connection lines (before emojis so they're behind)
  if (STATE.showConnections) {
    drawConnections(svg, records, dateToX, axisY, lanes);
  }

  // Draw emoji markers
  records.forEach(r => {
    const x = dateToX(parseDate(r.date_start));
    const lane = lanes[r.id] || 0;
    const y = axisY - 22 - lane * 28;
    const imp = Math.min(10, Math.max(1, Number(r.importance) || 5));
    const fontSize = 16 + (imp - 1) * 1.8; // 16px at imp=1, ~32px at imp=10

    const g = svgEl('g', {
      class: 'emoji-marker',
      transform: `translate(${x}, ${y})`,
      'data-id': r.id,
      role: 'button',
      tabindex: '0',
      'aria-label': r.event_name,
    });
    const txt = svgEl('text', {
      x: 0, y: 0,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': fontSize,
    });
    txt.textContent = r.emoji || '📌';
    g.appendChild(txt);
    g.addEventListener('click', (e) => { e.stopPropagation(); showPopover(r.id, x, y + axisY - y + 20); });
    g.addEventListener('mouseenter', () => showPopoverDelayed(r.id, x, y));
    g.addEventListener('mouseleave', cancelPopoverDelay);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showPopover(r.id, x, y); } });
    svg.appendChild(g);

    // Small dot on axis
    svg.appendChild(svgEl('circle', {
      cx: x, cy: axisY, r: 4,
      fill: categoryColor(r.category),
      stroke: '#0f172a', 'stroke-width': 1.5,
    }));
  });

  updateMinimap(totalWidth, baseWidth);
}

function drawTicks(svg, minDate, maxDate, axisY, pad, axisWidth, totalMs) {
  const rangeYears = (maxDate - minDate) / (1000 * 60 * 60 * 24 * 365);
  const ticks = [];

  if (rangeYears >= 2) {
    // Year ticks
    let y = new Date(Date.UTC(minDate.getUTCFullYear(), 0, 1));
    while (y <= maxDate) {
      ticks.push({ date: new Date(y), label: y.getUTCFullYear().toString() });
      y = new Date(Date.UTC(y.getUTCFullYear() + 1, 0, 1));
    }
  } else {
    // Month ticks
    let m = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1));
    while (m <= maxDate) {
      const label = m.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' });
      ticks.push({ date: new Date(m), label });
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
  // Sort by date_start
  const sorted = [...records].sort((a, b) => (parseDate(a.date_start) || 0) - (parseDate(b.date_start) || 0));
  const lanes = {};
  // Each lane tracks the rightmost date_end (or date_start) placed so far
  const laneEnds = [];

  sorted.forEach(r => {
    const start = parseDate(r.date_start);
    if (!start) { lanes[r.id] = 0; return; }
    const end = r.date_end ? parseDate(r.date_end) : start;
    // Find lowest free lane
    let lane = 0;
    while (laneEnds[lane] && laneEnds[lane] >= start.getTime() - 1000 * 60 * 60 * 24 * 180) {
      lane++;
    }
    lanes[r.id] = lane;
    laneEnds[lane] = end.getTime();
  });
  return lanes;
}

/* ============================================================
   6. CONNECTION / HEATMAP ENGINE
   ============================================================ */
function buildTagMap(records) {
  const tagMap = {}; // tag -> [record ids]
  records.forEach(r => {
    parseTags(r.tags).forEach(tag => {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(r.id);
    });
  });
  return tagMap;
}

function buildSharedTagMatrix(records) {
  // Returns map: `id1|id2` -> count of shared tags
  const shared = {};
  const tagMap = buildTagMap(records);
  Object.values(tagMap).forEach(ids => {
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
    const lane1 = lanes[r1.id] || 0;
    const lane2 = lanes[r2.id] || 0;
    const y1 = axisY - 22 - lane1 * 28;
    const y2 = axisY - 22 - lane2 * 28;

    const cx1 = x1;
    const cy1 = y1 - 30;
    const cx2 = x2;
    const cy2 = y2 - 30;

    const opacity = Math.min(0.7, 0.2 + count * 0.15);
    const color = count >= 3 ? '#f59e0b' : count === 2 ? '#8b5cf6' : '#3b82f6';
    const path = svgEl('path', {
      d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
      fill: 'none',
      stroke: color,
      'stroke-width': count,
      opacity,
      class: 'connection-line',
    });
    svg.insertBefore(path, svg.firstChild); // behind emojis
  });
}

function drawClusters(svg, records, dateToX, axisY, lanes) {
  // Group records that share 2+ tags
  const matrix = buildSharedTagMatrix(records);
  const groups = new Map(); // record id -> group id
  let groupId = 0;

  Object.entries(matrix).forEach(([key, count]) => {
    if (count < 2) return;
    const [id1, id2] = key.split('|');
    const g1 = groups.get(id1);
    const g2 = groups.get(id2);
    if (!g1 && !g2) { groups.set(id1, groupId); groups.set(id2, groupId); groupId++; }
    else if (g1 && !g2) groups.set(id2, g1);
    else if (!g1 && g2) groups.set(id1, g2);
    // else both in same/different group – keep g1
  });

  // For each group, draw a bounding rect
  const groupRects = {};
  groups.forEach((gid, id) => {
    const r = records.find(rec => rec.id === id);
    if (!r) return;
    const x = dateToX(parseDate(r.date_start));
    const lane = lanes[r.id] || 0;
    const y = axisY - 22 - lane * 28;
    if (!groupRects[gid]) groupRects[gid] = { minX: x, maxX: x, minY: y, maxY: y };
    const gr = groupRects[gid];
    gr.minX = Math.min(gr.minX, x - 20);
    gr.maxX = Math.max(gr.maxX, x + 20);
    gr.minY = Math.min(gr.minY, y - 20);
    gr.maxY = Math.max(gr.maxY, y + 20);
  });

  Object.values(groupRects).forEach(gr => {
    const rect = svgEl('rect', {
      x: gr.minX - 10, y: gr.minY - 10,
      width: gr.maxX - gr.minX + 20, height: gr.maxY - gr.minY + 20,
      fill: 'rgba(59,130,246,0.06)',
      stroke: 'rgba(59,130,246,0.2)',
      'stroke-width': 1, rx: 8, ry: 8,
      class: 'cluster-rect',
    });
    svg.insertBefore(rect, svg.firstChild);
  });
}

function renderHeatmapPanel() {
  const records = STATE.filtered;
  const tagMap = buildTagMap(records);
  const byId = {};
  records.forEach(r => { byId[r.id] = r; });

  const sorted = Object.entries(tagMap)
    .filter(([, ids]) => ids.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

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

  // Draw dots on minimap
  const dates = records.flatMap(r => [parseDate(r.date_start)].filter(Boolean));
  const minT = Math.min(...dates.map(d => d.getTime()));
  const maxT = Math.max(...dates.map(d => d.getTime()));

  records.forEach(r => {
    const d = parseDate(r.date_start);
    if (!d) return;
    const x = ((d.getTime() - minT) / (maxT - minT || 1)) * 196 + 2;
    const color = categoryColor(r.category);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, 20, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Viewport indicator
  const ratio = viewWidth / totalWidth;
  const scrollRatio = wrapper.scrollLeft / (totalWidth - viewWidth || 1);
  viewport.style.width = Math.max(ratio * 200, 10) + 'px';
  viewport.style.left = scrollRatio * (200 - ratio * 200) + 'px';
}

/* ============================================================
   7. POPOVER / INTERACTIONS
   ============================================================ */
let _popoverDelayTimer = null;

function showPopoverDelayed(id, svgX, svgY) {
  cancelPopoverDelay();
  _popoverDelayTimer = setTimeout(() => showPopover(id, svgX, svgY), 280);
}

function cancelPopoverDelay() {
  clearTimeout(_popoverDelayTimer);
}

function showPopover(id, svgX, svgY) {
  const r = STATE.records.find(rec => rec.id === id);
  if (!r) return;
  STATE.activePopoverId = id;

  const popover = document.getElementById('popover');
  const wrapper = document.getElementById('timeline-wrapper');
  const wRect   = wrapper.getBoundingClientRect();

  // Compute screen position from SVG coords
  const screenX = wRect.left + svgX - wrapper.scrollLeft;
  const screenY = wRect.top  + svgY - wrapper.scrollTop;

  // Populate fields
  const imgEl = document.getElementById('popover-image');
  if (r.image_url) {
    imgEl.src = r.image_url;
    imgEl.removeAttribute('data-hidden');
    imgEl.parentElement.style.display = '';
    imgEl.onerror = () => { imgEl.setAttribute('data-hidden','true'); imgEl.parentElement.style.display = 'none'; };
  } else {
    imgEl.setAttribute('data-hidden','true');
    imgEl.parentElement.style.display = 'none';
  }

  const nameEl = document.getElementById('popover-name');
  nameEl.textContent = r.event_name;
  nameEl.href = r.sources || '#';

  document.getElementById('popover-dates').textContent = formatDateRange(r.date_start, r.date_end);

  const catEl = document.getElementById('popover-category');
  if (r.category) {
    catEl.innerHTML = `<span class="category-badge" style="background:${categoryColor(r.category)}">${esc(r.category)}</span>`;
  } else {
    catEl.innerHTML = '';
  }

  const impEl = document.getElementById('popover-importance');
  const imp = Math.min(10, Math.max(1, Number(r.importance) || 5));
  impEl.innerHTML = Array.from({length:10}, (_,i) =>
    `<span class="importance-pip ${i < imp ? 'filled' : ''}"></span>`
  ).join('');

  const desc = r.description || '';
  document.getElementById('popover-desc').textContent = desc.length > 150 ? desc.slice(0, 150) + '…' : desc;

  const tagsEl = document.getElementById('popover-tags');
  const tags = parseTags(r.tags);
  tagsEl.innerHTML = tags.map(t => `<span class="tag-badge">${esc(t)}</span>`).join('');

  document.getElementById('popover-edit-btn').onclick   = () => { hidePopover(); openEditModal(id); };
  document.getElementById('popover-delete-btn').onclick = () => { hidePopover(); confirmDelete(id); };

  popover.classList.remove('hidden');

  // Smart positioning
  const pw = popover.offsetWidth || 280;
  const ph = popover.offsetHeight || 260;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = screenX - pw / 2;
  let top  = screenY - ph - 12;

  // Flip horizontally if needed
  if (left < 8) left = 8;
  if (left + pw > vw - 8) left = vw - pw - 8;
  // Flip vertically if too high
  if (top < 8) top = screenY + 20;
  if (top + ph > vh - 8) top = vh - ph - 8;

  popover.style.left = left + 'px';
  popover.style.top  = top + 'px';
}

function hidePopover() {
  document.getElementById('popover').classList.add('hidden');
  STATE.activePopoverId = null;
}

/* ============================================================
   8. CRUD MODALS
   ============================================================ */
function openCreateModal() {
  const form = document.getElementById('crud-form');
  form.reset();
  document.getElementById('field-id').value = '';
  document.getElementById('modal-title').textContent = 'Add Event';
  document.getElementById('modal-delete-btn').classList.add('hidden');
  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('field-event_name').focus();
}

function openEditModal(id) {
  const r = STATE.records.find(rec => rec.id === id);
  if (!r) return;
  document.getElementById('field-id').value = r.id;
  document.getElementById('field-event_name').value  = r.event_name   || '';
  document.getElementById('field-date_start').value  = r.date_start   || '';
  document.getElementById('field-date_end').value    = r.date_end     || '';
  document.getElementById('field-category').value    = r.category     || '';
  document.getElementById('field-emoji').value        = r.emoji       || '';
  document.getElementById('field-importance').value  = r.importance   || 5;
  document.getElementById('field-tags').value         = r.tags        || '';
  document.getElementById('field-description').value = r.description  || '';
  document.getElementById('field-sources').value      = r.sources     || '';
  document.getElementById('field-image_url').value   = r.image_url   || '';

  document.getElementById('modal-title').textContent = 'Edit Event';
  document.getElementById('modal-delete-btn').classList.remove('hidden');
  document.getElementById('modal-delete-btn').onclick = () => {
    closeCrudModal();
    confirmDelete(id);
  };
  document.getElementById('crud-modal').classList.remove('hidden');
  document.getElementById('field-event_name').focus();
}

function closeCrudModal() {
  document.getElementById('crud-modal').classList.add('hidden');
}

function handleCrudSubmit(e) {
  e.preventDefault();
  const data = {
    event_name:  document.getElementById('field-event_name').value,
    date_start:  document.getElementById('field-date_start').value.trim(),
    date_end:    document.getElementById('field-date_end').value.trim(),
    category:    document.getElementById('field-category').value,
    emoji:       document.getElementById('field-emoji').value,
    importance:  document.getElementById('field-importance').value,
    tags:        document.getElementById('field-tags').value,
    description: document.getElementById('field-description').value,
    sources:     document.getElementById('field-sources').value,
    image_url:   document.getElementById('field-image_url').value,
  };

  // Inline validation feedback
  const dateStartEl = document.getElementById('field-date_start');
  const dateEndEl   = document.getElementById('field-date_end');
  dateStartEl.classList.toggle('invalid', data.date_start && !DATE_RE.test(data.date_start));
  dateEndEl.classList.toggle('invalid', data.date_end && !DATE_RE.test(data.date_end));

  const id = document.getElementById('field-id').value;
  let result;
  if (id) {
    result = updateRecord(id, data);
    if (result) showToast('Event updated', 'success');
  } else {
    result = createRecord(data);
    if (result) showToast('Event created', 'success');
  }
  if (result) closeCrudModal();
}

function confirmDelete(id) {
  const r = STATE.records.find(rec => rec.id === id);
  const name = r ? r.event_name : id;
  document.getElementById('confirm-title').textContent = 'Delete Event';
  document.getElementById('confirm-message').textContent = `Are you sure you want to delete "${name}"? This cannot be undone.`;
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

/* ============================================================
   9. IMPORT / EXPORT
   ============================================================ */
function exportCSV() {
  if (!STATE.records.length) { showToast('No records to export', 'warning'); return; }
  const csv = Papa.unparse(STATE.records.map(r => {
    const row = {};
    FIELDS.forEach(f => { row[f] = r[f] ?? ''; });
    return row;
  }), { columns: FIELDS });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
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
      const skipped  = [];
      result.data.forEach((row, i) => {
        // Map columns case-insensitively
        const norm = {};
        Object.entries(row).forEach(([k, v]) => { norm[k.trim().toLowerCase()] = v; });
        const rec = {};
        FIELDS.forEach(f => { rec[f] = (norm[f] || '').trim(); });
        rec.id         = rec.id || generateId();
        rec.version    = Number(rec.version) || 1;
        rec.importance = Number(rec.importance) || 5;
        const errors = validateRecord(rec);
        if (errors.length) {
          skipped.push(`Row ${i + 2}: ${errors.join(', ')}`);
          return;
        }
        imported.push(rec);
      });

      if (skipped.length) {
        showToast(`Skipped ${skipped.length} invalid row(s). First: ${skipped[0]}`, 'warning');
      }
      if (imported.length) {
        STATE.records = mergeRecords(STATE.records, imported);
        applyFilters();
        renderTimeline();
        showToast(`Imported ${imported.length} record(s)`, 'success');
      } else {
        showToast('No valid records found in CSV', 'error');
      }
    },
    error(err) {
      showToast('CSV parse error: ' + err.message, 'error');
    },
  });
}

function setupDragDrop() {
  const zone = document.getElementById('drop-zone');
  zone.addEventListener('dragover', e => {
    e.preventDefault();
    zone.classList.add('drop-highlight');
  });
  zone.addEventListener('dragleave', e => {
    if (!zone.contains(e.relatedTarget)) zone.classList.remove('drop-highlight');
  });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drop-highlight');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      importCSV(file);
    } else {
      showToast('Please drop a .csv file', 'warning');
    }
  });
}

/* ============================================================
   10. UI UTILITIES  (toasts, spinner, filters, zoom)
   ============================================================ */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${esc(message)}</span><button class="toast-dismiss" aria-label="Dismiss">×</button>`;
  toast.querySelector('.toast-dismiss').onclick = () => toast.remove();
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, duration);
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

  // Mouse wheel zoom on timeline
  document.getElementById('timeline-wrapper').addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? CONFIG.ZOOM_STEP : -CONFIG.ZOOM_STEP;
    STATE.zoom = Math.min(CONFIG.ZOOM_MAX, Math.max(CONFIG.ZOOM_MIN, STATE.zoom + delta));
    renderTimeline();
  }, { passive: false });
}

function setupDragScroll() {
  const wrapper = document.getElementById('timeline-wrapper');
  let dragging = false, startX = 0, scrollLeft = 0;
  wrapper.addEventListener('mousedown', e => {
    if (e.target.closest('.emoji-marker')) return;
    dragging = true; startX = e.pageX - wrapper.offsetLeft; scrollLeft = wrapper.scrollLeft;
    wrapper.style.cursor = 'grabbing';
  });
  document.addEventListener('mouseup', () => { dragging = false; wrapper.style.cursor = 'grab'; });
  wrapper.addEventListener('mousemove', e => {
    if (!dragging) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    wrapper.scrollLeft = scrollLeft - (x - startX);
    updateMinimap(
      parseFloat(document.getElementById('timeline-svg').getAttribute('width') || 0),
      wrapper.clientWidth
    );
  });
  wrapper.addEventListener('scroll', () => {
    const svg = document.getElementById('timeline-svg');
    updateMinimap(parseFloat(svg.getAttribute('width') || 0), wrapper.clientWidth);
  });
}

function setupFilters() {
  document.getElementById('search-input').addEventListener('input', e => {
    STATE.filterText = e.target.value;
    applyFilters();
    renderTimeline();
  });
  document.getElementById('category-filter').addEventListener('change', e => {
    STATE.filterCategory = e.target.value;
    applyFilters();
    renderTimeline();
  });
  document.getElementById('tag-filter').addEventListener('change', e => {
    STATE.filterTag = e.target.value;
    applyFilters();
    renderTimeline();
  });
  document.getElementById('clear-filters-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('category-filter').value = '';
    document.getElementById('tag-filter').value = '';
    STATE.filterText = '';
    STATE.filterCategory = '';
    STATE.filterTag = '';
    applyFilters();
    renderTimeline();
  });
}

function setupConnections() {
  document.getElementById('connections-btn').addEventListener('click', () => {
    STATE.showConnections = !STATE.showConnections;
    const btn = document.getElementById('connections-btn');
    btn.textContent = STATE.showConnections ? '🔗 Hide Connections' : '🔗 Connections';
    if (STATE.showConnections) {
      renderHeatmapPanel();
      document.getElementById('heatmap-panel').classList.remove('hidden');
    } else {
      document.getElementById('heatmap-panel').classList.add('hidden');
    }
    renderTimeline();
  });
  document.getElementById('heatmap-close-btn').addEventListener('click', () => {
    STATE.showConnections = false;
    document.getElementById('connections-btn').textContent = '🔗 Connections';
    document.getElementById('heatmap-panel').classList.add('hidden');
    renderTimeline();
  });
}

/* ============================================================
   11. INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  // Show setup banner if not configured
  if (!CONFIG.CLIENT_ID || !CONFIG.SPREADSHEET_ID) {
    document.getElementById('setup-banner').classList.remove('hidden');
  }

  // Load sample data if sheets not configured
  if (!CONFIG.SPREADSHEET_ID) {
    STATE.records = SAMPLE_EVENTS.map(r => ({ ...r }));
  }
  applyFilters();

  // Auth
  initGoogleAuth();
  document.getElementById('login-btn').addEventListener('click', () => requestToken(true));
  document.getElementById('signout-btn').addEventListener('click', signOut);

  // Sheet actions
  document.getElementById('open-sheet-btn').addEventListener('click', () => {
    if (CONFIG.SPREADSHEET_ID) window.open(`https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}`, '_blank');
  });
  document.getElementById('sync-btn').addEventListener('click', syncFromSheet);
  document.getElementById('push-btn').addEventListener('click', pushToSheet);

  // Export / Import
  document.getElementById('export-btn').addEventListener('click', exportCSV);
  document.getElementById('import-input').addEventListener('change', e => {
    importCSV(e.target.files[0]);
    e.target.value = '';
  });
  document.getElementById('empty-import-input').addEventListener('change', e => {
    importCSV(e.target.files[0]);
    e.target.value = '';
  });

  // FAB & empty state add button
  document.getElementById('fab-btn').addEventListener('click', openCreateModal);
  document.getElementById('empty-add-btn').addEventListener('click', openCreateModal);

  // CRUD modal
  document.getElementById('crud-form').addEventListener('submit', handleCrudSubmit);
  document.getElementById('modal-close-btn').addEventListener('click', closeCrudModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeCrudModal);
  document.getElementById('crud-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeCrudModal();
  });

  // Confirm dialog
  document.getElementById('confirm-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) document.getElementById('confirm-backdrop').classList.add('hidden');
  });

  // Popover dismiss on outside click
  document.addEventListener('click', e => {
    const popover = document.getElementById('popover');
    if (!popover.classList.contains('hidden') && !popover.contains(e.target) && !e.target.closest('.emoji-marker')) {
      hidePopover();
    }
  });

  // ESC key dismiss
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCrudModal();
      document.getElementById('confirm-backdrop').classList.add('hidden');
      hidePopover();
    }
  });

  // Setup all controls
  setupZoomControls();
  setupDragScroll();
  setupFilters();
  setupConnections();
  setupDragDrop();

  // Handle window resize
  window.addEventListener('resize', () => { renderTimeline(); });

  // Initial render
  renderTimeline();
});
