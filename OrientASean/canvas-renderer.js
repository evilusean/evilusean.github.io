// canvas-renderer.js
// Canvas drawing: arcs, planting zones, labels, scale bar, compass rose, tooltips.

const SUMMER_COLOUR  = '#f59e0b';  // amber-400
const WINTER_COLOUR  = '#60a5fa';  // blue-400
const DECIDUOUS_FILL = 'rgba(74, 222, 128, 0.35)';   // green-400, semi-transparent
const EVERGREEN_FILL = 'rgba(6, 78, 59, 0.35)';      // emerald-900, semi-transparent
const BG_COLOUR      = '#f9fafb';  // gray-50

/**
 * Clear the canvas and fill with the background colour, resetting any transforms.
 * @param {HTMLCanvasElement} canvas
 */
export function clearCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Map a north-clockwise azimuth bearing to canvas (x, y) coordinates.
 * North is at the top; origin is canvas centre.
 * canvasX = cx + r * sin(θ_rad)
 * canvasY = cy − r * cos(θ_rad)
 */
function bearingToCanvas(azimuthDeg, radius, cx, cy) {
  const rad = azimuthDeg * Math.PI / 180;
  return {
    x: cx + radius * Math.sin(rad),
    y: cy - radius * Math.cos(rad),
  };
}

/**
 * Scale a real-world distance to canvas pixels.
 * @param {number} metres         Real-world distance
 * @param {number} metersPerPixel Scale factor
 */
function toPixels(metres, metersPerPixel) {
  return metres / metersPerPixel;
}

/**
 * Draw a sun arc as a polyline.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./site-planner.js').ArcPoint[]} points
 * @param {string} colour
 * @param {number} cx  Canvas centre x
 * @param {number} cy  Canvas centre y
 * @param {number} metersPerPixel
 * @param {number} maxAltitudeDeg  Used to normalise arc radius across summer/winter
 */
function drawArc(ctx, points, colour, cx, cy, metersPerPixel, maxAltitudeDeg) {
  if (points.length < 2) return;

  // Map altitude to a visual radius: higher sun = smaller radius (closer to zenith)
  // We use a fixed reference radius and scale by altitude ratio
  const refRadius = Math.min(cx, cy) * 0.75;

  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap  = 'round';
  ctx.beginPath();

  points.forEach((pt, i) => {
    // Radius shrinks as altitude increases (sun overhead = small circle on ground plan)
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = refRadius * (1 - altFraction * 0.6);
    const { x, y } = bearingToCanvas(pt.azimuthDeg, r, cx, cy);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
  ctx.restore();
}

/**
 * Draw "Sunrise", "Noon", "Sunset" labels at the labelled ArcPoints.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./site-planner.js').ArcPoint[]} points
 * @param {string} colour
 * @param {number} cx
 * @param {number} cy
 */
function drawArcLabels(ctx, points, colour, cx, cy) {
  const refRadius = Math.min(cx, cy) * 0.75;

  ctx.save();
  ctx.fillStyle = colour;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const pt of points) {
    if (!pt.label) continue;
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = refRadius * (1 - altFraction * 0.6);
    const { x, y } = bearingToCanvas(pt.azimuthDeg, r, cx, cy);

    // Offset label slightly outward from the point
    const offsetR = r + 16;
    const { x: lx, y: ly } = bearingToCanvas(pt.azimuthDeg, offsetR, cx, cy);

    const labelText = pt.label.charAt(0).toUpperCase() + pt.label.slice(1);

    // Background pill for readability
    const metrics = ctx.measureText(labelText);
    const tw = metrics.width + 8;
    const th = 16;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.82)';
    ctx.beginPath();
    ctx.roundRect(lx - tw / 2, ly - th / 2, tw, th, 4);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = colour;
    ctx.fillText(labelText, lx, ly);

    // Dot at the exact point
    ctx.save();
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Draw a filled arc sector for a planting zone.
 * @param {CanvasRenderingContext2D} ctx
 * @param {import('./site-planner.js').ZoneGeometry} zone
 * @param {string} fillColour
 * @param {number} cx
 * @param {number} cy
 * @param {number} metersPerPixel
 */
function drawZone(ctx, zone, fillColour, cx, cy, metersPerPixel) {
  if (!zone || zone.radius <= 0) return;

  const radiusPx = Math.max(20, toPixels(zone.radius, metersPerPixel));
  // Clamp to canvas bounds
  const maxR = Math.min(cx, cy) * 0.9;
  const r = Math.min(radiusPx, maxR);

  // Convert north-clockwise degrees to standard canvas radians
  // canvas angle 0 = east; north = -π/2
  // northClockwise → canvas: subtract 90°, then convert
  const toCanvasAngle = (deg) => (deg - 90) * Math.PI / 180;

  const startRad = toCanvasAngle(zone.startAngleDeg);
  const endRad   = toCanvasAngle(zone.endAngleDeg);

  ctx.save();
  ctx.fillStyle = fillColour;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, r, startRad, endRad);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw compass rose (N/S/E/W) around the canvas centre.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 */
function drawCompassRose(ctx, cx, cy) {
  const dirs = [
    { label: 'N', azimuth: 0 },
    { label: 'E', azimuth: 90 },
    { label: 'S', azimuth: 180 },
    { label: 'W', azimuth: 270 },
  ];
  const rLabel = Math.min(cx, cy) * 0.94;
  const rTick  = Math.min(cx, cy) * 0.88;

  ctx.save();
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const { label, azimuth } of dirs) {
    const { x, y } = bearingToCanvas(azimuth, rLabel, cx, cy);
    const { x: tx, y: ty } = bearingToCanvas(azimuth, rTick, cx, cy);

    // Tick line
    ctx.save();
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + (tx - cx) * 0.96, cy + (ty - cy) * 0.96);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.restore();

    // Label
    ctx.fillStyle = label === 'N' ? '#d97706' : '#374151';
    ctx.fillText(label, x, y);
  }
  ctx.restore();
}

/**
 * Draw a scale bar in the bottom-left corner of the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasWidth
 * @param {number} canvasHeight
 * @param {'metric'|'imperial'} unit
 * @param {number} metersPerPixel
 */
function drawScaleBar(ctx, canvasWidth, canvasHeight, unit, metersPerPixel) {
  // Pick a nice round scale bar length
  const targetPx = 80;
  const targetMetres = targetPx * metersPerPixel;

  // Round to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(targetMetres)));
  const nice = [1, 2, 5, 10].map(f => f * magnitude)
    .find(n => n / metersPerPixel >= 40) || magnitude;

  const barPx = nice / metersPerPixel;
  const label = unit === 'imperial'
    ? `${(nice * 3.28084).toFixed(0)} ft`
    : `${nice.toFixed(0)} m`;

  const x = 16;
  const y = canvasHeight - 20;

  ctx.save();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.lineCap = 'square';

  // Bar
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + barPx, y);
  // End ticks
  ctx.moveTo(x, y - 4);
  ctx.lineTo(x, y + 4);
  ctx.moveTo(x + barPx, y - 4);
  ctx.lineTo(x + barPx, y + 4);
  ctx.stroke();

  // Label
  ctx.fillStyle = '#374151';
  ctx.font = '11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, x + barPx / 2, y - 6);
  ctx.restore();
}

/**
 * Draw a building footprint placeholder at the canvas centre.
 */
function drawBuilding(ctx, cx, cy) {
  const size = 14;
  ctx.save();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 2;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.rect(cx - size, cy - size, size * 2, size * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#374151';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⌂', cx, cy);
  ctx.restore();
}

/**
 * Return the nearest ArcPoint to a canvas coordinate within a pixel threshold.
 * @param {number} canvasX
 * @param {number} canvasY
 * @param {import('./site-planner.js').ArcPoint[]} points
 * @param {number} thresholdPx
 * @param {number} cx   Canvas centre x (used to recompute point positions)
 * @param {number} cy   Canvas centre y
 * @returns {import('./site-planner.js').ArcPoint|null}
 */
export function hitTestArcPoint(canvasX, canvasY, points, thresholdPx, cx, cy) {
  const refRadius = Math.min(cx, cy) * 0.75;
  let nearest = null;
  let minDist  = Infinity;

  for (const pt of points) {
    const altFraction = Math.max(0, Math.min(pt.altitudeDeg, 89)) / 90;
    const r = refRadius * (1 - altFraction * 0.6);
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
 * Full render: clear → zones → arcs → labels → compass → scale bar → building.
 * @param {HTMLCanvasElement} canvas
 * @param {import('./site-planner.js').ArcPoint[]} summerArc
 * @param {import('./site-planner.js').ArcPoint[]} winterArc
 * @param {import('./site-planner.js').ZoneGeometry} deciduousZone
 * @param {import('./site-planner.js').ZoneGeometry} evergreenZone
 * @param {{ unit: 'metric'|'imperial', metersPerPixel: number }} options
 */
export function renderAll(canvas, summerArc, winterArc, deciduousZone, evergreenZone, options) {
  const { unit = 'metric', metersPerPixel = 0.5 } = options || {};
  const ctx = canvas.getContext('2d');
  const cx = canvas.width  / 2;
  const cy = canvas.height / 2;

  clearCanvas(canvas);

  // Planting zones (behind arcs)
  drawZone(ctx, deciduousZone, DECIDUOUS_FILL, cx, cy, metersPerPixel);
  drawZone(ctx, evergreenZone, EVERGREEN_FILL, cx, cy, metersPerPixel);

  // Sun arcs
  drawArc(ctx, summerArc, SUMMER_COLOUR, cx, cy, metersPerPixel, 90);
  drawArc(ctx, winterArc, WINTER_COLOUR, cx, cy, metersPerPixel, 90);

  // Labels on arcs
  drawArcLabels(ctx, summerArc, SUMMER_COLOUR, cx, cy);
  drawArcLabels(ctx, winterArc, WINTER_COLOUR, cx, cy);

  // Compass rose, scale bar, building
  drawCompassRose(ctx, cx, cy);
  drawScaleBar(ctx, canvas.width, canvas.height, unit, metersPerPixel);
  drawBuilding(ctx, cx, cy);
}
