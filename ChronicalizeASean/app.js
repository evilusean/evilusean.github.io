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
