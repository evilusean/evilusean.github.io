/* ============================================================
   Socratic TriangulaSean — app.js  v5.9
   Socratic-first: Question → Reveal (spoilers) → Update SVG/Ledger
   ============================================================ */
'use strict';

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

// ─── PHASE SYSTEM ────────────────────────────────────────────
// Each step cycles: QUESTION → REVEAL → UPDATE → (next step QUESTION)
const PHASE = { QUESTION: 'question', REVEAL: 'reveal', UPDATE: 'update' };
const PHASE_DUR_DEFAULT = { question: 12000, reveal: 8000, update: 15000 };

const STATE = { SCREENSAVER: 'screen', ACTIVE: 'active' };

// ─── TRIANGLE LIBRARY ────────────────────────────────────────
const TRIANGLE_LIBRARY = [
  { name:'3-4-5',             tag:'pythagorean', case:'HL',  sides:[3,4,5],            angles:[53.13,36.87,90] },
  { name:'5-12-13',           tag:'pythagorean', case:'HL',  sides:[5,12,13],          angles:[67.38,22.62,90] },
  { name:'8-15-17',           tag:'pythagorean', case:'HL',  sides:[8,15,17],          angles:[61.93,28.07,90] },
  { name:'7-24-25',           tag:'pythagorean', case:'HL',  sides:[7,24,25],          angles:[73.74,16.26,90] },
  { name:'9-40-41',           tag:'pythagorean', case:'HL',  sides:[9,40,41],          angles:[77.32,12.68,90] },
  { name:'6-8-10',            tag:'pythagorean', case:'HL',  sides:[6,8,10],           angles:[53.13,36.87,90] },
  { name:'30-60-90',          tag:'special',     case:'ASA', sides:[1,Math.sqrt(3),2], angles:[30,60,90] },
  { name:'45-45-90',          tag:'special',     case:'ASA', sides:[1,1,Math.sqrt(2)], angles:[45,45,90] },
  { name:'Equilateral',       tag:'special',     case:'SSS', sides:[5,5,5],            angles:[60,60,60] },
  { name:'Isosceles 36',      tag:'special',     case:'SAS', sides:[4,4,2.35],         angles:[72,72,36] },
  { name:'SSA-Two Solutions', tag:'ssa',         case:'SSA', sides:[7,10,null],        angles:[35,null,null], ssaKnown:{a:7,b:10,A:35} },
  { name:'SSA-One Solution',  tag:'ssa',         case:'SSA', sides:[10,7,null],        angles:[35,null,null], ssaKnown:{a:10,b:7,A:35} },
  { name:'SSA-No Solution',   tag:'ssa',         case:'SSA', sides:[3,10,null],        angles:[35,null,null], ssaKnown:{a:3,b:10,A:35} },
  { name:'SAS Oblique',       tag:'oblique',     case:'SAS', sides:[8,11,null],        angles:[null,null,60], sasKnown:{a:8,b:11,C:60} },
  { name:'SSS Oblique',       tag:'oblique',     case:'SSS', sides:[5,7,9],            angles:[null,null,null] },
  { name:'AAS Classic',       tag:'oblique',     case:'AAS', sides:[null,8,null],      angles:[40,null,75],   aasKnown:{B:8,A:40,C:75} },
];

// ─── MATH ────────────────────────────────────────────────────
const M = {
  sin:  a => Math.sin(a*DEG),
  cos:  a => Math.cos(a*DEG),
  tan:  a => Math.tan(a*DEG),
  asin: v => Math.asin(v)*RAD,
  acos: v => Math.acos(v)*RAD,
  round:(v,d=2) => Math.round(v*10**d)/10**d,
  fmt:  v => v==null?'?':(Number.isInteger(v)?v:M.round(v,2)),
};

function solveTriangle(t) {
  let {A,B,C,a,b,c}={...t};
  const kn=v=>v!=null&&!isNaN(v);
  if(kn(A)&&kn(B)&&!kn(C))C=180-A-B; if(kn(A)&&kn(C)&&!kn(B))B=180-A-C; if(kn(B)&&kn(C)&&!kn(A))A=180-B-C;
  if(kn(a)&&kn(b)&&kn(C)&&!kn(c))c=Math.sqrt(a*a+b*b-2*a*b*M.cos(C));
  if(kn(a)&&kn(c)&&kn(B)&&!kn(b))b=Math.sqrt(a*a+c*c-2*a*c*M.cos(B));
  if(kn(b)&&kn(c)&&kn(A)&&!kn(a))a=Math.sqrt(b*b+c*c-2*b*c*M.cos(A));
  if(kn(a)&&kn(b)&&kn(c)){if(!kn(C))C=M.acos((a*a+b*b-c*c)/(2*a*b));if(!kn(A))A=M.acos((b*b+c*c-a*a)/(2*b*c));if(!kn(B))B=180-A-C;}
  const r=(kn(a)&&kn(A))?a/M.sin(A):(kn(b)&&kn(B))?b/M.sin(B):(kn(c)&&kn(C))?c/M.sin(C):null;
  if(r){if(!kn(a)&&kn(A))a=r*M.sin(A);if(!kn(b)&&kn(B))b=r*M.sin(B);if(!kn(c)&&kn(C))c=r*M.sin(C);if(!kn(A)&&kn(a))A=M.asin(a/r);if(!kn(B)&&kn(b))B=M.asin(b/r);if(!kn(C)&&kn(c))C=M.asin(c/r);}
  if(kn(A)&&kn(B)&&!kn(C))C=180-A-B; if(kn(A)&&kn(C)&&!kn(B))B=180-A-C; if(kn(B)&&kn(C)&&!kn(A))A=180-B-C;
  const r2=(kn(a)&&kn(A))?a/M.sin(A):(kn(b)&&kn(B))?b/M.sin(B):(kn(c)&&kn(C))?c/M.sin(C):null;
  if(r2){if(!kn(a)&&kn(A))a=r2*M.sin(A);if(!kn(b)&&kn(B))b=r2*M.sin(B);if(!kn(c)&&kn(C))c=r2*M.sin(C);}
  return{A:M.round(A),B:M.round(B),C:M.round(C),a:M.round(a),b:M.round(b),c:M.round(c)};
}

function analyzeSSA(a,b,A){
  const h=b*M.sin(A);
  if(A>=90)return a>b?[{label:'Triangle 1',valid:true}]:[];
  if(a<h)return[];
  if(Math.abs(a-h)<0.001)return[{label:'Right Triangle',valid:true}];
  if(a>=b)return[{label:'Triangle 1',valid:true}];
  const B1=M.asin(b*M.sin(A)/a),B2=180-B1,C1=180-A-B1,C2=180-A-B2,sols=[];
  if(C1>0)sols.push({label:'Triangle 1 (acute B)',B:M.round(B1),C:M.round(C1),valid:true});
  if(C2>0)sols.push({label:'Triangle 2 (obtuse B)',B:M.round(B2),C:M.round(C2),valid:true});
  return sols;
}

// ─── SPOILER BUILDER ─────────────────────────────────────────
// type: 'formula' | 'answer' | ''
// topic: optional cheatsheet section id to highlight on click
function sp(text, type='', topic='') {
  const topicAttr = topic ? ` data-topic="${topic}"` : '';
  return `<span class="spoiler ${type?type+'-spoiler':''}"${topicAttr} tabindex="0">${text}</span>`;
}

// ─── STEP BUILDER ────────────────────────────────────────────
// Each step: { question, reveal (HTML with spoilers), key, activeEl, answer, isFinal, isSSADecision }
// question  = Socratic prompt, no answers given
// reveal    = method explanation with spoilered formula/answer, shown after question phase
function buildSteps(tri) {
  const steps = [];
  const {caseType, solved} = tri;

  const push = (question, reveal, activeEl, answer, key) =>
    steps.push({question, reveal, activeEl, answer: M.round(answer,2), key});

  if (caseType === 'HL') {
    steps.push({
      question: `You have a right triangle with hypotenuse c = ${M.fmt(solved.c)}. One angle is 90°. What relationship connects all three sides?`,
      reveal: `Right triangles use the ${sp('Pythagorean Theorem','formula','pythagorean')}: ${sp('a² + b² = c²','formula','pythagorean')}. The hypotenuse is always opposite the right angle.`,
      activeEl: 'side-c', answer: null, key: null
    });
    if (!tri.knowns.a) push(
      `You know angle B = ${M.fmt(solved.B)}° and hypotenuse c = ${M.fmt(solved.c)}. Side a is opposite to B. Which trig ratio uses opposite and hypotenuse?`,
      `${sp('sin','formula')} uses Opposite/Hypotenuse. So: ${sp(`sin(${M.fmt(solved.B)}°) = a / ${M.fmt(solved.c)}`,'formula')} → a = ${sp(M.fmt(solved.a),'answer')}`,
      'side-a', solved.a, 'a'
    );
    if (!tri.knowns.b) push(
      `Side b is adjacent to angle B. Which trig ratio uses adjacent and hypotenuse?`,
      `${sp('cos','formula')} uses Adjacent/Hypotenuse. So: ${sp(`cos(${M.fmt(solved.B)}°) = b / ${M.fmt(solved.c)}`,'formula')} → b = ${sp(M.fmt(solved.b),'answer')}`,
      'side-b', solved.b, 'b'
    );
    if (!tri.knowns.A) push(
      `Now you have all three sides. How do you find angle A from sides a and c?`,
      `Use the inverse: ${sp('A = sin⁻¹(a / c)','formula')} = ${sp(`sin⁻¹(${M.fmt(solved.a)} / ${M.fmt(solved.c)})`,'formula')} = ${sp(M.fmt(solved.A)+'°','answer')}`,
      'arc-A', solved.A, 'A'
    );
    if (!tri.knowns.B) push(
      `How do you find angle B from sides b and c?`,
      `Use: ${sp('B = cos⁻¹(b / c)','formula')} = ${sp(`cos⁻¹(${M.fmt(solved.b)} / ${M.fmt(solved.c)})`,'formula')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    steps.push({question:`✓ Verify: ${M.fmt(solved.A)}° + ${M.fmt(solved.B)}° + 90° = 180°. Triangle solved!`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'SAS') {
    steps.push({
      question: `You have two sides (a = ${M.fmt(solved.a)}, b = ${M.fmt(solved.b)}) and the angle between them (C = ${M.fmt(solved.C)}°). Can you use SOHCAHTOA here? Why or why not?`,
      reveal: `SOHCAHTOA only works for right triangles. With two sides and an included angle, use the ${sp('Law of Cosines','formula','law-of-cosines')}: ${sp('c² = a² + b² − 2ab·cos(C)','formula','law-of-cosines')}`,
      activeEl: null, answer: null, key: null
    });
    push(
      `Using the Law of Cosines, what is side c?`,
      `${sp(`c² = ${M.fmt(solved.a)}² + ${M.fmt(solved.b)}² − 2(${M.fmt(solved.a)})(${M.fmt(solved.b)})cos(${M.fmt(solved.C)}°)`,'formula','law-of-cosines')} → c = ${sp(M.fmt(solved.c),'answer')}`,
      'side-c', solved.c, 'c'
    );
    push(
      `Now you have all three sides and angle C. How do you find angle A?`,
      `Use the ${sp('Law of Sines','formula','law-of-sines')}: ${sp('sin(A)/a = sin(C)/c','formula','law-of-sines')} → A = ${sp(M.fmt(solved.A)+'°','answer')}`,
      'arc-A', solved.A, 'A'
    );
    push(
      `You have A and C. What's the quickest way to find B?`,
      `${sp('Angle Sum Theorem','formula')}: ${sp('B = 180° − A − C','formula')} = ${sp(`180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`,'formula')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    steps.push({question:`✓ Triangle solved! a=${M.fmt(solved.a)}, b=${M.fmt(solved.b)}, c=${M.fmt(solved.c)}, A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'SSS') {
    steps.push({
      question: `You have all three sides: a=${M.fmt(solved.a)}, b=${M.fmt(solved.b)}, c=${M.fmt(solved.c)}. No angles yet. Which law lets you find an angle when you only have sides?`,
      reveal: `The ${sp('Law of Cosines','formula')} rearranges to: ${sp('cos(C) = (a²+b²−c²) / (2ab)','formula')}. Start with the largest angle to avoid ambiguity.`,
      activeEl: null, answer: null, key: null
    });
    push(
      `Find angle C using the Law of Cosines.`,
      `${sp(`cos(C) = (${M.fmt(solved.a)}²+${M.fmt(solved.b)}²−${M.fmt(solved.c)}²) / (2·${M.fmt(solved.a)}·${M.fmt(solved.b)})`,'formula')} → C = ${sp(M.fmt(solved.C)+'°','answer')}`,
      'arc-C', solved.C, 'C'
    );
    push(
      `Now you have C and all three sides. What's the most efficient way to find A?`,
      `Switch to ${sp('Law of Sines','formula')}: ${sp('sin(A)/a = sin(C)/c','formula')} → A = ${sp(M.fmt(solved.A)+'°','answer')}`,
      'arc-A', solved.A, 'A'
    );
    push(
      `You have A and C. How do you find B without any more trig?`,
      `${sp('Angle Sum','formula')}: ${sp('B = 180° − A − C','formula')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    steps.push({question:`✓ Triangle solved! A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'ASA' || caseType === 'AAS') {
    steps.push({
      question: `You have two angles and a side. Before using any trig, what can you figure out immediately from the angles alone?`,
      reveal: `The ${sp('Angle Sum Theorem','formula')}: ${sp('A + B + C = 180°','formula')}. Always find the third angle first — it unlocks the Law of Sines for all sides.`,
      activeEl: null, answer: null, key: null
    });
    if (!tri.knowns.A) push(
      `What is angle A?`,
      `${sp('A = 180° − B − C','formula')} = ${sp(`180° − ${M.fmt(solved.B)}° − ${M.fmt(solved.C)}°`,'formula')} = ${sp(M.fmt(solved.A)+'°','answer')}`,
      'arc-A', solved.A, 'A'
    );
    if (!tri.knowns.B) push(
      `What is angle B?`,
      `${sp('B = 180° − A − C','formula')} = ${sp(`180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`,'formula')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    if (!tri.knowns.C) push(
      `What is angle C?`,
      `${sp('C = 180° − A − B','formula')} = ${sp(`180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.B)}°`,'formula')} = ${sp(M.fmt(solved.C)+'°','answer')}`,
      'arc-C', solved.C, 'C'
    );
    const ks=tri.knowns.a?'a':tri.knowns.b?'b':'c';
    const ka=ks==='a'?'A':ks==='b'?'B':'C';
    if (!tri.knowns.a) push(
      `You know side ${ks} = ${M.fmt(solved[ks])} and all three angles. Which law connects sides to angles?`,
      `${sp('Law of Sines','formula')}: ${sp(`a/sin(A) = ${M.fmt(solved[ks])}/sin(${M.fmt(solved[ka])}°)`,'formula')} → a = ${sp(M.fmt(solved.a),'answer')}`,
      'side-a', solved.a, 'a'
    );
    if (!tri.knowns.b) push(
      `Same ratio — find side b.`,
      `${sp(`b = ${M.fmt(solved[ks])} × sin(${M.fmt(solved.B)}°) / sin(${M.fmt(solved[ka])}°)`,'formula')} = ${sp(M.fmt(solved.b),'answer')}`,
      'side-b', solved.b, 'b'
    );
    if (!tri.knowns.c) push(
      `And side c?`,
      `${sp(`c = ${M.fmt(solved[ks])} × sin(${M.fmt(solved.C)}°) / sin(${M.fmt(solved[ka])}°)`,'formula')} = ${sp(M.fmt(solved.c),'answer')}`,
      'side-c', solved.c, 'c'
    );
    steps.push({question:`✓ Triangle fully solved!`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'SSA') {
    steps.push({
      question: `You have a=${M.fmt(tri.ssaKnown.a)}, b=${M.fmt(tri.ssaKnown.b)}, A=${M.fmt(tri.ssaKnown.A)}°. This is the Ambiguous Case (SSA). Why might this give more than one triangle?`,
      reveal: `With SSA, the side opposite the known angle might "swing" to hit the base in two places. Compute the altitude: ${sp('h = b·sin(A)','formula')} = ${sp(M.fmt(M.round(tri.ssaKnown.b*M.sin(tri.ssaKnown.A),3)),'answer')}`,
      activeEl: null, answer: null, key: null
    });
    const h=M.round(tri.ssaKnown.b*M.sin(tri.ssaKnown.A),3);
    steps.push({
      question: `h = ${h}. You have a=${M.fmt(tri.ssaKnown.a)}, b=${M.fmt(tri.ssaKnown.b)}. Compare a to h and b. How many triangles are possible?`,
      reveal: `Rules: ${sp('a < h → 0 solutions','formula')} | ${sp('a = h → 1 (right △)','formula')} | ${sp('h < a < b → 2 solutions','formula')} | ${sp('a ≥ b → 1 solution','formula')}`,
      activeEl: null, answer: null, key: null, isSSADecision: true
    });
  }

  return steps;
}

// ─── APP STATE ───────────────────────────────────────────────
const App = {
  state: STATE.SCREENSAVER,
  phase: PHASE.QUESTION,
  speed: 1,
  paused: false,
  currentTri: null,
  stepIndex: 0,
  steps: [],
  timer: null,
  revealCountdownTimer: null,
  quizMode: false,
  quizVaultItem: null,
  mistakes: [],
  savedProblems: [],
  filters: {pythagorean:true, special:true, ssa:true, oblique:true},
  // Track which values have been revealed on SVG/ledger so far
  revealedKeys: new Set(),
  questionDur: 12,
  revealDur: 8,
  updateDur: 15,
};

const $ = id => document.getElementById(id);
const DOM = {
  stateBadge:    $('state-badge'),
  phaseQuestion: $('phase-question'),
  phaseReveal:   $('phase-reveal'),
  tutorText:     $('tutor-text'),
  revealText:    $('reveal-text'),
  revealCountdown: $('reveal-countdown'),
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
  questionDurationSlider: $('question-duration-slider'),
  questionDurationLabel: $('question-duration-label'),
  revealDurationSlider: $('reveal-duration-slider'),
  revealDurationLabel: $('reveal-duration-label'),
  updateDurationSlider: $('update-duration-slider'),
  updateDurationLabel: $('update-duration-label'),
  btnPrev:       $('btn-prev'),
  btnPause:      $('btn-pause'),
  btnNext:       $('btn-next'),
  progressBar:   $('progress-bar'),
  // SVG ledger bar
  slvA:$('slv-A'), slvB:$('slv-B'), slvC:$('slv-C'),
  slva:$('slv-a'), slvb:$('slv-b'), slvc:$('slv-c'),
  // Right-column ledger
  valA:$('val-A'), valB:$('val-B'), valC:$('val-C'),
  vala:$('val-a'), valb:$('val-b'), valc:$('val-c'),
  ledgerA:$('ledger-A'), ledgerB:$('ledger-B'), ledgerC:$('ledger-C'),
  ledgera:$('ledger-a'), ledgerb:$('ledger-b'), ledgerc:$('ledger-c'),
  caseBadge:     $('case-badge'),
  ssaAlert:      $('ssa-alert'),
  ssaSolutions:  $('ssa-solutions'),
  vaultList:     $('vault-list'),
  vaultFilters:  document.querySelectorAll('.vault-filter'),
  quizCaseFilters: document.querySelectorAll('.quiz-case'),
  mistakeList:   $('mistake-list'),
  btnClearMistakes: $('btn-clear-mistakes'),
  btnSave:       $('btn-save'),
  btnShare:      $('btn-share'),
  ssaModal:      $('ssa-modal'),
  ssaModalBody:  $('ssa-modal-body'),
  ssaModalChoices:$('ssa-modal-choices'),
  ssaModalClose: $('ssa-modal-close'),
  toast:         $('toast'),
  cheatsheet:    $('cheatsheet-panel'),
  scratchpad:    $('scratchpad'),
};

// ─── PERSISTENCE ─────────────────────────────────────────────
function loadStorage() {
  try {
    const f=JSON.parse(localStorage.getItem('ts_filters')); if(f)App.filters={...App.filters,...f};
    const m=JSON.parse(localStorage.getItem('ts_mistakes')); if(m)App.mistakes=m;
    const s=JSON.parse(localStorage.getItem('ts_saved'));   if(s)App.savedProblems=s;
    const sc=localStorage.getItem('ts_scratch');            if(sc)DOM.scratchpad.value=sc;
  } catch(e){}
}
function saveStorage() {
  localStorage.setItem('ts_filters',JSON.stringify(App.filters));
  localStorage.setItem('ts_mistakes',JSON.stringify(App.mistakes));
  localStorage.setItem('ts_saved',JSON.stringify(App.savedProblems));
}
function syncURL() {
  if(!App.currentTri)return;
  const p=new URLSearchParams();
  p.set('type',App.currentTri.caseType);
  // Removed step to avoid spoilers
  p.set('filter',Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k).join(','));
  history.replaceState(null,'','?'+p.toString());
}
function loadFromURL() {
  const p=new URLSearchParams(location.search);
  const type=p.get('type'),step=parseInt(p.get('step'))||0,filter=p.get('filter');
  if(filter){const a=filter.split(',');Object.keys(App.filters).forEach(k=>App.filters[k]=a.includes(k));}
  if(type){const preset=TRIANGLE_LIBRARY.find(t=>t.case===type);if(preset){generateFromPreset(preset);App.stepIndex=Math.min(step,App.steps.length-1);renderStep();}}
}

// ─── GENERATION ──────────────────────────────────────────────
function generateFromPreset(preset) {
  clearAllTimers();
  App.quizMode=false; App.quizVaultItem=null;
  App.revealedKeys=new Set();

  if(preset.case==='SSA'){
    const{a,b,A}=preset.ssaKnown;
    App.currentTri={caseType:'SSA',knowns:{a:true,b:true,A:true},solved:{a,b,A,B:null,C:null,c:null},ssaKnown:preset.ssaKnown,ssaSolutions:analyzeSSA(a,b,A),name:preset.name};
  } else {
    const knowns={},partial={};
    preset.sides.forEach((v,i)=>{if(v!=null){knowns[['a','b','c'][i]]=true;}partial[['a','b','c'][i]]=v;});
    preset.angles.forEach((v,i)=>{if(v!=null){knowns[['A','B','C'][i]]=true;}partial[['A','B','C'][i]]=v;});
    if(preset.sasKnown)Object.assign(partial,preset.sasKnown);
    if(preset.aasKnown)Object.assign(partial,preset.aasKnown);
    App.currentTri={caseType:preset.case,knowns,solved:solveTriangle(partial),name:preset.name};
  }

  // Pre-reveal known values
  Object.keys(App.currentTri.knowns).forEach(k=>App.revealedKeys.add(k));

  App.currentTri.steps=buildSteps(App.currentTri);
  App.stepIndex=0;
  App.steps=App.currentTri.steps;
  App.phase=PHASE.QUESTION;

  // Animate triangle in
  const grp=$('svg-triangle-group');
  grp.classList.remove('appear');
  void grp.offsetWidth;
  grp.classList.add('appear');

  renderSVG();
  renderLedger();
  renderSVGLedger();
  renderStep();
  syncURL();
}

function generateRandom(){
  const active=Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k);
  if(!active.length){showToast('Enable at least one filter.','error');return;}
  const pool=TRIANGLE_LIBRARY.filter(t=>active.includes(t.tag));
  if(!pool.length){showToast('No triangles match filters.','error');return;}
  // Avoid repeating the same triangle back-to-back
  let candidates=pool;
  if(App.currentTri&&pool.length>1){
    candidates=pool.filter(t=>t.name!==App.currentTri.name);
  }
  // Fisher-Yates pick: just pick a random index
  const pick=candidates[Math.floor(Math.random()*candidates.length)];
  generateFromPreset(pick);
}

function generateByCase(ct){
  if(ct==='random'){generateRandom();return;}
  const pool=TRIANGLE_LIBRARY.filter(t=>t.case===ct);
  if(!pool.length){generateRandom();return;}
  generateFromPreset(pool[Math.floor(Math.random()*pool.length)]);
}

function clearAllTimers(){
  if(App.timer){cancelAnimationFrame(App.timer);App.timer=null;}
  if(App.revealCountdownTimer){clearInterval(App.revealCountdownTimer);App.revealCountdownTimer=null;}
  DOM.progressBar.style.width='0%';
}

function startTimer(duration, onComplete){
  if(App.timer){cancelAnimationFrame(App.timer);App.timer=null;}
  DOM.progressBar.style.width='0%';
  if(App.paused)return;
  const start=Date.now();
  const dur=duration/App.speed;  // apply speed here only
  const tick=()=>{
    const elapsed=Date.now()-start;
    DOM.progressBar.style.width=Math.min(100,(elapsed/dur)*100)+'%';
    if(elapsed>=dur)onComplete();
    else App.timer=requestAnimationFrame(tick);
  };
  App.timer=requestAnimationFrame(tick);
}

// ─── PHASE MACHINE ───────────────────────────────────────────
function runPhase(phase){
  App.phase=phase;
  updateStateBadge();

  if(phase===PHASE.QUESTION){
    showQuestionPhase();
    if(!App.quizMode){
      // startTimer handles speed internally
      startTimer(App.questionDur * 1000, ()=>runPhase(PHASE.REVEAL));
    }
  } else if(phase===PHASE.REVEAL){
    showRevealPhase();
    startRevealCountdown(App.revealDur * 1000, ()=>runPhase(PHASE.UPDATE));
  } else if(phase===PHASE.UPDATE){
    const step=App.steps[App.stepIndex];
    if(step&&step.key){
      App.revealedKeys.add(step.key);
      animateLedgerReveal(step.key);
      popSVGLedger(step.key);
      renderSVG();
      renderSVGLedger();
    }
    if(step&&step.activeEl) applyStepColors(step);
    startTimer(App.updateDur * 1000, ()=>advanceStep());
  }
}

function showQuestionPhase(){
  DOM.phaseQuestion.classList.remove('hidden');
  DOM.phaseReveal.classList.add('hidden');
  DOM.progressBar.style.background='var(--state-tutor)';
}

function showRevealPhase(){
  DOM.phaseReveal.classList.remove('hidden');
  DOM.progressBar.style.background='var(--state-anim)';
  const step=App.steps[App.stepIndex];
  DOM.revealText.innerHTML=step?.reveal||'';
  // Bind spoiler interactions: click to lock-reveal, hover auto-reveals visually via CSS
  DOM.revealText.querySelectorAll('.spoiler').forEach(el=>{
    el.addEventListener('click',()=>{
      el.classList.add('revealed');
      // If spoiler has a topic, highlight that section in the cheatsheet
      const topic=el.dataset.topic;
      if(topic) highlightCheatsheetTopic(topic);
    });
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')el.classList.add('revealed');});
  });
}

// Map topic keys to cheatsheet section IDs
const TOPIC_MAP = {
  'sohcahtoa':     'cs-sohcahtoa',
  'inverse-trig':  'cs-inverse',
  'law-of-sines':  'cs-sines',
  'law-of-cosines':'cs-cosines',
  'pythagorean':   'cs-pythagorean',
  'angle-sum':     'cs-anglesum',
  'ssa':           'cs-ssa',
};

function highlightCheatsheetTopic(topic){
  const sectionId=TOPIC_MAP[topic];
  if(!sectionId)return;
  // Open cheatsheet if hidden
  if(DOM.cheatsheet.classList.contains('hidden')){
    DOM.cheatsheet.classList.remove('hidden');
    $('btn-cheatsheet').classList.add('active');
  }
  // Remove previous highlights
  document.querySelectorAll('.cs-section.highlighted').forEach(s=>s.classList.remove('highlighted'));
  const section=$(sectionId);
  if(section){
    section.classList.add('highlighted');
    section.scrollIntoView({behavior:'smooth',block:'nearest'});
    setTimeout(()=>section.classList.remove('highlighted'),3000);
  }
}

function startRevealCountdown(duration, onComplete){
  // duration is already in ms (not divided by speed — startTimer handles that)
  let remaining=Math.ceil(duration/1000);
  DOM.revealCountdown.textContent=`(${remaining}s)`;
  if(App.revealCountdownTimer){clearInterval(App.revealCountdownTimer);App.revealCountdownTimer=null;}
  App.revealCountdownTimer=setInterval(()=>{
    remaining--;
    DOM.revealCountdown.textContent=remaining>0?`(${remaining}s)`:'';
    if(remaining<=0){
      clearInterval(App.revealCountdownTimer);
      App.revealCountdownTimer=null;
      // Auto-reveal all spoilers with animation
      DOM.revealText.querySelectorAll('.spoiler:not(.revealed)').forEach(el=>{
        el.classList.add('auto-revealing','revealed');
      });
    }
  },1000);
  startTimer(duration, onComplete);
}

function updateStateBadge(){
  const labels={[PHASE.QUESTION]:'QUESTION',[PHASE.REVEAL]:'REVEAL',[PHASE.UPDATE]:'UPDATE'};
  const cls={[PHASE.QUESTION]:'tutor',[PHASE.REVEAL]:'anim',[PHASE.UPDATE]:'review'};
  DOM.stateBadge.className=cls[App.phase]||'screen';
  DOM.stateBadge.textContent=App.state===STATE.SCREENSAVER?'SCREENSAVER':(labels[App.phase]||'');
}

function advanceStep(){
  if(App.stepIndex<App.steps.length-1){
    App.stepIndex++;
    renderStep();
    if(App.quizMode){
      App.phase=PHASE.QUESTION; updateStateBadge();
      renderQuizStep();
      $('btn-quiz-reveal').classList.remove('hidden');
      $('btn-quiz-next').classList.add('hidden');
    } else {
      runPhase(PHASE.QUESTION);
    }
  } else {
    if(!App.quizMode){
      setTimeout(()=>{generateRandom();startScreensaver();},2500);
    } else {
      showToast('Triangle solved! 🎉','success');
    }
  }
}

// ─── SCREENSAVER / QUIZ ──────────────────────────────────────
function startScreensaver(){
  App.state=STATE.SCREENSAVER; App.quizMode=false;
  document.body.classList.add('screensaver-active');
  DOM.inputArea.classList.add('hidden'); DOM.hintArea.classList.add('hidden');
  updateStateBadge();
  generateRandom();
  runPhase(PHASE.QUESTION);
}
function stopScreensaver(){
  App.state=STATE.ACTIVE;
  document.body.classList.remove('screensaver-active');
  clearAllTimers();
}
function startQuizMode(preset){
  stopScreensaver();
  App.quizMode=true; App.quizVaultItem=preset;
  generateFromPreset(preset);
  // Quiz: no timers, user drives each step manually
  clearAllTimers();
  DOM.progressBar.style.width='0%';
  showQuizUI();
  renderVault();
  showToast(`Quiz: ${preset.name}`);
  // Show question phase but don't start timer
  App.phase=PHASE.QUESTION;
  updateStateBadge();
  showQuestionPhase();
}

function showQuizUI(){
  DOM.inputArea.classList.remove('hidden');
  DOM.hintArea.classList.remove('hidden');
  DOM.feedbackArea.textContent=''; DOM.feedbackArea.className='';
  // Update quiz step prompt
  renderQuizStep();
}

function renderQuizStep(){
  const step=App.steps[App.stepIndex];
  if(!step)return;
  DOM.tutorText.textContent=step.question;
  DOM.phaseReveal.classList.add('hidden');
  DOM.phaseQuestion.classList.remove('hidden');
  const hasAnswer=step.answer!=null;
  DOM.inputArea.classList.toggle('hidden',!hasAnswer);
  // Progress bar
  const total=App.steps.length;
  const pct=total>1?(App.stepIndex/(total-1))*100:0;
  DOM.progressBar.style.width=pct+'%';
  DOM.progressBar.style.background='var(--state-review)';
  // Progress label
  const lbl=$('quiz-progress-label');
  if(lbl) lbl.textContent=`Step ${App.stepIndex+1} of ${total}`;
  // Button states
  const revealBtn=$('btn-quiz-reveal');
  const nextBtn=$('btn-quiz-next');
  if(revealBtn) revealBtn.classList.toggle('hidden', App.phase!==PHASE.QUESTION||!step.reveal);
  if(nextBtn)   nextBtn.classList.toggle('hidden', App.phase===PHASE.QUESTION);
}

function quizRevealStep(){
  // Show the reveal/method for current step without advancing
  App.phase=PHASE.REVEAL;
  updateStateBadge();
  showRevealPhase();
  // Don't start a countdown timer in quiz mode
  DOM.revealCountdown.textContent='';
  $('btn-quiz-reveal').classList.add('hidden');
  $('btn-quiz-next').classList.remove('hidden');
}

function quizNextStep(){
  // Commit the answer to ledger/SVG and advance
  const step=App.steps[App.stepIndex];
  if(step&&step.key){
    App.revealedKeys.add(step.key);
    animateLedgerReveal(step.key);
    popSVGLedger(step.key);
    renderSVG();
    renderSVGLedger();
  }
  if(step&&step.activeEl) applyStepColors(step);
  if(App.stepIndex<App.steps.length-1){
    App.stepIndex++;
    App.phase=PHASE.QUESTION;
    updateStateBadge();
    renderQuizStep();
    renderStep();
    $('btn-quiz-reveal').classList.remove('hidden');
    $('btn-quiz-next').classList.add('hidden');
  } else {
    // Done
    showToast('Triangle solved! 🎉','success');
    $('btn-quiz-next').classList.add('hidden');
    $('btn-quiz-reveal').classList.add('hidden');
  }
}
function checkAnswer(){
  const step=App.steps[App.stepIndex];
  if(!step||step.answer==null){
    if(App.quizMode) quizRevealStep();
    else advanceStep();
    return;
  }
  const raw=parseFloat(DOM.answerInput.value);
  if(isNaN(raw)){showToast('Enter a number.','error');return;}
  const correct=Math.abs(raw-step.answer)<0.1;
  DOM.feedbackArea.textContent=correct?`✓ Correct! ${step.answer}`:`✗ Expected ≈${step.answer}`;
  DOM.feedbackArea.className=correct?'correct':'wrong';
  if(!correct){
    App.mistakes.push({triName:App.currentTri.name,step:step.question.slice(0,40),expected:step.answer,got:raw});
    saveStorage(); renderMistakes();
  }
  DOM.answerInput.value='';
  if(correct){
    setTimeout(()=>{
      DOM.feedbackArea.textContent='';
      if(App.quizMode) quizRevealStep();
      else runPhase(PHASE.REVEAL);
    },600);
  }
}

// ─── RENDER ──────────────────────────────────────────────────
function renderStep(){
  const step=App.steps[App.stepIndex];
  if(!step)return;
  DOM.tutorText.innerHTML='';
  void DOM.tutorText.offsetWidth;
  DOM.tutorText.textContent=step.question;
  DOM.phaseReveal.classList.add('hidden');
  DOM.phaseQuestion.classList.remove('hidden');
  // No SSA modal popup — SSA is handled inline in the step questions
  syncURL();
}

// Ledger (right column) — only shows known givens + revealed values
function renderLedger(){
  if(!App.currentTri)return;
  const{knowns,solved}=App.currentTri;
  const step=App.steps[App.stepIndex]||{};
  ['A','B','C','a','b','c'].forEach(k=>{
    const valEl=DOM['val'+k], rowEl=DOM['ledger'+k];
    const isKnown=knowns[k];
    const revealed=App.revealedKeys.has(k);
    const v=solved[k];
    const showVal=(isKnown||revealed)&&v!=null;
    valEl.textContent=showVal?M.fmt(v)+(k===k.toUpperCase()?'°':''):'?';
    rowEl.className='ledger-row'; valEl.className='ledger-val';
    if(isKnown){rowEl.classList.add('known');valEl.classList.add('known');}
    else if(revealed&&v!=null){rowEl.classList.add('solved');valEl.classList.add('solved');}
    if(step.key===k)rowEl.classList.add('active');
  });
  DOM.caseBadge.textContent=App.currentTri.caseType?`Case: ${App.currentTri.caseType}`:'';
  // Never show SSA alert inline — handled in steps
  DOM.ssaAlert.classList.add('hidden');
}

function animateLedgerReveal(key){
  const valEl=DOM['val'+key];
  if(!valEl)return;
  const v=App.currentTri.solved[key];
  if(v==null)return;
  // Update right-column ledger
  valEl.textContent=M.fmt(v)+(key===key.toUpperCase()?'°':'');
  valEl.className='ledger-val solved';
  DOM['ledger'+key].className='ledger-row solved';
  valEl.classList.remove('pop'); void valEl.offsetWidth; valEl.classList.add('pop');
  // Update SVG ledger bar with pop
  const slvEl=DOM['slv'+key];
  if(slvEl){
    const label=key===key.toUpperCase()?`∠${key}`:`${key}`;
    slvEl.textContent=`${label} = ${M.fmt(v)}${key===key.toUpperCase()?'°':''}`;
    slvEl.className='slr-val solved';
    slvEl.classList.remove('pop'); void slvEl.offsetWidth; slvEl.classList.add('pop');
    setTimeout(()=>slvEl.classList.remove('pop'),600);
  }
}

// SVG ledger bar (above triangle) — only show revealed values
function renderSVGLedger(){
  if(!App.currentTri)return;
  const{knowns,solved}=App.currentTri;
  const step=App.steps[App.stepIndex]||{};
  ['A','B','C','a','b','c'].forEach(k=>{
    const el=DOM['slv'+k];
    if(!el)return;
    const isKnown=knowns[k];
    const revealed=App.revealedKeys.has(k);
    const v=solved[k];
    const label=k===k.toUpperCase()?`∠${k}`:`${k}`;
    // Only show value if it's a known given OR has been revealed in UPDATE phase
    const showVal=(isKnown||revealed)&&v!=null;
    el.textContent=`${label} = ${showVal?M.fmt(v)+(k===k.toUpperCase()?'°':''):'?'}`;
    el.className='slr-val';
    if(isKnown)el.classList.add('known');
    else if(revealed&&v!=null)el.classList.add('solved');
    if(step.key===k)el.classList.add('active');
  });
}

function popSVGLedger(key){
  const el=DOM['slv'+key];
  if(!el)return;
  el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  setTimeout(()=>el.classList.remove('pop'),600);
}

// ─── SVG RENDERING ───────────────────────────────────────────
function renderSVG(){
  if(!App.currentTri)return;
  const{solved}=App.currentTri;
  const a=solved.a||5, b=solved.b||5, c=solved.c||5;
  const C=solved.C||60;

  const maxSide=Math.max(a,b,c,1);
  const scale=500/maxSide;
  const cx=400, cy=300;

  const Bx=cx+(c*scale)/2, By=cy+(a*scale)/2;
  const Cx=cx-(c*scale)/2, Cy=By;
  const Ax=Cx+b*scale*M.cos(C), Ay=Cy-b*scale*M.sin(C);
  const pts={A:[Ax,Ay],B:[Bx,By],C:[Cx,Cy]};

  $('tri-fill').setAttribute('points',`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`);
  setSVGLine('side-a',pts.B,pts.C);
  setSVGLine('side-b',pts.A,pts.C);
  setSVGLine('side-c',pts.A,pts.B);

  // Vertex labels — push outward from centroid
  const gx=(Ax+Bx+Cx)/3, gy=(Ay+By+Cy)/3;
  const vOff=32;
  placeLabel('lbl-A',Ax,Ay,gx,gy,vOff,'A');
  placeLabel('lbl-B',Bx,By,gx,gy,vOff,'B');
  placeLabel('lbl-C',Cx,Cy,gx,gy,vOff,'C');

  // Angle value labels — shown only when revealed, placed near arc
  const arcOff=52;
  placeAngleLabel('lbl-angA',Ax,Ay,gx,gy,arcOff,solved.A,'A');
  placeAngleLabel('lbl-angB',Bx,By,gx,gy,arcOff,solved.B,'B');
  placeAngleLabel('lbl-angC',Cx,Cy,gx,gy,arcOff,solved.C,'C');

  // Side labels — perpendicular offset away from centroid
  // Only show label text if the value has been revealed (not just known)
  const aRev=App.revealedKeys.has('a');
  const bRev=App.revealedKeys.has('b');
  const cRev=App.revealedKeys.has('c');
  setSideLabel('lbl-a',pts.B,pts.C,gx,gy, aRev?`a = ${M.fmt(solved.a)}`:'a = ?');
  setSideLabel('lbl-b',pts.A,pts.C,gx,gy, bRev?`b = ${M.fmt(solved.b)}`:'b = ?');
  setSideLabel('lbl-c',pts.A,pts.B,gx,gy, cRev?`c = ${M.fmt(solved.c)}`:'c = ?');

  // Color side labels
  ['a','b','c'].forEach(k=>{
    const el=$('lbl-'+k);
    const isKnown=App.currentTri.knowns[k];
    const revealed=App.revealedKeys.has(k);
    el.className.baseVal='tri-label side-label'+(isKnown?' known':(revealed?' solved':''));
    el.style.opacity='1';
  });

  // Angle arcs
  drawArc('arc-A',pts.A,pts.B,pts.C,30);
  drawArc('arc-B',pts.B,pts.A,pts.C,30);
  drawArc('arc-C',pts.C,pts.A,pts.B,30);

  // Right angle marker
  const ram=$('right-angle-marker');
  if(Math.abs((solved.C||0)-90)<0.5){
    ram.classList.remove('hidden');
    const sz=16;
    // Two lines forming a square corner at C
    const dx=(Bx-Cx)/Math.hypot(Bx-Cx,By-Cy), dy=(By-Cy)/Math.hypot(Bx-Cx,By-Cy);
    const ex=(Ax-Cx)/Math.hypot(Ax-Cx,Ay-Cy), ey=(Ay-Cy)/Math.hypot(Ax-Cx,Ay-Cy);
    const px=Cx+dx*sz, py=Cy+dy*sz;
    const qx=Cx+ex*sz, qy=Cy+ey*sz;
    $('ram-h').setAttribute('x1',Cx); $('ram-h').setAttribute('y1',Cy); $('ram-h').setAttribute('x2',px); $('ram-h').setAttribute('y2',py); $('ram-h').setAttribute('stroke','var(--text-muted)');
    $('ram-v').setAttribute('x1',Cx); $('ram-v').setAttribute('y1',Cy); $('ram-v').setAttribute('x2',qx); $('ram-v').setAttribute('y2',qy); $('ram-v').setAttribute('stroke','var(--text-muted)');
    // Corner dot
    const mx=px+qx-Cx, my=py+qy-Cy;
    // draw corner line
    const corner=$('right-angle-marker').querySelector('line:last-child')||null;
  } else {
    ram.classList.add('hidden');
  }

  applyStepColors(App.steps[App.stepIndex]||{});
}

function placeLabel(id,vx,vy,gx,gy,off,text){
  const dx=vx-gx, dy=vy-gy, len=Math.hypot(dx,dy)||1;
  const el=$(id);
  el.setAttribute('x',vx+dx/len*off);
  el.setAttribute('y',vy+dy/len*off+6);
  el.textContent=text;
}

function placeAngleLabel(id,vx,vy,gx,gy,off,val,key){
  const dx=vx-gx, dy=vy-gy, len=Math.hypot(dx,dy)||1;
  const el=$(id);
  el.setAttribute('x',vx+dx/len*off);
  el.setAttribute('y',vy+dy/len*off+5);
  const revealed=App.revealedKeys.has(key);  // Only revealed, not known
  // Only show numeric value when revealed; always show arc
  el.textContent=revealed&&val!=null?`${M.fmt(val)}°`:'';
  el.className.baseVal='tri-label angle-val-label'+(revealed?' visible':'');
}

function setSideLabel(id,p1,p2,gx,gy,text){
  const mx=(p1[0]+p2[0])/2, my=(p1[1]+p2[1])/2;
  const dx=p2[0]-p1[0], dy=p2[1]-p1[1], len=Math.hypot(dx,dy)||1;
  let nx=-dy/len, ny=dx/len;
  if((mx+nx*20-gx)*nx+(my+ny*20-gy)*ny<0){nx=-nx;ny=-ny;}
  const off=24;
  setTextPos(id,mx+nx*off,my+ny*off+5,text);
}

function setSVGLine(id,p1,p2){
  const el=$(id);
  el.setAttribute('x1',p1[0]);el.setAttribute('y1',p1[1]);
  el.setAttribute('x2',p2[0]);el.setAttribute('y2',p2[1]);
}
function setTextPos(id,x,y,text){
  const el=$(id);
  el.setAttribute('x',x);el.setAttribute('y',y);el.textContent=text;
}

function drawArc(id,vertex,p1,p2,r){
  const el=$(id);
  const d1x=p1[0]-vertex[0],d1y=p1[1]-vertex[1];
  const d2x=p2[0]-vertex[0],d2y=p2[1]-vertex[1];
  const l1=Math.hypot(d1x,d1y),l2=Math.hypot(d2x,d2y);
  if(l1<0.01||l2<0.01)return;
  const sx=vertex[0]+(d1x/l1)*r,sy=vertex[1]+(d1y/l1)*r;
  const ex=vertex[0]+(d2x/l2)*r,ey=vertex[1]+(d2y/l2)*r;
  const sweep=(d1x*d2y-d1y*d2x)>0?0:1;
  el.setAttribute('d',`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`);
}

function applyStepColors(step){
  ['side-a','side-b','side-c'].forEach(id=>{const el=$(id);el.className.baseVal='tri-side';el.style.filter='';});
  ['arc-A','arc-B','arc-C'].forEach(id=>{$(id).className.baseVal='tri-arc';});
  if(!step.activeEl)return;
  const el=$(step.activeEl);
  if(!el)return;
  if(step.activeEl.startsWith('side')){
    const f=(step.reveal||'').toLowerCase();
    const cls=f.includes('sin')?'sin-active':f.includes('cos')?'cos-active':f.includes('tan')?'tan-active':'hyp-active';
    el.className.baseVal='tri-side '+cls;
    if(step.isFinal)el.classList.add('pulse');
  } else if(step.activeEl.startsWith('arc')){
    el.className.baseVal='tri-arc active';
  }
}

// ─── VAULT & MISTAKES ────────────────────────────────────────
function renderVault(){
  const active=Object.entries(App.filters).filter(([,v])=>v).map(([k])=>k);
  const visible=TRIANGLE_LIBRARY.filter(t=>active.includes(t.tag));
  DOM.vaultList.innerHTML='';
  if(!visible.length){DOM.vaultList.innerHTML='<p class="empty-msg">No identities match filters.</p>';return;}
  visible.forEach(item=>{
    const div=document.createElement('div');
    div.className='vault-item'+(App.quizVaultItem===item?' quiz-active':'');
    div.innerHTML=`<span class="vault-name">${item.name}</span><span class="vault-tag">${item.case}</span>`;
    div.addEventListener('click',()=>startQuizMode(item));
    DOM.vaultList.appendChild(div);
  });
}
function renderMistakes(){
  DOM.mistakeList.innerHTML='';
  if(!App.mistakes.length){DOM.mistakeList.innerHTML='<p class="empty-msg">No mistakes yet.</p>';return;}
  App.mistakes.slice(-10).reverse().forEach(m=>{
    const div=document.createElement('div');
    div.className='mistake-item';
    div.textContent=`${m.triName}: expected ${m.expected}, got ${m.got}`;
    DOM.mistakeList.appendChild(div);
  });
}
function populatePresets(){
  DOM.presetSelect.innerHTML='<option value="">None (Generate)</option>';
  TRIANGLE_LIBRARY.forEach((t,i)=>{
    const opt=document.createElement('option');
    opt.value=i;opt.textContent=`${t.name} (${t.case})`;
    DOM.presetSelect.appendChild(opt);
  });
}

// ─── SSA MODAL ───────────────────────────────────────────────
function showSSAModal(solutions,known){
  const{a,b,A}=known;
  const h=M.round(b*M.sin(A),3);
  DOM.ssaModalBody.textContent=`Given: a=${M.fmt(a)}, b=${M.fmt(b)}, A=${M.fmt(A)}°. Altitude h = b·sin(A) = ${h}. `+
    (solutions.length===0?'Since a < h, no triangle exists.':solutions.length===1?'Exactly one triangle is possible.':'Two triangles are possible (ambiguous case).');
  DOM.ssaModalChoices.innerHTML='';
  if(solutions.length===0){
    const btn=document.createElement('button');btn.className='ssa-choice-btn';
    btn.textContent='✕ No solution — return to screensaver';
    btn.onclick=()=>{closeSSAModal();startScreensaver();};
    DOM.ssaModalChoices.appendChild(btn);
  } else {
    solutions.forEach(sol=>{
      const btn=document.createElement('button');btn.className='ssa-choice-btn';
      btn.textContent=`Solve ${sol.label}`+(sol.B?` (B≈${sol.B}°, C≈${sol.C}°)`:'');
      btn.onclick=()=>{
        closeSSAModal();
        if(solutions.length>1){
          const ratio=a/M.sin(A),cSide=M.round(ratio*M.sin(sol.C));
          App.currentTri.solved={a,b,A,B:sol.B,C:sol.C,c:cSide};
          App.currentTri.caseType='SSA_SOLVED';
          App.currentTri.steps=[
            {question:`You chose ${sol.label}: B=${sol.B}°, C=${sol.C}°. Now find side c using the Law of Sines. What's the ratio?`,reveal:`${sp('c/sin(C) = a/sin(A)','formula')} → c = ${sp(M.fmt(cSide),'answer')}`,activeEl:'side-c',answer:cSide,key:'c'},
            {question:`✓ Triangle solved! a=${a}, b=${b}, c=${cSide}, A=${A}°, B=${sol.B}°, C=${sol.C}°`,reveal:'',activeEl:null,answer:null,key:null,isFinal:true},
          ];
          App.steps=App.currentTri.steps;App.stepIndex=0;
          renderSVG();renderLedger();renderSVGLedger();renderStep();
          runPhase(PHASE.QUESTION);
        }
      };
      DOM.ssaModalChoices.appendChild(btn);
    });
  }
  DOM.ssaModal.classList.remove('hidden');
}
function closeSSAModal(){DOM.ssaModal.classList.add('hidden');}

// ─── TOAST ───────────────────────────────────────────────────
let _tt=null;
function showToast(msg,type=''){
  DOM.toast.textContent=msg;DOM.toast.className=type;DOM.toast.classList.remove('hidden');
  if(_tt)clearTimeout(_tt);
  _tt=setTimeout(()=>DOM.toast.classList.add('hidden'),2500);
}
function saveProblem(){
  if(!App.currentTri){showToast('Nothing to save.','error');return;}
  App.savedProblems.push({name:App.currentTri.name||App.currentTri.caseType,solved:App.currentTri.solved,caseType:App.currentTri.caseType,savedAt:new Date().toISOString()});
  saveStorage();showToast(`Saved: ${App.currentTri.name||App.currentTri.caseType}`,'success');
}

// ─── TOP BAR & PANEL TOGGLES ─────────────────────────────────
function initTopBarToggles(){
  document.querySelectorAll('.tb-btn[data-panel]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const panel=$(btn.dataset.panel);if(!panel)return;
      const collapsed=panel.classList.contains('collapsed');
      panel.classList.toggle('collapsed',!collapsed);
      btn.classList.toggle('active',collapsed);
    });
  });
  $('btn-cheatsheet').addEventListener('click',()=>{
    const hidden=DOM.cheatsheet.classList.contains('hidden');
    DOM.cheatsheet.classList.toggle('hidden',!hidden);
    $('btn-cheatsheet').classList.toggle('active',hidden);
  });
}
function initPanelHeaders(){
  document.querySelectorAll('.panel-header[data-toggle]').forEach(hdr=>{
    hdr.addEventListener('click',()=>{hdr.closest('.side-panel')?.classList.toggle('collapsed');});
  });
}

// ─── CALCULATOR ──────────────────────────────────────────────
function initCalculator(){
  let expr='',result='0';
  const exprEl=$('calc-expr'),resultEl=$('calc-result');
  const isDeg=()=>document.querySelector('input[name="calc-mode"]:checked').value==='deg';
  const upd=()=>{exprEl.textContent=expr;resultEl.textContent=result;};
  const evaluate=()=>{
    try{
      let e=expr.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-').replace(/π/g,'Math.PI')
        .replace(/sin\(/g,isDeg()?`(v=>Math.sin(v*${DEG}))(`:'Math.sin(')
        .replace(/cos\(/g,isDeg()?`(v=>Math.cos(v*${DEG}))(`:'Math.cos(')
        .replace(/tan\(/g,isDeg()?`(v=>Math.tan(v*${DEG}))(`:'Math.tan(')
        .replace(/asin\(/g,isDeg()?`(v=>Math.asin(v)*${RAD})(`:'Math.asin(')
        .replace(/acos\(/g,isDeg()?`(v=>Math.acos(v)*${RAD})(`:'Math.acos(')
        .replace(/atan\(/g,isDeg()?`(v=>Math.atan(v)*${RAD})(`:'Math.atan(')
        .replace(/√\(/g,'Math.sqrt(').replace(/²/g,'**2');
      // eslint-disable-next-line no-new-func
      const val=Function('"use strict";return('+e+')')();
      result=isFinite(val)?String(Math.round(val*1e8)/1e8):'Error';
    }catch{result='Error';}
    upd();
  };
  document.querySelectorAll('.calc-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const fn=btn.dataset.fn,val=btn.dataset.val;
      if(btn.id==='calc-clear'){expr='';result='0';upd();return;}
      if(btn.id==='calc-back'){expr=expr.slice(0,-1);upd();return;}
      if(btn.id==='calc-equals'){evaluate();return;}
      if(fn){expr+=fn==='sq'?'²':fn==='sqrt'?'√(':fn+'(';}
      else if(val){expr+=val==='()'?'(':val;}
      upd();
    });
  });
}

// ─── SCRATCHPAD ──────────────────────────────────────────────
function initScratchpad(){
  DOM.scratchpad.addEventListener('input',()=>localStorage.setItem('ts_scratch',DOM.scratchpad.value));
  $('btn-clear-scratch').addEventListener('click',()=>{DOM.scratchpad.value='';localStorage.removeItem('ts_scratch');showToast('Scratchpad cleared.');});
}

// ─── DRAGGABLE CHEATSHEET ────────────────────────────────────
function initCheatsheet(){
  const panel=DOM.cheatsheet,titlebar=$('cheatsheet-titlebar');
  let dragging=false,ox=0,oy=0;
  titlebar.addEventListener('mousedown',e=>{
    if(panel.classList.contains('docked-left')||panel.classList.contains('docked-right'))return;
    dragging=true;const r=panel.getBoundingClientRect();ox=e.clientX-r.left;oy=e.clientY-r.top;
    panel.style.transition='none';e.preventDefault();
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    let x=Math.max(0,Math.min(window.innerWidth-panel.offsetWidth,e.clientX-ox));
    let y=Math.max(0,Math.min(window.innerHeight-panel.offsetHeight,e.clientY-oy));
    panel.style.left=x+'px';panel.style.top=y+'px';panel.style.right='auto';
  });
  document.addEventListener('mouseup',()=>{dragging=false;panel.style.transition='';});
  document.querySelectorAll('.dock-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      panel.classList.remove('docked-left','docked-right');
      panel.style.left='';panel.style.top='';panel.style.right='';
      if(btn.dataset.dock==='left')panel.classList.add('docked-left');
      if(btn.dataset.dock==='right')panel.classList.add('docked-right');
    });
  });
  $('cheatsheet-close').addEventListener('click',()=>{
    panel.classList.add('hidden');panel.classList.remove('docked-left','docked-right');
    panel.style.left='';panel.style.top='';panel.style.right='';
    $('btn-cheatsheet').classList.remove('active');
  });
}

// ─── EVENTS ──────────────────────────────────────────────────
function bindEvents(){
  DOM.btnGenerate.addEventListener('click',()=>{
    stopScreensaver();
    const cv=DOM.caseSelect.value,pv=DOM.presetSelect.value;
    if(pv!=='')generateFromPreset(TRIANGLE_LIBRARY[parseInt(pv)]);
    else generateByCase(cv);
    runPhase(PHASE.QUESTION);
  });
  DOM.btnScreensaver.addEventListener('click',()=>startScreensaver());
  DOM.speedSlider.addEventListener('input',()=>{App.speed=parseFloat(DOM.speedSlider.value);DOM.speedLabel.textContent=App.speed+'×';});
  DOM.questionDurationSlider.addEventListener('input',()=>{App.questionDur=parseInt(DOM.questionDurationSlider.value);DOM.questionDurationLabel.textContent=App.questionDur+'s';});
  DOM.revealDurationSlider.addEventListener('input',()=>{App.revealDur=parseInt(DOM.revealDurationSlider.value);DOM.revealDurationLabel.textContent=App.revealDur+'s';});
  DOM.updateDurationSlider.addEventListener('input',()=>{App.updateDur=parseInt(DOM.updateDurationSlider.value);DOM.updateDurationLabel.textContent=App.updateDur+'s';});
  DOM.btnSubmit.addEventListener('click',checkAnswer);
  DOM.answerInput.addEventListener('keydown',e=>{if(e.key==='Enter')checkAnswer();});
  $('btn-hint').addEventListener('click',()=>{const step=App.steps[App.stepIndex];DOM.hintText.textContent=step?.reveal?.replace(/<[^>]+>/g,'')||'No hint available.';});
  DOM.btnPrev.addEventListener('click',()=>{if(App.stepIndex>0){App.stepIndex--;clearAllTimers();renderStep();renderSVG();renderSVGLedger();if(App.quizMode)renderQuizStep();else runPhase(PHASE.QUESTION);}});
  DOM.btnNext.addEventListener('click',()=>{
    if(App.quizMode){
      if(App.phase===PHASE.QUESTION) quizRevealStep();
      else quizNextStep();
    } else {
      if(App.phase===PHASE.QUESTION){runPhase(PHASE.REVEAL);}
      else if(App.phase===PHASE.REVEAL){runPhase(PHASE.UPDATE);}
      else{advanceStep();}
    }
  });

  // Quiz panel
  $('btn-start-quiz').addEventListener('click',()=>{
    const ct=$('quiz-case-select').value;
    const selectedCases=[...DOM.quizCaseFilters].filter(cb=>cb.checked).map(cb=>cb.value);
    const active=selectedCases.length?selectedCases:[...new Set(TRIANGLE_LIBRARY.map(t=>t.case))];

    let pool;
    if(ct==='random'){
      pool=TRIANGLE_LIBRARY.filter(t=>active.includes(t.case));
    } else {
      if(!active.includes(ct)){
        showToast(`Case ${ct} not included in selected cases.`, 'error');
        return;
      }
      pool=TRIANGLE_LIBRARY.filter(t=>t.case===ct);
    }
    if(!pool.length){showToast('No triangle found for that case/case set.','error');return;}
    const preset=pool[Math.floor(Math.random()*pool.length)];
    startQuizMode(preset);
    $('quiz-controls').classList.remove('hidden');
    $('btn-quiz-reveal').classList.remove('hidden');
    $('btn-quiz-next').classList.add('hidden');
  });

  $('btn-quiz-mode').addEventListener('click',()=>{
    if(App.quizMode){ $('btn-quiz-exit').click(); } else { $('btn-start-quiz').click(); }
  });
  $('btn-quiz-reveal').addEventListener('click',()=>quizRevealStep());
  $('btn-quiz-next').addEventListener('click',()=>quizNextStep());
  $('btn-quiz-skip').addEventListener('click',()=>{
    // Skip: reveal answer and advance
    const step=App.steps[App.stepIndex];
    if(step&&step.key) App.revealedKeys.add(step.key);
    quizNextStep();
  });
  $('btn-quiz-exit').addEventListener('click',()=>{
    App.quizMode=false; App.quizVaultItem=null;
    DOM.inputArea.classList.add('hidden'); DOM.hintArea.classList.add('hidden');
    $('quiz-controls').classList.add('hidden');
    renderVault();
    startScreensaver();
    showToast('Quiz exited.');
  });
  DOM.btnPause.addEventListener('click',togglePause);
  DOM.btnSave.addEventListener('click',saveProblem);
  DOM.btnShare.addEventListener('click',()=>{syncURL();navigator.clipboard?.writeText(location.href).then(()=>showToast('URL copied!','success')).catch(()=>showToast(location.href));});
  DOM.btnClearMistakes.addEventListener('click',()=>{App.mistakes=[];saveStorage();renderMistakes();showToast('Mistakes cleared.');});
  DOM.vaultFilters.forEach(cb=>{
    cb.checked=App.filters[cb.value]!==false;
    cb.addEventListener('change',()=>{App.filters[cb.value]=cb.checked;saveStorage();renderVault();});
  });
  DOM.ssaModalClose.addEventListener('click',closeSSAModal);
  DOM.ssaModal.addEventListener('click',e=>{if(e.target===DOM.ssaModal)closeSSAModal();});
  document.addEventListener('keydown',handleKeyboard);
}

function togglePause(){
  App.paused=!App.paused;
  DOM.btnPause.textContent=App.paused?'▶':'⏸';
  DOM.btnPause.title=App.paused?'Resume (Space)':'Pause (Space)';
  if(App.paused){
    clearAllTimers();
  } else {
    // Resume: restart the current phase (timers reset, spoilers stay as-is)
    runPhase(App.phase);
  }
}

function handleKeyboard(e){
  if(e.target===DOM.answerInput||e.target===DOM.scratchpad)return;
  switch(e.code){
    case 'Space':      e.preventDefault();togglePause();break;
    case 'Enter':      e.preventDefault();saveProblem();break;
    case 'ArrowRight': e.preventDefault();DOM.btnNext.click();break;
    case 'ArrowLeft':  e.preventDefault();DOM.btnPrev.click();break;
    case 'Escape':
      e.preventDefault();
      if(!DOM.ssaModal.classList.contains('hidden')){closeSSAModal();break;}
      if(!DOM.cheatsheet.classList.contains('hidden')){DOM.cheatsheet.classList.add('hidden');DOM.cheatsheet.classList.remove('docked-left','docked-right');$('btn-cheatsheet').classList.remove('active');break;}
      if(App.quizMode){App.quizMode=false;App.quizVaultItem=null;renderVault();showToast('Quiz closed.');}
      break;
  }
}

// ─── INIT ────────────────────────────────────────────────────
function init(){
  loadStorage();
  populatePresets();
  bindEvents();
  initTopBarToggles();
  initPanelHeaders();
  initCalculator();
  initScratchpad();
  initCheatsheet();
  DOM.vaultFilters.forEach(cb=>{cb.checked=App.filters[cb.value]!==false;});
  // Set initial duration labels
  DOM.questionDurationLabel.textContent = App.questionDur + 's';
  DOM.revealDurationLabel.textContent = App.revealDur + 's';
  DOM.updateDurationLabel.textContent = App.updateDur + 's';
  const params=new URLSearchParams(location.search);
  if(params.get('type')){loadFromURL();runPhase(PHASE.QUESTION);}
  else{startScreensaver();}
}

document.addEventListener('DOMContentLoaded',init);
