/* ============================================================
   Socratic TriangulaSean — app.js  v5.7
   Static GitHub Pages app — no build step required
   ============================================================ */

'use strict';

// ─── CONSTANTS ───────────────────────────────────────────────
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

const STATE = { SCREENSAVER: 'screen', TUTOR_PROMPT: 'tutor', ANIMATION: 'anim', REVIEW: 'review' };
const STATE_DURATIONS = { tutor: 10000, anim: 5000, review: 30000 };

// ─── TRIANGLE LIBRARY ────────────────────────────────────────
// Each entry: { name, tag, case, sides:[a,b,c], angles:[A,B,C] (deg) }
const TRIANGLE_LIBRARY = [
  // Pythagorean triples (right triangles, HL/SSS)
  { name: '3-4-5',        tag: 'pythagorean', case: 'HL',  sides:[3,4,5],       angles:[53.13,36.87,90] },
  { name: '5-12-13',      tag: 'pythagorean', case: 'HL',  sides:[5,12,13],     angles:[67.38,22.62,90] },
  { name: '8-15-17',      tag: 'pythagorean', case: 'HL',  sides:[8,15,17],     angles:[61.93,28.07,90] },
  { name: '7-24-25',      tag: 'pythagorean', case: 'HL',  sides:[7,24,25],     angles:[73.74,16.26,90] },
  { name: '9-40-41',      tag: 'pythagorean', case: 'HL',  sides:[9,40,41],     angles:[77.32,12.68,90] },
  { name: '6-8-10',       tag: 'pythagorean', case: 'HL',  sides:[6,8,10],      angles:[53.13,36.87,90] },
  // Special angle triangles
  { name: '30-60-90',     tag: 'special',     case: 'ASA', sides:[1,Math.sqrt(3),2], angles:[30,60,90] },
  { name: '45-45-90',     tag: 'special',     case: 'ASA', sides:[1,1,Math.sqrt(2)], angles:[45,45,90] },
  { name: 'Equilateral',  tag: 'special',     case: 'SSS', sides:[5,5,5],       angles:[60,60,60] },
  { name: 'Isosceles 36', tag: 'special',     case: 'SAS', sides:[4,4,2.35],    angles:[72,72,36] },
  // SSA Ambiguous cases
  { name: 'SSA-Two Solutions', tag: 'ssa',    case: 'SSA', sides:[7,10,null],   angles:[35,null,null], ssaKnown:{a:7,b:10,A:35} },
  { name: 'SSA-One Solution',  tag: 'ssa',    case: 'SSA', sides:[10,7,null],   angles:[35,null,null], ssaKnown:{a:10,b:7,A:35} },
  { name: 'SSA-No Solution',   tag: 'ssa',    case: 'SSA', sides:[3,10,null],   angles:[35,null,null], ssaKnown:{a:3,b:10,A:35} },
  // Oblique triangles
  { name: 'SAS Oblique',  tag: 'oblique',     case: 'SAS', sides:[8,11,null],   angles:[null,null,60], sasKnown:{a:8,b:11,C:60} },
  { name: 'SSS Oblique',  tag: 'oblique',     case: 'SSS', sides:[5,7,9],       angles:[null,null,null] },
  { name: 'AAS Classic',  tag: 'oblique',     case: 'AAS', sides:[null,8,null], angles:[40,null,75],   aasKnown:{B:8,A:40,C:75} },
];

// ─── MATH UTILITIES ──────────────────────────────────────────
const M = {
  sin: a => Math.sin(a * DEG),
  cos: a => Math.cos(a * DEG),
  tan: a => Math.tan(a * DEG),
  asin: v => Math.asin(v) * RAD,
  acos: v => Math.acos(v) * RAD,
  atan2: (y,x) => Math.atan2(y,x) * RAD,
  round: (v, d=2) => Math.round(v * 10**d) / 10**d,
  fmt: v => v == null ? '?' : (Number.isInteger(v) ? v : M.round(v,2)),
};

// Solve a full triangle given partial knowns, returns {A,B,C,a,b,c} or null
function solveTriangle(t) {
  let {A,B,C,a,b,c} = {...t};
  const known = v => v != null && !isNaN(v);

  // Angle sum
  if (known(A) && known(B) && !known(C)) C = 180 - A - B;
  if (known(A) && known(C) && !known(B)) B = 180 - A - C;
  if (known(B) && known(C) && !known(A)) A = 180 - B - C;

  // Law of Cosines: find side from 2 sides + included angle
  if (known(a) && known(b) && known(C) && !known(c))
    c = Math.sqrt(a*a + b*b - 2*a*b*M.cos(C));
  if (known(a) && known(c) && known(B) && !known(b))
    b = Math.sqrt(a*a + c*c - 2*a*c*M.cos(B));
  if (known(b) && known(c) && known(A) && !known(a))
    a = Math.sqrt(b*b + c*c - 2*b*c*M.cos(A));

  // Law of Cosines: find angle from 3 sides
  if (known(a) && known(b) && known(c)) {
    if (!known(C)) C = M.acos((a*a + b*b - c*c) / (2*a*b));
    if (!known(A)) A = M.acos((b*b + c*c - a*a) / (2*b*c));
    if (!known(B)) B = 180 - A - C;
  }

  // Law of Sines
  const ratio = (known(a)&&known(A)) ? a/M.sin(A) :
                (known(b)&&known(B)) ? b/M.sin(B) :
                (known(c)&&known(C)) ? c/M.sin(C) : null;
  if (ratio) {
    if (!known(a) && known(A)) a = ratio * M.sin(A);
    if (!known(b) && known(B)) b = ratio * M.sin(B);
    if (!known(c) && known(C)) c = ratio * M.sin(C);
    if (!known(A) && known(a)) A = M.asin(a / ratio);
    if (!known(B) && known(b)) B = M.asin(b / ratio);
    if (!known(C) && known(c)) C = M.asin(c / ratio);
  }

  // Angle sum again after sines
  if (known(A) && known(B) && !known(C)) C = 180 - A - B;
  if (known(A) && known(C) && !known(B)) B = 180 - A - C;
  if (known(B) && known(C) && !known(A)) A = 180 - B - C;

  // Final sines pass
  const ratio2 = (known(a)&&known(A)) ? a/M.sin(A) :
                 (known(b)&&known(B)) ? b/M.sin(B) :
                 (known(c)&&known(C)) ? c/M.sin(C) : null;
  if (ratio2) {
    if (!known(a) && known(A)) a = ratio2 * M.sin(A);
    if (!known(b) && known(B)) b = ratio2 * M.sin(B);
    if (!known(c) && known(C)) c = ratio2 * M.sin(C);
  }

  return { A: M.round(A), B: M.round(B), C: M.round(C),
           a: M.round(a), b: M.round(b), c: M.round(c) };
}

// SSA Ambiguous case analysis
function analyzeSSA(a, b, A) {
  // a = side opposite to A, b = adjacent side, A = known angle
  const h = b * M.sin(A); // altitude
  if (A >= 90) {
    return a > b ? [{ label: 'Triangle 1', valid: true }] : [];
  }
  if (a < h)  return [];                          // no solution
  if (Math.abs(a - h) < 0.001) return [{ label: 'Right Triangle', valid: true }]; // one (right)
  if (a >= b) return [{ label: 'Triangle 1', valid: true }];                       // one
  // Two solutions
  const B1 = M.asin(b * M.sin(A) / a);
  const B2 = 180 - B1;
  const C1 = 180 - A - B1;
  const C2 = 180 - A - B2;
  const solutions = [];
  if (C1 > 0) solutions.push({ label: 'Triangle 1 (acute B)', B: M.round(B1), C: M.round(C1), valid: true });
  if (C2 > 0) solutions.push({ label: 'Triangle 2 (obtuse B)', B: M.round(B2), C: M.round(C2), valid: true });
  return solutions;
}

// ─── STEP GENERATOR ──────────────────────────────────────────
// Returns ordered array of Socratic steps for a given triangle case
function buildSteps(tri) {
  const steps = [];
  const { caseType, solved } = tri;

  const push = (prompt, formula, activeEl, hint, answer, key) =>
    steps.push({ prompt, formula, activeEl, hint, answer: M.round(answer, 2), key });

  if (caseType === 'HL' || (caseType === 'SSS' && tri.knowns.C === 90)) {
    // Right triangle: SOHCAHTOA path
    steps.push({ prompt: `We have a right triangle. The hypotenuse is c = ${M.fmt(solved.c)}. What do we know about the sides?`, formula: 'a² + b² = c²', activeEl: 'side-c', hint: 'The hypotenuse is always opposite the right angle (90°).', answer: null, key: null });
    if (!tri.knowns.a) push(`Using sin(B) = opposite/hypotenuse, find side a.`, `sin(${M.fmt(solved.B)}°) = a / ${M.fmt(solved.c)}`, 'side-a', `a = c × sin(B) = ${M.fmt(solved.c)} × sin(${M.fmt(solved.B)}°)`, solved.a, 'a');
    if (!tri.knowns.b) push(`Using cos(B) = adjacent/hypotenuse, find side b.`, `cos(${M.fmt(solved.B)}°) = b / ${M.fmt(solved.c)}`, 'side-b', `b = c × cos(B) = ${M.fmt(solved.c)} × cos(${M.fmt(solved.B)}°)`, solved.b, 'b');
    if (!tri.knowns.A) push(`Now find angle A using sin⁻¹.`, `A = sin⁻¹(a / c)`, 'arc-A', `A = sin⁻¹(${M.fmt(solved.a)} / ${M.fmt(solved.c)})`, solved.A, 'A');
    if (!tri.knowns.B) push(`Find angle B using cos⁻¹.`, `B = cos⁻¹(b / c)`, 'arc-B', `B = cos⁻¹(${M.fmt(solved.b)} / ${M.fmt(solved.c)})`, solved.B, 'B');
    steps.push({ prompt: `Verify: A + B + C = ${M.fmt(solved.A)}° + ${M.fmt(solved.B)}° + 90° = 180°. Triangle solved!`, formula: 'A + B + C = 180°', activeEl: null, hint: null, answer: null, key: null, isFinal: true });

  } else if (caseType === 'SAS') {
    steps.push({ prompt: `We have SAS: two sides and the included angle. We can't use SOHCAHTOA directly. Which law applies?`, formula: 'Law of Cosines: c² = a² + b² − 2ab·cos(C)', activeEl: null, hint: 'When you have two sides and the angle BETWEEN them, use the Law of Cosines.', answer: null, key: null });
    push(`Find the third side c using the Law of Cosines.`, `c² = ${M.fmt(solved.a)}² + ${M.fmt(solved.b)}² − 2(${M.fmt(solved.a)})(${M.fmt(solved.b)})cos(${M.fmt(solved.C)}°)`, 'side-c', `c = √(a² + b² − 2ab·cos(C))`, solved.c, 'c');
    push(`Now use Law of Sines to find angle A.`, `sin(A)/a = sin(C)/c`, 'arc-A', `A = sin⁻¹(a·sin(C)/c)`, solved.A, 'A');
    push(`Find angle B using the Angle Sum Theorem.`, `B = 180° − A − C`, 'arc-B', `B = 180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`, solved.B, 'B');
    steps.push({ prompt: `All values found! a=${M.fmt(solved.a)}, b=${M.fmt(solved.b)}, c=${M.fmt(solved.c)}, A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, formula: '', activeEl: null, hint: null, answer: null, key: null, isFinal: true });

  } else if (caseType === 'SSS') {
    steps.push({ prompt: `We have SSS: all three sides. We need to find the angles. Which law lets us find an angle from three sides?`, formula: 'Law of Cosines: cos(C) = (a²+b²−c²)/(2ab)', activeEl: null, hint: 'With all three sides, rearrange the Law of Cosines to solve for an angle.', answer: null, key: null });
    push(`Find angle C using the Law of Cosines.`, `cos(C) = (${M.fmt(solved.a)}²+${M.fmt(solved.b)}²−${M.fmt(solved.c)}²) / (2·${M.fmt(solved.a)}·${M.fmt(solved.b)})`, 'arc-C', `C = cos⁻¹((a²+b²−c²)/(2ab))`, solved.C, 'C');
    push(`Find angle A using Law of Sines.`, `sin(A)/a = sin(C)/c`, 'arc-A', `A = sin⁻¹(a·sin(C)/c)`, solved.A, 'A');
    push(`Find angle B using Angle Sum.`, `B = 180° − A − C`, 'arc-B', `B = 180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`, solved.B, 'B');
    steps.push({ prompt: `Triangle solved! A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, formula: '', activeEl: null, hint: null, answer: null, key: null, isFinal: true });

  } else if (caseType === 'ASA' || caseType === 'AAS') {
    steps.push({ prompt: `We have two angles and a side. First, use the Angle Sum Theorem to find the third angle.`, formula: 'A + B + C = 180°', activeEl: null, hint: 'Always find the missing angle first — it unlocks the Law of Sines.', answer: null, key: null });
    if (!tri.knowns.A) push(`Find angle A.`, `A = 180° − B − C`, 'arc-A', `A = 180° − ${M.fmt(solved.B)}° − ${M.fmt(solved.C)}°`, solved.A, 'A');
    if (!tri.knowns.B) push(`Find angle B.`, `B = 180° − A − C`, 'arc-B', `B = 180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`, solved.B, 'B');
    if (!tri.knowns.C) push(`Find angle C.`, `C = 180° − A − B`, 'arc-C', `C = 180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.B)}°`, solved.C, 'C');
    const knownSide = tri.knowns.a ? 'a' : tri.knowns.b ? 'b' : 'c';
    const knownAngle = knownSide === 'a' ? 'A' : knownSide === 'b' ? 'B' : 'C';
    if (!tri.knowns.a) push(`Use Law of Sines to find side a.`, `a/sin(A) = ${M.fmt(solved[knownSide])}/sin(${M.fmt(solved[knownAngle])}°)`, 'side-a', `a = ${M.fmt(solved[knownSide])} × sin(${M.fmt(solved.A)}°) / sin(${M.fmt(solved[knownAngle])}°)`, solved.a, 'a');
    if (!tri.knowns.b) push(`Find side b.`, `b = ${M.fmt(solved[knownSide])} × sin(${M.fmt(solved.B)}°) / sin(${M.fmt(solved[knownAngle])}°)`, 'side-b', `b = ratio × sin(B)`, solved.b, 'b');
    if (!tri.knowns.c) push(`Find side c.`, `c = ${M.fmt(solved[knownSide])} × sin(${M.fmt(solved.C)}°) / sin(${M.fmt(solved[knownAngle])}°)`, 'side-c', `c = ratio × sin(C)`, solved.c, 'c');
    steps.push({ prompt: `Triangle fully solved!`, formula: '', activeEl: null, hint: null, answer: null, key: null, isFinal: true });

  } else if (caseType === 'SSA') {
    steps.push({ prompt: `We have SSA — the Ambiguous Case. Given a=${M.fmt(tri.ssaKnown.a)}, b=${M.fmt(tri.ssaKnown.b)}, A=${M.fmt(tri.ssaKnown.A)}°. First, compute the altitude h = b·sin(A).`, formula: `h = b·sin(A) = ${M.fmt(tri.ssaKnown.b)}·sin(${M.fmt(tri.ssaKnown.A)}°)`, activeEl: null, hint: 'The altitude h determines how many triangles are possible.', answer: null, key: null });
    const h = M.round(tri.ssaKnown.b * M.sin(tri.ssaKnown.A), 3);
    steps.push({ prompt: `h = ${h}. Compare a=${M.fmt(tri.ssaKnown.a)} to h=${h} and b=${M.fmt(tri.ssaKnown.b)}. How many solutions exist?`, formula: `If a < h: 0 solutions. If a = h: 1 (right). If h < a < b: 2. If a ≥ b: 1.`, activeEl: null, hint: `a=${M.fmt(tri.ssaKnown.a)}, h=${h}, b=${M.fmt(tri.ssaKnown.b)}`, answer: null, key: null, isSSADecision: true });
  }

  return steps;
}

// ─── APP STATE ───────────────────────────────────────────────
const App = {
  state: STATE.SCREENSAVER,
  speed: 1,
  paused: false,
  currentTri: null,       // { caseType, knowns, solved, steps, ssaKnown?, ssaSolutions? }
  stepIndex: 0,
  steps: [],
  timer: null,
  timerStart: null,
  timerDuration: 0,
  screensaverQueue: [],
  quizMode: false,
  quizVaultItem: null,
  mistakes: [],           // { triName, step, expected, got }
  savedProblems: [],
  filters: { pythagorean: true, special: true, ssa: true, oblique: true },
};

// ─── DOM REFS ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const DOM = {
  stateBadge:    $('state-badge'),
  tutorText:     $('tutor-text'),
  inputArea:     $('input-area'),
  answerInput:   $('answer-input'),
  btnSubmit:     $('btn-submit'),
  hintArea:      $('hint-area'),
  hintText:      $('hint-text'),
  feedbackArea:  $('feedback-area'),
  caseSelect:    $('case-select'),
  presetSelect:  $('preset-select'),
  btnGenerate:   $('btn-generate'),
  btnScreensaver:$('btn-screensaver'),
  speedSlider:   $('speed-slider'),
  speedLabel:    $('speed-label'),
  btnPrev:       $('btn-prev'),
  btnPause:      $('btn-pause'),
  btnNext:       $('btn-next'),
  progressBar:   $('progress-bar'),
  // Ledger
  valA: $('val-A'), valB: $('val-B'), valC: $('val-C'),
  vala: $('val-a'), valb: $('val-b'), valc: $('val-c'),
  ledgerA: $('ledger-A'), ledgerB: $('ledger-B'), ledgerC: $('ledger-C'),
  ledgera: $('ledger-a'), ledgerb: $('ledger-b'), ledgerc: $('ledger-c'),
  caseBadge:     $('case-badge'),
  formulaDisplay:$('formula-display'),
  ssaAlert:      $('ssa-alert'),
  ssaSolutions:  $('ssa-solutions'),
  // Vault
  vaultList:     $('vault-list'),
  vaultFilters:  document.querySelectorAll('.vault-filter'),
  // Mistakes
  mistakeList:   $('mistake-list'),
  btnClearMistakes: $('btn-clear-mistakes'),
  // Session
  btnSave:       $('btn-save'),
  btnShare:      $('btn-share'),
  // Modal
  ssaModal:      $('ssa-modal'),
  ssaModalBody:  $('ssa-modal-body'),
  ssaModalChoices: $('ssa-modal-choices'),
  ssaModalClose: $('ssa-modal-close'),
  // Toast
  toast:         $('toast'),
};

// ─── PERSISTENCE ─────────────────────────────────────────────
function loadStorage() {
  try {
    const f = JSON.parse(localStorage.getItem('ts_filters'));
    if (f) App.filters = { ...App.filters, ...f };
    const m = JSON.parse(localStorage.getItem('ts_mistakes'));
    if (m) App.mistakes = m;
    const s = JSON.parse(localStorage.getItem('ts_saved'));
    if (s) App.savedProblems = s;
  } catch(e) {}
}

function saveStorage() {
  localStorage.setItem('ts_filters', JSON.stringify(App.filters));
  localStorage.setItem('ts_mistakes', JSON.stringify(App.mistakes));
  localStorage.setItem('ts_saved', JSON.stringify(App.savedProblems));
}

function syncURL() {
  if (!App.currentTri) return;
  const params = new URLSearchParams();
  params.set('type', App.currentTri.caseType);
  params.set('step', App.stepIndex);
  const activeFilters = Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k).join(',');
  params.set('filter', activeFilters);
  history.replaceState(null, '', '?' + params.toString());
}

function loadFromURL() {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const step = parseInt(params.get('step')) || 0;
  const filter = params.get('filter');
  if (filter) {
    const active = filter.split(',');
    Object.keys(App.filters).forEach(k => App.filters[k] = active.includes(k));
  }
  if (type) {
    const preset = TRIANGLE_LIBRARY.find(t => t.case === type);
    if (preset) {
      generateFromPreset(preset);
      App.stepIndex = Math.min(step, App.steps.length - 1);
      renderStep();
    }
  }
}

// ─── TRIANGLE GENERATION ─────────────────────────────────────
function generateFromPreset(preset) {
  clearTimer();
  App.quizMode = false;
  App.quizVaultItem = null;

  const knowns = {};
  const solved = {};

  if (preset.case === 'SSA') {
    const { a, b, A } = preset.ssaKnown;
    const solutions = analyzeSSA(a, b, A);
    App.currentTri = {
      caseType: 'SSA',
      knowns: { a: true, b: true, A: true },
      solved: { a, b, A, B: null, C: null, c: null },
      ssaKnown: preset.ssaKnown,
      ssaSolutions: solutions,
      name: preset.name,
    };
    App.currentTri.steps = buildSteps(App.currentTri);
  } else {
    // Build knowns map
    preset.sides.forEach((v,i) => { if (v != null) knowns[['a','b','c'][i]] = true; });
    preset.angles.forEach((v,i) => { if (v != null) knowns[['A','B','C'][i]] = true; });

    const partial = {};
    preset.sides.forEach((v,i) => { partial[['a','b','c'][i]] = v; });
    preset.angles.forEach((v,i) => { partial[['A','B','C'][i]] = v; });

    // Override with specific known structures
    if (preset.sasKnown) Object.assign(partial, preset.sasKnown);
    if (preset.aasKnown) Object.assign(partial, preset.aasKnown);

    const s = solveTriangle(partial);
    App.currentTri = { caseType: preset.case, knowns, solved: s, name: preset.name };
    App.currentTri.steps = buildSteps(App.currentTri);
  }

  App.stepIndex = 0;
  App.steps = App.currentTri.steps;
  App.state = STATE.TUTOR_PROMPT;
  renderAll();
  syncURL();
}

function generateRandom() {
  const activeFilters = Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k);
  if (!activeFilters.length) { showToast('Enable at least one filter in the Vault.', 'error'); return; }
  const pool = TRIANGLE_LIBRARY.filter(t => activeFilters.includes(t.tag));
  if (!pool.length) { showToast('No triangles match current filters.', 'error'); return; }
  const preset = pool[Math.floor(Math.random() * pool.length)];
  generateFromPreset(preset);
}

function generateByCase(caseType) {
  if (caseType === 'random') { generateRandom(); return; }
  const pool = TRIANGLE_LIBRARY.filter(t => t.case === caseType);
  if (!pool.length) { generateRandom(); return; }
  generateFromPreset(pool[Math.floor(Math.random() * pool.length)]);
}

// ─── STATE MACHINE ───────────────────────────────────────────
function setState(newState) {
  App.state = newState;
  DOM.stateBadge.className = '';
  DOM.stateBadge.classList.add(newState);
  const labels = { screen:'SCREENSAVER', tutor:'TUTOR PROMPT', anim:'ANIMATION', review:'REVIEW' };
  DOM.stateBadge.textContent = labels[newState] || newState.toUpperCase();
  DOM.progressBar.style.background = newState === 'tutor' ? 'var(--state-tutor)' :
                                      newState === 'anim'  ? 'var(--state-anim)'  :
                                      newState === 'review'? 'var(--state-review)': 'var(--state-screen)';
}

function startTimer(duration, onComplete) {
  clearTimer();
  if (App.paused) return;
  App.timerStart = Date.now();
  App.timerDuration = duration / App.speed;
  const tick = () => {
    const elapsed = Date.now() - App.timerStart;
    const pct = Math.min(100, (elapsed / App.timerDuration) * 100);
    DOM.progressBar.style.width = pct + '%';
    if (elapsed >= App.timerDuration) { onComplete(); }
    else { App.timer = requestAnimationFrame(tick); }
  };
  App.timer = requestAnimationFrame(tick);
}

function clearTimer() {
  if (App.timer) { cancelAnimationFrame(App.timer); App.timer = null; }
  DOM.progressBar.style.width = '0%';
}

function advanceStateMachine() {
  if (App.quizMode) return; // quiz mode: user drives
  const step = App.steps[App.stepIndex];
  if (!step) return;

  if (App.state === STATE.TUTOR_PROMPT) {
    setState(STATE.ANIMATION);
    startTimer(STATE_DURATIONS.anim, () => {
      setState(STATE.REVIEW);
      startTimer(STATE_DURATIONS.review, () => advanceStep());
    });
  } else if (App.state === STATE.SCREENSAVER) {
    startTimer(STATE_DURATIONS.anim + STATE_DURATIONS.review, () => advanceStep());
  }
}

function advanceStep() {
  if (App.stepIndex < App.steps.length - 1) {
    App.stepIndex++;
    renderStep();
    setState(STATE.TUTOR_PROMPT);
    startTimer(STATE_DURATIONS.tutor, () => advanceStateMachine());
  } else {
    // Cycle to next in screensaver
    if (App.state === STATE.SCREENSAVER || !App.quizMode) {
      setTimeout(() => { generateRandom(); startScreensaver(); }, 2000);
    }
  }
}

// ─── SCREENSAVER ─────────────────────────────────────────────
function startScreensaver() {
  App.quizMode = false;
  setState(STATE.SCREENSAVER);
  document.body.classList.add('screensaver-active');
  DOM.inputArea.classList.add('hidden');
  DOM.hintArea.classList.add('hidden');
  generateRandom();
  startTimer(STATE_DURATIONS.tutor, () => advanceStateMachine());
}

function stopScreensaver() {
  document.body.classList.remove('screensaver-active');
  clearTimer();
}

// ─── QUIZ MODE ───────────────────────────────────────────────
function startQuizMode(vaultItem) {
  stopScreensaver();
  App.quizMode = true;
  App.quizVaultItem = vaultItem;
  generateFromPreset(vaultItem);
  setState(STATE.TUTOR_PROMPT);
  DOM.inputArea.classList.remove('hidden');
  DOM.hintArea.classList.remove('hidden');
  DOM.feedbackArea.textContent = '';
  DOM.feedbackArea.className = '';
  renderVault(); // highlight active
  showToast(`Quiz: ${vaultItem.name}`);
}

function checkAnswer() {
  const step = App.steps[App.stepIndex];
  if (!step || step.answer == null) { advanceStep(); return; }
  const raw = parseFloat(DOM.answerInput.value);
  if (isNaN(raw)) { showToast('Enter a number.', 'error'); return; }
  const correct = Math.abs(raw - step.answer) < 0.1;
  DOM.feedbackArea.textContent = correct ? `✓ Correct! ${step.answer}` : `✗ Expected ${step.answer}`;
  DOM.feedbackArea.className = correct ? 'correct' : 'wrong';
  if (!correct) {
    App.mistakes.push({ triName: App.currentTri.name, step: step.prompt.slice(0,40), expected: step.answer, got: raw });
    saveStorage();
    renderMistakes();
  }
  DOM.answerInput.value = '';
  if (correct) setTimeout(() => { DOM.feedbackArea.textContent = ''; advanceStep(); }, 800);
}

// ─── RENDER FUNCTIONS ────────────────────────────────────────
function renderAll() {
  renderStep();
  renderLedger();
  renderSVG();
  renderVault();
  renderMistakes();
}

function renderStep() {
  if (!App.steps.length) return;
  const step = App.steps[App.stepIndex];
  if (!step) return;

  DOM.tutorText.textContent = step.prompt;
  DOM.formulaDisplay.textContent = step.formula || '';
  DOM.hintText.textContent = step.hint || '';

  // Show/hide input
  const needsInput = App.quizMode && step.answer != null;
  DOM.inputArea.classList.toggle('hidden', !needsInput);
  DOM.hintArea.classList.toggle('hidden', !App.quizMode);

  // SSA modal
  if (step.isSSADecision && App.currentTri.ssaSolutions) {
    showSSAModal(App.currentTri.ssaSolutions, App.currentTri.ssaKnown);
  }

  // Update SVG highlight
  highlightSVGElement(step.activeEl);
  renderLedger();
  syncURL();
}

function renderLedger() {
  if (!App.currentTri) return;
  const { knowns, solved } = App.currentTri;
  const step = App.steps[App.stepIndex] || {};

  const keys = ['A','B','C','a','b','c'];
  keys.forEach(k => {
    const valEl = DOM['val' + k];
    const rowEl = DOM['ledger' + k];
    const v = solved[k];
    valEl.textContent = v != null ? M.fmt(v) + (k === k.toUpperCase() ? '°' : '') : '?';
    rowEl.className = 'ledger-row';
    valEl.className = 'ledger-val';
    if (knowns[k]) { rowEl.classList.add('known'); valEl.classList.add('known'); }
    else if (v != null) { rowEl.classList.add('solved'); valEl.classList.add('solved'); }
    if (step.key === k) rowEl.classList.add('active');
  });

  DOM.caseBadge.textContent = App.currentTri.caseType ? `Case: ${App.currentTri.caseType}` : '';

  // SSA alert
  if (App.currentTri.caseType === 'SSA') {
    DOM.ssaAlert.classList.remove('hidden');
    const sols = App.currentTri.ssaSolutions || [];
    DOM.ssaSolutions.textContent = sols.length === 0 ? 'No solution' :
      sols.length === 1 ? '1 solution' : `2 solutions: ${sols.map(s=>s.label).join(' | ')}`;
  } else {
    DOM.ssaAlert.classList.add('hidden');
  }
}

// ─── SVG RENDERING ───────────────────────────────────────────
function renderSVG() {
  if (!App.currentTri) return;
  const { solved, caseType } = App.currentTri;

  // Compute triangle vertices from sides using law of cosines
  const a = solved.a || 5, b = solved.b || 5, c = solved.c || 5;
  const A = solved.A || 60, B = solved.B || 60, C = solved.C || 60;

  // Place C at origin, B along x-axis, compute A
  const scale = 340 / Math.max(a, b, c, 1);
  const cx = 250, cy = 210; // center of SVG

  // Vertices: C at bottom-left, B at bottom-right, A at top
  const Bx = cx + (c * scale) / 2;
  const By = cy + (a * scale) / 2;
  const Cx = cx - (c * scale) / 2;
  const Cy = By;
  // A position using angle C
  const Ax = Cx + b * scale * M.cos(C);
  const Ay = Cy - b * scale * M.sin(C);

  const pts = { A: [Ax, Ay], B: [Bx, By], C: [Cx, Cy] };

  // Update polygon fill
  $('tri-fill').setAttribute('points', `${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`);

  // Sides: a = BC, b = AC, c = AB
  setSVGLine('side-a', pts.B, pts.C);
  setSVGLine('side-b', pts.A, pts.C);
  setSVGLine('side-c', pts.A, pts.B);

  // Labels: vertices
  setTextPos('lbl-A', Ax, Ay - 14, 'A');
  setTextPos('lbl-B', Bx + 10, By + 5, 'B');
  setTextPos('lbl-C', Cx - 18, Cy + 5, 'C');

  // Side labels (midpoints)
  setTextPos('lbl-a', (Bx+Cx)/2, By + 16, `a=${M.fmt(solved.a)}`);
  setTextPos('lbl-b', (Ax+Cx)/2 - 20, (Ay+Cy)/2, `b=${M.fmt(solved.b)}`);
  setTextPos('lbl-c', (Ax+Bx)/2 + 10, (Ay+By)/2, `c=${M.fmt(solved.c)}`);

  // Color side labels by known/solved
  ['a','b','c'].forEach(k => {
    const el = $('lbl-' + k);
    el.className.baseVal = 'tri-label side-label' + (App.currentTri.knowns[k] ? ' known' : (App.currentTri.solved[k] != null ? ' solved' : ''));
  });

  // Angle arcs
  drawArc('arc-A', pts.A, pts.B, pts.C, 22);
  drawArc('arc-B', pts.B, pts.A, pts.C, 22);
  drawArc('arc-C', pts.C, pts.A, pts.B, 22);

  // Right angle marker at C if 90°
  const rightAngleEl = $('right-angle-marker');
  if (Math.abs(C - 90) < 0.5) {
    rightAngleEl.classList.remove('hidden');
    rightAngleEl.setAttribute('x', Cx + 2);
    rightAngleEl.setAttribute('y', Cy - 14);
    rightAngleEl.setAttribute('stroke', 'var(--text-muted)');
  } else {
    rightAngleEl.classList.add('hidden');
  }

  // Apply active step highlight
  const step = App.steps[App.stepIndex] || {};
  applyStepColors(step);
}

function setSVGLine(id, p1, p2) {
  const el = $(id);
  el.setAttribute('x1', p1[0]); el.setAttribute('y1', p1[1]);
  el.setAttribute('x2', p2[0]); el.setAttribute('y2', p2[1]);
}

function setTextPos(id, x, y, text) {
  const el = $(id);
  el.setAttribute('x', x); el.setAttribute('y', y);
  el.textContent = text;
}

function drawArc(id, vertex, p1, p2, r) {
  const el = $(id);
  // Direction vectors from vertex
  const d1x = p1[0] - vertex[0], d1y = p1[1] - vertex[1];
  const d2x = p2[0] - vertex[0], d2y = p2[1] - vertex[1];
  const len1 = Math.sqrt(d1x*d1x + d1y*d1y);
  const len2 = Math.sqrt(d2x*d2x + d2y*d2y);
  if (len1 < 0.01 || len2 < 0.01) return;
  const sx = vertex[0] + (d1x/len1)*r;
  const sy = vertex[1] + (d1y/len1)*r;
  const ex = vertex[0] + (d2x/len2)*r;
  const ey = vertex[1] + (d2y/len2)*r;
  // Cross product to determine sweep
  const cross = d1x*d2y - d1y*d2x;
  const sweep = cross > 0 ? 0 : 1;
  el.setAttribute('d', `M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`);
}

function applyStepColors(step) {
  // Reset all sides
  ['side-a','side-b','side-c'].forEach(id => {
    const el = $(id);
    el.className.baseVal = 'tri-side';
    el.style.filter = '';
  });
  ['arc-A','arc-B','arc-C'].forEach(id => {
    $(id).className.baseVal = 'tri-arc';
  });

  if (!step.activeEl) return;
  const el = $(step.activeEl);
  if (!el) return;

  if (step.activeEl.startsWith('side')) {
    // Color by trig role
    const formula = (step.formula || '').toLowerCase();
    const cls = formula.includes('sin') ? 'sin-active' :
                formula.includes('cos') ? 'cos-active' :
                formula.includes('tan') ? 'tan-active' : 'hyp-active';
    el.className.baseVal = 'tri-side ' + cls;
    // Pulse on final solve
    if (step.isFinal) el.classList.add('pulse');
  } else if (step.activeEl.startsWith('arc')) {
    el.className.baseVal = 'tri-arc active';
  }
}

function highlightSVGElement(activeEl) {
  const dot = $('highlight-dot');
  if (!activeEl) { dot.classList.add('hidden'); return; }
  // Position dot near the active element midpoint
  const el = $(activeEl);
  if (!el) { dot.classList.add('hidden'); return; }
  dot.classList.remove('hidden');
  if (activeEl.startsWith('side')) {
    const mx = (parseFloat(el.getAttribute('x1')) + parseFloat(el.getAttribute('x2'))) / 2;
    const my = (parseFloat(el.getAttribute('y1')) + parseFloat(el.getAttribute('y2'))) / 2;
    dot.setAttribute('cx', mx); dot.setAttribute('cy', my);
  }
}

// ─── VAULT RENDERING ─────────────────────────────────────────
function renderVault() {
  const activeFilters = Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k);
  const visible = TRIANGLE_LIBRARY.filter(t => activeFilters.includes(t.tag));

  DOM.vaultList.innerHTML = '';
  if (!visible.length) {
    DOM.vaultList.innerHTML = '<p class="empty-msg">No identities match filters.</p>';
    return;
  }
  visible.forEach(item => {
    const div = document.createElement('div');
    div.className = 'vault-item' + (App.quizVaultItem === item ? ' quiz-active' : '');
    div.innerHTML = `<span class="vault-name">${item.name}</span><span class="vault-tag">${item.case}</span>`;
    div.addEventListener('click', () => startQuizMode(item));
    DOM.vaultList.appendChild(div);
  });
}

function renderMistakes() {
  DOM.mistakeList.innerHTML = '';
  if (!App.mistakes.length) {
    DOM.mistakeList.innerHTML = '<p class="empty-msg">No mistakes yet.</p>';
    return;
  }
  App.mistakes.slice(-10).reverse().forEach(m => {
    const div = document.createElement('div');
    div.className = 'mistake-item';
    div.textContent = `${m.triName}: expected ${m.expected}, got ${m.got}`;
    DOM.mistakeList.appendChild(div);
  });
}

// ─── PRESET SELECT POPULATION ────────────────────────────────
function populatePresets() {
  DOM.presetSelect.innerHTML = '<option value="">None (Generate)</option>';
  TRIANGLE_LIBRARY.forEach((t, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${t.name} (${t.case})`;
    DOM.presetSelect.appendChild(opt);
  });
}

// ─── SSA MODAL ───────────────────────────────────────────────
function showSSAModal(solutions, known) {
  const { a, b, A } = known;
  const h = M.round(b * M.sin(A), 3);
  DOM.ssaModalBody.textContent =
    `Given: a=${M.fmt(a)}, b=${M.fmt(b)}, A=${M.fmt(A)}°. Altitude h = b·sin(A) = ${h}. ` +
    (solutions.length === 0 ? 'Since a < h, no triangle exists.' :
     solutions.length === 1 ? 'Exactly one triangle is possible.' :
     'Two triangles are possible (ambiguous case).');

  DOM.ssaModalChoices.innerHTML = '';
  if (solutions.length === 0) {
    const btn = document.createElement('button');
    btn.className = 'ssa-choice-btn';
    btn.textContent = '✕ No solution — return to screensaver';
    btn.onclick = () => { closeSSAModal(); startScreensaver(); };
    DOM.ssaModalChoices.appendChild(btn);
  } else {
    solutions.forEach((sol, i) => {
      const btn = document.createElement('button');
      btn.className = 'ssa-choice-btn';
      btn.textContent = `Solve ${sol.label}` + (sol.B ? ` (B≈${sol.B}°, C≈${sol.C}°)` : '');
      btn.onclick = () => {
        closeSSAModal();
        if (solutions.length > 1) {
          // Build a solved triangle for the chosen solution
          const chosenB = sol.B, chosenC = sol.C;
          const ratio = a / M.sin(A);
          const chosenC_side = ratio * M.sin(chosenC);
          App.currentTri.solved = { a, b, A, B: chosenB, C: chosenC, c: M.round(chosenC_side) };
          App.currentTri.caseType = 'SSA_SOLVED';
          App.currentTri.steps = [
            { prompt: `You chose ${sol.label}: B=${chosenB}°, C=${chosenC}°. Now find side c using Law of Sines.`, formula: `c/sin(C) = a/sin(A)`, activeEl: 'side-c', hint: `c = a·sin(C)/sin(A)`, answer: M.round(chosenC_side), key: 'c' },
            { prompt: `Triangle solved! a=${a}, b=${b}, c=${M.round(chosenC_side)}, A=${A}°, B=${chosenB}°, C=${chosenC}°`, formula: '', activeEl: null, hint: null, answer: null, key: null, isFinal: true },
          ];
          App.steps = App.currentTri.steps;
          App.stepIndex = 0;
          renderAll();
        }
      };
      DOM.ssaModalChoices.appendChild(btn);
    });
  }
  DOM.ssaModal.classList.remove('hidden');
}

function closeSSAModal() { DOM.ssaModal.classList.add('hidden'); }

// ─── TOAST ───────────────────────────────────────────────────
let toastTimer = null;
function showToast(msg, type = '') {
  DOM.toast.textContent = msg;
  DOM.toast.className = type;
  DOM.toast.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => DOM.toast.classList.add('hidden'), 2500);
}

// ─── EVENT LISTENERS ─────────────────────────────────────────
function bindEvents() {
  // Generate button
  DOM.btnGenerate.addEventListener('click', () => {
    stopScreensaver();
    const caseVal = DOM.caseSelect.value;
    const presetVal = DOM.presetSelect.value;
    if (presetVal !== '') {
      generateFromPreset(TRIANGLE_LIBRARY[parseInt(presetVal)]);
    } else {
      generateByCase(caseVal);
    }
    setState(STATE.TUTOR_PROMPT);
    startTimer(STATE_DURATIONS.tutor, () => advanceStateMachine());
  });

  // Screensaver button
  DOM.btnScreensaver.addEventListener('click', () => startScreensaver());

  // Speed slider
  DOM.speedSlider.addEventListener('input', () => {
    App.speed = parseFloat(DOM.speedSlider.value);
    DOM.speedLabel.textContent = App.speed + '×';
  });

  // Submit answer
  DOM.btnSubmit.addEventListener('click', checkAnswer);
  DOM.answerInput.addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });

  // Hint
  $('btn-hint').addEventListener('click', () => {
    const step = App.steps[App.stepIndex];
    DOM.hintText.textContent = step?.hint || 'No hint available.';
  });

  // Nav controls
  DOM.btnPrev.addEventListener('click', () => {
    if (App.stepIndex > 0) { App.stepIndex--; clearTimer(); renderStep(); renderSVG(); }
  });
  DOM.btnNext.addEventListener('click', () => {
    if (App.stepIndex < App.steps.length - 1) { App.stepIndex++; clearTimer(); renderStep(); renderSVG(); }
    else advanceStep();
  });
  DOM.btnPause.addEventListener('click', togglePause);

  // Save
  DOM.btnSave.addEventListener('click', saveProblem);

  // Share
  DOM.btnShare.addEventListener('click', () => {
    syncURL();
    navigator.clipboard?.writeText(location.href).then(() => showToast('URL copied!', 'success'))
      .catch(() => showToast(location.href));
  });

  // Clear mistakes
  DOM.btnClearMistakes.addEventListener('click', () => {
    App.mistakes = [];
    saveStorage();
    renderMistakes();
    showToast('Mistakes cleared.');
  });

  // Vault filters
  DOM.vaultFilters.forEach(cb => {
    cb.checked = App.filters[cb.value] !== false;
    cb.addEventListener('change', () => {
      App.filters[cb.value] = cb.checked;
      saveStorage();
      renderVault();
    });
  });

  // SSA modal close
  DOM.ssaModalClose.addEventListener('click', closeSSAModal);
  DOM.ssaModal.addEventListener('click', e => { if (e.target === DOM.ssaModal) closeSSAModal(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
}

function togglePause() {
  App.paused = !App.paused;
  DOM.btnPause.textContent = App.paused ? '▶' : '⏸';
  DOM.btnPause.title = App.paused ? 'Resume (Space)' : 'Pause (Space)';
  if (App.paused) {
    clearTimer();
  } else {
    // Resume from current state
    if (App.state === STATE.TUTOR_PROMPT)
      startTimer(STATE_DURATIONS.tutor, () => advanceStateMachine());
    else if (App.state === STATE.ANIMATION)
      startTimer(STATE_DURATIONS.anim, () => { setState(STATE.REVIEW); startTimer(STATE_DURATIONS.review, () => advanceStep()); });
    else if (App.state === STATE.REVIEW)
      startTimer(STATE_DURATIONS.review, () => advanceStep());
    else if (App.state === STATE.SCREENSAVER)
      startTimer(STATE_DURATIONS.anim, () => advanceStep());
  }
}

function handleKeyboard(e) {
  // Ignore when typing in input
  if (e.target === DOM.answerInput) return;

  switch(e.code) {
    case 'Space':
      e.preventDefault();
      togglePause();
      break;
    case 'Enter':
      e.preventDefault();
      saveProblem();
      break;
    case 'ArrowRight':
      e.preventDefault();
      DOM.btnNext.click();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      DOM.btnPrev.click();
      break;
    case 'Escape':
      e.preventDefault();
      if (!DOM.ssaModal.classList.contains('hidden')) { closeSSAModal(); break; }
      if (App.quizMode) { App.quizMode = false; App.quizVaultItem = null; renderVault(); showToast('Quiz closed.'); }
      break;
  }
}

function saveProblem() {
  if (!App.currentTri) { showToast('Nothing to save.', 'error'); return; }
  const entry = {
    name: App.currentTri.name || App.currentTri.caseType,
    solved: App.currentTri.solved,
    caseType: App.currentTri.caseType,
    savedAt: new Date().toISOString(),
  };
  App.savedProblems.push(entry);
  saveStorage();
  showToast(`Saved: ${entry.name}`, 'success');
}

// ─── INIT ────────────────────────────────────────────────────
function init() {
  loadStorage();
  populatePresets();
  bindEvents();

  // Sync filter checkboxes with loaded state
  DOM.vaultFilters.forEach(cb => { cb.checked = App.filters[cb.value] !== false; });

  // Try loading from URL first
  const params = new URLSearchParams(location.search);
  if (params.get('type')) {
    loadFromURL();
    setState(STATE.TUTOR_PROMPT);
    startTimer(STATE_DURATIONS.tutor, () => advanceStateMachine());
  } else {
    // Default: screensaver
    startScreensaver();
  }
}

document.addEventListener('DOMContentLoaded', init);
