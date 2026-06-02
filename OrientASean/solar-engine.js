// solar-engine.js
// Pure functions: validation, solar gain, overhang, sunlight duration.
// No DOM access. All exports are side-effect-free.

/**
 * Validate geographic coordinates.
 * @param {number} lat  Decimal degrees, must be in [−90, +90]
 * @param {number} lng  Decimal degrees, must be in [−180, +180]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCoordinates(lat, lng) {
  const errors = [];

  if (typeof lat !== 'number' || !isFinite(lat)) {
    errors.push('Latitude must be a finite number.');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and +90.');
  }

  if (typeof lng !== 'number' || !isFinite(lng)) {
    errors.push('Longitude must be a finite number.');
  } else if (lng < -180 || lng > 180) {
    errors.push('Longitude must be between -180 and +180.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check whether a latitude is within a polar circle.
 * @param {number} lat  Decimal degrees
 * @returns {boolean}  true if |lat| >= 66.5
 */
export function isPolarLatitude(lat) {
  return Math.abs(lat) >= 66.5;
}

/**
 * Determine optimal solar orientation (azimuth in degrees, north-clockwise).
 * Northern Hemisphere (lat >= 0) → 180° (south-facing).
 * Southern Hemisphere (lat < 0)  →   0° (north-facing).
 * @param {number} lat
 * @returns {number}  0 or 180
 */
export function getOptimalAzimuth(lat) {
  return lat >= 0 ? 180 : 0;
}

/**
 * Summer Solstice solar noon altitude approximation: |lat| + 23.5°, capped at 90.
 * @param {number} lat  Decimal degrees
 * @returns {number}    altitudeDeg, never > 90
 */
export function getSummerAltitudeApprox(lat) {
  return Math.min(Math.abs(lat) + 23.5, 90);
}

/**
 * Winter Solstice solar noon altitude approximation: |lat| − 23.5°, floored at 0.
 * @param {number} lat  Decimal degrees
 * @returns {number}    altitudeDeg, never < 0
 */
export function getWinterAltitudeApprox(lat) {
  return Math.max(Math.abs(lat) - 23.5, 0);
}

/**
 * Calculate passive solar heat gain: windowArea × cos(altitudeDeg).
 * @param {number} windowArea   m² or ft²
 * @param {number} altitudeDeg  Solar altitude in degrees
 * @returns {number}            Gain (same units as windowArea)
 */
export function calcPassiveSolarGain(windowArea, altitudeDeg) {
  return windowArea * Math.cos(altitudeDeg * Math.PI / 180);
}

/**
 * Relative gain ratio vs theoretical maximum (deviation = 0°).
 * Formula: max(0, cos(orientationDeg × π/180)) × 100
 * The altitude factor cancels out in the ratio, so altitudeDeg is not used in the
 * calculation but is accepted for API consistency.
 * @param {number} orientationDeg  Deviation from optimal azimuth in degrees
 * @param {number} altitudeDeg     Accepted for interface consistency (unused in ratio)
 * @returns {number}               0–100
 */
export function calcRelativeGainRatio(orientationDeg, altitudeDeg) {
  return Math.max(0, Math.cos(orientationDeg * Math.PI / 180)) * 100;
}

/**
 * Orientation warning: true when |deviation from optimal| > 30°.
 * @param {number} orientationDeg  Building orientation (0 = north, 180 = south)
 * @param {number} lat             Site latitude
 * @returns {boolean}
 */
export function shouldWarnOrientation(orientationDeg, lat) {
  const optimalAzimuth = lat >= 0 ? 180 : 0;
  let deviation = Math.abs(orientationDeg - optimalAzimuth);
  if (deviation > 180) deviation = 360 - deviation;
  return deviation > 30;
}

/**
 * Minimum overhang depth for full summer shading.
 * Returns null when summerAltitudeDeg <= 0 (polar / not applicable).
 * @param {number} windowHeight      metres or feet
 * @param {number} summerAltitudeDeg
 * @returns {number|null}
 */
export function calcOverhangMin(windowHeight, summerAltitudeDeg) {
  if (summerAltitudeDeg <= 0) return null;
  return windowHeight / Math.tan(summerAltitudeDeg * Math.PI / 180);
}

/**
 * Maximum overhang depth still allowing full winter sun at sill.
 * Returns null when winterAltitudeDeg <= 0.
 * @param {number} windowHeight
 * @param {number} winterAltitudeDeg
 * @returns {number|null}
 */
export function calcOverhangMax(windowHeight, winterAltitudeDeg) {
  if (winterAltitudeDeg <= 0) return null;
  return windowHeight / Math.tan(winterAltitudeDeg * Math.PI / 180);
}

/**
 * Convert a distance between metric (metres) and imperial (feet).
 * Factor: 1 m = 3.28084 ft.
 * @param {number} value
 * @param {'metric'|'imperial'} from
 * @param {'metric'|'imperial'} to
 * @returns {number}
 */
export function convertDistance(value, from, to) {
  if (from === to) return value;
  if (from === 'metric' && to === 'imperial') return value * 3.28084;
  if (from === 'imperial' && to === 'metric') return value / 3.28084;
  return value;
}

/**
 * Compute Winter Solstice solar noon altitude at the given lat/lng using SunCalc.
 * Northern Hemisphere uses Dec 21; Southern Hemisphere uses Jun 21.
 * @param {number} lat
 * @param {number} lng
 * @returns {number}  altitudeDeg (degrees above horizon)
 */
export function getWinterSolsticeAltitude(lat, lng) {
  // SunCalc is loaded as a global from CDN
  const year = new Date().getFullYear();
  // Northern Hemisphere winter solstice ≈ Dec 21; Southern ≈ Jun 21
  const solsticeDate = lat >= 0
    ? new Date(Date.UTC(year, 11, 21, 12, 0, 0))   // December 21 noon UTC
    : new Date(Date.UTC(year, 5, 21, 12, 0, 0));    // June 21 noon UTC

  // Get solar noon for a more accurate altitude reading
  const times = SunCalc.getTimes(solsticeDate, lat, lng);
  const noonDate = isNaN(times.solarNoon) ? solsticeDate : times.solarNoon;

  const pos = SunCalc.getPosition(noonDate, lat, lng);
  const altitudeDeg = pos.altitude * (180 / Math.PI);
  return Math.max(0, altitudeDeg);
}

/**
 * Compute sunlight duration for a solstice day at the given location.
 * Detects polar day/night when SunCalc returns NaN for sunrise/sunset.
 * @param {number} lat
 * @param {number} lng
 * @param {'summer'|'winter'} solstice
 * @returns {{ durationMs: number|null, isPolarDay: boolean, isPolarNight: boolean }}
 */
export function getSunlightDuration(lat, lng, solstice) {
  const year = new Date().getFullYear();

  let solsticeDate;
  if (solstice === 'summer') {
    // Northern Hemisphere summer = Jun 21; Southern = Dec 21
    solsticeDate = lat >= 0
      ? new Date(Date.UTC(year, 5, 21))   // June 21
      : new Date(Date.UTC(year, 11, 21)); // December 21
  } else {
    // Northern Hemisphere winter = Dec 21; Southern = Jun 21
    solsticeDate = lat >= 0
      ? new Date(Date.UTC(year, 11, 21)) // December 21
      : new Date(Date.UTC(year, 5, 21)); // June 21
  }

  const times = SunCalc.getTimes(solsticeDate, lat, lng);
  const sunrise = times.sunrise;
  const sunset = times.sunset;

  const isPolarDay = isNaN(sunrise) && isNaN(sunset)
    ? _isPolarDay(lat, solstice)
    : isNaN(sunrise) || isNaN(sunset);

  const isPolarNight = !isPolarDay && (isNaN(sunrise) || isNaN(sunset));

  if (isNaN(sunrise) || isNaN(sunset)) {
    // Determine which polar condition based on latitude and solstice
    const abovePolarCircle = Math.abs(lat) >= 66.5;
    if (abovePolarCircle) {
      const northernSummer = (lat > 0 && solstice === 'summer') || (lat < 0 && solstice === 'winter');
      return { durationMs: null, isPolarDay: northernSummer, isPolarNight: !northernSummer };
    }
    return { durationMs: null, isPolarDay: false, isPolarNight: false };
  }

  const durationMs = sunset.getTime() - sunrise.getTime();
  return { durationMs, isPolarDay: false, isPolarNight: false };
}

/** Internal helper: determine polar day vs polar night for ambiguous NaN cases. */
function _isPolarDay(lat, solstice) {
  if (lat >= 0) return solstice === 'summer';
  return solstice === 'winter';
}

/**
 * Shortest signed angle from `fromDeg` to `toDeg` (north-clockwise, degrees).
 * Positive = clockwise when viewed from above.
 * @param {number} fromDeg
 * @param {number} toDeg
 * @returns {number}  in (−180, +180]
 */
export function shortestSignedTurn(fromDeg, toDeg) {
  let delta = ((toDeg - fromDeg) % 360 + 360) % 360;
  if (delta > 180) delta -= 360;
  return delta;
}

/**
 * How to rotate the building so the main wall (bay window) faces optimal solar gain.
 * @param {number} orientationDeg  Current main-wall bearing from north (0–360)
 * @param {number} lat
 * @returns {{
 *   optimalAzimuth: number,
 *   deviationDeg: number,
 *   turnDegrees: number,
 *   turnDirection: 'clockwise'|'counterclockwise'|'none',
 *   turnLabel: string,
 * }}
 */
export function calcOrientationTurn(orientationDeg, lat) {
  const optimalAzimuth = getOptimalAzimuth(lat);
  const turn = shortestSignedTurn(orientationDeg, optimalAzimuth);
  const deviationDeg = Math.abs(turn);
  if (deviationDeg < 0.5) {
    return {
      optimalAzimuth,
      deviationDeg: 0,
      turnDegrees: 0,
      turnDirection: 'none',
      turnLabel: 'Your main wall already faces the optimal direction for passive solar gain.',
    };
  }
  const turnDirection = turn > 0 ? 'clockwise' : 'counterclockwise';
  const turnLabel =
    `Rotate the house ${deviationDeg.toFixed(0)}° ${turnDirection} ` +
    `(from ${orientationDeg.toFixed(0)}° toward ${optimalAzimuth}°) ` +
    `so the bay window faces ${lat >= 0 ? 'south' : 'north'}.`;
  return {
    optimalAzimuth,
    deviationDeg,
    turnDegrees: deviationDeg,
    turnDirection,
    turnLabel,
  };
}

/**
 * Best garden placement: open ground on the sunniest side of the house.
 * @param {number} lat
 * @returns {{ azimuthDeg: number, label: string, description: string }}
 */
export function getGardenPlacement(lat) {
  const azimuthDeg = getOptimalAzimuth(lat);
  const compass = lat >= 0 ? 'south' : 'north';
  return {
    azimuthDeg,
    label: compass.charAt(0).toUpperCase() + compass.slice(1),
    description:
      `Place the vegetable garden ${compass} of the house (${azimuthDeg}° from north) ` +
      `for maximum winter sun and all-day summer light.`,
  };
}

/**
 * Compass label for a north-clockwise azimuth.
 * @param {number} azimuthDeg
 * @returns {string}
 */
export function azimuthToCompass(azimuthDeg) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((azimuthDeg % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}
