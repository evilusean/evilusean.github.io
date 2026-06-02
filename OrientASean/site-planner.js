// site-planner.js
// Pure functions: arc data generation, shadow zones, tree placement.
// No DOM access. All exports are side-effect-free.

/**
 * Generate arc point data for one solstice day by sampling SunCalc every 30 minutes.
 * Azimuths are converted from SunCalc's south-based radians to north-clockwise degrees.
 *
 * @param {number} lat
 * @param {number} lng
 * @param {'summer'|'winter'} solstice
 * @returns {ArcPoint[]}  Ordered array from sunrise to sunset
 */
export function buildArcData(lat, lng, solstice) {
  const year = new Date().getFullYear();

  let solsticeDate;
  if (solstice === 'summer') {
    solsticeDate = lat >= 0
      ? new Date(Date.UTC(year, 5, 21))   // Jun 21 — NH summer
      : new Date(Date.UTC(year, 11, 21)); // Dec 21 — SH summer
  } else {
    solsticeDate = lat >= 0
      ? new Date(Date.UTC(year, 11, 21)) // Dec 21 — NH winter
      : new Date(Date.UTC(year, 5, 21)); // Jun 21 — SH winter
  }

  const times = SunCalc.getTimes(solsticeDate, lat, lng);
  const sunrise = times.sunrise;
  const sunset  = times.sunset;
  const solarNoon = times.solarNoon;

  // Polar day/night — no arc to draw
  if (isNaN(sunrise) || isNaN(sunset)) return [];

  const points = [];
  const STEP_MS = 30 * 60 * 1000; // 30 minutes

  // Snap start to nearest 30-min step at or after sunrise
  let t = new Date(Math.ceil(sunrise.getTime() / STEP_MS) * STEP_MS);

  while (t <= sunset) {
    const pos = SunCalc.getPosition(t, lat, lng);
    const altitudeDeg = pos.altitude * (180 / Math.PI);
    // SunCalc azimuth: radians from south, clockwise west → convert to N-clockwise degrees
    const azimuthDeg = (pos.azimuth * (180 / Math.PI)) + 180;

    /** @type {ArcPoint} */
    const point = {
      time: new Date(t),
      altitudeDeg,
      azimuthDeg,
    };

    // Tag special points
    if (Math.abs(t - sunrise) < STEP_MS / 2) point.label = 'sunrise';
    if (Math.abs(t - sunset)  < STEP_MS / 2) point.label = 'sunset';

    points.push(point);
    t = new Date(t.getTime() + STEP_MS);
  }

  // Ensure sunrise and sunset endpoints are included
  const firstPos = SunCalc.getPosition(sunrise, lat, lng);
  const lastPos  = SunCalc.getPosition(sunset,  lat, lng);

  const sunrisePoint = {
    time: new Date(sunrise),
    altitudeDeg: firstPos.altitude * (180 / Math.PI),
    azimuthDeg:  (firstPos.azimuth * (180 / Math.PI)) + 180,
    label: 'sunrise',
  };
  const sunsetPoint = {
    time: new Date(sunset),
    altitudeDeg: lastPos.altitude * (180 / Math.PI),
    azimuthDeg:  (lastPos.azimuth * (180 / Math.PI)) + 180,
    label: 'sunset',
  };

  // Tag solar noon within the sampled points (find nearest)
  let nearestNoonIdx = 0;
  let minNoonDiff = Infinity;
  for (let i = 0; i < points.length; i++) {
    const diff = Math.abs(points[i].time - solarNoon);
    if (diff < minNoonDiff) { minNoonDiff = diff; nearestNoonIdx = i; }
  }
  if (points[nearestNoonIdx]) {
    points[nearestNoonIdx].label = 'noon';
  }

  // Replace first/last with exact sunrise/sunset
  if (points.length > 0) {
    points[0] = sunrisePoint;
    points[points.length - 1] = sunsetPoint;
  } else {
    points.push(sunrisePoint, sunsetPoint);
  }

  return points;
}

/**
 * Compute shadow length for an object at a given solar altitude.
 * Returns Infinity when the sun is at or below the horizon.
 * @param {number} objectHeight  metres or feet
 * @param {number} altitudeDeg   Solar altitude in degrees
 * @returns {number}             Shadow length (same units), or Infinity
 */
export function calcShadowLength(objectHeight, altitudeDeg) {
  if (altitudeDeg <= 0) return Infinity;
  return objectHeight / Math.tan(altitudeDeg * Math.PI / 180);
}

/**
 * Compute deciduous and evergreen planting zone geometries relative to building centre.
 * Zones are expressed as arc sectors (north-clockwise angles) with a reach radius.
 *
 * Northern Hemisphere:
 *   Deciduous: south + west quadrants  → 90°–270°
 *   Evergreen: north + northwest       → 270°–360°/0°–45°  (represented as 270°–405°)
 *
 * Southern Hemisphere: mirrors (deciduous north+west, evergreen south+southwest).
 *
 * @param {number} lat
 * @param {number} summerShadowLength  metres or feet
 * @param {number} winterShadowLength  metres or feet
 * @returns {{ deciduous: ZoneGeometry, evergreen: ZoneGeometry }}
 */
export function calcPlantingZones(lat, summerShadowLength, winterShadowLength) {
  const isNorthern = lat >= 0;

  // Clamp infinite shadow lengths to a large but finite value for display
  const summerRadius = isFinite(summerShadowLength) ? summerShadowLength : 0;
  const winterRadius = isFinite(winterShadowLength) ? winterShadowLength : 0;

  if (isNorthern) {
    return {
      deciduous: {
        startAngleDeg: 90,
        endAngleDeg:   270,
        radius: summerRadius,
        type: 'deciduous',
      },
      evergreen: {
        startAngleDeg: 270,
        endAngleDeg:   405,   // 45° past north (wraps)
        radius: winterRadius,
        type: 'evergreen',
      },
    };
  } else {
    // Southern Hemisphere mirror
    return {
      deciduous: {
        startAngleDeg: 270,
        endAngleDeg:   90,    // north + west (wraps through 0)
        radius: summerRadius,
        type: 'deciduous',
      },
      evergreen: {
        startAngleDeg: 90,
        endAngleDeg:   225,   // south + southwest
        radius: winterRadius,
        type: 'evergreen',
      },
    };
  }
}

/**
 * @typedef {Object} ArcPoint
 * @property {Date}   time
 * @property {number} altitudeDeg
 * @property {number} azimuthDeg   North-clockwise, 0–360
 * @property {string} [label]      'sunrise' | 'noon' | 'sunset'
 */

/**
 * @typedef {Object} ZoneGeometry
 * @property {number} startAngleDeg   North-clockwise start of arc sector
 * @property {number} endAngleDeg     North-clockwise end of arc sector
 * @property {number} radius          Shadow reach distance
 * @property {string} type            'deciduous' | 'evergreen'
 */
