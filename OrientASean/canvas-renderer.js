// canvas-renderer.js
// Top-down site map: sun paths, tree-planting bands, house orientation.

const SUMMER_COLOUR = '#f59e0b';
const WINTER_COLOUR = '#60a5fa';
const DECIDUOUS_FILL = 'rgba(134, 239, 172, 0.28)';
const DECIDUOUS_STROKE = 'rgba(22, 163, 74, 0.55)';
const EVERGREEN_FILL = 'rgba(16, 185, 129, 0.22)';
const EVERGREEN_STROKE = 'rgba(6, 78, 59, 0.5)';
const BG_COLOUR = '#f9fafb';
const HOUSE_FILL = 'rgba(254, 243, 199, 0.98)';
const HOUSE_STROKE = '#92400e';

/** @param {number} cx @param {number} cy */
function layoutMetrics(cx, cy) {
  const r = Math.min(cx, cy);
  return {
    arcRadius: r * 0.68,
    labelRadius: r * 0.82,
    housePad: 48,
    zoneInner: 56,
    zoneOuterMax: r * 0.86,
  };
}

export function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function bearingToCanvas(azimuthDeg, radius, cx, cy) {
  const rad = azimuthDeg * Math.PI / 180;
  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
  };
}

function toPixels(metres, metersPerPixel) {
  return metres / metersPerPixel;
}

function toCanvasAngle(deg) {
  return (deg - 90) * Math.PI / 180;
}

/**
 * Annular sector (ring slice) — tree planting band, not a shadow cone.
 */
function drawZoneBand(ctx, zone, fill, stroke, cx, cy, innerR, outerRMax, metersPerPixel) {
  if (!zone || zone.radius <= 0) return;

  const outerR = Math.min(
    outerRMax,
    Math.max(innerR + 28, toPixels(zone.radius, metersPerPixel)),
  );
  if (outerR <= innerR + 6) return;

  const startRad = toCanvasAngle(zone.startAngleDeg);
  const endDeg = zone.endAngleDeg % 360;
  const endRad = toCanvasAngle(endDeg);
  const counterclockwise = endDeg < zone.startAngleDeg;

  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startRad, endRad, counterclockwise);
  ctx.arc(cx, cy, innerR, endRad, startRad, !counterclockwise);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function drawHousePad(ctx, cx, cy, radius) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawArc(ctx, points, colour, cx, cy, arcRadius) {
  if (points.length < 2) return;

  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();

  points.forEach((pt, i) => {
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = arcRadius * (0.92 + altFraction * 0.08);
    const { x, y } = bearingToCanvas(pt.azimuthDeg, r, cx, cy);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

/** Summer arc only — labels sit on a fixed ring to avoid overlap with the house. */
function drawSummerArcLabels(ctx, points, colour, cx, cy, labelRadius) {
  const labels = { sunrise: 'Sunrise', noon: 'Noon', sunset: 'Sunset' };

  ctx.save();
  ctx.font = '600 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const pt of points) {
    if (!pt.label || !labels[pt.label]) continue;
    const { x: lx, y: ly } = bearingToCanvas(pt.azimuthDeg, labelRadius, cx, cy);
    const text = labels[pt.label];
    const tw = ctx.measureText(text).width + 10;

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(lx - tw / 2, ly - 9, tw, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = colour === SUMMER_COLOUR ? '#92400e' : '#1e40af';
    ctx.fillText(text, lx, ly);
  }
  ctx.restore();
}

function findNoonPoint(arc) {
  return arc.find(p => p.label === 'noon') ||
    arc.reduce((best, p) =>
      (p.altitudeDeg > (best?.altitudeDeg ?? -1) ? p : best), null);
}

function drawNoonDots(ctx, summerArc, winterArc, cx, cy, arcRadius) {
  const summerNoon = findNoonPoint(summerArc);
  const winterNoon = findNoonPoint(winterArc);
  if (!summerNoon && !winterNoon) return;

  const drawDot = (pt, colour, offsetPx) => {
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = arcRadius * (0.92 + altFraction * 0.08);
    const { x, y } = bearingToCanvas(pt.azimuthDeg, r, cx, cy);
    const nx = Math.sin(pt.azimuthDeg * Math.PI / 180);
    const ny = -Math.cos(pt.azimuthDeg * Math.PI / 180);
    ctx.beginPath();
    ctx.arc(x + nx * offsetPx, y + ny * offsetPx, 5, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  };

  ctx.save();
  if (summerNoon) drawDot(summerNoon, SUMMER_COLOUR, -6);
  if (winterNoon) drawDot(winterNoon, WINTER_COLOUR, 6);
  ctx.restore();
}

function drawHouse(ctx, cx, cy, orientationDeg, optimalAzimuth) {
  const halfW = 20;
  const halfD = 12;
  const rad = orientationDeg * Math.PI / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);

  ctx.fillStyle = HOUSE_FILL;
  ctx.strokeStyle = HOUSE_STROKE;
  ctx.lineWidth = 2;
  ctx.fillRect(-halfW, -halfD, halfW * 2, halfD * 2);
  ctx.strokeRect(-halfW, -halfD, halfW * 2, halfD * 2);

  ctx.fillStyle = '#fbbf24';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-7, -halfD);
  ctx.lineTo(0, -halfD - 8);
  ctx.lineTo(7, -halfD);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#b45309';
  ctx.fillStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -halfD - 10);
  ctx.lineTo(0, -halfD - 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -halfD - 22);
  ctx.lineTo(-4, -halfD - 16);
  ctx.lineTo(4, -halfD - 16);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 8px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('FRONT', 0, -halfD - 24);

  ctx.restore();

  let dev = Math.abs(orientationDeg - optimalAzimuth);
  if (dev > 180) dev = 360 - dev;
  if (dev > 12) {
    const { x: ox, y: oy } = bearingToCanvas(optimalAzimuth, 42, cx, cy);
    ctx.save();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.65)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ox, oy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

function drawGardenDot(ctx, cx, cy, gardenAzimuthDeg, metersPerPixel, zoneInner) {
  const distPx = Math.min(
    toPixels(10, metersPerPixel),
    zoneInner + 14,
  );
  const { x, y } = bearingToCanvas(gardenAzimuthDeg, distPx, cx, cy);

  ctx.save();
  ctx.fillStyle = 'rgba(254, 243, 199, 0.95)';
  ctx.strokeStyle = '#16a34a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawCompassBox(ctx, cx, cy) {
  const boxX = 14;
  const boxY = 14;
  const size = 52;

  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, size, size, 6);
  ctx.fill();
  ctx.stroke();

  const bx = boxX + size / 2;
  const by = boxY + size / 2;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d97706';
  ctx.fillText('N', bx, by - 14);
  ctx.fillStyle = '#6b7280';
  ctx.fillText('S', bx, by + 14);
  ctx.fillText('W', bx - 14, by);
  ctx.fillText('E', bx + 14, by);
  ctx.restore();
}

function drawScaleBar(ctx, canvasWidth, canvasHeight, unit, metersPerPixel) {
  const targetPx = 80;
  const targetMetres = targetPx * metersPerPixel;
  const magnitude = Math.pow(10, Math.floor(Math.log10(targetMetres)));
  const nice = [1, 2, 5, 10].map(f => f * magnitude)
    .find(n => n / metersPerPixel >= 40) || magnitude;

  const barPx = nice / metersPerPixel;
  const label = unit === 'imperial'
    ? `${(nice * 3.28084).toFixed(0)} ft`
    : `${nice.toFixed(0)} m`;

  const x = 14;
  const y = canvasHeight - 16;

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeStyle = '#d1d5db';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 22, barPx + 8, 26, 4);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barPx, y);
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x, y + 3);
  ctx.moveTo(x + barPx, y - 3);
  ctx.lineTo(x + barPx, y + 3);
  ctx.stroke();

  ctx.fillStyle = '#374151';
  ctx.font = '10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, x + barPx / 2, y - 5);
  ctx.restore();
}

export function hitTestArcPoint(canvasX, canvasY, points, thresholdPx, cx, cy) {
  const { arcRadius } = layoutMetrics(cx, cy);
  let nearest = null;
  let minDist = Infinity;

  for (const pt of points) {
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = arcRadius * (0.92 + altFraction * 0.08);
    const { x, y } = bearingToCanvas(pt.azimuthDeg, r, cx, cy);
    const dist = Math.hypot(canvasX - x, canvasY - y);
    if (dist < thresholdPx && dist < minDist) {
      minDist = dist;
      nearest = pt;
    }
  }
  return nearest;
}

/**
 * @param {{
 *   unit?: 'metric'|'imperial',
 *   metersPerPixel?: number,
 *   orientationDeg?: number,
 *   optimalAzimuth?: number,
 *   gardenAzimuthDeg?: number,
 * }} options
 */
export function renderAll(canvas, summerArc, winterArc, deciduousZone, evergreenZone, options) {
  const {
    unit = 'metric',
    metersPerPixel = 0.5,
    orientationDeg = 180,
    optimalAzimuth = 180,
    gardenAzimuthDeg = 180,
  } = options || {};

  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const { arcRadius, labelRadius, housePad, zoneInner, zoneOuterMax } = layoutMetrics(cx, cy);

  clearCanvas(canvas);

  drawHousePad(ctx, cx, cy, housePad);

  drawZoneBand(ctx, deciduousZone, DECIDUOUS_FILL, DECIDUOUS_STROKE, cx, cy, zoneInner, zoneOuterMax, metersPerPixel);
  drawZoneBand(ctx, evergreenZone, EVERGREEN_FILL, EVERGREEN_STROKE, cx, cy, zoneInner, zoneOuterMax, metersPerPixel);

  drawArc(ctx, summerArc, SUMMER_COLOUR, cx, cy, arcRadius);
  drawArc(ctx, winterArc, WINTER_COLOUR, cx, cy, arcRadius);

  drawSummerArcLabels(ctx, summerArc, SUMMER_COLOUR, cx, cy, labelRadius);
  drawNoonDots(ctx, summerArc, winterArc, cx, cy, arcRadius);

  drawGardenDot(ctx, cx, cy, gardenAzimuthDeg, metersPerPixel, zoneInner);
  drawHouse(ctx, cx, cy, orientationDeg, optimalAzimuth);

  drawCompassBox(ctx, cx, cy);
  drawScaleBar(ctx, canvas.width, canvas.height, unit, metersPerPixel);
}
