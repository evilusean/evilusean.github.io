/**
 * ui.js — State Management, Event Handling, Equation Dashboard
 * Single entry-point module. Imports engine.js and renderer.js.
 */

import { computeTrajectory } from './engine.js';
import { computeScaleInfo, drawFrame, drawFullParabola, updatePlot, createChart } from './renderer.js';

// ---------------------------------------------------------------------------
// Preset table — each preset carries realistic angle, speed, gravity and
// projectile geometry so the simulation is immediately meaningful.
//
// angle   — typical launch angle for that object in real use
// speed   — realistic muzzle/throw/launch speed (m/s)
// gravity — 9.81 m/s² (Earth) unless otherwise noted
//
// Approximate real-world ranges for reference (vacuum, ~45°):
//   R ≈ v² / g   →   100 m/s ≈ 1 km,  300 m/s ≈ 9 km,  800 m/s ≈ 65 km
// ---------------------------------------------------------------------------
const PRESETS = {
  // ── Sports ────────────────────────────────────────────────────────────────
  'golf-ball':    { mass: 0.0459,  diameter: 0.0427, cd: 0.47,  category: 'sports',    angle: 12,  speed: 70,     gravity: 9.81 },  // ~200 m range
  'basketball':   { mass: 0.6200,  diameter: 0.2400, cd: 0.47,  category: 'sports',    angle: 55,  speed: 7,      gravity: 9.81 },  // free-throw arc
  'baseball':     { mass: 0.1450,  diameter: 0.0737, cd: 0.35,  category: 'sports',    angle: 35,  speed: 42,     gravity: 9.81 },  // outfield throw
  'soccer-ball':  { mass: 0.4300,  diameter: 0.2200, cd: 0.25,  category: 'sports',    angle: 30,  speed: 30,     gravity: 9.81 },  // goal-kick ~60 m
  'tennis-ball':  { mass: 0.0580,  diameter: 0.0670, cd: 0.55,  category: 'sports',    angle: 8,   speed: 55,     gravity: 9.81 },  // serve ~200 km/h
  'ping-pong':    { mass: 0.0027,  diameter: 0.0400, cd: 0.40,  category: 'sports',    angle: 5,   speed: 12,     gravity: 9.81 },
  'shot-put':     { mass: 7.2600,  diameter: 0.1300, cd: 0.47,  category: 'sports',    angle: 42,  speed: 14,     gravity: 9.81 },  // world-class ~23 m
  'shuttlecock':  { mass: 0.0050,  diameter: 0.0540, cd: 0.60,  category: 'sports',    angle: 20,  speed: 80,     gravity: 9.81 },  // smash
  'arrow':        { mass: 0.0220,  diameter: 0.0080, cd: 0.01,  category: 'sports',    angle: 5,   speed: 60,     gravity: 9.81 },  // 60 m target
  'javelin':      { mass: 0.8000,  diameter: 0.0300, cd: 0.04,  category: 'sports',    angle: 35,  speed: 30,     gravity: 9.81 },  // world-class ~90 m
  'bowling-ball': { mass: 6.8000,  diameter: 0.2160, cd: 0.47,  category: 'sports',    angle: 2,   speed: 10,     gravity: 9.81 },

  // ── Firearms ──────────────────────────────────────────────────────────────
  '22-lr':        { mass: 0.0024,  diameter: 0.0056, cd: 0.17,  category: 'firearms',  angle: 1,   speed: 370,    gravity: 9.81 },  // ~140 m effective
  '9mm':          { mass: 0.0080,  diameter: 0.0091, cd: 0.19,  category: 'firearms',  angle: 1,   speed: 370,    gravity: 9.81 },  // pistol, ~50 m effective
  '45-acp':       { mass: 0.0148,  diameter: 0.0115, cd: 0.20,  category: 'firearms',  angle: 1,   speed: 260,    gravity: 9.81 },  // subsonic pistol
  '556-nato':     { mass: 0.0040,  diameter: 0.0057, cd: 0.30,  category: 'firearms',  angle: 1,   speed: 945,    gravity: 9.81 },  // M4/AR-15, ~500 m effective
  '308-win':      { mass: 0.0116,  diameter: 0.0079, cd: 0.22,  category: 'firearms',  angle: 3,   speed: 860,    gravity: 9.81 },  // sniper, ~800 m effective
  '338-lapua':    { mass: 0.0163,  diameter: 0.0086, cd: 0.20,  category: 'firearms',  angle: 4,   speed: 915,    gravity: 9.81 },  // sniper, ~1500 m effective
  '50-bmg':       { mass: 0.0460,  diameter: 0.0127, cd: 0.21,  category: 'firearms',  angle: 5,   speed: 928,    gravity: 9.81 },  // heavy sniper, ~2000 m

  // ── Mortars (short-range high-angle) ──────────────────────────────────────
  '60mm-mortar':  { mass: 1.3300,  diameter: 0.0600, cd: 0.30,  category: 'ordnance',  angle: 75,  speed: 160,    gravity: 9.81 },  // ~3.5 km max
  '81mm-mortar':  { mass: 4.1500,  diameter: 0.0810, cd: 0.30,  category: 'ordnance',  angle: 75,  speed: 250,    gravity: 9.81 },  // ~5.6 km max
  '120mm-mortar': { mass: 13.000,  diameter: 0.1200, cd: 0.28,  category: 'ordnance',  angle: 75,  speed: 320,    gravity: 9.81 },  // ~7 km max

  // ── Artillery (the long-range stuff) ──────────────────────────────────────
  // M198 howitzer (US, 155mm): max range ~22 km standard shell, ~30 km RAP
  'm198-155mm':   { mass: 43.000,  diameter: 0.1550, cd: 0.25,  category: 'ordnance',  angle: 45,  speed: 684,    gravity: 9.81 },  // ~22 km standard
  // 2S19 Msta-S (Russian, 155mm equiv): max range ~24 km standard, ~28 km RAP
  '2s19-msta':    { mass: 43.000,  diameter: 0.1520, cd: 0.25,  category: 'ordnance',  angle: 45,  speed: 720,    gravity: 9.81 },  // ~25 km
  // 2S7 Pion (Russian, 203mm): ~37 km range — one of the world's longest-range guns
  '2s7-pion':     { mass: 110.00,  diameter: 0.2030, cd: 0.24,  category: 'ordnance',  angle: 50,  speed: 960,    gravity: 9.81 },  // ~37 km
  // BM-21 Grad MLRS (Russian, 122mm rocket): ~40 km
  'bm21-grad':    { mass: 66.000,  diameter: 0.1220, cd: 0.20,  category: 'ordnance',  angle: 50,  speed: 690,    gravity: 9.81 },  // ~40 km
  // BM-30 Smerch MLRS (Russian, 300mm): ~90 km — 20 km not even close, this does 90!
  'bm30-smerch':  { mass: 800.00,  diameter: 0.3000, cd: 0.18,  category: 'ordnance',  angle: 50,  speed: 1200,   gravity: 9.81 },  // ~90 km
  // Paris Gun (WWI, Germany): longest-range gun in history at ~130 km
  'paris-gun':    { mass: 94.000,  diameter: 0.2100, cd: 0.22,  category: 'ordnance',  angle: 55,  speed: 1600,   gravity: 9.81 },  // ~130 km
  // M110 howitzer (US, 203mm): ~29 km
  'm110-203mm':   { mass: 92.000,  diameter: 0.2030, cd: 0.25,  category: 'ordnance',  angle: 45,  speed: 684,    gravity: 9.81 },  // ~17 km

  // ── Tactical Missiles ──────────────────────────────────────────────────────
  // Hand grenade (baseline short-range)
  'grenade':      { mass: 0.4000,  diameter: 0.0600, cd: 0.47,  category: 'ordnance',  angle: 45,  speed: 15,     gravity: 9.81 },  // ~20 m throw
  // RPG-7 rocket
  'rpg':          { mass: 2.5000,  diameter: 0.0850, cd: 0.35,  category: 'ordnance',  angle: 5,   speed: 115,    gravity: 9.81 },  // ~300 m effective
  // Javelin ATGM: fire-and-forget, top-attack ~2 km
  'javelin-atgm': { mass: 11.800,  diameter: 0.1270, cd: 0.18,  category: 'ordnance',  angle: 30,  speed: 190,    gravity: 9.81 },  // ~2 km
  // Stinger MANPADS: air-defense missile, ~4 km range
  'stinger':      { mass: 10.100,  diameter: 0.0700, cd: 0.15,  category: 'ordnance',  angle: 45,  speed: 750,    gravity: 9.81 },  // ~4.8 km
  // Patriot PAC-3 interceptor: very high speed, ~70 km altitude
  'patriot':      { mass: 316.00,  diameter: 0.2500, cd: 0.12,  category: 'ordnance',  angle: 70,  speed: 1700,   gravity: 9.81 },  // ~70 km range
  // Tomahawk cruise missile (modelled as ballistic for simplicity)
  'tomahawk':     { mass: 1200.0,  diameter: 0.5200, cd: 0.10,  category: 'ordnance',  angle: 45,  speed: 250,    gravity: 9.81 },  // 1600 km range (powered)
  // Iskander-M (Russia, ballistic): ~480 km range
  'iskander':     { mass: 480.00,  diameter: 0.9200, cd: 0.10,  category: 'ordnance',  angle: 45,  speed: 2100,   gravity: 9.81 },  // ~480 km
  // Cannonball (historical, 18th-c.): ~1 km
  'cannonball':   { mass: 5.4400,  diameter: 0.1100, cd: 0.47,  category: 'ordnance',  angle: 10,  speed: 440,    gravity: 9.81 },

  // ── Strategic / Space ─────────────────────────────────────────────────────
  // Minuteman III ICBM: ~13,000 km range
  'minuteman':    { mass: 350.00,  diameter: 1.6700, cd: 0.12,  category: 'ordnance',  angle: 45,  speed: 7200,   gravity: 9.81 },
  // Sarmat (RS-28, Russia): ~18,000 km range — heaviest ICBM ever built
  'sarmat':       { mass: 1000.0,  diameter: 3.0000, cd: 0.10,  category: 'ordnance',  angle: 45,  speed: 7600,   gravity: 9.81 },
  // Saturn V first stage (for fun — max height comparison)
  'saturn-v':     { mass: 130000., diameter: 10.060, cd: 0.50,  category: 'ordnance',  angle: 80,  speed: 2300,   gravity: 9.81 },
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
function initState() {
  return {
    angle: 12, speed: 70, mass: 0.0459, diameter: 0.0427,
    cd: 0.47, rho: 1.225, gravity: 9.81,
    mode: 'realistic', preset: 'golf-ball', category: 'sports',
  };
}

let state = initState();
const _listeners = [];

export function getState() { return Object.freeze({ ...state }); }
export function onStateChange(listener) {
  _listeners.push(listener);
  return () => { const i = _listeners.indexOf(listener); if (i !== -1) _listeners.splice(i, 1); };
}
function notifyListeners() { const s = getState(); for (const fn of _listeners) fn(s); }

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
let animationComplete = false;

// ---------------------------------------------------------------------------
// Chart instance
// ---------------------------------------------------------------------------
let chart = null;

// ---------------------------------------------------------------------------
// rAF debounce
// ---------------------------------------------------------------------------
let rafPending = false;

function scheduleUpdate() {
  if (!rafPending) { rafPending = true; requestAnimationFrame(runUpdateCycle); }
}

function runUpdateCycle() {
  rafPending = false;
  compareMode = false;
  trajectory = computeTrajectory(buildParams(state));
  const stats = statsFrom(trajectory);
  updatePlot(chart, trajectory, state.mode, false);
  renderEquations(state, stats);
  restartAnimation(trajectory);
  serializeState(state);
  notifyListeners();
}

function buildParams(s) {
  // No dt — let engine.js auto-scale based on trajectory duration
  return { angle: s.angle, speed: s.speed, mass: s.mass, diameter: s.diameter,
           cd: s.cd, rho: s.rho, gravity: s.gravity };
}

function statsFrom(traj) {
  if (!traj || traj.length === 0)
    return { peakHeight: 0, range: 0, flightTime: 0, peakTime: 0, impactSpeed: 0, impactVx: 0, impactVy: 0 };
  const peak = traj.reduce((m, s) => (s.y > m.y ? s : m), traj[0]);
  const landing = traj[traj.length - 1];
  return {
    peakHeight: peak.y, range: landing.x, flightTime: landing.t,
    peakTime: peak.t, impactSpeed: landing.speed,
    impactVx: landing.vx, impactVy: landing.vy,
  };
}

// ---------------------------------------------------------------------------
// Canvas animation
// ---------------------------------------------------------------------------
function getCanvasSize(canvas) {
  // getBoundingClientRect is reliable even before a first paint
  const rect = canvas.getBoundingClientRect();
  const w = rect.width  > 10 ? Math.round(rect.width)  : canvas.parentElement?.clientWidth || 640;
  const h = rect.height > 10 ? Math.round(rect.height) : Math.round(w * 9 / 16);
  return { w, h };
}

// Animation time scale: target ~3 s of wall time for any trajectory.
// Stored in restartAnimation, used by animFrame.
let animTimeScale = 1.0;  // simSeconds per wallSecond

function restartAnimation(traj) {
  if (animHandle) cancelAnimationFrame(animHandle);
  animHandle = null; frameIndex = 0; trail = [];
  lastWallTime = null; currentSimTime = 0; animationComplete = false;

  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;

  // Sync canvas pixel buffer to its CSS display size
  const { w, h } = getCanvasSize(canvas);
  canvas.width  = w;
  canvas.height = h;

  if (!traj || traj.length === 0) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, w, h);
    return;
  }

  // Scale animation so total flight time displays in ~3 wall-clock seconds
  const totalSimTime = traj[traj.length - 1].t;
  const TARGET_WALL_SECS = 3.0;
  animTimeScale = totalSimTime / TARGET_WALL_SECS;
  // Clamp: never slower than 0.1× real-time, never faster than real-time
  // (fast projectiles show at real-time, slow ones are slightly sped up)
  animTimeScale = Math.max(0.1, Math.min(animTimeScale, totalSimTime));

  scaleInfo = computeScaleInfo(traj, w, h);
  animHandle = requestAnimationFrame(animFrame);
}

function animFrame(wallTimestamp) {
  const canvas = document.getElementById('sim-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) { console.error('Canvas 2D context unavailable'); return; }

  if (lastWallTime === null) lastWallTime = wallTimestamp;
  const wallElapsed = (wallTimestamp - lastWallTime) / 1000;
  lastWallTime = wallTimestamp;

  // Advance sim time scaled so the animation always takes ~3 s
  currentSimTime += wallElapsed * animTimeScale;

  while (frameIndex < trajectory.length - 1 && trajectory[frameIndex + 1].t <= currentSimTime)
    frameIndex++;

  trail.push(trajectory[frameIndex]);
  if (trail.length > 200) trail.shift();

  const isLast = frameIndex >= trajectory.length - 1;
  const totalRange = trajectory.length > 0 ? trajectory[trajectory.length - 1].x : 0;

  if (isLast && !animationComplete) {
    animationComplete = true;
    const stats = statsFrom(trajectory);
    drawFullParabola(ctx, trajectory, scaleInfo, state.category, stats);
  } else if (!isLast) {
    drawFrame(ctx, trajectory[frameIndex], trail, scaleInfo, state.category, false, totalRange, animTimeScale);
    animHandle = requestAnimationFrame(animFrame);
  }
}

// ---------------------------------------------------------------------------
// Slider config
// ---------------------------------------------------------------------------
const SLIDERS = [
  { id: 'angle',    label: 'Launch Angle',   min: 0,     max: 90,   step: 1,     unit: '°',       key: 'angle' },
  { id: 'speed',    label: 'Initial Speed',  min: 1,     max: 8000, step: 1,     unit: ' m/s',    key: 'speed' },
  { id: 'mass',     label: 'Mass',           min: 0.001, max: 200000, step: 0.001, unit: ' kg',     key: 'mass' },
  { id: 'diameter', label: 'Diameter',       min: 0.001, max: 12.0,  step: 0.001, unit: ' m',      key: 'diameter' },
  { id: 'cd',       label: 'Drag Coeff Cd',  min: 0.001, max: 1.0,  step: 0.001, unit: '',        key: 'cd' },
  { id: 'rho',      label: 'Air Density ρ',  min: 0.0,   max: 1.5,  step: 0.01,  unit: ' kg/m³',  key: 'rho' },
  { id: 'gravity',  label: 'Gravity g',      min: 0.1,   max: 25.0, step: 0.1,   unit: ' m/s²',   key: 'gravity' },
];

// ---------------------------------------------------------------------------
// Control Panel builder
// ---------------------------------------------------------------------------
function buildControlPanel() {
  const panel = document.getElementById('control-panel');
  if (!panel) return;

  panel.innerHTML = `
    <!-- Mobile: close button -->
    <div class="flex items-center justify-between mb-4 lg:hidden">
      <h2 class="text-blue-400 text-lg font-semibold">Controls</h2>
      <button id="btn-close-panel" aria-label="Close controls"
        class="p-1.5 rounded bg-gray-700 hover:bg-gray-600 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2"
             viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round"
             d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <h2 class="hidden lg:block text-blue-400 text-lg font-semibold mb-4">Controls</h2>

    <div class="mb-4">
      <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Preset</label>
      <select id="preset-select"
        class="w-full bg-gray-700 text-white border border-gray-600 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-blue-500">
        <option value="">— Select Preset —</option>
        <optgroup label="⚽ Sports">
          <option value="golf-ball">Golf Ball (~200 m)</option>
          <option value="baseball">Baseball throw (~130 m)</option>
          <option value="soccer-ball">Soccer Goal-kick (~60 m)</option>
          <option value="tennis-ball">Tennis Serve (~200 km/h)</option>
          <option value="basketball">Basketball Free-throw</option>
          <option value="ping-pong">Ping Pong Serve</option>
          <option value="shot-put">Shot Put (~23 m)</option>
          <option value="shuttlecock">Badminton Smash</option>
          <option value="arrow">Archery Arrow (~60 m)</option>
          <option value="javelin">Javelin (~90 m)</option>
          <option value="bowling-ball">Bowling Ball</option>
        </optgroup>
        <optgroup label="🔫 Firearms">
          <option value="22-lr">.22 LR (~140 m eff.)</option>
          <option value="9mm">9mm Parabellum (~50 m eff.)</option>
          <option value="45-acp">.45 ACP (subsonic)</option>
          <option value="556-nato">5.56 NATO M4 (~500 m eff.)</option>
          <option value="308-win">.308 Win / 7.62 NATO (~800 m eff.)</option>
          <option value="338-lapua">.338 Lapua Magnum (~1500 m eff.)</option>
          <option value="50-bmg">.50 BMG (~2000 m eff.)</option>
        </optgroup>
        <optgroup label="💥 Mortars (1–7 km)">
          <option value="60mm-mortar">60mm Mortar (~3.5 km)</option>
          <option value="81mm-mortar">81mm Mortar (~5.6 km)</option>
          <option value="120mm-mortar">120mm Mortar (~7 km)</option>
        </optgroup>
        <optgroup label="🔴 Artillery (7–130 km)">
          <option value="m110-203mm">M110 Howitzer 203mm (~17 km)</option>
          <option value="m198-155mm">M198 Howitzer 155mm (~22 km)</option>
          <option value="2s19-msta">2S19 Msta-S 152mm (~25 km)</option>
          <option value="2s7-pion">2S7 Pion 203mm (~37 km)</option>
          <option value="bm21-grad">BM-21 Grad MLRS (~40 km)</option>
          <option value="bm30-smerch">BM-30 Smerch MLRS (~90 km)</option>
          <option value="paris-gun">Paris Gun WWI (~130 km)</option>
        </optgroup>
        <optgroup label="🚀 Tactical Missiles">
          <option value="grenade">Hand Grenade (~20 m)</option>
          <option value="rpg">RPG-7 (~300 m eff.)</option>
          <option value="cannonball">Cannonball 18th-c. (~1 km)</option>
          <option value="javelin-atgm">Javelin ATGM (~2 km)</option>
          <option value="stinger">Stinger MANPADS (~4.8 km)</option>
          <option value="patriot">Patriot PAC-3 (~70 km)</option>
          <option value="iskander">Iskander-M (~480 km)</option>
          <option value="tomahawk">Tomahawk (ballistic approx.)</option>
        </optgroup>
        <optgroup label="☢️ Strategic / Space">
          <option value="minuteman">Minuteman III ICBM (~13,000 km)</option>
          <option value="sarmat">RS-28 Sarmat (~18,000 km)</option>
          <option value="saturn-v">Saturn V (first stage)</option>
        </optgroup>
      </select>
    </div>

    <div class="mb-4">
      <label class="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Simulation Mode</label>
      <div class="flex gap-2">
        <button id="btn-realistic" class="mode-btn flex-1 py-1.5 rounded text-sm font-semibold transition-colors" data-mode="realistic">Realistic</button>
        <button id="btn-vacuum"    class="mode-btn flex-1 py-1.5 rounded text-sm font-semibold transition-colors" data-mode="vacuum">Vacuum</button>
      </div>
    </div>

    <div class="mb-5">
      <button id="btn-compare" class="w-full py-1.5 rounded text-sm font-semibold bg-purple-700 hover:bg-purple-600 transition-colors text-white">
        Compare Vacuum &amp; Realistic
      </button>
    </div>

    <label class="block text-xs text-gray-400 mb-2 uppercase tracking-wider">Parameters</label>
    <div id="slider-container" class="space-y-3"></div>`;

  _buildSliders();
  updateModeButtons();

  document.getElementById('slider-container').addEventListener('input',  handleSliderInput);
  document.getElementById('slider-container').addEventListener('change', handleNumberInput);
  document.getElementById('preset-select').addEventListener('change', handlePresetSelect);
  document.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => handleModeToggle(btn.dataset.mode)));
  document.getElementById('btn-compare').addEventListener('click', handleCompare);

  // Mobile drawer close button
  const closeBtn = document.getElementById('btn-close-panel');
  if (closeBtn) closeBtn.addEventListener('click', _closeMobilePanel);
}

function _closeMobilePanel() {
  const p = document.getElementById('control-panel');
  const b = document.getElementById('menu-backdrop');
  if (p) p.classList.remove('open');
  if (b) b.classList.add('hidden');
  document.body.style.overflow = '';
}

function _buildSliders() {
  const container = document.getElementById('slider-container');
  if (!container) return;
  container.innerHTML = '';
  for (const s of SLIDERS) {
    const val = state[s.key];
    const row = document.createElement('div');
    row.innerHTML = `
      <div class="flex justify-between items-center mb-0.5">
        <label for="${s.id}-slider" class="text-xs text-gray-300">${s.label}</label>
      </div>
      <div class="flex items-center gap-2">
        <input type="range" id="${s.id}-slider"
          min="${s.min}" max="${s.max}" step="${s.step}" value="${val}"
          data-key="${s.key}" data-unit="${s.unit}" data-step="${s.step}" data-min="${s.min}" data-max="${s.max}"
          class="flex-1 accent-blue-500 h-2 rounded cursor-pointer min-w-0" />
        <input type="number" id="${s.id}-num"
          min="${s.min}" max="${s.max}" step="${s.step}" value="${formatVal(val, s.step)}"
          data-key="${s.key}" data-unit="${s.unit}" data-step="${s.step}" data-min="${s.min}" data-max="${s.max}"
          class="w-20 bg-gray-700 text-blue-300 border border-gray-600 rounded px-1.5 py-0.5 text-xs font-mono text-right
                 focus:outline-none focus:border-blue-500 focus:bg-gray-600" />
        <span class="text-xs text-gray-500 w-10 shrink-0">${s.unit.trim() || '—'}</span>
      </div>`;
    container.appendChild(row);
  }
}

function formatVal(val, step) {
  const decimals = step < 0.001 ? 4 : step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return Number(val).toFixed(decimals);
}

function updateModeButtons() {
  const r = document.getElementById('btn-realistic');
  const v = document.getElementById('btn-vacuum');
  if (!r || !v) return;
  if (state.mode === 'realistic') {
    r.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-orange-600 text-white';
    v.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-gray-600 text-gray-300';
  } else {
    v.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-blue-600 text-white';
    r.className = 'mode-btn flex-1 py-1.5 rounded text-sm font-semibold bg-gray-600 text-gray-300';
  }
}

function _syncInputPair(key, val) {
  const cfg = SLIDERS.find(s => s.key === key);
  if (!cfg) return;
  const slider = document.getElementById(`${cfg.id}-slider`);
  const num    = document.getElementById(`${cfg.id}-num`);
  if (slider) slider.value = val;
  if (num)    num.value    = formatVal(val, cfg.step);
}

// ---------------------------------------------------------------------------
// Event Handlers
// ---------------------------------------------------------------------------
function handleSliderInput(event) {
  const input = event.target;
  if (input.type !== 'range') return;
  const key  = input.dataset.key;
  const step = parseFloat(input.dataset.step);
  const val  = parseFloat(input.value);
  state[key] = val;
  const num = document.getElementById(`${key}-num`);
  if (num) num.value = formatVal(val, step);
  highlightVars([key]);
  scheduleUpdate();
}

function handleNumberInput(event) {
  const input = event.target;
  if (input.type !== 'number') return;
  const key  = input.dataset.key;
  const min  = parseFloat(input.dataset.min);
  const max  = parseFloat(input.dataset.max);
  const step = parseFloat(input.dataset.step);
  let val = parseFloat(input.value);
  if (isNaN(val)) return;
  val = Math.min(max, Math.max(min, val));
  input.value = formatVal(val, step);
  state[key]  = val;
  const slider = document.getElementById(`${key}-slider`);
  if (slider) slider.value = val;
  highlightVars([key]);
  scheduleUpdate();
}

function handlePresetSelect(event) {
  const key = event.target.value;
  if (!key || !PRESETS[key]) return;
  const p = PRESETS[key];

  // Apply all preset fields to state
  state.mass     = p.mass;
  state.diameter = p.diameter;
  state.cd       = p.cd;
  state.angle    = p.angle;
  state.speed    = p.speed;
  state.gravity  = p.gravity;
  state.preset   = key;
  state.category = p.category;

  // Sync all five affected sliders+number inputs
  for (const k of ['mass', 'diameter', 'cd', 'angle', 'speed', 'gravity']) {
    _syncInputPair(k, state[k]);
  }

  highlightVars(['mass', 'diameter', 'cd', 'angle', 'speed']);

  // Close drawer on mobile so user sees the simulation immediately
  if (window.innerWidth < 1024) _closeMobilePanel();

  scheduleUpdate();
}

function handleModeToggle(mode) {
  state.mode = mode;
  state.rho  = mode === 'vacuum' ? 0.0 : 1.225;
  compareMode = false;
  _syncInputPair('rho', state.rho);
  updateModeButtons();
  scheduleUpdate();
}

function handleCompare() {
  const vacTraj  = computeTrajectory({ ...buildParams(state), rho: 0.0 });
  const realTraj = computeTrajectory({ ...buildParams(state), rho: 1.225 });
  if (!chart) return;

  const toPoints = t => t.map(s => ({ x: s.x, y: s.y }));
  const maxX = Math.max(...vacTraj.map(s => s.x), ...realTraj.map(s => s.x)) * 1.05;
  const maxY = Math.max(...vacTraj.map(s => s.y), ...realTraj.map(s => s.y)) * 1.1;

  chart.data.datasets = [
    { label: 'Vacuum',   data: toPoints(vacTraj),  borderColor: 'rgba(59,130,246,1)',  backgroundColor: 'rgba(59,130,246,0.12)',  borderWidth: 2, pointRadius: 0, tension: 0.1, fill: true },
    { label: 'Realistic', data: toPoints(realTraj), borderColor: 'rgba(249,115,22,1)', backgroundColor: 'rgba(249,115,22,0.12)', borderWidth: 2, pointRadius: 0, tension: 0.1, fill: true },
  ];
  chart.options.scales.x.max = maxX;
  chart.options.scales.y.max = maxY;
  chart.update('none');
  compareMode = true;
  trajectory = state.mode === 'vacuum' ? vacTraj : realTraj;
  restartAnimation(trajectory);
}

// ---------------------------------------------------------------------------
// Stats panel
// ---------------------------------------------------------------------------
function renderStats(stats) {
  const panel = document.getElementById('stats-panel');
  if (!panel) return;

  const fmt2 = n => Number.isFinite(n) ? n.toFixed(2) : '—';
  const fmt1 = n => Number.isFinite(n) ? n.toFixed(1) : '—';

  panel.innerHTML = `
    <h3 class="text-blue-400 text-sm font-semibold mb-2 uppercase tracking-wider">Flight Stats</h3>
    <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
      <span class="text-gray-400">Peak Height</span>
      <span class="text-green-300 font-mono text-right">${fmt2(stats.peakHeight)} m</span>

      <span class="text-gray-400">Range</span>
      <span class="text-blue-300 font-mono text-right">${fmt2(stats.range)} m</span>

      <span class="text-gray-400">Flight Time</span>
      <span class="text-yellow-300 font-mono text-right">${fmt2(stats.flightTime)} s</span>

      <span class="text-gray-400">Time to Peak</span>
      <span class="text-yellow-200 font-mono text-right">${fmt2(stats.peakTime)} s</span>

      <span class="text-gray-400">Impact Speed</span>
      <span class="text-red-300 font-mono text-right">${fmt1(stats.impactSpeed)} m/s</span>

      <span class="text-gray-400">Impact Vx</span>
      <span class="text-orange-300 font-mono text-right">${fmt1(stats.impactVx)} m/s</span>

      <span class="text-gray-400">Impact Vy</span>
      <span class="text-orange-300 font-mono text-right">${fmt1(stats.impactVy)} m/s</span>

      <span class="text-gray-400">Mode</span>
      <span class="${state.mode === 'realistic' ? 'text-orange-400' : 'text-blue-400'} font-semibold text-right capitalize">${state.mode}</span>
    </div>`;
}

// ---------------------------------------------------------------------------
// Equation Dashboard (KaTeX)
// ---------------------------------------------------------------------------
const VAR_SLIDER_MAP = {
  angle:    ['theta'], speed:    ['v_0'], mass:     ['m'],
  diameter: ['d','A'], cd:       ['C_d'], rho:      ['rho'], gravity: ['g'],
};

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function katexBlock(latex) {
  try {
    return katex.renderToString(latex, { throwOnError: true, displayMode: true });
  } catch (e) {
    return `<span class="text-yellow-400 text-sm">⚠ Equation error: ${escHtml(latex)}</span>`;
  }
}

function renderEquations(s, stats) {
  const panel = document.getElementById('equation-panel');
  if (!panel) return;

  const sig = n => {
    if (n === 0) return '0';
    const d = Math.max(0, 2 - Math.floor(Math.log10(Math.abs(n))));
    return Number(n.toPrecision(3)).toFixed(d);
  };

  const v0 = sig(s.speed);
  const g  = sig(s.gravity);
  const th = s.angle;

  const xEq  = String.raw`x(t) = v_0 \cos(\theta)\cdot t`;
  const xNum = String.raw`x(t) = ${v0}\cos(${th}^{\circ})\cdot t`;
  const yEq  = String.raw`y(t) = v_0 \sin(\theta)\cdot t - \tfrac{1}{2}g\,t^2`;
  const yNum = String.raw`y(t) = ${v0}\sin(${th}^{\circ})\cdot t - \tfrac{1}{2}(${g})t^2`;
  const vEq  = String.raw`v(t) = \sqrt{v_x^2 + v_y^2}`;
  const fdEq = String.raw`F_d = \tfrac{1}{2}\rho\, v^2\, C_d\, A`;
  const fdNum= String.raw`F_d = \tfrac{1}{2}(${sig(s.rho)})\,v^2\,(${sig(s.cd)})\,\pi\!\left(\tfrac{${sig(s.diameter)}}{2}\right)^{\!2}`;

  const dragBlock = s.mode === 'realistic' ? `
    <div class="eq-block mb-3" data-vars="rho,C_d,d,A">
      <div class="text-xs text-gray-400 mb-0.5">Drag Force</div>
      ${katexBlock(fdEq)}
      <div class="opacity-70 mt-0.5">${katexBlock(fdNum)}</div>
    </div>` : '';

  panel.innerHTML = `
    <h2 class="text-blue-400 text-lg font-semibold mb-3">Equations</h2>

    <div class="eq-block mb-4" data-vars="v_0,theta">
      <div class="text-xs text-gray-400 mb-0.5">Horizontal Position</div>
      ${katexBlock(xEq)}
      <div class="opacity-70 mt-0.5">${katexBlock(xNum)}</div>
    </div>

    <div class="eq-block mb-4" data-vars="v_0,theta,g">
      <div class="text-xs text-gray-400 mb-0.5">Vertical Position</div>
      ${katexBlock(yEq)}
      <div class="opacity-70 mt-0.5">${katexBlock(yNum)}</div>
    </div>

    <div class="eq-block mb-4" data-vars="v_0">
      <div class="text-xs text-gray-400 mb-0.5">Speed</div>
      ${katexBlock(vEq)}
    </div>

    ${dragBlock}

    <hr class="border-gray-700 my-3" />
    <div id="stats-panel"></div>
    <div id="help-panel"></div>`;

  renderStats(stats);
  renderHelp();
}

// ---------------------------------------------------------------------------
// Help panel — How to Use + Equations & Glossary
// ---------------------------------------------------------------------------
function renderHelp() {
  const panel = document.getElementById('help-panel');
  if (!panel) return;

  panel.innerHTML = `
<hr class="border-gray-700 my-3" />

<!-- ── How to Use ──────────────────────────────────────────────────────── -->
<details class="mb-3 group">
  <summary class="cursor-pointer select-none flex items-center justify-between
                  text-sm font-semibold text-blue-400 hover:text-blue-300 py-1">
    <span>📖 How to Use</span>
    <span class="text-gray-500 group-open:rotate-90 transition-transform">▶</span>
  </summary>
  <div class="mt-2 space-y-3 text-xs text-gray-300 leading-relaxed pl-1">

    <div>
      <p class="text-white font-semibold mb-1">1 · Pick a preset or set parameters manually</p>
      <p>Use the <span class="text-blue-300">preset dropdown</span> to instantly load a real-world
      projectile — angle, speed, mass, diameter and drag coefficient all update automatically.
      Alternatively, drag any <span class="text-blue-300">slider</span> or type directly into the
      number box beside it.</p>
    </div>

    <div>
      <p class="text-white font-semibold mb-1">2 · Watch the simulation update live</p>
      <p>Every parameter change immediately recomputes the full trajectory. The
      <span class="text-blue-300">canvas</span> (center top) animates the projectile moving along
      that path. The <span class="text-blue-300">Chart.js plot</span> (center bottom) shows the
      complete parabola at once so you can read off exact values.</p>
    </div>

    <div>
      <p class="text-white font-semibold mb-1">3 · Compare Vacuum vs Realistic</p>
      <p>Toggle <span class="text-orange-400">Realistic</span> (air resistance on) or
      <span class="text-blue-400">Vacuum</span> (no air). Hit
      <span class="text-purple-400">Compare</span> to overlay both trajectories on the chart —
      great for seeing how much drag shortens the range of a golf ball vs a bullet.</p>
    </div>

    <div>
      <p class="text-white font-semibold mb-1">4 · Read the flight stats</p>
      <p>After each computation the stats panel updates with peak height, range, flight time,
      time to peak, impact speed, and the horizontal/vertical velocity components at landing.</p>
    </div>

    <div>
      <p class="text-white font-semibold mb-1">5 · Share a configuration</p>
      <p>The URL bar updates automatically with all current parameters. Copy and paste the URL
      to share an exact scenario with someone else — it will restore everything on load.</p>
    </div>

    <div class="bg-gray-700 rounded p-2 text-gray-400">
      <p class="text-white font-semibold mb-1">💡 Tips</p>
      <ul class="list-disc list-inside space-y-1">
        <li>Set <span class="text-blue-300">gravity</span> to 1.62 for the Moon or 3.72 for Mars.</li>
        <li>Set <span class="text-blue-300">air density ρ</span> to 0 manually to enter Vacuum mode
            without the toggle (same as Vacuum mode).</li>
        <li>Artillery shells use high angles (~45–75°) to maximise range; direct-fire weapons
            use very low angles (&lt;5°) for accuracy.</li>
        <li>The animation speed label (top-left of canvas) shows the playback ratio —
            a bullet might play at 40× speed so you can actually see it.</li>
      </ul>
    </div>

  </div>
</details>

<!-- ── Equations & Glossary ────────────────────────────────────────────── -->
<details class="mb-3 group">
  <summary class="cursor-pointer select-none flex items-center justify-between
                  text-sm font-semibold text-blue-400 hover:text-blue-300 py-1">
    <span>📐 Equations &amp; Glossary</span>
    <span class="text-gray-500 group-open:rotate-90 transition-transform">▶</span>
  </summary>
  <div class="mt-2 space-y-4 text-xs text-gray-300 leading-relaxed pl-1">

    <!-- Core kinematics -->
    <div>
      <p class="text-white font-semibold text-sm mb-2">Core Kinematics (Vacuum)</p>
      <p class="mb-1">These equations describe motion without air resistance and are exact
      analytical solutions.</p>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">x(t) = v₀ · cos(θ) · t</p>
        <p>Horizontal position at time <em>t</em>. It increases linearly because there is no
        horizontal force in vacuum — the ball covers equal horizontal distance every second.</p>
      </div>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">y(t) = v₀ · sin(θ) · t − ½ · g · t²</p>
        <p>Vertical position at time <em>t</em>. The first term is upward motion from the launch,
        the second term is gravity pulling it back down — creating the parabolic shape.</p>
      </div>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">v(t) = √(vₓ² + vᵧ²)</p>
        <p>Total speed at any moment — the length of the velocity vector combining horizontal and
        vertical components (Pythagorean theorem).</p>
      </div>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">R = v₀² · sin(2θ) / g</p>
        <p>Analytical vacuum range formula. Maximum range occurs at θ = 45° because sin(90°) = 1.
        Doubling launch speed quadruples range — that's why ICBMs need km/s, not m/s.</p>
      </div>
    </div>

    <!-- Drag force -->
    <div>
      <p class="text-white font-semibold text-sm mb-2">Drag Force (Realistic Mode)</p>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">F_d = ½ · ρ · v² · C_d · A</p>
        <p>Aerodynamic drag — the force the air pushes back against the moving object.
        It grows with the <em>square</em> of speed, which is why a bullet loses range far more
        dramatically than a golf ball when you add air.</p>
      </div>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">A = π · (d/2)²</p>
        <p>Cross-sectional area — the "face" the projectile presents to the air. A wider object
        (large diameter) creates more drag even at the same speed.</p>
      </div>

      <div class="bg-gray-900 rounded p-2 mb-2">
        <p class="text-yellow-300 font-mono mb-0.5">a_drag = −(F_d / m) · (v̂)</p>
        <p>Drag deceleration — F=ma rearranged. The direction is opposite to velocity (v̂ is the
        unit vector). A heavier object (large m) decelerates less for the same drag force, which
        is why a cannonball carries farther than a ping-pong ball at the same speed.</p>
      </div>
    </div>

    <!-- Euler integration -->
    <div>
      <p class="text-white font-semibold text-sm mb-2">Euler Integration (How the sim works)</p>
      <div class="bg-gray-900 rounded p-2">
        <p class="text-yellow-300 font-mono mb-0.5">v_new = v + a · Δt</p>
        <p class="text-yellow-300 font-mono mb-1">x_new = x + v · Δt</p>
        <p>At each tiny time step Δt the simulation updates velocity using current acceleration,
        then updates position using current velocity. Repeating thousands of times traces the
        full path — including drag effects that have no closed-form equation.</p>
      </div>
    </div>

    <!-- Glossary -->
    <div>
      <p class="text-white font-semibold text-sm mb-2">Glossary — every term explained</p>
      <div class="space-y-2">

        ${glossaryRow('Launch Angle (θ)', '0–90°',
          'The angle above horizontal at which the object is launched. 45° gives maximum range in vacuum. Artillery uses 45–75° for long range; rifles use &lt;5° for flat, accurate shots.')}

        ${glossaryRow('Initial Speed (v₀)', 'm/s',
          'How fast the projectile leaves the launch point. Doubling speed quadruples range (because R ∝ v²). A golf ball leaves at ~70 m/s; a rifle bullet at ~900 m/s.')}

        ${glossaryRow('Mass (m)', 'kg',
          'How heavy the object is. Heavier objects decelerate less from drag (F=ma — same drag force, bigger mass = smaller acceleration). Compare: ping-pong ball 2.7 g vs cannonball 5.4 kg.')}

        ${glossaryRow('Diameter (d)', 'm',
          'The width of the projectile. Used to calculate cross-sectional area A = π(d/2)². A wider object presents more face to the air and experiences more drag.')}

        ${glossaryRow('Drag Coefficient (C_d)', 'dimensionless',
          'A shape factor describing how aerodynamically streamlined an object is. A smooth sphere: ~0.47. A streamlined bullet: ~0.17–0.30. A flat plate face-on: ~1.0. Lower = less drag.')}

        ${glossaryRow('Air Density (ρ)', 'kg/m³',
          'How thick the air is. Sea-level standard atmosphere = 1.225 kg/m³. Set to 0 for vacuum. High altitude or hot weather = lower density = less drag = longer range.')}

        ${glossaryRow('Gravity (g)', 'm/s²',
          'Downward acceleration due to gravity. Earth = 9.81, Moon = 1.62, Mars = 3.72, Jupiter = 24.8. Lower gravity means longer flight time and much greater range.')}

        ${glossaryRow('Peak Height', 'm',
          'The maximum altitude reached during flight — the top of the parabola. Occurs at t = v₀·sin(θ)/g (vacuum) and is always at the midpoint of horizontal distance in vacuum.')}

        ${glossaryRow('Range', 'm',
          'Total horizontal distance from launch point to landing (where y returns to 0). The key output of the simulation — this is what changes most dramatically with drag.')}

        ${glossaryRow('Flight Time', 's',
          'Total time from launch to landing. In vacuum: T = 2·v₀·sin(θ)/g. Longer angle = more vertical speed = more time in the air.')}

        ${glossaryRow('Time to Peak', 's',
          'How long until the highest point is reached — exactly half the flight time in vacuum. In realistic mode it is slightly less than half because drag slows the ascent more than the descent.')}

        ${glossaryRow('Impact Speed', 'm/s',
          'Total speed at the moment of landing (√(Vx²+Vy²)). In vacuum this equals launch speed (energy conservation). With drag it is always less — the air has stolen kinetic energy.')}

        ${glossaryRow('Impact Vx', 'm/s',
          'Horizontal velocity component at landing. In vacuum this never changes from v₀·cos(θ). With drag it decreases continuously — a bullet can lose 30–50% of horizontal speed over long range.')}

        ${glossaryRow('Impact Vy', 'm/s',
          'Vertical velocity component at landing (negative = downward). In vacuum |Vy| at landing equals the initial |Vy|. With drag it is smaller because the object falls from lower peak height.')}

        ${glossaryRow('Vacuum Mode', '—',
          'Sets air density to exactly 0. No drag force is computed. The trajectory is a perfect mathematical parabola described by the kinematic equations above. Used as a comparison baseline.')}

        ${glossaryRow('Realistic Mode', '—',
          'Sets air density to 1.225 kg/m³ (sea-level standard). Drag force is computed at every step, shortening range and altering the parabola shape. This is how the object would actually fly.')}

        ${glossaryRow('Euler Integration', '—',
          'The numerical method used to simulate the trajectory. The simulation steps forward in tiny time increments (Δt), updating velocity and position at each step using the current forces. Not perfectly accurate but very fast and accurate enough for this application.')}

      </div>
    </div>

  </div>
</details>`;
}

function glossaryRow(term, unit, desc) {
  return `
    <div class="bg-gray-800 rounded p-2">
      <div class="flex items-baseline gap-2 mb-0.5">
        <span class="text-blue-300 font-semibold">${term}</span>
        <span class="text-gray-500 text-xs">${unit}</span>
      </div>
      <p class="text-gray-400">${desc}</p>
    </div>`;
}

// ---------------------------------------------------------------------------
// Variable highlight
// ---------------------------------------------------------------------------
let _highlightTimers = {};

function highlightVars(changedKeys) {
  const varNames = changedKeys.flatMap(k => VAR_SLIDER_MAP[k] || []);
  if (!varNames.length) return;
  const panel = document.getElementById('equation-panel');
  if (!panel) return;
  panel.querySelectorAll('.eq-block').forEach(block => {
    const vars = (block.dataset.vars || '').split(',');
    if (varNames.some(v => vars.includes(v))) {
      block.classList.add('highlight-var');
      clearTimeout(_highlightTimers[block.dataset.vars]);
      _highlightTimers[block.dataset.vars] = setTimeout(() => block.classList.remove('highlight-var'), 1300);
    }
  });
}

// ---------------------------------------------------------------------------
// URL State Serialization
// ---------------------------------------------------------------------------
function serializeState(s) {
  const p = new URLSearchParams({ angle: s.angle, speed: s.speed, mass: s.mass,
    diam: s.diameter, cd: s.cd, rho: s.rho, gravity: s.gravity, mode: s.mode });
  try { history.replaceState(null, '', '?' + p.toString()); } catch (_) {}
}

const URL_RANGES = {
  angle:[0,90], speed:[1,8000], mass:[0.001,200000], diam:[0.001,12.0],
  cd:[0.001,1.0], rho:[0.0,1.5], gravity:[0.1,25.0],
};

function parseQueryString(qs) {
  const params = new URLSearchParams(qs);
  const partial = {};
  for (const [key, rawVal] of params.entries()) {
    if (key === 'mode') {
      if (rawVal === 'vacuum' || rawVal === 'realistic') partial.mode = rawVal;
      else console.warn(`[URL] Rejected mode="${rawVal}"`);
      continue;
    }
    const range = URL_RANGES[key];
    if (!range) { console.warn(`[URL] Unknown key="${key}"`); continue; }
    const num = parseFloat(rawVal);
    if (isNaN(num) || num < range[0] || num > range[1]) {
      console.warn(`[URL] Rejected key="${key}" val=${rawVal}`); continue;
    }
    partial[key] = num;
  }
  return partial;
}

function applyURLState(partial) {
  const map = { angle:'angle', speed:'speed', mass:'mass', diam:'diameter',
                cd:'cd', rho:'rho', gravity:'gravity', mode:'mode' };
  for (const [k, v] of Object.entries(partial)) { const sk = map[k]||k; state[sk] = v; }
  if (partial.mode) { state.mode = partial.mode; state.rho = partial.mode === 'vacuum' ? 0.0 : (partial.rho ?? 1.225); }
}

function syncAllInputsFromState() {
  for (const s of SLIDERS) _syncInputPair(s.key, state[s.key]);
  updateModeButtons();
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  buildControlPanel();

  const chartCanvas = document.getElementById('trajectory-chart');
  if (chartCanvas && typeof Chart !== 'undefined') chart = createChart(chartCanvas);

  const qs = window.location.search;
  if (qs && qs.length > 1) { applyURLState(parseQueryString(qs.slice(1))); syncAllInputsFromState(); }

  trajectory = computeTrajectory(buildParams(state));
  const stats = statsFrom(trajectory);
  if (chart) updatePlot(chart, trajectory, state.mode, false);
  renderEquations(state, stats);
  restartAnimation(trajectory);
  serializeState(state);

  const ps = document.getElementById('preset-select');
  if (ps && state.preset) ps.value = state.preset;
});

window.addEventListener('resize', () => {
  if (trajectory && trajectory.length > 0) restartAnimation(trajectory);
});
