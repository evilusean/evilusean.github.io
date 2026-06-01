// solar-engine.test.js
// Property-based tests for solar-engine.js using fast-check and Vitest.

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { convertDistance, validateCoordinates } from './solar-engine.js';

// Feature: passive-solar-planner, Property 1: Out-of-range coordinates are always rejected
// Validates: Requirements 1.2

/**
 * Property 1: Out-of-range coordinates are always rejected
 *
 * For any latitude outside [−90, +90] or longitude outside [−180, +180],
 * validateCoordinates SHALL return valid: false and a non-empty errors array.
 *
 * **Validates: Requirements 1.2**
 */
describe('Property 1: Out-of-range coordinates are always rejected', () => {
  test('out-of-range latitude is always rejected', () => {
    fc.assert(
      fc.property(
        // lat outside [-90, +90]: values < -90 or > +90
        fc.oneof(
          fc.double({ min: -1e9, max: -90.0001, noNaN: true }),
          fc.double({ min: 90.0001, max: 1e9, noNaN: true })
        ),
        // lng can be any valid value
        fc.double({ min: -180, max: 180, noNaN: true }),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          return result.valid === false && result.errors.length > 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  test('out-of-range longitude is always rejected', () => {
    fc.assert(
      fc.property(
        // lat can be any valid value
        fc.double({ min: -90, max: 90, noNaN: true }),
        // lng outside [-180, +180]: values < -180 or > +180
        fc.oneof(
          fc.double({ min: -1e9, max: -180.0001, noNaN: true }),
          fc.double({ min: 180.0001, max: 1e9, noNaN: true })
        ),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          return result.valid === false && result.errors.length > 0;
        }
      ),
      { numRuns: 200 }
    );
  });

  test('both out-of-range lat and lng are rejected with both errors present', () => {
    fc.assert(
      fc.property(
        // lat outside [-90, +90]
        fc.oneof(
          fc.double({ min: -1e9, max: -90.0001, noNaN: true }),
          fc.double({ min: 90.0001, max: 1e9, noNaN: true })
        ),
        // lng outside [-180, +180]
        fc.oneof(
          fc.double({ min: -1e9, max: -180.0001, noNaN: true }),
          fc.double({ min: 180.0001, max: 1e9, noNaN: true })
        ),
        (lat, lng) => {
          const result = validateCoordinates(lat, lng);
          return result.valid === false && result.errors.length >= 2;
        }
      ),
      { numRuns: 200 }
    );
  });
});

// Feature: passive-solar-planner
// Property 2: Unit conversion is reversible
// Validates: Requirements 1.5

/**
 * Property 2: Unit conversion is reversible
 *
 * Converting a distance value from one unit system to another and back must
 * return a value within floating-point round-trip tolerance (1e-9).
 *
 * **Validates: Requirements 1.5**
 */
describe('Property 2: Unit conversion is reversible', () => {
  test('metric → imperial → metric round-trip yields original value (within 1e-9)', () => {
    fc.assert(
      fc.property(
        // Use fc.double to generate 64-bit doubles; fc.float requires 32-bit fround values
        fc.double({ min: 0.001, max: 100000, noNaN: true }),
        (value) => {
          const toImperial = convertDistance(value, 'metric', 'imperial');
          const backToMetric = convertDistance(toImperial, 'imperial', 'metric');
          return Math.abs(backToMetric - value) <= 1e-9;
        }
      ),
      { numRuns: 1000 }
    );
  });

  test('imperial → metric → imperial round-trip yields original value (within 1e-9)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.001, max: 100000, noNaN: true }),
        (value) => {
          const toMetric = convertDistance(value, 'imperial', 'metric');
          const backToImperial = convertDistance(toMetric, 'metric', 'imperial');
          return Math.abs(backToImperial - value) <= 1e-9;
        }
      ),
      { numRuns: 1000 }
    );
  });
});
