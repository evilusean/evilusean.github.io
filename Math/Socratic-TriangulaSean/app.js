/* ============================================================
   Socratic TriangulaSean — app.js  v6.1
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
  // HL: legs + right angle only — hypotenuse and acute angles are discovered in steps
  { name:'3-4-5',             tag:'pythagorean', case:'HL',  sides:[3,4,null],         angles:[null,null,90] },
  { name:'5-12-13',           tag:'pythagorean', case:'HL',  sides:[5,12,null],        angles:[null,null,90] },
  { name:'8-15-17',           tag:'pythagorean', case:'HL',  sides:[8,15,null],        angles:[null,null,90] },
  { name:'7-24-25',           tag:'pythagorean', case:'HL',  sides:[7,24,null],        angles:[null,null,90] },
  { name:'9-40-41',           tag:'pythagorean', case:'HL',  sides:[9,40,null],        angles:[null,null,90] },
  { name:'6-8-10',            tag:'pythagorean', case:'HL',  sides:[6,8,null],         angles:[null,null,90] },
  { name:'30-60-90',          tag:'special',     case:'AAS', sides:[1,null,null],      angles:[30,null,90],   aasKnown:{a:1,A:30,C:90} },
  { name:'45-45-90',          tag:'special',     case:'ASA', sides:[null,1,null],      angles:[45,null,90] },
  { name:'Equilateral',       tag:'special',     case:'SSS', sides:[5,5,5],            angles:[null,null,null] },
  { name:'Isosceles 5-5-6',   tag:'special',     case:'SSS', sides:[5,5,6],            angles:[null,null,null] },
  { name:'Isosceles 36',      tag:'special',     case:'SAS', sides:[4,4,null],         angles:[null,null,36], sasKnown:{a:4,b:4,C:36} },
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

/** Full B, C, c for the first SSA solution (for accurate SVG + step answers). */
function computeSSATriangle(a,b,A,sol){
  if(!sol)return null;
  if(sol.B!=null&&sol.C!=null){
    const c=a*M.sin(sol.C)/M.sin(A);
    return{B:sol.B,C:sol.C,c:M.round(c)};
  }
  if(sol.label==='Right Triangle'){
    const B=90,C=M.round(90-A);
    const c=a*M.sin(C)/M.sin(A);
    return{B,C,c:M.round(c)};
  }
  const B=M.asin(Math.min(1,b*M.sin(A)/a));
  const C=M.round(180-A-B);
  const c=a*M.sin(C)/M.sin(A);
  return{B:M.round(B),C,c:M.round(c)};
}

function buildSSASteps(tri){
  const steps=[];
  const{a,b,A}=tri.ssaKnown;
  const h=M.round(b*M.sin(A),4);
  const sols=tri.ssaSolutions||analyzeSSA(a,b,A);
  const push=(question,reveal,activeEl,answer,key)=>
    steps.push({question,reveal,activeEl,answer:answer!=null?M.round(answer,2):null,key});

  steps.push({
    question:`You have a=${M.fmt(a)}, b=${M.fmt(b)}, A=${M.fmt(A)}° (SSA). Why can this be ambiguous?`,
    reveal:`Side a swings; the perpendicular from B to the line along side c has length ${sp('h = b·sin(A)','formula','ssa')} (altitude to that base — not a labeled side of the triangle). Here h ≈ ${sp(M.fmt(h),'answer')}.`,
    activeEl:null,answer:null,key:null
  });
  steps.push({
    question:`Compare a (${M.fmt(a)}) to h (${M.fmt(h)}) and to b (${M.fmt(b)}). How many triangles?`,
    reveal:`Rules (${sp('SSA','formula','ssa')}): a < h → 0 | a = h → 1 (right) | h < a < b → 2 | a ≥ b → 1`,
    activeEl:null,answer:null,key:null,isSSADecision:true
  });

  if(sols.length===0){
    steps.push({question:`✓ No triangle exists (a < h).`,reveal:'',activeEl:null,answer:null,key:null,isFinal:true});
    return steps;
  }

  const primary=computeSSATriangle(a,b,A,sols[0]);
  if(!primary)return steps;

  if(sols.length===2){
    steps.push({
      question:`Two triangles fit the data (acute B vs obtuse B). We walk through the first: B≈${M.fmt(sols[0].B)}°, C≈${M.fmt(sols[0].C)}°. (Alternate: B≈${M.fmt(sols[1].B)}°.)`,
      reveal:`Same SSA givens can yield two non-congruent triangles — always check both when h < a < b.`,
      activeEl:null,answer:null,key:null
    });
  }

  const{B,C,c}=primary;
  if(Math.abs(B-90)<0.5){
    push(
      `When a = h, the triangle is right at B. What is angle B?`,
      `${sp('B = 90°','answer')} — boundary case where the altitude equals side a (see SSA cheatsheet).`,
      'arc-B',90,'B'
    );
  }else{
    push(
      `Using the Law of Sines, what is angle B?`,
      `${sp('sin(B)/b = sin(A)/a','formula','law-of-sines')} → B = ${sp('sin⁻¹(b·sin(A)/a)','formula')} ≈ ${sp(M.fmt(B)+'°','answer')}`,
      'arc-B',B,'B'
    );
  }
  push(
    `What is angle C?`,
    `${sp('C = 180° − A − B','formula','angle-sum')} = ${sp(M.fmt(C)+'°','answer')}`,
    'arc-C',C,'C'
  );
  push(
    `What is side c?`,
    `${sp('Law of Sines','formula','law-of-sines')}: ${sp('c = a·sin(C)/sin(A)','formula','law-of-sines')} = ${sp(M.fmt(c),'answer')}`,
    'side-c',c,'c'
  );
  steps.push({question:`✓ Triangle solved: a=${M.fmt(a)}, b=${M.fmt(b)}, c=${M.fmt(c)}, A=${M.fmt(A)}°, B=${M.fmt(B)}°, C=${M.fmt(C)}°`,reveal:'',activeEl:null,answer:null,key:null,isFinal:true});
  return steps;
}

/** Questions must be plain text only (reveal may contain HTML/spoilers). */
function plainQuestionText(q){
  if(q==null)return'';
  return String(q).replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
}

/** Format a value only if it is a given (not computed) — keeps questions from leaking answers. */
function fmtGiven(tri, key){
  if(!tri?.knowns?.[key]||tri.solved[key]==null)return'?';
  const v=M.fmt(tri.solved[key]);
  return key===key.toUpperCase()?`${v}°`:v;
}

function isLabelVisible(key){
  if(!App.currentTri)return false;
  return App.currentTri.knowns[key]||App.revealedKeys.has(key);
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
    const hlGivens=tri.knowns.c
      ?`hypotenuse c = ${fmtGiven(tri,'c')}`
      :`legs a = ${fmtGiven(tri,'a')} and b = ${fmtGiven(tri,'b')}`;
    steps.push({
      question: `You have a right triangle (${hlGivens}). ∠C = 90°. What relationship connects all three sides?`,
      reveal: `Right triangles use the ${sp('Pythagorean Theorem','formula','pythagorean')}: ${sp('a² + b² = c²','formula','pythagorean')}. The hypotenuse is always opposite the right angle.`,
      activeEl: null, answer: null, key: null
    });
    if (!tri.knowns.c) push(
      `Using the Pythagorean Theorem, what is the hypotenuse c?`,
      `${sp(`c² = ${fmtGiven(tri,'a')}² + ${fmtGiven(tri,'b')}²`,'formula','pythagorean')} → c = ${sp(M.fmt(solved.c),'answer')}`,
      'side-c', solved.c, 'c'
    );
    if (!tri.knowns.a) push(
      `You know ∠B and hypotenuse c. Side a is opposite ∠B. Which trig ratio uses opposite and hypotenuse?`,
      `${sp('sin','formula','sohcahtoa')} uses Opposite/Hypotenuse. So: ${sp(`sin(B°) = a / c`,'formula','sohcahtoa')} → a = ${sp(M.fmt(solved.a),'answer')}`,
      'side-a', solved.a, 'a'
    );
    if (!tri.knowns.b) push(
      `Side b is adjacent to angle B. Which trig ratio uses adjacent and hypotenuse?`,
      `${sp('cos','formula','sohcahtoa')} uses Adjacent/Hypotenuse. So: ${sp(`cos(B°) = b / c`,'formula','sohcahtoa')} → b = ${sp(M.fmt(solved.b),'answer')}`,
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
      question: `You have two sides (a = ${fmtGiven(tri,'a')}, b = ${fmtGiven(tri,'b')}) and the angle between them (C = ${fmtGiven(tri,'C')}). Can you use SOHCAHTOA here? Why or why not?`,
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
      `${sp('Angle Sum Theorem','formula','angle-sum')}: ${sp('B = 180° − A − C','formula','angle-sum')} = ${sp(`180° − ${M.fmt(solved.A)}° − ${M.fmt(solved.C)}°`,'formula','angle-sum')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    steps.push({question:`✓ Triangle solved! a=${M.fmt(solved.a)}, b=${M.fmt(solved.b)}, c=${M.fmt(solved.c)}, A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'SSS') {
    steps.push({
      question: `You have all three sides: a=${fmtGiven(tri,'a')}, b=${fmtGiven(tri,'b')}, c=${fmtGiven(tri,'c')}. No angles yet. Which law lets you find an angle when you only have sides?`,
      reveal: `The ${sp('Law of Cosines','formula','law-of-cosines')} rearranges to: ${sp('cos(C) = (a²+b²−c²) / (2ab)','formula','law-of-cosines')}. Start with the largest angle to avoid ambiguity.`,
      activeEl: null, answer: null, key: null
    });
    push(
      `Find angle C using the Law of Cosines.`,
      `${sp(`cos(C) = (${M.fmt(solved.a)}²+${M.fmt(solved.b)}²−${M.fmt(solved.c)}²) / (2·${M.fmt(solved.a)}·${M.fmt(solved.b)})`,'formula')} → C = ${sp(M.fmt(solved.C)+'°','answer')}`,
      'arc-C', solved.C, 'C'
    );
    push(
      `Now you have C and all three sides. What's the most efficient way to find A?`,
      `Switch to ${sp('Law of Sines','formula','law-of-sines')}: ${sp('sin(A)/a = sin(C)/c','formula','law-of-sines')} → A = ${sp(M.fmt(solved.A)+'°','answer')}`,
      'arc-A', solved.A, 'A'
    );
    push(
      `You have A and C. How do you find B without any more trig?`,
      `${sp('Angle Sum','formula','angle-sum')}: ${sp('B = 180° − A − C','formula','angle-sum')} = ${sp(M.fmt(solved.B)+'°','answer')}`,
      'arc-B', solved.B, 'B'
    );
    steps.push({question:`✓ Triangle solved! A=${M.fmt(solved.A)}°, B=${M.fmt(solved.B)}°, C=${M.fmt(solved.C)}°`, reveal:'', activeEl:null, answer:null, key:null, isFinal:true});

  } else if (caseType === 'ASA' || caseType === 'AAS') {
    steps.push({
      question: `You have two angles and a side. Before using any trig, what can you figure out immediately from the angles alone?`,
      reveal: `The ${sp('Angle Sum Theorem','formula','angle-sum')}: ${sp('A + B + C = 180°','formula','angle-sum')}. Always find the third angle first — it unlocks the Law of Sines for all sides.`,
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
      `You know side ${ks} = ${fmtGiven(tri,ks)} and all three angles. Which law connects sides to angles?`,
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
    return buildSSASteps(tri);
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
  /** Presets available for “next problem” in quiz (from last Start Quiz). */
  quizPool: [],
  mistakes: [],
  savedProblems: [],
  filters: {pythagorean:true, special:true, ssa:true, oblique:true},
  // Track which values have been revealed on SVG/ledger so far
  revealedKeys: new Set(),
  questionDur: 12,
  revealDur: 8,
  updateDur: 15,
  _quizLedgerStepSnapshot: -1,
  _ledgerFreshStep: false,
};

const $ = id => document.getElementById(id);
const DOM = {
  stateBadge:    $('state-badge'),
  phaseQuestion: $('phase-question'),
  phaseReveal:   $('phase-reveal'),
  tutorText:     $('tutor-text'),
  revealText:    $('reveal-text'),
  revealCountdown: $('reveal-countdown'),
  btnCheckAnswer:$('btn-check-answer'),
  ledgerFeedbackWrap: $('ledger-feedback-wrap'),
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
  const type=p.get('type'),filter=p.get('filter');
  if(filter){const a=filter.split(',');Object.keys(App.filters).forEach(k=>App.filters[k]=a.includes(k));}
  // Always start at step 0 — do not restore step from URL (avoids spoilers in shared links)
  if(type){const preset=TRIANGLE_LIBRARY.find(t=>t.case===type);if(preset){generateFromPreset(preset);}}
}

// ─── GENERATION ──────────────────────────────────────────────
/** @param {object} opts keepQuiz — do not exit quiz mode (used by quiz + next problem). */
function generateFromPreset(preset, opts={}) {
  clearAllTimers();
  if(opts.keepQuiz){
    App.quizMode=true;
  }else{
    App.quizMode=false;
    App.quizVaultItem=null;
    if(DOM.ledgerFeedbackWrap)DOM.ledgerFeedbackWrap.classList.add('hidden');
  }
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

  finalizeTriangleGeneration();
}

function finalizeTriangleGeneration(){
  App._quizLedgerStepSnapshot=-1;
  if(App.quizMode)App._ledgerFreshStep=true;
  Object.keys(App.currentTri.knowns).forEach(k=>App.revealedKeys.add(k));

  App.currentTri.steps=buildSteps(App.currentTri);
  if(App.currentTri.caseType==='SSA'&&App.currentTri.ssaSolutions?.length){
    const p=computeSSATriangle(App.currentTri.ssaKnown.a,App.currentTri.ssaKnown.b,App.currentTri.ssaKnown.A,App.currentTri.ssaSolutions[0]);
    if(p)Object.assign(App.currentTri.solved,p);
  }
  App.stepIndex=0;
  App.steps=App.currentTri.steps;
  App.phase=PHASE.QUESTION;

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

function buildQuizPoolFromUI(){
  const ct=$('quiz-case-select').value;
  const selectedCases=[...DOM.quizCaseFilters].filter(cb=>cb.checked).map(cb=>cb.value);
  const active=selectedCases.length?selectedCases:[...new Set(TRIANGLE_LIBRARY.map(t=>t.case))];
  if(ct==='random')return TRIANGLE_LIBRARY.filter(t=>active.includes(t.case));
  if(!active.includes(ct))return [];
  return TRIANGLE_LIBRARY.filter(t=>t.case===ct);
}

function readQc(id){
  const el=$(id);
  if(!el)return null;
  const v=parseFloat(el.value);
  return isNaN(v)?null:v;
}

/** Build triangle from quiz panel custom form; stays in quiz mode. */
function loadCustomQuizTriangle(){
  const ct=$('quiz-custom-case').value;
  if(!ct){showToast('Select a case for custom load.','error');return;}
  stopScreensaver();
  App.quizMode=true;
  if(!App.quizPool.length)App.quizPool=buildQuizPoolFromUI();

  let tri;
  try{
    if(ct==='SSS'){
      const a=readQc('qc-a'),b=readQc('qc-b'),c=readQc('qc-c');
      if(a==null||b==null||c==null){showToast('SSS needs sides a, b, and c.','error');return;}
      if(a+b<=c||a+c<=b||b+c<=a){showToast('Those sides violate the triangle inequality.','error');return;}
      tri={caseType:'SSS',knowns:{a:true,b:true,c:true},solved:solveTriangle({a,b,c}),name:'Custom SSS'};
    }else if(ct==='SAS'){
      const a=readQc('qc-a'),b=readQc('qc-b'),C=readQc('qc-C');
      if(a==null||b==null||C==null){showToast('SAS needs a, b, and ∠C (angle between them).','error');return;}
      tri={caseType:'SAS',knowns:{a:true,b:true,C:true},solved:solveTriangle({a,b,C}),name:'Custom SAS'};
    }else if(ct==='ASA'){
      const A=readQc('qc-A'),b=readQc('qc-b'),C=readQc('qc-C');
      if(A==null||b==null||C==null){showToast('ASA needs ∠A, side b (included), and ∠C.','error');return;}
      tri={caseType:'ASA',knowns:{A:true,b:true,C:true},solved:solveTriangle({A,b,C}),name:'Custom ASA'};
    }else if(ct==='AAS'){
      const A=readQc('qc-A'),B=readQc('qc-B'),a=readQc('qc-a');
      if(A==null||B==null||a==null){showToast('AAS needs ∠A, ∠B, and side a (adjust fields if your known side is b or c).','error');return;}
      tri={caseType:'AAS',knowns:{A:true,B:true,a:true},solved:solveTriangle({A,B,a}),name:'Custom AAS'};
    }else if(ct==='HL'){
      const a=readQc('qc-a'),b=readQc('qc-b');
      if(a==null||b==null){showToast('HL needs the two legs a and b (∠C = 90°).','error');return;}
      tri={caseType:'HL',knowns:{a:true,b:true,C:true},solved:solveTriangle({a,b,C:90}),name:'Custom HL'};
    }else if(ct==='SSA'){
      const a=readQc('qc-a'),b=readQc('qc-b'),A=readQc('qc-A');
      if(a==null||b==null||A==null){showToast('SSA needs side a, side b, and ∠A (non-included).','error');return;}
      tri={caseType:'SSA',knowns:{a:true,b:true,A:true},solved:{a,b,A,B:null,C:null,c:null},ssaKnown:{a,b,A},ssaSolutions:analyzeSSA(a,b,A),name:'Custom SSA'};
    }else{
      showToast('Unknown case.','error');return;
    }
  }catch(e){
    showToast('Could not build that triangle.','error');return;
  }

  App.currentTri=tri;
  App.quizVaultItem=null;
  App.revealedKeys=new Set();
  finalizeTriangleGeneration();
  clearAllTimers();
  DOM.progressBar.style.width='0%';
  showQuizUI();
  showQuestionPhase();
  $('quiz-controls').classList.remove('hidden');
  showToast(`Loaded: ${tri.name}`);
}

function startNextQuizProblem(){
  if(!App.quizMode){
    clearAllTimers();
    generateRandom();
    runPhase(PHASE.QUESTION);
    return;
  }
  if(!App.quizPool||!App.quizPool.length)App.quizPool=buildQuizPoolFromUI();
  if(!App.quizPool.length){
    showToast('No triangles in quiz pool — adjust case filters.','error');
    return;
  }
  let candidates=App.quizPool;
  if(App.currentTri&&candidates.length>1){
    candidates=candidates.filter(p=>p.name!==(App.currentTri.name||''));
    if(!candidates.length)candidates=App.quizPool;
  }
  const preset=candidates[Math.floor(Math.random()*candidates.length)];
  generateFromPreset(preset,{keepQuiz:true});
  App.quizVaultItem=preset;
  clearAllTimers();
  DOM.progressBar.style.width='0%';
  showQuizUI();
  showQuestionPhase();
  renderVault();
  showToast(`Next: ${preset.name}`);
}

function checkQuizGuesses(){
  if(!App.currentTri)return;
  document.querySelectorAll('.quiz-guess').forEach(inp=>{
    const k=inp.dataset.key;
    const v=parseFloat(inp.value);
    inp.classList.remove('guess-right','guess-wrong');
    if(inp.value===''||isNaN(v))return;
    const tgt=App.currentTri.solved[k];
    if(tgt==null)return;
    const tol=k===k.toUpperCase()?0.12:0.08;
    if(Math.abs(v-tgt)<tol)inp.classList.add('guess-right');
    else inp.classList.add('guess-wrong');
  });
}

function addCurrentToMistakeLedger(){
  if(!App.currentTri){showToast('No triangle to save.','error');return;}
  App.mistakes.push({
    type:'saved',
    triName:App.currentTri.name||App.currentTri.caseType,
    caseType:App.currentTri.caseType,
    solved:{...App.currentTri.solved},
    savedAt:new Date().toISOString(),
  });
  saveStorage();
  renderMistakes();
  showToast('Saved to mistake ledger.');
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
  renderSVGLedger();
  renderSVG();
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
      const topic=el.dataset.topic;
      if(topic) highlightCheatsheetTopic(topic);
    });
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')el.classList.add('revealed');});
  });
}

// Map data-topic values (from sp(..., topic)) to cheatsheet section IDs
const TOPIC_MAP = {
  'sohcahtoa':      'cs-sohcahtoa',
  'inverse-trig':   'cs-inverse',
  'law-of-sines':   'cs-sines',
  'law-of-cosines': 'cs-cosines',
  'pythagorean':    'cs-pythagorean',
  'angle-sum':      'cs-anglesum',
  'ssa':            'cs-ssa',
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
      clearAllTimers();
      generateRandom();
      runPhase(PHASE.QUESTION);
    } else {
      startNextQuizProblem();
    }
  }
}

// ─── SCREENSAVER / QUIZ ──────────────────────────────────────
function startScreensaver(){
  App.state=STATE.SCREENSAVER; App.quizMode=false;
  document.body.classList.add('screensaver-active');
  DOM.hintArea.classList.add('hidden');
  if(DOM.ledgerFeedbackWrap)DOM.ledgerFeedbackWrap.classList.add('hidden');
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
  App.quizPool=buildQuizPoolFromUI();
  App.quizVaultItem=preset;
  generateFromPreset(preset,{keepQuiz:true});
  clearAllTimers();
  DOM.progressBar.style.width='0%';
  showQuizUI();
  renderVault();
  showToast(`Quiz: ${preset.name}`);
  App.phase=PHASE.QUESTION;
  updateStateBadge();
  showQuestionPhase();
}

function showQuizUI(){
  DOM.hintArea.classList.remove('hidden');
  if(DOM.feedbackArea){DOM.feedbackArea.textContent=''; DOM.feedbackArea.className='';}
  const gb=$('quiz-guess-block');
  if(gb)gb.classList.remove('hidden');
  renderQuizStep();
}

function renderQuizStep(){
  const step=App.steps[App.stepIndex];
  if(!step)return;
  if(App._quizLedgerStepSnapshot!==App.stepIndex){
    App._quizLedgerStepSnapshot=App.stepIndex;
    App._ledgerFreshStep=true;
  }
  DOM.tutorText.textContent=plainQuestionText(step.question);
  DOM.phaseReveal.classList.add('hidden');
  DOM.phaseQuestion.classList.remove('hidden');
  const hasAnswer=step.answer!=null;
  if(DOM.ledgerFeedbackWrap){
    DOM.ledgerFeedbackWrap.classList.toggle('hidden',!hasAnswer);
  }
  const total=App.steps.length;
  const pct=total>1?(App.stepIndex/(total-1))*100:0;
  DOM.progressBar.style.width=pct+'%';
  DOM.progressBar.style.background='var(--state-review)';
  const lbl=$('quiz-progress-label');
  if(lbl) lbl.textContent=`Step ${App.stepIndex+1} of ${total}`;
  const revealBtn=$('btn-quiz-reveal');
  const nextBtn=$('btn-quiz-next');
  if(revealBtn) revealBtn.classList.toggle('hidden', App.phase!==PHASE.QUESTION||!step.reveal);
  if(nextBtn)   nextBtn.classList.toggle('hidden', App.phase===PHASE.QUESTION);
  renderSVGLedger();
  renderSVG();
  if(hasAnswer&&step.key){
    requestAnimationFrame(()=>{const el=$(`slv-${step.key}`);if(el&&!el.readOnly)el.focus();});
  }
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
    startNextQuizProblem();
  }
}
function checkAnswer(){
  const step=App.steps[App.stepIndex];
  if(!step||step.answer==null){
    if(App.quizMode) quizRevealStep();
    else advanceStep();
    return;
  }
  const key=step.key;
  const inp=key?$(`slv-${key}`):null;
  const raw=inp?parseFloat(inp.value):NaN;
  if(isNaN(raw)){showToast('Enter a number in the highlighted box above the triangle.','error');return;}
  const correct=Math.abs(raw-step.answer)<0.1;
  if(inp){
    inp.classList.toggle('correct',correct);
    inp.classList.toggle('wrong',!correct);
  }
  if(DOM.feedbackArea){
    DOM.feedbackArea.textContent=correct?`✓ Correct! ${step.answer}`:`✗ Expected ≈${step.answer}`;
    DOM.feedbackArea.className=correct?'correct':'wrong';
  }
  if(!correct){
    const pq=plainQuestionText(step.question);
    App.mistakes.push({triName:App.currentTri.name,step:pq.slice(0,40),expected:step.answer,got:raw});
    saveStorage(); renderMistakes();
  }
  if(correct){
    setTimeout(()=>{
      if(inp)inp.classList.remove('correct','wrong');
      if(DOM.feedbackArea)DOM.feedbackArea.textContent='';
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
  DOM.tutorText.textContent=plainQuestionText(step.question);
  DOM.phaseReveal.classList.add('hidden');
  DOM.phaseQuestion.classList.remove('hidden');
  if(!App.quizMode){
    renderSVGLedger();
    renderSVG();
  }
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
  valEl.textContent=M.fmt(v)+(key===key.toUpperCase()?'°':'');
  valEl.className='ledger-val solved';
  DOM['ledger'+key].className='ledger-row solved';
  valEl.classList.remove('pop'); void valEl.offsetWidth; valEl.classList.add('pop');
  const slvEl=DOM['slv'+key];
  if(slvEl){
    const label=key===key.toUpperCase()?`∠${key}`:`${key}`;
    slvEl.readOnly=true;
    slvEl.value=`${label} = ${M.fmt(v)}${key===key.toUpperCase()?'°':''}`;
    slvEl.className='slr-val slr-input solved';
    slvEl.classList.remove('pop'); void slvEl.offsetWidth; slvEl.classList.add('pop');
    setTimeout(()=>slvEl.classList.remove('pop'),600);
  }
}

// SVG ledger bar (above triangle) — inputs: readonly display, or editable for quiz answer step
function renderSVGLedger(){
  if(!App.currentTri)return;
  const{knowns,solved}=App.currentTri;
  const step=App.steps[App.stepIndex]||{};
  const quizActive=App.quizMode&&step.answer!=null&&step.key;
  ['A','B','C','a','b','c'].forEach(k=>{
    const el=DOM['slv'+k];
    if(!el)return;
    const isKnown=knowns[k];
    const revealed=App.revealedKeys.has(k);
    const v=solved[k];
    const label=k===k.toUpperCase()?`∠${k}`:`${k}`;
    const showVal=(isKnown||revealed)&&v!=null;

    el.classList.remove('known','solved','active','guess-active');
    const isQuizCell=quizActive&&k===step.key;
    if(!isQuizCell||App._ledgerFreshStep)el.classList.remove('correct','wrong');
    el.classList.add('slr-val','slr-input');

    if(quizActive&&k===step.key){
      el.readOnly=false;
      el.classList.add('guess-active','active');
      if(App._ledgerFreshStep){
        el.value='';
        el.placeholder=label+(k===k.toUpperCase()?' (°)':'');
        App._ledgerFreshStep=false;
      }
      el.setAttribute('aria-label',`Enter ${label} for this step`);
    }else{
      el.readOnly=true;
      el.placeholder='';
      el.value=showVal
        ?`${label} = ${M.fmt(v)}${k===k.toUpperCase()?'°':''}`
        :`${label} = ?`;
      el.setAttribute('aria-label',`${label}`);
    }

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
  const scale=360/maxSide;
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
  setSideLabel('lbl-a',pts.B,pts.C,gx,gy, isLabelVisible('a')?`a = ${M.fmt(solved.a)}`:'a = ?');
  setSideLabel('lbl-b',pts.A,pts.C,gx,gy, isLabelVisible('b')?`b = ${M.fmt(solved.b)}`:'b = ?');
  setSideLabel('lbl-c',pts.A,pts.B,gx,gy, isLabelVisible('c')?`c = ${M.fmt(solved.c)}`:'c = ?');

  // Color side labels (SVG: use classList, not className.baseVal)
  ['a','b','c'].forEach(k=>{
    const el=$('lbl-'+k);
    const isKnown=App.currentTri.knowns[k];
    const revealed=App.revealedKeys.has(k);
    el.classList.remove('known','solved');
    el.classList.add('tri-label','side-label');
    if(isKnown)el.classList.add('known');
    else if(revealed)el.classList.add('solved');
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

  // Center triangle in viewBox (fixes off-center drawings on wide/narrow shapes)
  $('svg-triangle-group').setAttribute('transform',`translate(${400-gx} ${300-gy})`);
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
  const visible=isLabelVisible(key);
  el.textContent=visible&&val!=null?`${M.fmt(val)}°`:'';
  el.classList.remove('visible');
  el.classList.add('tri-label','angle-val-label');
  if(visible)el.classList.add('visible');
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
  ['side-a','side-b','side-c'].forEach(id=>{
    const el=$(id);
    el.classList.remove('sin-active','cos-active','tan-active','hyp-active','pulse');
    el.classList.add('tri-side');
    el.style.filter='';
  });
  ['arc-A','arc-B','arc-C'].forEach(id=>{
    const el=$(id);
    el.classList.remove('active');
    el.classList.add('tri-arc');
  });
  if(!step.activeEl)return;
  const el=$(step.activeEl);
  if(!el)return;
  if(step.activeEl.startsWith('side')){
    const f=(step.reveal||'').toLowerCase();
    const cls=f.includes('sin')?'sin-active':f.includes('cos')?'cos-active':f.includes('tan')?'tan-active':'hyp-active';
    el.classList.remove('tri-side');
    el.classList.add('tri-side',cls);
    if(step.isFinal)el.classList.add('pulse');
  } else if(step.activeEl.startsWith('arc')){
    el.classList.remove('tri-arc');
    el.classList.add('tri-arc','active');
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
  App.mistakes.slice(-20).reverse().forEach(m=>{
    const div=document.createElement('div');
    div.className='mistake-item';
    if(m.type==='saved'){
      div.textContent=`📌 ${m.triName} (${m.caseType}) · ${m.savedAt.slice(0,10)}`;
      div.title=typeof m.solved==='object'?JSON.stringify(m.solved):'';
    }else{
      div.textContent=`${m.triName}: expected ${m.expected}, got ${m.got}`;
    }
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
  try{
    App.savedProblems.push({name:App.currentTri.name||App.currentTri.caseType,solved:App.currentTri.solved,caseType:App.currentTri.caseType,savedAt:new Date().toISOString()});
    saveStorage();
    showToast(`Saved to browser (${App.savedProblems.length} stored). Use ＋ in Mistake Ledger for review notes.`,'success');
  }catch(e){
    showToast('Could not save (storage full or blocked).','error');
  }
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
  DOM.btnCheckAnswer.addEventListener('click',checkAnswer);
  $('svg-ledger').addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.classList?.contains('slr-input'))checkAnswer();
  });
  $('btn-quiz-load-custom').addEventListener('click',loadCustomQuizTriangle);
  $('btn-quiz-check-guesses').addEventListener('click',checkQuizGuesses);
  $('btn-add-mistake-current').addEventListener('click',addCurrentToMistakeLedger);
  $('btn-hint').addEventListener('click',()=>{const step=App.steps[App.stepIndex];DOM.hintText.textContent=step?.reveal?.replace(/<[^>]+>/g,'')||'No hint available.';});
  DOM.btnPrev.addEventListener('click',()=>{if(App.stepIndex>0){App.stepIndex--;clearAllTimers();renderStep();renderSVG();renderSVGLedger();if(App.quizMode)renderQuizStep();else runPhase(PHASE.QUESTION);}});
  DOM.btnNext.addEventListener('click',()=>{
    const st=App.steps[App.stepIndex];
    if(App.quizMode){
      if(st?.isFinal&&App.phase===PHASE.QUESTION){
        startNextQuizProblem();
        return;
      }
      if(App.phase===PHASE.QUESTION) quizRevealStep();
      else quizNextStep();
    } else {
      if(st?.isFinal&&App.phase===PHASE.QUESTION){
        clearAllTimers();
        generateRandom();
        runPhase(PHASE.QUESTION);
        return;
      }
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
    App.quizMode=false; App.quizVaultItem=null; App.quizPool=[];
    DOM.hintArea.classList.add('hidden');
    if(DOM.ledgerFeedbackWrap)DOM.ledgerFeedbackWrap.classList.add('hidden');
    $('quiz-controls').classList.add('hidden');
    const gb=$('quiz-guess-block');
    if(gb)gb.classList.add('hidden');
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
  const t=e.target;
  if(t===DOM.scratchpad||t.classList?.contains('quiz-guess')||t.closest?.('#quiz-custom-block')||t.closest?.('#svg-ledger'))return;
  switch(e.code){
    case 'Space':      e.preventDefault();togglePause();break;
    case 'Enter':      e.preventDefault();saveProblem();break;
    case 'ArrowRight': e.preventDefault();DOM.btnNext.click();break;
    case 'ArrowLeft':  e.preventDefault();DOM.btnPrev.click();break;
    case 'Escape':
      e.preventDefault();
      if(!DOM.ssaModal.classList.contains('hidden')){closeSSAModal();break;}
      if(!DOM.cheatsheet.classList.contains('hidden')){DOM.cheatsheet.classList.add('hidden');DOM.cheatsheet.classList.remove('docked-left','docked-right');$('btn-cheatsheet').classList.remove('active');break;}
      if(App.quizMode){$('btn-quiz-exit').click();}
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