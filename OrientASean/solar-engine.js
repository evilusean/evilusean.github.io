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

  // Check for non-finite / NaN latitude
  if (typeof lat !== 'number' || !isFinite(lat)) {
    errors.push('Latitude must be a finite number.');
  } else if (lat < -90 || lat > 90) {
    errors.push('Latitude must be between -90 and +90.');
  }

  // Check for non-finite / NaN longitude
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
 * @returns {boolean}  true if |lat| >= 66.5, false otherwise
 */
export function isPolarLatitude(lat) {
  return Math.abs(lat) >= 66.5;
}

/**
 * Determine optimal solar orientation (azimuth in degrees, north-clockwise).
 * Northern Hemisphere (lat >= 0) → 180° (south-facing).
 * Southern Hemisphere (lat < 0)  →   0° (north-facing).
 * @param {number} lat  Decimal degrees
 * @returns {number}  optimalAzimuth  (0 or 180)
 */
export function getOptimalAzimuth(lat) {
  return lat >= 0 ? 180 : 0;
}

/**
 * Compute Summer Solstice solar noon altitude (approximation: |lat| + 23.5°, capped at 90°).
 * For Northern Hemisphere (lat >= 0): min(lat + 23.5, 90)
 * For Southern Hemisphere (lat < 0):  min(|lat| + 23.5, 90)
 * Result never exceeds 90.
 * @param {number} lat  Decimal degrees, [-90, +90]
 * @returns {number}    altitudeDeg (degrees above horizon, capped at 90)
 */
export function getSummerAltitudeApprox(lat) {
  return Math.min(Math.abs(lat) + 23.5, 90);
}

/**
 * Compute Winter Solstice solar noon altitude (approximation: lat ∓ 23.5°, floored at 0).
 * For Northern Hemisphere (lat >= 0): max(lat - 23.5, 0)
 * For Southern Hemisphere (lat < 0):  max(|lat| - 23.5, 0)
 * Result is never negative.
 * @param {number} lat  Decimal degrees, [-90, +90]
 * @returns {number}    altitudeDeg (degrees above horizon, >= 0)
 */
export function getWinterAltitudeApprox(lat) {
  if (lat >= 0) {
    return Math.max(lat - 23.5, 0);
  } else {
    return Math.max(Math.abs(lat) - 23.5, 0);
  }
}

/**
 * Calculate relative gain ratio vs theoretical maximum (orientation = 0° deviation).
 * At zero deviation the ratio is 100; it decreases with deviation and is clamped to [0, 100].
 * Formula: max(0, cos(orientationDeg × π/180)) × 100
 * The altitudeDeg parameter is accepted for API consistency but does not affect the ratio,
 * since the ratio is relative (gain at deviation δ divided by gain at deviation 0°,
 * both sharing the same altitude factor which cancels out).
 * @param {number} orientationDeg  Deviation from optimal azimuth, in degrees
 * @param {number} altitudeDeg     Winter solstice altitude (accepted for interface consistency)
 * @returns {number}  ratio in [0, 100]
 */
export function calcRelativeGainRatio(orientationDeg, altitudeDeg) {
  return Math.max(0, Math.cos(orientationDeg * Math.PI / 180)) * 100;
}

/**
 * Convert a distance value between metric (metres) and imperial (feet).
 * Uses the factor 1 metre = 3.28084 feet.
 * @param {number} value  The distance value to convert
 * @param {'metric'|'imperial'} from  The unit of the input value
 * @param {'metric'|'imperial'} to    The desired output unit
 * @returns {number}  Converted value (unchanged if from === to)
 */
export function convertDistance(value, from, to) {
  if (from === to) {
    return value;
  }
  if (from === 'metric' && to === 'imperial') {
    return value * 3.28084;
  }
  if (from === 'imperial' && to === 'metric') {
    return value / 3.28084;
  }
  // Unknown unit combination — return value unchanged
  return value;
}

/**
 * Calculate passive solar heat gain through south-facing glazing.
 * Gain = windowArea × cos(altitudeDeg × π/180)
 * @param {number} windowArea   Area of the window in m² (or ft²)
 * @param {number} altitudeDeg  Solar altitude angle in degrees (typically winter solstice noon altitude)
 * @returns {number}            Passive solar gain (same units as windowArea)
 */
export function calcPassiveSolarGain(windowArea, altitudeDeg) {
  return windowArea * Math.cos(altitudeDeg * Math.PI / 180);
}

/**
 * Determine whether the building orientation warrants a solar gain warning.
 * Northern Hemisphere (lat >= 0): optimal azimuth is 180° (south-facing).
 * Southern Hemisphere (lat < 0):  optimal azimuth is 0° (north-facing).
 * Deviation is normalised to [0, 180] to handle wrap-around.
 * @param {number} orientationDeg  Building orientation in degrees (0 = north, 180 = south)
 * @param {number} lat             Site latitude in decimal degrees
 * @returns {boolean}              true when |deviation from optimal| > 30°
 */
export function shouldWarnOrientation(orientationDeg, lat) {
  const optimalAzimuth = lat >= 0 ? 180 : 0;
  let deviation = Math.abs(orientationDeg - optimalAzimuth);
  // Normalise to [0, 180] — a 270° raw difference is equivalent to 90°
  if (deviation > 180) {
    deviation = 360 - deviation;
  }
  return deviation > 30;
}
