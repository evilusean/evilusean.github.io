/* Compound Interest & Growth Calculator */

const $ = (id) => document.getElementById(id);

const DOM = {
  principal: $('input-principal'),
  rate: $('input-rate'),
  frequency: $('input-frequency'),
  time: $('input-time'),
  pmt: $('input-pmt'),
  formulaCompound: $('formula-compound'),
  formulaAnnuity: $('formula-annuity'),
  formulaTotal: $('formula-total'),
  annuityBlock: $('annuity-formula-block'),
  ledgerPrincipal: $('ledger-principal'),
  ledgerRate: $('ledger-rate'),
  ledgerInterest: $('ledger-interest'),
  ledgerBalance: $('ledger-balance'),
  tutorText: $('tutor-text'),
  stateBadge: $('state-badge'),
  feedback: $('feedback-area'),
  quizProgress: $('quiz-progress'),
  quizProgressFill: $('quiz-progress-fill'),
  quizStepLabel: $('quiz-step-label'),
  chart: $('growth-chart'),
  chartWrap: $('chart-wrap'),
  chartTooltip: $('chart-tooltip'),
  btnQuiz: $('btn-quiz-mode'),
  btnReset: $('btn-reset'),
  btnQuizCheck: $('btn-quiz-check'),
};

const App = {
  quizMode: false,
  displayAll: false,
  quizStep: 0,
  validatedSteps: new Set(),
  chartPoints: [],
};

const QUIZ_STEPS = [
  {
    id: 'principal',
    field: 'principal',
    prompt: 'What is the principal P — the initial amount invested?',
    check: (s) => s.P > 0,
    hint: 'Enter a positive dollar amount for P.',
  },
  {
    id: 'rate',
    field: 'rate',
    prompt: 'What is the annual interest rate r? (We convert your percent to a decimal in the formula.)',
    check: (s) => s.r >= 0,
    hint: 'Enter the annual rate as a percentage (e.g. 5 for 5%).',
  },
  {
    id: 'frequency',
    field: 'frequency',
    prompt: 'How many times per year is interest compounded (n)?',
    check: (s) => s.n >= 1,
    hint: 'Pick how often interest is applied per year.',
  },
  {
    id: 'time',
    field: 'time',
    prompt: 'For how many years (t) is the money invested?',
    check: (s) => s.t > 0,
    hint: 'Enter a positive number of years.',
  },
  {
    id: 'ratePerPeriod',
    field: null,
    prompt: 'What is the rate per compounding period, r/n?',
    check: (s) => Number.isFinite(s.ratePerPeriod),
    hint: 'Divide the decimal rate by n.',
    revealSpoiler: 'compound-formula',
  },
  {
    id: 'growthFactor',
    field: null,
    prompt: 'What is the growth factor (1 + r/n)?',
    check: (s) => s.growthFactor > 0,
    hint: 'Add 1 to the rate per period.',
  },
  {
    id: 'exponent',
    field: null,
    prompt: 'What is the total number of compounding periods, n·t?',
    check: (s) => s.exponent > 0,
    hint: 'Multiply compounding frequency by years.',
  },
  {
    id: 'principalFV',
    field: null,
    prompt: 'Using A = P(1 + r/n)^(nt), what is the future value from principal alone?',
    check: (s) => s.principalFV >= 0,
    hint: 'Raise the growth factor to the power nt, then multiply by P.',
    revealSpoiler: 'interest',
  },
  {
    id: 'pmt',
    field: 'pmt',
    prompt: 'If you make monthly contributions, what is PMT per month? (Enter 0 if none.)',
    check: () => true,
    hint: 'Optional — enter 0 to skip the annuity formula.',
    optional: true,
  },
  {
    id: 'annuity',
    field: null,
    prompt: 'What is the future value of your monthly contributions?',
    check: (s) => s.PMT === 0 || s.annuityFV >= 0,
    hint: 'Use the ordinary annuity formula with monthly rate r/12.',
    revealSpoiler: 'annuity-formula',
    skipIf: (s) => s.PMT === 0,
  },
  {
    id: 'balance',
    field: null,
    prompt: 'What is the total balance A (principal growth + contributions)?',
    check: (s) => s.totalFV >= 0,
    hint: 'Add principal future value and annuity future value.',
    revealSpoiler: 'balance',
  },
];

function parseNum(value, fallback = 0) {
  const n = parseFloat(String(value).replace(/,/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function getState() {
  const P = parseNum(DOM.principal.value);
  const rPct = parseNum(DOM.rate.value);
  const r = rPct / 100;
  const n = parseInt(DOM.frequency.value, 10) || 1;
  const t = parseNum(DOM.time.value);
  const PMT = parseNum(DOM.pmt.value);
  const ratePerPeriod = n > 0 ? r / n : 0;
  const growthFactor = 1 + ratePerPeriod;
  const exponent = n * t;
  const principalFV = P * Math.pow(growthFactor, exponent);
  const annuityFV = futureValueMonthlyContributions(PMT, r, t);
  const totalFV = principalFV + annuityFV;
  const totalContributions = PMT * 12 * t;
  const accruedInterest = totalFV - P - totalContributions;

  return {
    P,
    r,
    rPct,
    n,
    t,
    PMT,
    ratePerPeriod,
    growthFactor,
    exponent,
    principalFV,
    annuityFV,
    totalFV,
    totalContributions,
    accruedInterest,
  };
}

function futureValueMonthlyContributions(PMT, r, years) {
  if (PMT <= 0 || years <= 0) return 0;
  const i = r / 12;
  const months = Math.round(12 * years);
  if (i === 0) return PMT * months;
  return PMT * ((Math.pow(1 + i, months) - 1) / i);
}

function formatCurrency(n) {
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
}

function formatNum(n, digits = 4) {
  if (!Number.isFinite(n)) return '?';
  return Number(n.toPrecision(digits)).toString();
}

function buildCompoundLatex(s) {
  const rDec = formatNum(s.r, 4);
  return `\\[ A = ${formatNum(s.P, 6)} \\left(1 + \\frac{${rDec}}{${s.n}}\\right)^{${s.n} \\cdot ${formatNum(s.t, 4)}} = ${formatNum(s.principalFV, 6)} \\]`;
}

function buildAnnuityLatex(s) {
  const i = s.r / 12;
  const months = Math.round(12 * s.t);
  const iStr = formatNum(i, 4);
  if (s.PMT <= 0) {
    return `\\[ A_{\\text{PMT}} = 0 \\]`;
  }
  return `\\[ A_{\\text{PMT}} = ${formatNum(s.PMT, 6)} \\times \\frac{\\left(1 + ${iStr}\\right)^{${months}} - 1}{${iStr}} = ${formatNum(s.annuityFV, 6)} \\]`;
}

function buildTotalLatex(s) {
  return `\\[ A_{\\text{total}} = ${formatNum(s.principalFV, 6)} + ${formatNum(s.annuityFV, 6)} = ${formatNum(s.totalFV, 6)} \\]`;
}

function typesetMath() {
  if (window.MathJax?.typesetPromise) {
    return MathJax.typesetPromise([
      DOM.formulaCompound,
      DOM.formulaAnnuity,
      DOM.formulaTotal,
    ]).catch(() => {});
  }
  return Promise.resolve();
}

function getActiveQuizSteps(state) {
  return QUIZ_STEPS.filter((step) => !(step.skipIf && step.skipIf(state)));
}

function getCurrentQuizStep() {
  const steps = getActiveQuizSteps(getState());
  return steps[App.quizStep] || null;
}

function updateSpoilers(state) {
  const spoilers = {
    'compound-formula': false,
    'annuity-formula': false,
    'total-formula': false,
    interest: false,
    balance: false,
  };

  if (!App.quizMode || App.displayAll) {
    Object.keys(spoilers).forEach((k) => { spoilers[k] = true; });
  } else {
    App.validatedSteps.forEach((id) => {
      const step = QUIZ_STEPS.find((s) => s.id === id);
      if (step?.revealSpoiler) spoilers[step.revealSpoiler] = true;
    });
    const steps = getActiveQuizSteps(state);
    for (let i = 0; i <= App.quizStep && i < steps.length; i++) {
      const step = steps[i];
      if (step.revealSpoiler) spoilers[step.revealSpoiler] = true;
    }
    if (App.validatedSteps.has('principalFV')) spoilers['compound-formula'] = true;
    if (App.validatedSteps.has('balance')) {
      spoilers['total-formula'] = true;
      spoilers.balance = true;
      spoilers.interest = true;
    }
  }

  document.querySelectorAll('.spoiler-target[data-spoiler]').forEach((el) => {
    const key = el.dataset.spoiler;
    const show = spoilers[key] !== false;
    el.classList.toggle('hidden-spoiler', !show);
  });

  DOM.chartWrap.classList.toggle('spoiler-chart', App.quizMode && !App.displayAll && !spoilers.balance);
}

function updateLedger(state) {
  DOM.ledgerPrincipal.textContent = formatCurrency(state.P);
  DOM.ledgerRate.textContent = `${state.rPct}% (${formatNum(state.r, 4)} dec)`;
  DOM.ledgerInterest.textContent = formatCurrency(state.accruedInterest);
  DOM.ledgerBalance.textContent = formatCurrency(state.totalFV);
}

function updateFormulas(state) {
  DOM.annuityBlock.classList.toggle('hidden', state.PMT <= 0);
  DOM.formulaCompound.innerHTML = buildCompoundLatex(state);
  DOM.formulaAnnuity.innerHTML = buildAnnuityLatex(state);
  DOM.formulaTotal.innerHTML = buildTotalLatex(state);
  return typesetMath();
}

function updateQuizUI() {
  const state = getState();
  const steps = getActiveQuizSteps(state);
  const step = getCurrentQuizStep();

  DOM.quizProgress.classList.toggle('hidden', !App.quizMode);
  DOM.btnQuiz.classList.toggle('active', App.quizMode);
  DOM.btnQuizCheck.classList.toggle('hidden', !App.quizMode || !step || step.field !== null);

  if (!App.quizMode) {
    DOM.btnQuizCheck.classList.add('hidden');
    DOM.stateBadge.textContent = 'EXPLORE';
    DOM.stateBadge.className = '';
    DOM.tutorText.textContent =
      'Adjust the inputs to see values substituted into the formulas and watch the growth curve update in real time.';
    DOM.feedback.classList.add('hidden');
    document.querySelectorAll('.input-group').forEach((g) => g.classList.remove('quiz-active'));
    return;
  }

  if (!step) {
    DOM.stateBadge.textContent = 'COMPLETE';
    DOM.stateBadge.className = 'done';
    DOM.tutorText.textContent =
      `Excellent! After ${state.t} years at ${state.rPct}% compounded ${state.n}×/year, your balance is ${formatCurrency(state.totalFV)}.`;
    DOM.quizProgressFill.style.width = '100%';
    DOM.quizStepLabel.textContent = 'All steps validated';
    return;
  }

  DOM.stateBadge.textContent = 'QUIZ';
  DOM.stateBadge.className = 'quiz';
  DOM.tutorText.textContent = step.prompt;
  const pct = steps.length ? ((App.quizStep) / steps.length) * 100 : 0;
  DOM.quizProgressFill.style.width = `${pct}%`;
  DOM.quizStepLabel.textContent = `Step ${App.quizStep + 1} of ${steps.length}`;

  document.querySelectorAll('.input-group').forEach((g) => {
    g.classList.toggle('quiz-active', Boolean(step?.field && step.field === g.dataset.field));
  });
}

function showFeedback(ok, message) {
  DOM.feedback.textContent = message;
  DOM.feedback.className = ok ? 'correct' : 'wrong';
  DOM.feedback.classList.remove('hidden');
}

function validateQuizAnswer(fieldId) {
  const state = getState();
  const steps = getActiveQuizSteps(state);
  const step = getCurrentQuizStep();

  if (!App.quizMode || !step) return;

  if (step.field !== null && step.field !== fieldId) {
    showFeedback(false, 'Use Check on the highlighted input for this step.');
    return;
  }

  if (step.field === null && fieldId !== step.id && fieldId !== 'quiz-step') {
    showFeedback(false, 'Use “Check step” for this conceptual question.');
    return;
  }

  if (!step.check(state)) {
    showFeedback(false, step.hint);
    return;
  }

  App.validatedSteps.add(step.id);
  const group = document.querySelector(`.input-group[data-field="${step.field}"]`);
  if (group) group.classList.add('validated');

  if (step.revealSpoiler) {
    document.querySelectorAll(`[data-spoiler="${step.revealSpoiler}"]`).forEach((el) => {
      el.classList.remove('hidden-spoiler');
    });
  }

  showFeedback(true, 'Correct! Moving to the next step.');
  App.quizStep += 1;

  while (App.quizStep < steps.length) {
    const next = steps[App.quizStep];
    if (next.skipIf && next.skipIf(state)) {
      App.validatedSteps.add(next.id);
      App.quizStep += 1;
    } else break;
  }

  updateQuizUI();
  render();
}

function handleCheck(fieldId) {
  if (App.quizMode) {
    validateQuizAnswer(fieldId);
    return;
  }
  const group = document.querySelector(`.input-group[data-field="${fieldId}"]`);
  if (group) group.classList.add('validated');
  showFeedback(true, 'Input recorded. Toggle Quiz mode for a guided walkthrough.');
  DOM.feedback.classList.remove('hidden');
  render();
}

function balanceAtYear(state, year) {
  const principalPart = state.P * Math.pow(state.growthFactor, state.n * year);
  const contribPart = futureValueMonthlyContributions(state.PMT, state.r, year);
  return { principalPart, contribPart, total: principalPart + contribPart };
}

function drawChart(state) {
  const canvas = DOM.chart;
  const wrap = DOM.chartWrap;
  const dpr = window.devicePixelRatio || 1;
  const rect = wrap.getBoundingClientRect();
  const w = Math.max(rect.width, 200);
  const h = Math.max(rect.height, 220);

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pad = { top: 24, right: 20, bottom: 36, left: 56 };
  const plotW = w - pad.left - pad.right;
  const plotH = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);

  const tMax = Math.max(state.t, 1);
  const samples = Math.min(120, Math.max(30, Math.ceil(tMax * 12)));
  const points = [];
  let yMax = state.P;

  for (let i = 0; i <= samples; i++) {
    const year = (i / samples) * tMax;
    const b = balanceAtYear(state, year);
    points.push({ year, ...b });
    yMax = Math.max(yMax, b.total);
  }

  App.chartPoints = points;
  yMax *= 1.08;

  const xScale = (yr) => pad.left + (yr / tMax) * plotW;
  const yScale = (val) => pad.top + plotH - (val / yMax) * plotH;

  ctx.strokeStyle = '#2a2a4a';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + plotW, y);
    ctx.stroke();
  }

  ctx.fillStyle = '#6c7086';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Time (years)', pad.left + plotW / 2, h - 8);

  ctx.save();
  ctx.translate(14, pad.top + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Balance ($)', 0, 0);
  ctx.restore();

  for (let i = 0; i <= 4; i++) {
    const val = (yMax * (4 - i)) / 4;
    const y = pad.top + (plotH * i) / 4;
    ctx.textAlign = 'right';
    ctx.fillText(formatCompact(val), pad.left - 6, y + 4);
  }

  const hideFull = App.quizMode && !App.displayAll &&
    document.getElementById('ledger-balance')?.classList.contains('hidden-spoiler');

  function strokeLine(key, color, width = 2.5) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = hideFull && key === 'total' ? 0.2 : 1;
    points.forEach((p, idx) => {
      const x = xScale(p.year);
      const y = yScale(p[key]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  strokeLine('principalPart', '#89dceb', 2);
  if (state.PMT > 0) strokeLine('contribPart', '#cba6f7', 2);
  strokeLine('total', '#a6e3a1', 3);

  if (state.t > 0 && state.t <= tMax) {
    const end = balanceAtYear(state, state.t);
    const ex = xScale(state.t);
    const ey = yScale(end.total);
    ctx.fillStyle = '#89b4fa';
    ctx.beginPath();
    ctx.arc(ex, ey, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function formatCompact(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

function onChartMove(e) {
  const rect = DOM.chart.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pad = { left: 56, right: 20 };
  const plotW = rect.width - pad.left - pad.right;
  if (plotW <= 0 || !App.chartPoints.length) return;

  const tMax = App.chartPoints[App.chartPoints.length - 1].year || 1;
  const year = Math.max(0, Math.min(tMax, ((x - pad.left) / plotW) * tMax));
  let closest = App.chartPoints[0];
  let minDist = Infinity;
  for (const p of App.chartPoints) {
    const d = Math.abs(p.year - year);
    if (d < minDist) {
      minDist = d;
      closest = p;
    }
  }

  DOM.chartTooltip.classList.remove('hidden');
  DOM.chartTooltip.style.left = `${e.clientX - rect.left + 12}px`;
  DOM.chartTooltip.style.top = `${e.clientY - rect.top - 8}px`;
  DOM.chartTooltip.innerHTML =
    `Year ${closest.year.toFixed(1)}<br>Total: ${formatCurrency(closest.total)}`;
}

function render() {
  const state = getState();
  updateLedger(state);
  updateSpoilers(state);
  updateQuizUI();
  updateFormulas(state).then(() => drawChart(state));
}

function setQuizMode(on) {
  App.quizMode = on;
  document.body.classList.toggle('quiz-mode', on);
  DOM.btnQuiz.textContent = on ? '✓ Quiz On' : '🎯 Quiz';
  DOM.btnQuiz.classList.toggle('active', on);

  if (on) {
    App.quizStep = 0;
    App.validatedSteps.clear();
    App.displayAll = false;
    document.body.classList.remove('display-all');
    document.querySelectorAll('.input-group').forEach((g) => g.classList.remove('validated'));
  } else {
    DOM.btnQuizCheck.classList.add('hidden');
  }

  syncUrlParams();
  render();
}

function resetAll() {
  DOM.principal.value = '10000';
  DOM.rate.value = '5';
  DOM.frequency.value = '12';
  DOM.time.value = '10';
  DOM.pmt.value = '0';
  App.quizStep = 0;
  App.validatedSteps.clear();
  App.displayAll = false;
  document.body.classList.remove('display-all');
  document.querySelectorAll('.input-group').forEach((g) => g.classList.remove('validated'));
  DOM.feedback.classList.add('hidden');
  if (App.quizMode) setQuizMode(false);
  syncUrlParams();
  render();
}

const URL_SAFE_KEYS = new Set(['quiz', 'P', 'r', 'n', 't', 'pmt']);

function syncUrlParams() {
  const params = new URLSearchParams();
  if (App.quizMode) params.set('quiz', '1');
  const s = getState();
  if (s.P !== 10000) params.set('P', String(s.P));
  if (s.rPct !== 5) params.set('r', String(s.rPct));
  if (s.n !== 12) params.set('n', String(s.n));
  if (s.t !== 10) params.set('t', String(s.t));
  if (s.PMT !== 0) params.set('pmt', String(s.PMT));

  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
}

function loadUrlParams() {
  const params = new URLSearchParams(location.search);
  for (const [key, val] of params.entries()) {
    if (!URL_SAFE_KEYS.has(key)) continue;
    if (key === 'quiz') {
      if (val === '1') App.quizMode = true;
      continue;
    }
    if (key === 'P') DOM.principal.value = val;
    if (key === 'r') DOM.rate.value = val;
    if (key === 'n') DOM.frequency.value = val;
    if (key === 't') DOM.time.value = val;
    if (key === 'pmt') DOM.pmt.value = val;
  }
}

function bindEvents() {
  const inputs = [DOM.principal, DOM.rate, DOM.frequency, DOM.time, DOM.pmt];
  inputs.forEach((el) => {
    el.addEventListener('input', () => {
      syncUrlParams();
      render();
    });
  });

  document.querySelectorAll('.btn-check').forEach((btn) => {
    btn.addEventListener('click', () => handleCheck(btn.dataset.check));
  });

  DOM.btnQuiz.addEventListener('click', () => setQuizMode(!App.quizMode));
  DOM.btnQuizCheck.addEventListener('click', () => {
    const step = getCurrentQuizStep();
    if (step) validateQuizAnswer(step.field === null ? 'quiz-step' : step.field);
  });
  DOM.btnReset.addEventListener('click', resetAll);

  DOM.chart.addEventListener('mousemove', onChartMove);
  DOM.chart.addEventListener('mouseleave', () => DOM.chartTooltip.classList.add('hidden'));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(), 120);
  });
}

function init() {
  App.displayAll = false;
  document.body.classList.remove('display-all');

  loadUrlParams();
  bindEvents();

  if (App.quizMode) setQuizMode(true);

  render();
}

init();
