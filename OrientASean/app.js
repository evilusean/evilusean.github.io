// app.js
// UI glue: reads DOM inputs, calls engine/planner/renderer, updates DOM, handles export.
// Loaded as <script type="module"> — SunCalc is a global from the CDN script above it.

import {
  validateCoordinates,
  getOptimalAzimuth,
  getWinterSolsticeAltitude,
  getSummerAltitudeApprox,
  getWinterAltitudeApprox,
  calcPassiveSolarGain,
  calcRelativeGainRatio,
  shouldWarnOrientation,
  calcOverhangMin,
  calcOverhangMax,
  convertDistance,
  getSunlightDuration,
  isPolarLatitude,
} from './solar-engine.js';

import {
  buildArcData,
  calcShadowLength,
  calcPlantingZones,
} from './site-planner.js';

import {
  renderAll,
  clearCanvas,
  hitTestArcPoint,
} from './canvas-renderer.js';

// ─── State ────────────────────────────────────────────────────────────────────

/** @type {import('./solar-engine.js').AnalysisResult|null} */
let currentResult = null;
let analysisComplete = false;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const form             = document.getElementById('analysis-form');
const canvas           = document.getElementById('site-canvas');
const tooltip          = document.getElementById('canvas-tooltip');
const geoBtn           = document.getElementById('geolocate-btn');
const geoError         = document.getElementById('geo-error');
const exportPngBtn     = document.getElementById('export-png-btn');
const exportTxtBtn     = document.getElementById('export-txt-btn');
const exportMsg        = document.getElementById('export-msg');

// Input refs
const latInput         = document.getElementById('lat');
const lngInput         = document.getElementById('lng');
const latError         = document.getElementById('lat-error');
const lngError         = document.getElementById('lng-error');
const unitMetric       = document.getElementById('unit-metric');
const unitImperial     = document.getElementById('unit-imperial');
const unitMetricLabel  = document.getElementById('unit-metric-label');
const unitImperialLabel= document.getElementById('unit-imperial-label');
const areaUnitLabel    = document.getElementById('area-unit-label');
const heightUnitLabel  = document.getElementById('height-unit-label');
const treeUnitLabel    = document.getElementById('tree-unit-label');

// Result refs
const resultGainValue          = document.getElementById('result-gain-value');
const resultGainRatio          = document.getElementById('result-gain-ratio');
const resultGainRecommendation = document.getElementById('result-gain-recommendation');
const resultOrientationWarning = document.getElementById('result-orientation-warning');
const resultOverhangMin        = document.getElementById('result-overhang-min');
const resultOverhangMax        = document.getElementById('result-overhang-max');
const resultOverhangNa         = document.getElementById('result-overhang-na');
const resultSummerDuration     = document.getElementById('result-summer-duration');
const resultWinterDuration     = document.getElementById('result-winter-duration');
const resultPolarMsg           = document.getElementById('result-polar-msg');
const resultDeciduous          = document.getElementById('result-deciduous');
const resultEvergreen          = document.getElementById('result-evergreen');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUnit() {
  return unitImperial.checked ? 'imperial' : 'metric';
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

function formatDuration(durationMs) {
  const totalMin = Math.round(durationMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h ${m}m`;
}

function formatDistance(metres, unit) {
  if (unit === 'imperial') {
    return `${convertDistance(metres, 'metric', 'imperial').toFixed(2)} ft`;
  }
  return `${metres.toFixed(2)} m`;
}

/**
 * Update the unit toggle visual state.
 */
function updateUnitToggleUI() {
  const isImperial = getUnit() === 'imperial';
  unitMetricLabel.className    = `block py-2 px-3 font-medium transition-colors ${isImperial ? 'bg-white text-gray-600 hover:bg-gray-50' : 'bg-amber-500 text-white'}`;
  unitImperialLabel.className  = `block py-2 px-3 font-medium transition-colors ${isImperial ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`;
  const unitSuffix = isImperial ? 'ft' : 'm';
  areaUnitLabel.textContent    = isImperial ? '(ft²)' : '(m²)';
  heightUnitLabel.textContent  = `(${unitSuffix})`;
  treeUnitLabel.textContent    = `(${unitSuffix}, default ${isImperial ? '20' : '6'})`;
}

/**
 * Enable or disable export buttons.
 */
function setExportEnabled(enabled) {
  exportPngBtn.disabled = !enabled;
  exportTxtBtn.disabled = !enabled;
  exportMsg.textContent = enabled
    ? 'Analysis complete — exports available.'
    : 'Run an analysis to enable exports.';
}

// ─── Form submit handler ──────────────────────────────────────────────────────

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError(latError);
  clearError(lngError);

  const lat  = parseFloat(latInput.value);
  const lng  = parseFloat(lngInput.value);
  const unit = getUnit();

  // Validate coordinates
  const { valid, errors } = validateCoordinates(
    isNaN(lat) ? undefined : lat,
    isNaN(lng) ? undefined : lng,
  );

  if (isNaN(lat) || !valid) {
    showError(latError, errors.find(e => e.toLowerCase().includes('lat')) || errors[0] || 'Invalid latitude.');
  }
  if (isNaN(lng) || !valid) {
    const lngErr = errors.find(e => e.toLowerCase().includes('lng') || e.toLowerCase().includes('lon'));
    if (lngErr) showError(lngError, lngErr);
  }
  if (!valid || isNaN(lat) || isNaN(lng)) return;

  // Read optional inputs
  const windowArea      = parseFloat(document.getElementById('windowArea').value)      || 6;
  const windowHeight    = parseFloat(document.getElementById('windowHeight').value)    || 1.2;
  const orientationAngle= parseFloat(document.getElementById('orientationAngle').value)|| 180;
  const treeHeightRaw   = parseFloat(document.getElementById('treeHeight').value);
  const defaultTree     = unit === 'imperial' ? 20 : 6;
  const treeHeight      = isNaN(treeHeightRaw) ? defaultTree : treeHeightRaw;

  // Convert tree height to metres for calculations if imperial
  const treeHeightM = unit === 'imperial'
    ? convertDistance(treeHeight, 'imperial', 'metric')
    : treeHeight;
  const windowAreaM2 = unit === 'imperial'
    ? windowArea / (3.28084 * 3.28084)
    : windowArea;
  const windowHeightM = unit === 'imperial'
    ? convertDistance(windowHeight, 'imperial', 'metric')
    : windowHeight;

  // ── Solar engine calculations ──
  const optimalAzimuth    = getOptimalAzimuth(lat);
  const summerAltitudeDeg = getSummerAltitudeApprox(lat);
  const winterAltitudeDeg = getWinterAltitudeApprox(lat);
  const winterAltSunCalc  = getWinterSolsticeAltitude(lat, lng);

  // Use SunCalc value for gain if > 0, else fall back to approx
  const gainAltitude = winterAltSunCalc > 0 ? winterAltSunCalc : winterAltitudeDeg;

  const passiveSolarGain = calcPassiveSolarGain(windowAreaM2, gainAltitude);

  // Deviation of building orientation from optimal
  let deviation = Math.abs(orientationAngle - optimalAzimuth);
  if (deviation > 180) deviation = 360 - deviation;

  const relativeGainRatio = calcRelativeGainRatio(deviation, gainAltitude);
  const warnOrientation   = shouldWarnOrientation(orientationAngle, lat);
  const overhangMin       = calcOverhangMin(windowHeightM, summerAltitudeDeg);
  const overhangMax       = calcOverhangMax(windowHeightM, winterAltitudeDeg);

  const summerDuration = getSunlightDuration(lat, lng, 'summer');
  const winterDuration = getSunlightDuration(lat, lng, 'winter');

  // ── Site planner ──
  const summerArc = buildArcData(lat, lng, 'summer');
  const winterArc = buildArcData(lat, lng, 'winter');

  const summerShadowLen = calcShadowLength(treeHeightM, summerAltitudeDeg);
  const winterShadowLen = calcShadowLength(treeHeightM, winterAltitudeDeg);

  const { deciduous: deciduousZone, evergreen: evergreenZone } =
    calcPlantingZones(lat, summerShadowLen, winterShadowLen);

  // ── Canvas render ──
  // Scale: fit ~3× tree shadow length into half the canvas width
  const referenceLen = isFinite(summerShadowLen) ? summerShadowLen : 20;
  const metersPerPixel = (referenceLen * 3) / (canvas.width / 2);

  renderAll(canvas, summerArc, winterArc, deciduousZone, evergreenZone, {
    unit,
    metersPerPixel,
  });

  // ── Populate result DOM elements ──
  // Convert outputs to display unit
  const gainDisplay = unit === 'imperial'
    ? `${(passiveSolarGain * 10.764).toFixed(1)} BTU·h⁻¹·ft⁻²`
    : `${passiveSolarGain.toFixed(2)} W/m²·h`;

  resultGainValue.textContent = `Passive solar gain: ${gainDisplay}`;
  resultGainRatio.textContent = `Relative gain ratio: ${relativeGainRatio.toFixed(1)}%`;
  resultGainRecommendation.textContent =
    `Optimal orientation: ${optimalAzimuth === 180 ? 'South-facing (180°)' : 'North-facing (0°)'}`;

  if (warnOrientation) {
    resultOrientationWarning.classList.remove('hidden');
  } else {
    resultOrientationWarning.classList.add('hidden');
  }

  // Overhang
  if (overhangMin === null) {
    resultOverhangNa.classList.remove('hidden');
    resultOverhangMin.textContent = '—';
    resultOverhangMax.textContent = '—';
  } else {
    resultOverhangNa.classList.add('hidden');
    const minDisp = formatDistance(overhangMin, unit);
    const maxDisp = overhangMax !== null ? formatDistance(overhangMax, unit) : 'N/A';
    resultOverhangMin.textContent = `Min depth (summer shade): ${minDisp}`;
    resultOverhangMax.textContent = `Max depth (winter sun): ${maxDisp}`;
  }

  // Sunlight duration
  const polarMessages = [];

  if (summerDuration.isPolarDay) {
    resultSummerDuration.textContent = 'Summer solstice: Polar day — sun does not set on this date.';
    polarMessages.push('Polar day detected.');
  } else if (summerDuration.isPolarNight) {
    resultSummerDuration.textContent = 'Summer solstice: Polar night — sun does not rise on this date.';
    polarMessages.push('Polar night detected.');
  } else if (summerDuration.durationMs !== null) {
    resultSummerDuration.textContent = `Summer solstice: ${formatDuration(summerDuration.durationMs)}`;
  }

  if (winterDuration.isPolarDay) {
    resultWinterDuration.textContent = 'Winter solstice: Polar day — sun does not set on this date.';
  } else if (winterDuration.isPolarNight) {
    resultWinterDuration.textContent = 'Winter solstice: Polar night — sun does not rise on this date.';
  } else if (winterDuration.durationMs !== null) {
    resultWinterDuration.textContent = `Winter solstice: ${formatDuration(winterDuration.durationMs)}`;
  }

  if (polarMessages.length > 0) {
    resultPolarMsg.textContent = polarMessages.join(' ');
    resultPolarMsg.classList.remove('hidden');
  } else {
    resultPolarMsg.classList.add('hidden');
  }

  // Tree placement
  const isNorthern = lat >= 0;
  const deciduousSide = isNorthern ? 'south and west' : 'north and west';
  const evergreenSide = isNorthern ? 'north and northwest' : 'south and southwest';
  const shadowDisp = isFinite(summerShadowLen)
    ? formatDistance(summerShadowLen, unit)
    : 'very long (polar)';
  resultDeciduous.textContent =
    `Deciduous trees: plant on ${deciduousSide} side (summer shadow ~${shadowDisp})`;
  resultEvergreen.textContent =
    `Evergreen trees: plant on ${evergreenSide} side for wind buffering`;

  // Store result for export
  currentResult = {
    lat, lng, unit, optimalAzimuth,
    winterAltitudeDeg: gainAltitude, summerAltitudeDeg,
    passiveSolarGain, relativeGainRatio,
    overhangMin, overhangMax,
    summerDuration, winterDuration,
    summerArc, winterArc,
    deciduousZone, evergreenZone,
    analysisComplete: true,
    summerShadowLen, winterShadowLen,
    treeHeightM, metersPerPixel,
    isNorthern,
  };

  analysisComplete = true;
  setExportEnabled(true);
});

// ─── Geolocation handler ──────────────────────────────────────────────────────

geoBtn.addEventListener('click', () => {
  clearError(geoError);
  if (!navigator.geolocation) {
    showError(geoError, 'Geolocation is not supported by this browser.');
    return;
  }
  geoBtn.disabled = true;
  geoBtn.textContent = 'Locating…';

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latInput.value = pos.coords.latitude.toFixed(6);
      lngInput.value = pos.coords.longitude.toFixed(6);
      geoBtn.disabled = false;
      geoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg> Use My Location`;
    },
    (err) => {
      geoBtn.disabled = false;
      geoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 11c0 1.657-1.343 3-3 3S6 12.657 6 11s1.343-3 3-3 3 1.343 3 3z"/><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg> Use My Location`;
      const messages = {
        1: 'Location access was denied. Please enter coordinates manually.',
        2: 'Location could not be determined. Please enter coordinates manually.',
        3: 'Location request timed out. Please enter coordinates manually.',
      };
      showError(geoError, messages[err.code] || 'Geolocation failed. Please enter coordinates manually.');
    },
    { timeout: 10000 },
  );
});

// ─── Unit toggle ──────────────────────────────────────────────────────────────

[unitMetric, unitImperial].forEach(radio => {
  radio.addEventListener('change', () => {
    updateUnitToggleUI();
    if (analysisComplete && currentResult) {
      // Re-render and re-display with updated unit
      const prevUnit = currentResult.unit;
      const newUnit  = getUnit();

      // Re-render canvas (scale bar updates automatically)
      renderAll(
        canvas,
        currentResult.summerArc,
        currentResult.winterArc,
        currentResult.deciduousZone,
        currentResult.evergreenZone,
        { unit: newUnit, metersPerPixel: currentResult.metersPerPixel },
      );

      // Update overhang display
      const { overhangMin, overhangMax } = currentResult;
      if (overhangMin !== null) {
        resultOverhangMin.textContent =
          `Min depth (summer shade): ${formatDistance(overhangMin, newUnit)}`;
        resultOverhangMax.textContent =
          `Max depth (winter sun): ${overhangMax !== null ? formatDistance(overhangMax, newUnit) : 'N/A'}`;
      }

      // Update tree shadow display
      const { summerShadowLen, isNorthern } = currentResult;
      const deciduousSide = isNorthern ? 'south and west' : 'north and west';
      const shadowDisp = isFinite(summerShadowLen)
        ? formatDistance(summerShadowLen, newUnit)
        : 'very long (polar)';
      resultDeciduous.textContent =
        `Deciduous trees: plant on ${deciduousSide} side (summer shadow ~${shadowDisp})`;

      currentResult.unit = newUnit;
    }
  });
});

// ─── Canvas tooltip on mousemove ──────────────────────────────────────────────

canvas.addEventListener('mousemove', (e) => {
  if (!analysisComplete || !currentResult) return;

  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const canvasX = cx * scaleX;
  const canvasY = cy * scaleY;

  const centreX = canvas.width  / 2;
  const centreY = canvas.height / 2;
  const THRESHOLD = 12;

  let hit = hitTestArcPoint(canvasX, canvasY, currentResult.summerArc, THRESHOLD, centreX, centreY);
  if (!hit) {
    hit = hitTestArcPoint(canvasX, canvasY, currentResult.winterArc, THRESHOLD, centreX, centreY);
  }

  if (hit) {
    const timeStr = hit.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    tooltip.innerHTML =
      `<strong>${timeStr}</strong><br>` +
      `Alt: ${hit.altitudeDeg.toFixed(1)}°<br>` +
      `Az: ${hit.azimuthDeg.toFixed(1)}°`;
    tooltip.style.left = `${cx + 12}px`;
    tooltip.style.top  = `${cy - 8}px`;
    tooltip.classList.remove('hidden');
  } else {
    tooltip.classList.add('hidden');
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.classList.add('hidden');
});

// ─── PNG export ───────────────────────────────────────────────────────────────

exportPngBtn.addEventListener('click', () => {
  if (!analysisComplete) return;
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = 'passive-solar-analysis.png';
  a.click();
});

// ─── Text export ──────────────────────────────────────────────────────────────

/**
 * Build a plain-text summary of the analysis result.
 * @param {object} result
 * @returns {string}
 */
export function generateTextExport(result) {
  const u = result.unit;
  const lines = [
    '=== Passive Solar Planner — Analysis Report ===',
    '',
    `Site: ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`,
    `Units: ${u === 'imperial' ? 'Imperial (feet)' : 'Metric (metres)'}`,
    '',
    '--- Passive Solar Gain ---',
    `Passive solar gain: ${result.passiveSolarGain.toFixed(3)} (relative, ${u === 'imperial' ? 'BTU basis' : 'W/m² basis'})`,
    `Relative gain ratio: ${result.relativeGainRatio.toFixed(1)}%`,
    `Optimal orientation: ${result.optimalAzimuth === 180 ? 'South-facing (180°)' : 'North-facing (0°)'}`,
    '',
    '--- Overhang Depth Range ---',
  ];

  if (result.overhangMin === null) {
    lines.push('Overhang calculation not applicable at this latitude.');
  } else {
    lines.push(`Min overhang depth: ${formatDistance(result.overhangMin, u)}`);
    lines.push(result.overhangMax !== null
      ? `Max overhang depth: ${formatDistance(result.overhangMax, u)}`
      : 'Max overhang depth: N/A (winter altitude is 0°)');
  }

  lines.push('', '--- Sunlight Duration ---');

  const sd = result.summerDuration;
  if (sd.isPolarDay) lines.push('Summer solstice: Polar day — sun does not set.');
  else if (sd.isPolarNight) lines.push('Summer solstice: Polar night — sun does not rise.');
  else if (sd.durationMs !== null) lines.push(`Summer solstice: ${formatDuration(sd.durationMs)}`);

  const wd = result.winterDuration;
  if (wd.isPolarDay) lines.push('Winter solstice: Polar day — sun does not set.');
  else if (wd.isPolarNight) lines.push('Winter solstice: Polar night — sun does not rise.');
  else if (wd.durationMs !== null) lines.push(`Winter solstice: ${formatDuration(wd.durationMs)}`);

  lines.push('', '--- Tree Placement Recommendations ---');
  const isNorthern = result.isNorthern;
  const deciduousSide = isNorthern ? 'south and west' : 'north and west';
  const evergreenSide = isNorthern ? 'north and northwest' : 'south and southwest';
  const shadowDisp = isFinite(result.summerShadowLen)
    ? formatDistance(result.summerShadowLen, u)
    : 'very long (polar)';
  lines.push(`Deciduous trees: plant on ${deciduousSide} side (summer shadow ~${shadowDisp})`);
  lines.push(`Evergreen trees: plant on ${evergreenSide} side for wind buffering`);

  lines.push('', '=== End of Report ===');
  return lines.join('\n');
}

exportTxtBtn.addEventListener('click', () => {
  if (!analysisComplete || !currentResult) return;
  const text = generateTextExport(currentResult);
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'passive-solar-analysis.txt';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
});

// ─── Init ─────────────────────────────────────────────────────────────────────

updateUnitToggleUI();
setExportEnabled(false);
