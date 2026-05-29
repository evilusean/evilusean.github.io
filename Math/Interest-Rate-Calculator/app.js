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
  chart: $('growth-chart'),
  chartWrap: $('chart-wrap'),
  chartTooltip: $('chart-tooltip'),
  btnReset: $('btn-reset'),
};

const App = {
  chartPoints: [],
};

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

  function strokeLine(key, color, width = 2.5) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    points.forEach((p, idx) => {
      const x = xScale(p.year);
      const y = yScale(p[key]);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
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
  updateFormulas(state).then(() => drawChart(state));
}

function resetAll() {
  DOM.principal.value = '10000';
  DOM.rate.value = '5';
  DOM.frequency.value = '12';
  DOM.time.value = '10';
  DOM.pmt.value = '0';
  syncUrlParams();
  render();
}

const URL_SAFE_KEYS = new Set(['P', 'r', 'n', 't', 'pmt']);

function syncUrlParams() {
  const params = new URLSearchParams();
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
  loadUrlParams();
  bindEvents();
  render();
}

init();
