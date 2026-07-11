/**
 * ui.js — State Management, Event Handling, Equation Dashboard
 * Single entry-point module. Imports engine.js and renderer.js.
 */

import { computeTrajectory } from './engine.js';
import { computeScaleInfo, drawFrame, updatePlot, createChart } from './renderer.js';

// ---------------------------------------------------------------------------
// Preset table
// ---------------------------------------------------------------------------
const PRESETS = {
  // Sports
  'golf-ball':   { mass: 0.0459,  diameter: 0.0427, cd: 0.47, category: 'sports' },
  'basketball':  { mass: 0.6200,  diameter: 0.2400, cd: 0.47, category: 'sports' },
  'baseball':    { mass: 0.1450,  diameter: 0.0737, cd: 0.35, category: 'sports' },
  'ping-pong':   { mass: 0.0027,  diameter: 0.0400, cd: 0.40, category: 'sports' },
  // Firearms
  '22-lr':       { mass: 0.0024,  diameter: 0.0056, cd: 0.17, category: 'firearms' },
  '556-nato':    { mass: 0.0040,  diameter: 0.0057, cd: 0.30, category: 'firearms' },
  '45-acp':      { mass: 0.0148,  diameter: 0.0115, cd: 0.20, category: 'firearms' },
  // Ordnance
  '60mm-mortar': { mass: 1.3300,  diameter: 0.0600, cd: 0.30, category: 'ordnance' },
  'cannonball':  { mass: 5.4400,  diameter: 0.1100, cd: 0.47, category: 'ordnance' },
  'atm':         { mass: 10.500,  diameter: 0.0800, cd: 0.20, category: 'ordnance' },
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
function initState() {
  return {
    angle:    45,
    speed:    50,
    mass:     0.0459,
    diameter: 0.0427,
    cd:       0.47,
    rho:      1.225,
    gravity:  9.81,
    mode:     'realistic',
    preset:   'golf-ball',
    category: 'sports',
  };
}

let state = initState();
const _listeners = [];

export function getState() {
  return Object.freeze({ ...state });
}

export function onStateChange(listener) {
  _listeners.push(listener);
  return () => {
    const i = _listeners.indexOf(listener);
    if (i !== -1) _listeners.splice(i, 1);
  };
}

function notifyListeners() {
  const snap = getState();
  for (const fn of _listeners) fn(snap);
}

// ---------------------------------------------------------------------------
// Animation state
// ---------------------------------------------------------------------------
let trajectory = [];
let frameIndex = 0;
let animHandle = null;
let lastWallTime = null;
let currentSimTime = 0;
let trail = [];
let scaleInfo = null;
let compareMode = false;
let vacuumTrajectory = [];
let realisticTrajectory = [];

// ---------------------------------------------------------------------------
// Chart instance
// ---------------------------------------------------------------------------
let chart = null;

// ---------------------------------------------------------------------------
// rAF debounce
// ---------------------------------------------------------------------------
let rafPending = false;

function scheduleUpdate() {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(runUpdateCycle);
  }
}

function runUpdateCycle() {
  rafPending = false;
  trajectory = computeTrajectory(buildParams(state));

  // Store for compare mode
  if (state.mode === 'vacuum') {
    vacuumTrajectory = trajectory;
  } else {
    realisticTrajectory = trajectory;
  }

  const stats = statsFrom(trajectory);
  updatePlot(chart, trajectory, state.mode, compareMode);
  renderEquations(state, stats);
  restartAnimation(trajectory);
  serializeState(state);
  notifyListeners();
}

function buildParams(s) {
  return {
    angle:    s.angle,
    speed:    s.speed,
    mass:     s.mass,
    diameter: s.diameter,
    cd:       s.cd,
    rho:      s.rho,
    gravity:  s.gravity,
    dt:       0.001,
  };
}

function statsFrom(traj) {
  if (!traj || traj.length === 0) return { peakHeight: 0, range: 0, peakTime: 0 };
  const peak = traj.reduce((m, s) => (s.y > m.y ? s : m), traj[0]);
  const landing = traj[traj.length - 1];
  return { peakHeight: peak.y, range: landing.x, peakTime: peak.t };
}

// ---------------------------------------------------------------------------
// Canvas animation
// ---------------------------------------------------------------------------
function restartAnimation(traj) {
  if (animHandle) cancelAnimationFrame(animHandle);
  animHandle = null;
  frameIndex = 0;
  trail = [];
  lastWallTime = null;
  currentSimTime = 0;

  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;

  // Sync canvas resolution to display size
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetWidth * (9 / 16);

  if (!traj || traj.length === 0) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  scaleInfo = computeScaleInfo(traj, canvas.width, canvas.height);
  animHandle = requestAnimationFrame(animFrame);
}

function animFrame(wallTimestamp) {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('Canvas 2D context unavailable'); return; }

  if (lastWallTime === null) lastWallTime = wallTimestamp;
  const elapsed = (wallTimestamp - lastWallTime) / 1000; // seconds
  lastWallTime = wallTimestamp;
  currentSimTime += elapsed;

  // Advance frame index to match wall time
  while (
    frameIndex < trajectory.length - 1 &&
    trajectory[frameIndex + 1].t <= currentSimTime
  ) {
    frameIndex++;
  }

  trail.push(trajectory[frameIndex]);
  if (trail.length > 200) trail.shift();

  const isLast = frameIndex >= trajectory.length - 1;
  const totalRange = trajectory.length > 0 ? trajectory[trajectory.length - 1].x : 0;

  drawFrame(
    ctx,
    trajectory[frameIndex],
    trail,
    scaleInfo,
    state.category,
    isLast,
    totalRange
  );

  if (!isLast) {
    animHandle = requestAnimationFrame(animFrame);
  }
}

// ---------------------------------------------------------------------------
// Control Panel HTML construction
// ---------------------------------------------------------------------------
const SLIDERS = [
  { id: 'angle',    label: 'Launch Angle',  min: 0,     max: 90,   step: 1,     unit: '°',      key: 'angle' },
  { id: 'speed',    label: 'Initial Speed', min: 1,     max: 2000, step: 1,     unit: ' m/s',   key: 'speed' },
  { id: 'mass',     label: 'Mass',          min: 0.001, max: 50,   step: 0.001, unit: ' kg',    key: 'mass' },
  { id: 'diameter', label: 'Diameter',      min: 0.005, max: 0.5,  step: 0.001, unit: ' m',     key: 'diameter' },
  { id: 'cd',       label: 'Drag Coeff Cₐ', min: 0.05,  max: 1.0,  step: 0.01,  unit: '',       key: 'cd' },
  { id: 'rho',      label: 'Air Density ρ', min: 0.0,   max: 1.5,  step: 0.01,  unit: ' kg/m³', key: 'rho' },
  { id: 'gravity',  label: 'Gravity g',     min: 0.1,   max: 25.0, step: 0.1,   unit: ' m/s²',  key: 'gravity' },
];

function buildControlPanel() {
  const panel = document.getElementById('control-panel');
  if (!panel) return;

  panel.innerHTML = `
    <h2 class="text-blue-400 text-lg font-semibold mb-4">Controls</h2>

    <!-- Preset Selector -->
    <div class="mb-5">
      <label class="block text-sm text-gray-400 mb-1">Preset</label>
      <select id="preset-select"
        class="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500">
        <option value="">— Select Preset —</option>
        <optgroup label="Sports">
          <option value="golf-ball">Golf Ball</option>
          <option value="basketball">Basketball</option>
          <option value="baseball">Baseball</option>
          <option value="ping-pong">Ping Pong</option>
        </optgroup>
        <optgroup label="Firearms">
          <option value="22-lr">.22 LR</option>
          <option value="556-nato">5.56 NATO</option>
          <option value="45-acp">.45 ACP</option>
        </optgroup>
        <optgroup label="Ordnance">
          <option value="60mm-mortar">60mm Mortar</option>
          <option value="cannonball">Cannonball</option>
          <option value="atm">Anti-Tank Missile</option>
        </optgroup>
      </select>
    </div>

    <!-- Mode Toggle -->
    <div class="mb-5">
      <label class="block text-sm text-gray-400 mb-1">Simulation Mode</label>
      <div class="flex gap-2">
        <button id="btn-realistic"
          class="mode-btn flex-1 py-1.5 rounded text-sm font-semibold transition-colors"
          data-mode="realistic">Realistic</button>
        <button id="btn-vacuum"
          class="mode-btn flex-1 py-1.5 rounded text-sm font-semibold transition-colors"
          data-mode="vacuum">Vacuum</button>
      </div>
    </div>

    <!-- Compare Button -->
    <div class="mb-5">
      <button id="btn-compare"
        class="w-full py-1.5 rounded text-sm font-semibold bg-purple-700 hover:bg-purple-600 transition-colors text-white">
        Compare Vacuum &amp; Realistic
      </button>
    </div>

    <!-- Sliders -->
    <div id="slider-container" class="space-y-4"></div>
  `;

  // Inject slider rows
  const container = document.getElementById('slider-container');
  for (const s of SLIDERS) {
    const val = state[s.key];
    const row = document.createElement('div');
    row.innerHTML = `
      <div class="flex justify-between items-center mb-0.5">
        <label for="${s.id}-slider" class="text-sm text-gray-300">${s.label}</label>
        <span id="${s.id}-display" class="text-sm font-mono text-blue-300">${formatVal(val, s.step)}${s.unit}</span>
      </div>
      <input type="range" id="${s.id}-slider"
        min="${s.min}" max="${s.max}" step="${s.step}" value="${val}"
        data-key="${s.key}" data-unit="${s.unit}" data-step="${s.step}"
        class="w-full accent-blue-500 h-2 rounded cursor-pointer" />
    `;
    container.appendChild(row);
  }

  // Update mode button visual state
  updateModeButtons();

  // Event: sliders
  document.getElementById('slider-container').addEventListener('input', handleSliderInput);

  // Event: preset
  document.getElementById('preset-select').addEventListener('change', handlePresetSelect);

  // Event: mode buttons
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleModeToggle(btn.dataset.mode));
  });

  // Event: compare
  document.getElementById('btn-compare').addEventListener('click', handleCompare);
}

function formatVal(val, step) {
  // Show appropriate decimal places based on step size
  const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return Number(val).toFixed(decimals);
}

function updateModeButtons() {
  const realistic = document.getElementById('btn-realistic');
  const vacuum = document.getElementById('btn-vacuum');
  if (!realistic || !vacuum) return;
  if (state.mode === 'realistic') {
    realistic.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-orange-600 text-white';
    vacuum.className    = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-gray-600 text-gray-300';
  } else {
    vacuum.className    = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-blue-600 text-white';
    realistic.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-gray-600 text-gray-300';
  }
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------
function handleSliderInput(event) {
  const input = event.target;
  if (input.tagName !== 'INPUT' || input.type !== 'range') return;

  const key = input.dataset.key;
  const unit = input.dataset.unit;
  const step = parseFloat(input.dataset.step);
  const val = parseFloat(input.value);

  state[key] = val;

  const display = document.getElementById(`${key}-display`);
  if (display) display.textContent = `${formatVal(val, step)}${unit}`;

  // Highlight matching equation variables
  highlightVars([key]);

  scheduleUpdate();
}

function handlePresetSelect(event) {
  const key = event.target.value;
  if (!key || !PRESETS[key]) return;

  const preset = PRESETS[key];
  state.mass     = preset.mass;
  state.diameter = preset.diameter;
  state.cd       = preset.cd;
  state.preset   = key;
  state.category = preset.category;

  // Sync sliders and displays
  for (const fieldKey of ['mass', 'diameter', 'cd']) {
    const slider = document.getElementById(`${fieldKey}-slider`);
    const display = document.getElementById(`${fieldKey}-display`);
    const cfg = SLIDERS.find((s) => s.key === fieldKey);
    if (slider) slider.value = state[fieldKey];
    if (display && cfg) display.textContent = `${formatVal(state[fieldKey], cfg.step)}${cfg.unit}`;
  }

  highlightVars(['mass', 'diameter', 'cd']);
  scheduleUpdate();
}

function handleModeToggle(mode) {
  state.mode = mode;
  state.rho  = mode === 'vacuum' ? 0.0 : 1.225;
  compareMode = false;

  const rhoSlider  = document.getElementById('rho-slider');
  const rhoDisplay = document.getElementById('rho-display');
  if (rhoSlider)  rhoSlider.value = state.rho;
  if (rhoDisplay) rhoDisplay.textContent = `${state.rho.toFixed(3)} kg/m³`;

  updateModeButtons();
  scheduleUpdate();
}

function handleCompare() {
  // Compute both trajectories and show them simultaneously
  const vacParams  = { ...buildParams(state), rho: 0.0 };
  const realParams = { ...buildParams(state), rho: 1.225 };

  vacuumTrajectory    = computeTrajectory(vacParams);
  realisticTrajectory = computeTrajectory(realParams);

  if (!chart) return;

  const vacuumColor   = 'rgba(59,130,246,1)';
  const realisticColor = 'rgba(249,115,22,1)';

  const toPoints = (traj) => traj.map((s) => ({ x: s.x, y: s.y }));
  const maxX = Math.max(
    ...vacuumTrajectory.map((s) => s.x),
    ...realisticTrajectory.map((s) => s.x)
  ) * 1.05;
  const maxY = Math.max(
    ...vacuumTrajectory.map((s) => s.y),
    ...realisticTrajectory.map((s) => s.y)
  ) * 1.1;

  chart.data.datasets = [
    {
      label: 'Vacuum',
      data: toPoints(vacuumTrajectory),
      borderColor: vacuumColor,
      backgroundColor: 'rgba(59,130,246,0.12)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      fill: true,
    },
    {
      label: 'Realistic',
      data: toPoints(realisticTrajectory),
      borderColor: realisticColor,
      backgroundColor: 'rgba(249,115,22,0.12)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      fill: true,
    },
  ];
  chart.options.scales.x.max = maxX;
  chart.options.scales.y.max = maxY;
  chart.update('none');

  compareMode = true;
  // Animate the current mode trajectory
  trajectory = state.mode === 'vacuum' ? vacuumTrajectory : realisticTrajectory;
  restartAnimation(trajectory);
}

// ---------------------------------------------------------------------------
// Equation Dashboard (KaTeX)
// ---------------------------------------------------------------------------
const VAR_SLIDER_MAP = {
  angle:    ['theta'],
  speed:    ['v_0'],
  mass:     ['m'],
  diameter: ['d', 'A'],
  cd:       ['C_d'],
  rho:      ['rho'],
  gravity:  ['g'],
};

function renderEquations(s, stats) {
  const panel = document.getElementById('equation-panel');
  if (!panel) return;

  const sig = (n) => {
    if (n === 0) return '0';
    const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(n))));
    return Number(n.toPrecision(3)).toFixed(d);
  };

  const theta_deg = s.angle;
  const theta_rad = (s.angle * Math.PI / 180).toFixed(4);
  const v0        = sig(s.speed);
  const g         = sig(s.gravity);

  // Build equation HTML safely using KaTeX
  function katexBlock(latex, label) {
    try {
      return katex.renderToString(latex, { throwOnError: true, displayMode: true });
    } catch (e) {
      return `<span class="text-yellow-400 text-sm">⚠ Equation error: ${escHtml(latex)}</span>`;
    }
  }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const xEqLatex   = String.raw`x(t) = v_0 \cos(\theta)\cdot t`;
  const xNumLatex  = String.raw`x(t) = ${v0}\cos(${theta_deg}°)\cdot t`;
  const yEqLatex   = String.raw`y(t) = v_0 \sin(\theta)\cdot t - \tfrac{1}{2}g\,t^2`;
  const yNumLatex  = String.raw`y(t) = ${v0}\sin(${theta_deg}°)\cdot t - \tfrac{1}{2}(${g})t^2`;
  const vEqLatex   = String.raw`v(t) = \sqrt{v_x^2 + v_y^2}`;
  const fdEqLatex  = String.raw`F_d = \tfrac{1}{2}\rho\, v^2\, C_d\, A`;
  const fdNumLatex = String.raw`F_d = \tfrac{1}{2}(${sig(s.rho)})\,v^2\,(${sig(s.cd)})\,\pi\!\left(\tfrac{${sig(s.diameter)}}{2}\right)^2`;

  const dragBlock = s.mode === 'realistic' ? `
    <div class="eq-block mb-3" data-vars="rho,C_d,d,A">
      <div class="text-xs text-gray-400 mb-1">Drag Force</div>
      ${katexBlock(fdEqLatex)}
      <div class="text-xs text-gray-500 mt-1">${katexBlock(fdNumLatex)}</div>
    </div>` : '';

  panel.innerHTML = `
    <h2 class="text-blue-400 text-lg font-semibold mb-4">Equations</h2>

    <div class="eq-block mb-4" data-vars="v_0,theta">
      <div class="text-xs text-gray-400 mb-1">Horizontal Position</div>
      ${katexBlock(xEqLatex)}
      <div class="text-xs text-gray-500 mt-1">${katexBlock(xNumLatex)}</div>
    </div>

    <div class="eq-block mb-4" data-vars="v_0,theta,g">
      <div class="text-xs text-gray-400 mb-1">Vertical Position</div>
      ${katexBlock(yEqLatex)}
      <div class="text-xs text-gray-500 mt-1">${katexBlock(yNumLatex)}</div>
    </div>

    <div class="eq-block mb-4" data-vars="v_0">
      <div class="text-xs text-gray-400 mb-1">Speed</div>
      ${katexBlock(vEqLatex)}
    </div>

    ${dragBlock}

    <hr class="border-gray-700 my-4" />

    <div class="text-sm space-y-1">
      <div class="flex justify-between">
        <span class="text-gray-400">Peak Height</span>
        <span class="text-blue-300 font-mono">${stats.peakHeight.toFixed(2)} m</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Range</span>
        <span class="text-blue-300 font-mono">${stats.range.toFixed(2)} m</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Mode</span>
        <span class="${s.mode === 'realistic' ? 'text-orange-400' : 'text-blue-400'} font-semibold capitalize">${s.mode}</span>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Variable highlight animation
// ---------------------------------------------------------------------------
let _highlightTimers = {};

function highlightVars(changedKeys) {
  const varNames = changedKeys.flatMap((k) => VAR_SLIDER_MAP[k] || []);
  if (varNames.length === 0) return;

  const panel = document.getElementById('equation-panel');
  if (!panel) return;

  // Find eq-blocks whose data-vars include any changed variable
  panel.querySelectorAll('.eq-block').forEach((block) => {
    const vars = (block.dataset.vars || '').split(',');
    if (varNames.some((v) => vars.includes(v))) {
      block.classList.add('highlight-var');
      clearTimeout(_highlightTimers[block.dataset.vars]);
      _highlightTimers[block.dataset.vars] = setTimeout(() => {
        block.classList.remove('highlight-var');
      }, 1300);
    }
  });
}

// ---------------------------------------------------------------------------
// URL State Serialization
// ---------------------------------------------------------------------------
function serializeState(s) {
  const params = new URLSearchParams({
    angle:   s.angle,
    speed:   s.speed,
    mass:    s.mass,
    diam:    s.diameter,
    cd:      s.cd,
    rho:     s.rho,
    gravity: s.gravity,
    mode:    s.mode,
  });
  try {
    history.replaceState(null, '', '?' + params.toString());
  } catch (_) {
    // Silent fail in restricted environments
  }
}

const URL_RANGES = {
  angle:   [0, 90],
  speed:   [1, 2000],
  mass:    [0.001, 50],
  diam:    [0.005, 0.5],
  cd:      [0.05, 1.0],
  rho:     [0.0, 1.5],
  gravity: [0.1, 25.0],
};

function parseQueryString(qs) {
  const params = new URLSearchParams(qs);
  const partial = {};

  for (const [key, rawVal] of params.entries()) {
    if (key === 'mode') {
      if (rawVal === 'vacuum' || rawVal === 'realistic') {
        partial.mode = rawVal;
      } else {
        console.warn(`[URL] Rejected mode="${rawVal}": must be 'vacuum' or 'realistic'`);
      }
      continue;
    }

    const range = URL_RANGES[key];
    if (!range) {
      console.warn(`[URL] Rejected unknown key="${key}"`);
      continue;
    }

    const num = parseFloat(rawVal);
    if (isNaN(num)) {
      console.warn(`[URL] Rejected key="${key}" value="${rawVal}": not a number`);
      continue;
    }
    if (num < range[0] || num > range[1]) {
      console.warn(`[URL] Rejected key="${key}" value=${num}: out of range [${range[0]}, ${range[1]}]`);
      continue;
    }
    partial[key] = num;
  }

  return partial;
}

function applyURLState(partial) {
  const keyMap = { angle: 'angle', speed: 'speed', mass: 'mass', diam: 'diameter',
                   cd: 'cd', rho: 'rho', gravity: 'gravity', mode: 'mode' };
  for (const [urlKey, val] of Object.entries(partial)) {
    const stateKey = keyMap[urlKey] || urlKey;
    state[stateKey] = val;
  }
  if (partial.mode) {
    state.mode = partial.mode;
    state.rho  = partial.mode === 'vacuum' ? 0.0 : (partial.rho ?? 1.225);
  }
}

function syncSlidersFromState() {
  for (const s of SLIDERS) {
    const slider  = document.getElementById(`${s.id}-slider`);
    const display = document.getElementById(`${s.id}-display`);
    if (slider)  slider.value = state[s.key];
    if (display) display.textContent = `${formatVal(state[s.key], s.step)}${s.unit}`;
  }
  updateModeButtons();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Build control panel
  buildControlPanel();

  // Initialize Chart.js
  const chartCanvas = document.getElementById('trajectory-chart');
  if (chartCanvas && typeof Chart !== 'undefined') {
    chart = createChart(chartCanvas);
  }

  // Parse URL state if present
  const qs = window.location.search;
  if (qs && qs.length > 1) {
    const partial = parseQueryString(qs.slice(1));
    applyURLState(partial);
    syncSlidersFromState();
  }

  // Initial computation
  trajectory = computeTrajectory(buildParams(state));
  const stats = statsFrom(trajectory);

  if (chart) updatePlot(chart, trajectory, state.mode, false);
  renderEquations(state, stats);
  restartAnimation(trajectory);
  serializeState(state);

  // Sync preset select to default
  const presetSelect = document.getElementById('preset-select');
  if (presetSelect && state.preset) presetSelect.value = state.preset;
});

// Handle canvas resize
window.addEventListener('resize', () => {
  if (trajectory && trajectory.length > 0) {
    restartAnimation(trajectory);
  }
});
