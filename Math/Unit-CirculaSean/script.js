const svg = document.getElementById('unit-circle');
const statusEl = document.getElementById('status');
const tagEl = document.getElementById('angle-tag');
const tableBody = document.getElementById('table-body');
const reviewEl = document.getElementById('review');
const phaseEl = document.getElementById('phase');
const quizToggle = document.getElementById('quiz-toggle');

const angles = [
  { deg: 0, rad: '0', cos: 1, sin: 0, coord: '(1, 0)' },
  { deg: 30, rad: 'π/6', cos: Math.sqrt(3) / 2, sin: 0.5, coord: '(√3/2, 1/2)' },
  { deg: 45, rad: 'π/4', cos: Math.SQRT2 / 2, sin: Math.SQRT2 / 2, coord: '(√2/2, √2/2)' },
  { deg: 60, rad: 'π/3', cos: 0.5, sin: Math.sqrt(3) / 2, coord: '(1/2, √3/2)' },
  { deg: 90, rad: 'π/2', cos: 0, sin: 1, coord: '(0, 1)' },
  { deg: 120, rad: '2π/3', cos: -0.5, sin: Math.sqrt(3) / 2, coord: '(-1/2, √3/2)' },
  { deg: 135, rad: '3π/4', cos: -Math.SQRT2 / 2, sin: Math.SQRT2 / 2, coord: '(-√2/2, √2/2)' },
  { deg: 150, rad: '5π/6', cos: -Math.sqrt(3) / 2, sin: 0.5, coord: '(-√3/2, 1/2)' },
  { deg: 180, rad: 'π', cos: -1, sin: 0, coord: '(-1, 0)' },
  { deg: 210, rad: '7π/6', cos: -Math.sqrt(3) / 2, sin: -0.5, coord: '(-√3/2, -1/2)' },
  { deg: 225, rad: '5π/4', cos: -Math.SQRT2 / 2, sin: -Math.SQRT2 / 2, coord: '(-√2/2, -√2/2)' },
  { deg: 240, rad: '4π/3', cos: -0.5, sin: -Math.sqrt(3) / 2, coord: '(-1/2, -√3/2)' },
  { deg: 270, rad: '3π/2', cos: 0, sin: -1, coord: '(0, -1)' },
  { deg: 300, rad: '5π/3', cos: 0.5, sin: -Math.sqrt(3) / 2, coord: '(1/2, -√3/2)' },
  { deg: 315, rad: '7π/4', cos: Math.SQRT2 / 2, sin: -Math.SQRT2 / 2, coord: '(√2/2, -√2/2)' },
  { deg: 330, rad: '11π/6', cos: Math.sqrt(3) / 2, sin: -0.5, coord: '(√3/2, -1/2)' },
];

const state = {
  mode: 'idle', // idle | quiz
  phase: 'screensaver', // screensaver | intro | guess | reveal | flash
  timers: [],
  current: null,
  saved: [],
};

function fmt(v) {
  if (!isFinite(v)) return 'undef';
  const r = Math.round(v * 1000) / 1000;
  return r.toString();
}

function trigData(a) {
  const { cos, sin } = a;
  const tan = cos === 0 ? Infinity : sin / cos;
  const sec = cos === 0 ? Infinity : 1 / cos;
  const csc = sin === 0 ? Infinity : 1 / sin;
  const cot = sin === 0 ? Infinity : cos / sin;
  return { cos, sin, tan, sec, csc, cot };
}

function signPrefix(s, sign) {
  if (s === '0' || s === 'undef') return s;
  if (sign >= 0) return s;
  return s.startsWith('-') ? s : `-${s}`;
}

function exactTrigStrings(deg) {
  // Returns exact trig values for standard angles as strings.
  // Uses √ format (e.g., √3/2). "undef" for undefined.
  const d = ((deg % 360) + 360) % 360;
  const q = d === 0 || d === 90 || d === 180 || d === 270 ? null : Math.floor(d / 90) + 1;
  const ref = d <= 90 ? d : d <= 180 ? 180 - d : d <= 270 ? d - 180 : 360 - d;

  const base = {
    0: { cos: '1', sin: '0', tan: '0' },
    30: { cos: '√3/2', sin: '1/2', tan: '1/√3' },
    45: { cos: '√2/2', sin: '√2/2', tan: '1' },
    60: { cos: '1/2', sin: '√3/2', tan: '√3' },
    90: { cos: '0', sin: '1', tan: 'undef' },
  }[ref];

  if (!base) return null;

  // signs by quadrant (cos, sin)
  let cosSign = 1, sinSign = 1;
  if (q === 2) cosSign = -1;
  if (q === 3) { cosSign = -1; sinSign = -1; }
  if (q === 4) sinSign = -1;
  if (d === 0) { cosSign = 1; sinSign = 1; }
  if (d === 180) { cosSign = -1; sinSign = 1; }
  if (d === 270) { cosSign = 1; sinSign = -1; }

  const cos = signPrefix(base.cos, cosSign);
  const sin = signPrefix(base.sin, sinSign);

  // tan sign = sin/cos; special-case undefined
  let tan = base.tan;
  if (tan !== 'undef' && tan !== '0') {
    const tanSign = cosSign * sinSign;
    tan = signPrefix(tan, tanSign);
  } else if (tan === '0') {
    tan = '0';
  }

  // reciprocals
  // normalize common reciprocals to nicer forms
  function recip(s) {
    if (s === '0') return 'undef';
    if (s === 'undef') return '0';
    if (s === '1') return '1';
    if (s === '-1') return '-1';
    if (s === '1/2') return '2';
    if (s === '-1/2') return '-2';
    if (s === '√2/2') return '√2';
    if (s === '-√2/2') return '-√2';
    if (s === '√3/2') return '2/√3';
    if (s === '-√3/2') return '-2/√3';
    if (s === '√3') return '1/√3';
    if (s === '-√3') return '-1/√3';
    if (s === '1/√3') return '√3';
    if (s === '-1/√3') return '-√3';
    return `1/(${s})`;
  }

  const sec = cos === '0' ? 'undef' : recip(cos);
  const csc = sin === '0' ? 'undef' : recip(sin);
  const cot = tan === '0' ? 'undef' : recip(tan);

  return { cos, sin, tan, sec, csc, cot };
}

function polar(r, deg) {
  const rad = (deg * Math.PI) / 180;
  // SVG y grows downward; unit circle y grows upward
  return { x: r * Math.cos(rad), y: -r * Math.sin(rad) };
}

function clearTimers() {
  state.timers.forEach((t) => clearTimeout(t));
  state.timers = [];
}

function addText(x, y, text, cls = '') {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('class', `svg-label ${cls}`);
  // font-size in SVG user units (viewBox-relative) so it stays proportional
  t.setAttribute('font-size', '0.075');
  t.textContent = text;
  svg.appendChild(t);
}

function addLabel(deg, radius, text, cls = 'anchor-mid') {
  const { x, y } = polar(radius, deg);
  addText(x, y, text, cls);
}

function drawBase() {
  svg.innerHTML = '';
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', 0);
  circle.setAttribute('cy', 0);
  circle.setAttribute('r', 1);
  circle.setAttribute('stroke', '#c14b7b');
  circle.setAttribute('stroke-width', '0.02');
  circle.setAttribute('fill', 'none');
  svg.appendChild(circle);

  const axes = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  axes.setAttribute('stroke', '#7a85a5');
  axes.setAttribute('stroke-width', '0.008');
  [
    ['-1.1', 0, '1.1', 0],
    [0, '-1.2', 0, '1.2'],
  ].forEach((p) => {
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', p[0]);
    l.setAttribute('y1', p[1]);
    l.setAttribute('x2', p[2]);
    l.setAttribute('y2', p[3]);
    axes.appendChild(l);
  });
  svg.appendChild(axes);

  // axis labels
  addText(1.08, -0.04, '1', 'svg-label muted');
  addText(-1.12, -0.04, '-1', 'svg-label muted');
  // y axis labels (remember SVG is flipped, so top is +1)
  addText(0.03, -1.12, '1', 'svg-label muted');
  addText(0.03, 1.04, '-1', 'svg-label muted');
  addText(0.04, -0.04, '0', 'svg-label muted');
  addText(1.08, 0.1, 'x', 'svg-label muted');
  addText(0.08, -1.25, 'y', 'svg-label muted');
}

function drawStaticLabels() {
  // radians + degrees inside the circle; coordinates outside
  angles.forEach((a) => {
    addLabel(a.deg, 0.72, a.rad, 'rad anchor-mid');
    addLabel(a.deg, 0.90, `${a.deg}°`, 'deg anchor-mid');
    addLabel(a.deg, 1.18, a.coord, 'coord anchor-mid');
  });
  // cardinal text
  addText(0, -1.14, '(0, 1)', 'svg-label anchor-mid');
  addText(0, 1.08, '(0, -1)', 'svg-label anchor-mid');
}

function drawSpecialTrianglesOverlay() {
  // Show 30/45/60 in each quadrant as faint white transparent triangles
  const special = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
  special.forEach((deg) => {
    const a = angles.find((x) => x.deg === deg);
    if (!a) return;
    const angleRad = (a.deg * Math.PI) / 180;
    const x = Math.cos(angleRad);
    const y = -Math.sin(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `0,0 ${x},0 ${x},${y}`);
    poly.setAttribute('fill', 'rgba(255,255,255,0.06)');
    poly.setAttribute('stroke', 'rgba(255,255,255,0.22)');
    poly.setAttribute('stroke-width', '0.006');
    svg.appendChild(poly);
  });
}

function drawTriangle(angle, opts = {}) {
  const { showLabels = false } = opts;
  drawBase();
  const angleRad = (angle.deg * Math.PI) / 180;
  const x = Math.cos(angleRad);
  const y = -Math.sin(angleRad);

  // triangle fill
  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', `0,0 ${x},0 ${x},${y}`);
  poly.setAttribute('fill', 'rgba(32, 193, 255, 0.1)');
  poly.setAttribute('stroke', 'none');
  svg.appendChild(poly);

  // projection line on x-axis (cos)
  const baseLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseLine.setAttribute('x1', 0);
  baseLine.setAttribute('y1', 0);
  baseLine.setAttribute('x2', x);
  baseLine.setAttribute('y2', 0);
  baseLine.setAttribute('stroke', '#1e6bf1');
  baseLine.setAttribute('stroke-width', '0.012');
  svg.appendChild(baseLine);

  // vertical leg (sin)
  const vert = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  vert.setAttribute('x1', x);
  vert.setAttribute('y1', 0);
  vert.setAttribute('x2', x);
  vert.setAttribute('y2', y);
  vert.setAttribute('stroke', '#e03746');
  vert.setAttribute('stroke-width', '0.012');
  svg.appendChild(vert);

  // hypotenuse
  const hypo = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  hypo.setAttribute('x1', 0);
  hypo.setAttribute('y1', 0);
  hypo.setAttribute('x2', x);
  hypo.setAttribute('y2', y);
  hypo.setAttribute('stroke', '#8c3be0');
  hypo.setAttribute('stroke-width', '0.012');
  svg.appendChild(hypo);

  // arc
  const arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const largeArc = angle.deg > 180 ? 1 : 0;
  const sweep = 1;
  const arcX = Math.cos(angleRad) * 0.22;
  const arcY = Math.sin(angleRad) * 0.22;
  const d = `M 0.22 0 A 0.22 0.22 0 ${largeArc} ${sweep} ${arcX} ${arcY}`;
  arc.setAttribute('d', d);
  arc.setAttribute('fill', 'none');
  arc.setAttribute('stroke', '#e04f7c');
  arc.setAttribute('stroke-width', '0.015');
  svg.appendChild(arc);

  // point
  const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  point.setAttribute('cx', x);
  point.setAttribute('cy', y);
  point.setAttribute('r', '0.025');
  point.setAttribute('fill', '#40e0d0');
  svg.appendChild(point);

  if (showLabels) {
    addLabel(angle.deg, 0.28, `${angle.deg}°`, 'svg-label anchor-mid');
    addLabel(angle.deg, 0.36, `${angle.rad}`, 'rad anchor-mid');
    addLabel(angle.deg, 1.15, angle.coord, 'coord anchor-mid');
  }
}

function renderTable(a) {
  const t = exactTrigStrings(a.deg) || trigData(a);
  const rows = [
    ['cos', t.cos, 'row-cos'],
    ['sin', t.sin, 'row-sin'],
    ['tan', t.tan, 'row-tan'],
    ['sec', t.sec, 'row-sec'],
    ['csc', t.csc, 'row-csc'],
    ['cot', t.cot, 'row-cot'],
  ];
  tableBody.innerHTML = rows
    .map(([k, v, c]) => `<tr class="${c}"><td>${k}</td><td>${typeof v === 'number' ? fmt(v) : v}</td></tr>`)
    .join('');
}

function setPhase(phase, message) {
  state.phase = phase;
  phaseEl.textContent = phase === 'screensaver' ? 'Screensaver' : phase.toUpperCase();
  if (message) statusEl.textContent = message;
}

function showScreensaver() {
  clearTimers();
  state.phase = 'screensaver';
  state.mode = 'idle';
  quizToggle.textContent = 'Start Quiz';
  phaseEl.textContent = 'Screensaver';
  tagEl.textContent = 'Click an angle to see values';
  tableBody.innerHTML = '';
  statusEl.textContent = 'Full unit circle';
  drawBase();
  drawSpecialTrianglesOverlay();
  drawStaticLabels();
}

function showReveal() {
  if (!state.current) return;
  setPhase('reveal', 'Reveal: values shown');
  tagEl.innerHTML = `<div>${state.current.deg}°</div><div>${state.current.rad}</div><div>(x,y)=${state.current.coord}</div>`;
  renderTable(state.current);
  drawTriangle(state.current, { showLabels: true });
}

function startQuestion() {
  clearTimers();
  state.phase = 'intro';
  state.current = angles[Math.floor(Math.random() * angles.length)];
  tagEl.textContent = '—';
  tableBody.innerHTML = '';
  setPhase('intro', 'Observe the highlighted triangle (5s)');
  drawTriangle(state.current, { showLabels: false });

  state.timers.push(setTimeout(() => {
    setPhase('guess', 'Guess the angle (5s)');
    drawTriangle(state.current, { showLabels: false });
  }, 5000));

  state.timers.push(setTimeout(() => {
    showReveal();
  }, 10000));

  state.timers.push(setTimeout(() => {
    setPhase('flash', 'Full circle flash');
    drawBase();
    drawStaticLabels();
  }, 15000));

  state.timers.push(setTimeout(() => {
    if (state.mode === 'quiz') startQuestion();
  }, 17000));
}

function startQuiz() {
  state.mode = 'quiz';
  quizToggle.textContent = 'Stop Quiz';
  startQuestion();
}

function stopQuiz() {
  clearTimers();
  showScreensaver();
}

quizToggle.addEventListener('click', () => {
  if (state.mode === 'quiz') {
    stopQuiz();
  } else {
    startQuiz();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (state.current) {
      state.saved.push(`${state.current.deg}° (${state.current.rad})`);
      reviewEl.innerHTML = 'Saved: ' + state.saved.map((s) => `<span class="pill">${s}</span>`).join('');
    }
  }
  if (e.code === 'Enter') {
    e.preventDefault();
    if (state.mode === 'quiz') startQuestion();
  }
});

function svgPointFromEvent(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  return pt.matrixTransform(ctm.inverse());
}

function nearestAngleFromPoint(x, y) {
  // angle from +x axis in degrees [0, 360)
  // y is SVG-space; flip to math-space before atan2
  let deg = (Math.atan2(-y, x) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  let best = angles[0];
  let bestD = Infinity;
  for (const a of angles) {
    const d = Math.min(Math.abs(a.deg - deg), 360 - Math.abs(a.deg - deg));
    if (d < bestD) { bestD = d; best = a; }
  }
  return best;
}

svg.addEventListener('click', (evt) => {
  if (state.mode === 'quiz') return;
  const p = svgPointFromEvent(evt);
  if (!p) return;
  // ignore clicks near center (avoid random picks)
  const r = Math.hypot(p.x, p.y);
  if (r < 0.35) return;
  state.current = nearestAngleFromPoint(p.x, p.y);
  showReveal();
});

// initialize
showScreensaver();