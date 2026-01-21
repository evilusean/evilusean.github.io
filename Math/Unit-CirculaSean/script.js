const svg = document.getElementById('unit-circle');
const statusEl = document.getElementById('status');
const tagEl = document.getElementById('angle-tag');
const tableBody = document.getElementById('table-body');
const reviewEl = document.getElementById('review');
const quizModeSelect = document.getElementById('quiz-mode');
const angleFormatSelect = document.getElementById('angle-format');
const questionOverlay = document.getElementById('question-overlay');
const startStopBtn = document.getElementById('start-stop');

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
  quizType: 'none', // none | unit-circle | coterminal | trig-functions
  angleFormat: 'both', // both | degrees | radians
  phase: 'screensaver', // screensaver | intro | guess | reveal | flash
  timers: [],
  current: null,
  saved: [],
  history: [],
  index: -1, // points into history
  coterminalTarget: null, // for coterminal quiz: the angle to find
  currentIdentity: null, // for trig identities quiz
  isPaused: false, // for pause/resume
  screensaverIndex: 0, // for screensaver cycling through special triangles
};

// Angles used in quiz mode (exclude axis-only, non–special-triangle angles)
const quizAngles = angles.filter((a) => ![0, 90, 180, 270].includes(a.deg));

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
  t.setAttribute('font-size', '0.25');
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
  // radians + degrees inside the circle; coordinates outside (color-coded)
  angles.forEach((a) => {
    // Show labels based on angle format preference
    if (state.angleFormat === 'both' || state.angleFormat === 'radians') {
      addLabel(a.deg, 0.72, a.rad, 'rad anchor-mid');
    }
    if (state.angleFormat === 'both' || state.angleFormat === 'degrees') {
      addLabel(a.deg, 0.90, `${a.deg}°`, 'deg anchor-mid');
    }
    
    // Color-code coordinates: x (cos) in blue, y (sin) in red
    const coord = a.coord.replace('(', '').replace(')', '');
    const [xPart, yPart] = coord.split(',').map((s) => s.trim());
    const { x, y } = polar(1.18, a.deg);
    
    // Use tspan for proper alignment within a single text element
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('class', 'svg-label anchor-mid');
    text.setAttribute('font-size', '0.11');
    
    const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan1.textContent = '(';
    text.appendChild(tspan1);
    
    const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan2.setAttribute('class', 'coord-x');
    tspan2.setAttribute('fill', '#1e6bf1'); // cos blue
    tspan2.textContent = xPart;
    text.appendChild(tspan2);
    
    const tspan3 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan3.textContent = ', ';
    text.appendChild(tspan3);
    
    const tspan4 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan4.setAttribute('class', 'coord-y');
    tspan4.setAttribute('fill', '#e03746'); // sin red
    tspan4.textContent = yPart;
    text.appendChild(tspan4);
    
    const tspan5 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan5.textContent = ')';
    text.appendChild(tspan5);
    
    svg.appendChild(text);
  });
}

function drawSpecialTrianglesOverlay(interactive = false) {
  // Show 30/45/60 in each quadrant; hover to reveal white fill.
  const special = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
  special.forEach((deg) => {
    const a = angles.find((x) => x.deg === deg);
    if (!a) return;
    const angleRad = (a.deg * Math.PI) / 180;
    const x = Math.cos(angleRad);
    const y = -Math.sin(angleRad);

    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    poly.setAttribute('points', `0,0 ${x},0 ${x},${y}`);
    poly.setAttribute('fill', 'rgba(255,255,255,0)');
    poly.setAttribute('stroke', 'rgba(255,255,255,0.18)');
    poly.setAttribute('stroke-width', '0.006');
    poly.dataset.deg = deg;
    if (interactive) {
      poly.style.cursor = 'pointer';
      poly.addEventListener('mouseenter', () => {
        poly.setAttribute('fill', 'rgba(255,255,255,0.08)');
        poly.setAttribute('stroke', 'rgba(255,255,255,0.35)');
      });
      poly.addEventListener('mouseleave', () => {
        poly.setAttribute('fill', 'rgba(255,255,255,0)');
        poly.setAttribute('stroke', 'rgba(255,255,255,0.18)');
      });
      poly.addEventListener('click', () => {
        state.current = a;
        showReveal(true);
      });
    }
    svg.appendChild(poly);
  });
}

function drawTriangle(angle, opts = {}) {
  const { showLabels = false, showAnswers = false } = opts;
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
  // sweep=0 draws counter‑clockwise in our flipped-y system
  const sweep = 0;
  const arcX = Math.cos(angleRad) * 0.22;
  const arcY = -Math.sin(angleRad) * 0.22;
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
  point.setAttribute('fill', '#e03746');
  svg.appendChild(point);

  if (showLabels) {
    // Add LARGE, PROMINENT angle labels visible on the arc/triangle
    const angleRad = (angle.deg * Math.PI) / 180;
    const labelRadius = 0.35;
    const labelX = Math.cos(angleRad) * labelRadius;
    const labelY = -Math.sin(angleRad) * labelRadius;
    
    // Degrees label - very large and prominent
    const degLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    degLabel.setAttribute('x', labelX);
    degLabel.setAttribute('y', labelY - 0.08);
    degLabel.setAttribute('class', 'svg-label anchor-mid');
    degLabel.setAttribute('font-size', '0.32');
    degLabel.setAttribute('fill', '#e04f7c');
    degLabel.setAttribute('font-weight', 'bold');
    degLabel.textContent = `${angle.deg}°`;
    svg.appendChild(degLabel);
    
    // Radians label
    const radLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    radLabel.setAttribute('x', labelX);
    radLabel.setAttribute('y', labelY + 0.08);
    radLabel.setAttribute('class', 'svg-label anchor-mid');
    radLabel.setAttribute('font-size', '0.28');
    radLabel.setAttribute('fill', '#e04f7c');
    radLabel.setAttribute('font-weight', 'bold');
    radLabel.textContent = `${angle.rad}`;
    svg.appendChild(radLabel);
  }
  
  // Only show (x,y) coordinates if showAnswers is true
  if (showLabels && showAnswers) {
    // Color-code coordinate label
    const coord = angle.coord.replace('(', '').replace(')', '');
    const [xPart, yPart] = coord.split(',').map((s) => s.trim());
    const { x, y } = polar(1.20, angle.deg);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('class', 'svg-label anchor-mid');
    text.setAttribute('font-size', '0.11');
    
    const tspan1 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan1.textContent = '(';
    text.appendChild(tspan1);
    
    const tspan2 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan2.setAttribute('fill', '#1e6bf1'); // cos blue
    tspan2.textContent = xPart;
    text.appendChild(tspan2);
    
    const tspan3 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan3.textContent = ', ';
    text.appendChild(tspan3);
    
    const tspan4 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan4.setAttribute('fill', '#e03746'); // sin red
    tspan4.textContent = yPart;
    text.appendChild(tspan4);
    
    const tspan5 = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
    tspan5.textContent = ')';
    text.appendChild(tspan5);
    
    svg.appendChild(text);
  }
}

function renderTable(a) {
  const symbolic = exactTrigStrings(a.deg);
  const numeric = trigData(a);
  const t = symbolic || numeric;
  const rows = [
    ['cos', 'cos', 'row-cos'],
    ['sin', 'sin', 'row-sin'],
    ['tan', 'tan', 'row-tan'],
    ['sec', 'sec', 'row-sec'],
    ['csc', 'csc', 'row-csc'],
    ['cot', 'cot', 'row-cot'],
  ];
  tableBody.innerHTML = rows
    .map(([label, key, cls]) => {
      const sym = symbolic ? symbolic[key] : null;
      const num = numeric[key];
      let val;
      if (!isFinite(num)) {
        val = sym || 'undef';
      } else if (sym) {
        // For integer-like symbolic values, just show the integer; otherwise show "symbolic (decimal)"
        const isIntLike = /^-?\d+$/.test(sym);
        if (isIntLike) {
          val = sym;
        } else {
        val = `${sym} (${fmt(num)})`;
        }
      } else {
        val = fmt(num);
      }
      return `<tr class="${cls}"><td>${label}</td><td>${val}</td></tr>`;
    })
    .join('');
}

function setPhase(phase, message) {
  state.phase = phase;
  if (message) statusEl.textContent = message;
}

function initializeApp() {
  clearTimers();
  state.phase = 'idle';
  state.mode = 'idle';
  state.quizType = 'none';
  state.history = [];
  state.index = -1;
  state.coterminalTarget = null;
  state.currentIdentity = null;
  state.isPaused = false;
  quizModeSelect.value = 'none';
  questionOverlay.classList.remove('show');
  startStopBtn.textContent = 'Start';
  tagEl.textContent = 'Click an angle to see values';
  tableBody.innerHTML = '';
  statusEl.textContent = 'Full unit circle';
  drawBase();
  drawSpecialTrianglesOverlay(true);
  drawStaticLabels();
}

function startScreensaver() {
  clearTimers();
  state.phase = 'screensaver';
  state.mode = 'idle';
  state.quizType = 'none';
  state.history = [];
  state.index = -1;
  state.coterminalTarget = null;
  state.currentIdentity = null;
  state.isPaused = false;
  quizModeSelect.value = 'none';
  questionOverlay.classList.remove('show');
  startStopBtn.textContent = 'Stop';
  tableBody.innerHTML = '';
  statusEl.textContent = 'Screensaver: Cycling through all angles';
  
  // Cycle through ALL angles including axis angles (0, 90, 180, 270) and special triangles
  const screensaverAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];
  state.screensaverIndex = 0; // Reset index
  
  function showNextTriangle() {
    if (state.mode !== 'idle') return; // stop if quiz started
    
    // Check if we've completed a full rotation (16 angles)
    if (state.screensaverIndex > 0 && state.screensaverIndex % screensaverAngles.length === 0) {
      // Show full circle flash
      statusEl.textContent = 'Full rotation complete - showing all angles';
      drawBase();
      drawSpecialTrianglesOverlay(false);
      drawStaticLabels();
      // Add flash effect
      svg.classList.add('flash-glow');
      state.timers.push(setTimeout(() => {
        svg.classList.remove('flash-glow');
      }, 1000));
      
      // Wait 3 seconds before continuing to next triangle
      state.timers.push(setTimeout(() => {
        if (state.mode !== 'idle') return;
        continueScreensaver();
      }, 3000));
    } else {
      continueScreensaver();
    }
  }
  
  function continueScreensaver() {
    if (state.mode !== 'idle') return;
    
    const angle = screensaverAngles[state.screensaverIndex % screensaverAngles.length];
    state.current = angles.find(a => a.deg === angle);
    state.screensaverIndex++;
    
    drawTriangle(state.current, { showLabels: true, showAnswers: true });
    const coord = state.current.coord.replace('(', '').replace(')', '');
    const [xLabel, yLabel] = coord.split(',').map((s) => s.trim());
    tagEl.innerHTML = 
      `<div>${state.current.deg}°</div>` +
      `<div>${state.current.rad}</div>` +
      `<div class="xy-wrapper">( <span class="xy-x">${xLabel}</span>, <span class="xy-y">${yLabel}</span> )</div>`;
    renderTable(state.current);
    statusEl.textContent = `Angle: ${state.current.deg}°`;
    
    // Advance to next after 4 seconds
    state.timers.push(setTimeout(showNextTriangle, 4000));
  }
  
  showNextTriangle();
}

function showScreensaver() {
  // Alias for startScreensaver for backward compatibility
  startScreensaver();
}


function showReveal(fromClick = false) {
  if (!state.current) return;
  setPhase('reveal', fromClick ? 'Selected angle' : 'Reveal: values shown');
  
  // Show angle first
  tagEl.innerHTML = `<div>${state.current.deg}°</div><div>${state.current.rad}</div>`;
  renderTable(state.current);
  drawTriangle(state.current, { showLabels: true, showAnswers: true });
  
  // Then show (x,y) after brief delay
  state.timers.push(setTimeout(() => {
    const coord = state.current.coord.replace('(', '').replace(')', '');
    const [xLabel, yLabel] = coord.split(',').map((s) => s.trim());
    tagEl.innerHTML =
      `<div>${state.current.deg}°</div>` +
      `<div>${state.current.rad}</div>` +
      `<div class="xy-wrapper">( <span class="xy-x">${xLabel}</span>, <span class="xy-y">${yLabel}</span> )</div>`;
  }, 1500)); // 1.5 second delay
}

function startUnitCircleQuestion() {
  clearTimers();
  state.phase = 'intro';
  const next = quizAngles[Math.floor(Math.random() * quizAngles.length)];
  state.current = next;
  // manage history
  if (state.history.length === 0 || state.history[state.history.length - 1].deg !== next.deg) {
    state.history.push(next);
    state.index = state.history.length - 1;
  }
  tagEl.textContent = '—';
  tableBody.innerHTML = '';
  setPhase('intro', 'Observe the highlighted triangle (4s)');
  drawTriangle(state.current, { showLabels: false });

  // After 4 seconds, show the angle ONLY on the circle (no answers yet)
  state.timers.push(setTimeout(() => {
    setPhase('guess', 'Guess the angle - revealed for 6s');
    // Redraw triangle with angle labels visible (only for this triangle, no (x,y) yet)
    drawTriangle(state.current, { showLabels: true, showAnswers: false });
    // Show ONLY angle, hide table and xy coordinates
    tagEl.innerHTML = `<div class="angle-reveal-pulse">${state.current.deg}°</div><div>${state.current.rad}</div>`;
    tableBody.innerHTML = '';
  }, 4000));

  // After 10 seconds total (6 second angle-only window), show (x,y) and table
  state.timers.push(setTimeout(() => {
    setPhase('reveal', 'Coordinates and values revealed');
    // Redraw the triangle with all answer information
    drawTriangle(state.current, { showLabels: true, showAnswers: true });
    const coord = state.current.coord.replace('(', '').replace(')', '');
    const [xLabel, yLabel] = coord.split(',').map((s) => s.trim());
    tagEl.innerHTML =
      `<div>${state.current.deg}°</div>` +
      `<div>${state.current.rad}</div>` +
      `<div class="xy-wrapper">( <span class="xy-x">${xLabel}</span>, <span class="xy-y">${yLabel}</span> )</div>`;
    renderTable(state.current);
  }, 10000));

  // After 24 seconds, flash full circle
  state.timers.push(setTimeout(() => {
    setPhase('flash', 'Full circle flash');
    drawBase();
    drawSpecialTrianglesOverlay(false);
    drawStaticLabels();
    // Add flash effect
    svg.classList.add('flash-glow');
    state.timers.push(setTimeout(() => {
      svg.classList.remove('flash-glow');
    }, 1000));
  }, 24000));

  // Auto-advance after reveal phase
  state.timers.push(setTimeout(() => {
    if (state.mode === 'quiz' && state.quizType === 'unit-circle') {
      startUnitCircleQuestion();
    }
  }, 34000));
}

function startCoterminalQuestion() {
  clearTimers();
  state.phase = 'guess';
  
  // Pick a random angle from our standard set
  const baseAngle = angles[Math.floor(Math.random() * angles.length)];
  
  // Generate a coterminal angle by adding/subtracting multiples of 360° (or 2π)
  const multiplier = Math.floor(Math.random() * 5) - 2; // -2 to +2
  const coterminalDeg = baseAngle.deg + (multiplier * 360);
  
  // Store the target (the base angle on the unit circle)
  state.coterminalTarget = baseAngle;
  state.current = null; // user hasn't selected yet
  
  // Display the question prominently above the circle
  const useRadians = state.angleFormat === 'radians' || 
    (state.angleFormat === 'both' && Math.random() > 0.5);
  
  let questionText = '';
  if (useRadians) {
    // Convert to radians
    const coterminalRad = (coterminalDeg * Math.PI) / 180;
    // Format nicely
    let radStr = '';
    if (coterminalRad === 0) radStr = '0';
    else if (coterminalRad === Math.PI) radStr = 'π';
    else if (coterminalRad === -Math.PI) radStr = '-π';
    else if (Math.abs(coterminalRad) === Math.PI / 2) radStr = coterminalRad > 0 ? 'π/2' : '-π/2';
    else if (Math.abs(coterminalRad) === Math.PI * 2) radStr = coterminalRad > 0 ? '2π' : '-2π';
    else {
      // Try to simplify
      const frac = coterminalRad / Math.PI;
      if (Number.isInteger(frac)) {
        radStr = frac === 1 ? 'π' : frac === -1 ? '-π' : `${frac}π`;
      } else {
        radStr = `${coterminalRad.toFixed(3)}`;
      }
    }
    questionText = `Find coterminal angle: ${radStr} radians`;
  } else {
    questionText = `Find coterminal angle: ${coterminalDeg}°`;
  }
  
  // Show large prominent question above circle
  questionOverlay.textContent = questionText;
  questionOverlay.classList.add('show');
  
  tagEl.textContent = '—';
  tableBody.innerHTML = '';
  statusEl.textContent = 'Click on the unit circle to select the coterminal angle';
  
  // Draw full circle with labels AND special triangles
  drawBase();
  drawSpecialTrianglesOverlay(false); // show triangles but not interactive
  drawStaticLabels();
  
  // Highlight all possible coterminal positions (same point on circle)
  const { x, y } = polar(1, baseAngle.deg);
  const point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  point.setAttribute('cx', x);
  point.setAttribute('cy', y);
  point.setAttribute('r', '0.035');
  point.setAttribute('fill', '#40e0d0');
  point.setAttribute('stroke', '#40e0d0');
  point.setAttribute('stroke-width', '0.008');
  svg.appendChild(point);
  
  // 10-second timeout to show answer
  state.timers.push(setTimeout(() => {
    if (state.mode === 'quiz' && state.quizType === 'coterminal' && !state.current) {
      // User took too long, show answer
      state.current = state.coterminalTarget;
      statusEl.textContent = 'Time\'s up! Correct answer shown.';
      tagEl.textContent = `${state.coterminalTarget.deg}° (${state.coterminalTarget.rad}) is coterminal`;
      renderTable(state.coterminalTarget);
      drawTriangle(state.coterminalTarget, { showLabels: true });
      
      // Auto-advance after showing answer
      state.timers.push(setTimeout(() => {
        if (state.mode === 'quiz' && state.quizType === 'coterminal') {
          startCoterminalQuestion();
        }
      }, 3000));
    }
  }, 10000));
}

function checkCoterminalAnswer(selectedAngle) {
  if (!state.coterminalTarget) return false;
  // Angles are coterminal if they differ by multiples of 360°
  const diff = Math.abs(selectedAngle.deg - state.coterminalTarget.deg);
  const normalizedDiff = diff % 360;
  return normalizedDiff === 0 || normalizedDiff === 360 - (diff % 360);
}

// Trig identities data
const trigIdentities = [
  {
    name: 'Sum of Sine',
    formula: 'sin(A + B) = sin A cos B + cos A sin B',
    description: 'Breaks a sine of a combined angle into pieces you can evaluate from known values of sin and cos.',
    usage: 'Use when you see sin(… + …) and you want exact values or to expand an expression.\nExample: sin(75°)=sin(45°+30°)= (√2/2)(√3/2) + (√2/2)(1/2).'
  },
  {
    name: 'Difference of Sine',
    formula: 'sin(A - B) = sin A cos B - cos A sin B',
    description: 'Turns sin of a difference into a combination of sin/cos terms.',
    usage: 'Use when you see sin(… − …) or need an exact value like sin(15°).\nExample: sin(15°)=sin(45°−30°)=(√2/2)(√3/2) − (√2/2)(1/2).'
  },
  {
    name: 'Sum of Cosine',
    formula: 'cos(A + B) = cos A cos B - sin A sin B',
    description: 'Expands cos of a sum into products of cos and sin.',
    usage: 'Use when you see cos(… + …) or want an exact value.\nExample: cos(75°)=cos(45°+30°)= (√2/2)(√3/2) − (√2/2)(1/2).'
  },
  {
    name: 'Difference of Cosine',
    formula: 'cos(A - B) = cos A cos B + sin A sin B',
    description: 'Expands cos of a difference into products of cos and sin.',
    usage: 'Use when you see cos(… − …) or want an exact value.\nExample: cos(15°)=cos(45°−30°)= (√2/2)(√3/2) + (√2/2)(1/2).'
  },
  {
    name: 'Sum of Tangent',
    formula: 'tan(A + B) = (tan A + tan B) / (1 - tan A tan B)',
    description: 'Computes tangent of a sum using tangents of the parts.',
    usage: 'Use when you see tan(… + …) or want an exact value.\nExample: tan(75°) = (tan45°+tan30°)/(1−tan45°tan30°) = (1+1/√3)/(1−1/√3).'
  },
  {
    name: 'Double Angle Sine',
    formula: 'sin(2θ) = 2 sin θ cos θ',
    description: 'Rewrites sin(2θ) as a product of sinθ and cosθ.',
    usage: 'Use when you see sin(2θ) and want to replace it with sin/cos (often for simplification or integration).\nExample: If sinθ=3/5 and cosθ=4/5, then sin(2θ)=2(3/5)(4/5)=24/25.'
  },
  {
    name: 'Double Angle Cosine',
    formula: 'cos(2θ) = cos² θ - sin² θ = 2cos² θ - 1 = 1 - 2sin² θ',
    description: 'Multiple equivalent ways to rewrite cos(2θ), letting you choose the form that matches what you know.',
    usage: 'Use the form that fits your given info (only sin, only cos, or both).\nExample: If you know sinθ only, use cos(2θ)=1−2sin²θ.\nIf sinθ=3/5, cos(2θ)=1−2(9/25)=7/25.'
  },
  {
    name: 'Double Angle Tangent',
    formula: 'tan(2θ) = 2 tan θ / (1 - tan² θ)',
    description: 'Rewrites tan(2θ) in terms of tanθ.',
    usage: 'Use when you have tanθ and need tan(2θ) without computing sin/cos.\nExample: If tanθ=1/2, tan(2θ)= (2·1/2)/(1−1/4)=1/(3/4)=4/3.'
  },
  {
    name: 'Pythagorean Identity',
    formula: 'sin² θ + cos² θ = 1',
    description: 'The unit-circle relationship that lets you swap between sin and cos.',
    usage: 'Use to eliminate sin² or cos², or to find one trig value from the other.\nExample: If cosθ=4/5, then sin²θ=1−16/25=9/25 ⇒ sinθ=±3/5.'
  },
  {
    name: 'Secant Identity',
    formula: '1 + tan² θ = sec² θ',
    description: 'Pythagorean-style identity for tangent/secant.',
    usage: 'Use to replace sec²θ with 1+tan²θ (or vice versa), common in derivatives/integrals.\nExample: ∫sec²θ dθ = ∫(1+tan²θ)dθ if you’re substituting u=tanθ.'
  },
  {
    name: 'Cosecant Identity',
    formula: '1 + cot² θ = csc² θ',
    description: 'Pythagorean-style identity for cotangent/cosecant.',
    usage: 'Use to replace csc²θ with 1+cot²θ, often when substituting u=cotθ.\nExample: d/dθ(cotθ)=−csc²θ, and csc²θ=1+cot²θ helps rewrite everything in cot.'
  },
  {
    name: 'Half Angle Sine',
    formula: 'sin(θ/2) = ±√[(1 - cos θ) / 2]',
    description: 'Computes sin(θ/2) from cosθ (useful when halving angles).',
    usage: 'Use when you need sin(θ/2) but only know cosθ.\nExample: If cosθ=1/2, then sin(θ/2)=±√[(1−1/2)/2]=±√(1/4)=±1/2 (sign depends on quadrant of θ/2).'
  },
  {
    name: 'Half Angle Cosine',
    formula: 'cos(θ/2) = ±√[(1 + cos θ) / 2]',
    description: 'Computes cos(θ/2) from cosθ.',
    usage: 'Use when you need cos(θ/2) from a known cosθ.\nExample: If cosθ=1/2, then cos(θ/2)=±√[(1+1/2)/2]=±√(3/4)=±√3/2 (sign depends on quadrant).'
  },
  {
    name: 'Product to Sum - Sine Cosine',
    formula: 'sin A cos B = ½[sin(A + B) + sin(A - B)]',
    description: 'Turns a product into a sum (great for integration and signal “mixing” problems).',
    usage: 'Use when you see a product like sinA·cosB and want to integrate or simplify.\nExample: ∫sinx cos(3x) dx → ½∫[sin(4x)+sin(−2x)] dx.'
  },
  {
    name: 'Product to Sum - Cosine Cosine',
    formula: 'cos A cos B = ½[cos(A + B) + cos(A - B)]',
    description: 'Turns cosA·cosB into a sum of cosines.',
    usage: 'Use to simplify products or integrate.\nExample: ∫cosx cos(3x) dx → ½∫[cos(4x)+cos(−2x)] dx = ½∫[cos(4x)+cos(2x)] dx.'
  },
  {
    name: 'Sum to Product - Sine',
    formula: 'sin A + sin B = 2 sin[(A + B)/2] cos[(A - B)/2]',
    description: 'Turns a sum into a product (useful for factoring and solving).',
    usage: 'Use when you want to factor or find zeros.\nExample: sinx+sin3x = 2 sin(2x) cos(x). Now zeros come from sin(2x)=0 or cos(x)=0.'
  },
  {
    name: 'Sum to Product - Cosine',
    formula: 'cos A + cos B = 2 cos[(A + B)/2] cos[(A - B)/2]',
    description: 'Factors a sum of cosines into a product.',
    usage: 'Use for factoring and solving.\nExample: cosx+cos3x = 2 cos(2x) cos(x). This is easier to set equal to 0 than the original.'
  }
];

function startTrigIdentityQuestion() {
  clearTimers();
  state.phase = 'guess';
  
  // Pick a random identity
  const identity = trigIdentities[Math.floor(Math.random() * trigIdentities.length)];
  state.currentIdentity = identity;
  
  // Show question prominently above circle
  questionOverlay.innerHTML = `
    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">${identity.name}</div>
    <div class="formula">${identity.formula}</div>
  `;
  questionOverlay.classList.add('show');
  
  tagEl.textContent = '—';
  tableBody.innerHTML = '';
  statusEl.textContent = 'Think about what this identity means...';
  
  // Draw full circle
  drawBase();
  drawStaticLabels();
  
  // Wait 5 seconds, then show answer
  state.timers.push(setTimeout(() => {
    questionOverlay.innerHTML = `
      <div style="font-size: 1.2rem; margin-bottom: 0.5rem; color: var(--accent);">${identity.name}</div>
      <div class="formula">${identity.formula}</div>
      <div class="description">${identity.description}</div>
      <div class="usage">${identity.usage}</div>
    `;
    statusEl.textContent = 'Identity explained (30 seconds)';
    
    // Auto-advance after showing answer for 30 seconds
    state.timers.push(setTimeout(() => {
      if (state.mode === 'quiz' && state.quizType === 'trig-functions') {
        startTrigIdentityQuestion();
      }
    }, 30000)); // Show answer for 30 seconds
  }, 5000));
}

function startQuiz() {
  const quizType = quizModeSelect.value;
  if (quizType === 'none') {
    stopQuiz();
    return;
  }
  
  state.mode = 'quiz';
  state.quizType = quizType;
  startStopBtn.textContent = 'Stop';
  
  if (quizType === 'unit-circle') {
    startUnitCircleQuestion();
  } else if (quizType === 'coterminal') {
    startCoterminalQuestion();
  } else if (quizType === 'trig-functions') {
    startTrigIdentityQuestion();
  } else if (quizType === 'none') {
    startScreensaver();
  }
}

function stopQuiz() {
  clearTimers();
  initializeApp();
}

quizModeSelect.addEventListener('change', () => {
  // Don't auto-start; just stop any running quiz and update UI.
  if (state.mode === 'quiz') stopQuiz();
  if (quizModeSelect.value === 'none') {
    initializeApp();
  } else {
    startStopBtn.textContent = 'Start';
    statusEl.textContent = 'Ready. Press Start.';
    // Draw default view for that mode
    drawBase();
    drawSpecialTrianglesOverlay(true);
    drawStaticLabels();
  }
});

startStopBtn.addEventListener('click', () => {
  if (state.mode === 'quiz') {
    stopQuiz();
    return;
  }
  if (quizModeSelect.value === 'none') {
    showScreensaver();
    return;
  }
  startQuiz();
});

angleFormatSelect.addEventListener('change', () => {
  state.angleFormat = angleFormatSelect.value;
  if (state.mode === 'quiz') {
    // Redraw current view with new format
    if (state.quizType === 'unit-circle' && state.current) {
      drawTriangle(state.current, { showLabels: false });
    } else if (state.quizType === 'coterminal') {
      startCoterminalQuestion();
    } else if (state.quizType === 'trig-functions') {
      // Angle format doesn't affect trig identities quiz, but redraw circle
      drawBase();
      drawStaticLabels();
    } else {
      drawBase();
      drawStaticLabels();
    }
  } else {
    drawBase();
    drawSpecialTrianglesOverlay(true);
    drawStaticLabels();
  }
});

document.addEventListener('keydown', (e) => {
  // Space: pause/resume
  if (e.code === 'Space') {
    e.preventDefault();
    if (state.mode === 'quiz') {
      state.isPaused = !state.isPaused;
      if (state.isPaused) {
        clearTimers();
        statusEl.textContent += ' [PAUSED]';
      } else {
        // Resume by restarting the current quiz type
        if (state.quizType === 'unit-circle') startUnitCircleQuestion();
        else if (state.quizType === 'coterminal') startCoterminalQuestion();
        else if (state.quizType === 'trig-functions') startTrigIdentityQuestion();
      }
    }
  }
  
  // Enter: save
  if (e.code === 'Enter') {
    e.preventDefault();
    if (state.current) {
      state.saved.push(`${state.current.deg}° (${state.current.rad})`);
      reviewEl.innerHTML = 'Saved: ' + state.saved.map((s) => `<span class="pill">${s}</span>`).join('');
    } else if (state.mode === 'quiz') {
      // In quiz mode, Enter advances to next question
      if (state.quizType === 'unit-circle') startUnitCircleQuestion();
      else if (state.quizType === 'coterminal') startCoterminalQuestion();
      else if (state.quizType === 'trig-functions') startTrigIdentityQuestion();
    }
  }
  
  if (e.code === 'ArrowRight') {
    e.preventDefault();
    if (state.mode === 'quiz') {
      if (state.quizType === 'unit-circle') startUnitCircleQuestion();
      else if (state.quizType === 'coterminal') startCoterminalQuestion();
      else if (state.quizType === 'trig-functions') startTrigIdentityQuestion();
    } else {
      // advance history by picking a new random
      state.current = angles[Math.floor(Math.random() * angles.length)];
      state.history.push(state.current);
      state.index = state.history.length - 1;
      showReveal(true);
    }
  }
  if (e.code === 'ArrowLeft') {
    e.preventDefault();
    if (state.history.length > 1 && state.index > 0) {
      state.index -= 1;
      state.current = state.history[state.index];
      clearTimers();
      showReveal(true);
    }
  }
  if (e.code === 'Escape') {
    e.preventDefault();
    stopQuiz();
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
  const p = svgPointFromEvent(evt);
  if (!p) return;
  // ignore clicks near center (avoid random picks)
  const r = Math.hypot(p.x, p.y);
  if (r < 0.35) return;
  
  if (state.mode === 'quiz' && state.quizType === 'coterminal') {
    // Coterminal quiz: check if user clicked the correct angle
    const selected = nearestAngleFromPoint(p.x, p.y);
    if (checkCoterminalAnswer(selected)) {
      state.current = selected;
      questionOverlay.classList.remove('show');
      statusEl.textContent = 'Correct! ✓';
      tagEl.textContent = `${selected.deg}° (${selected.rad}) is coterminal`;
      renderTable(selected);
      drawTriangle(selected, { showLabels: true });
      
      // Auto-advance after showing answer
      state.timers.push(setTimeout(() => {
        if (state.mode === 'quiz' && state.quizType === 'coterminal') {
          startCoterminalQuestion();
        }
      }, 3000));
    } else {
      statusEl.textContent = `Incorrect. Try again! (Correct: ${state.coterminalTarget.deg}° / ${state.coterminalTarget.rad})`;
    }
    return;
  }
  
  if (state.mode === 'quiz') return; // other quiz modes don't allow clicking
  
  // Screensaver mode: show selected angle
  state.current = nearestAngleFromPoint(p.x, p.y);
  showReveal();
});

// Initialize app with full unit circle display
initializeApp();