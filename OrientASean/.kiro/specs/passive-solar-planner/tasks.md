# Implementation Plan: Passive Solar Planner

## Overview

Transform the existing SunCalc scaffold into a full passive solar analysis tool using four plain ES modules (`solar-engine.js`, `site-planner.js`, `canvas-renderer.js`, `app.js`) loaded via `<script type="module">` in `index.html`. No build step. All dependencies via CDN. Property-based tests run in Node.js with fast-check; example-based tests with Vitest.

## Tasks

- [x] 1. Scaffold project structure and update index.html
  - Replace `style.css` link with Tailwind Play CDN `<script>` tag in `<head>`
  - Add `<noscript>JavaScript is required for Passive Solar Planner to work.</noscript>` inside `<body>`
  - Add SunCalc 1.9.0 CDN `<script>` tag (non-module, before module scripts)
  - Add `<script type="module" src="app.js"></script>` as the sole module entry point
  - Create empty placeholder files: `solar-engine.js`, `site-planner.js`, `canvas-renderer.js`, `app.js`
  - Add `<canvas id="site-canvas">` element and all required output DOM elements (result sections, export buttons, tooltip div) with `disabled` on export buttons
  - Add full responsive Tailwind layout: sidebar inputs panel + main canvas area, responsive from 320 px to 2560 px using `flex`, `flex-col`, `md:flex-row`, `w-full`, `max-w-screen-xl`, `mx-auto` utility classes
  - Input fields: lat, lng, windowArea, windowHeight, orientationAngle, treeHeight, unit toggle (metric/imperial), geolocation button, analyze button
  - _Requirements: 1.1, 1.3, 8.1, 8.2, 8.4, 8.5_

- [x] 2. Implement solar-engine.js — coordinate validation and unit conversion
  - [x] 2.1 Implement `validateCoordinates(lat, lng)` returning `{ valid, errors[] }`; reject lat outside [−90, +90] and lng outside [−180, +180]
    - _Requirements: 1.1, 1.2_
  - [ ] 2.2 Write property test for coordinate validation (Property 1)
    - **Property 1: Out-of-range coordinates are always rejected**
    - **Validates: Requirements 1.2**
  - [x] 2.3 Implement `convertDistance(value, from, to)` using factor 3.28084 (metres → feet)
    - _Requirements: 1.5_
  - [x] 2.4 Write property test for unit conversion round-trip (Property 2)
    - **Property 2: Unit conversion is reversible**
    - **Validates: Requirements 1.5**

- [x] 3. Implement solar-engine.js — altitude approximations and polar detection
  - [x] 3.1 Implement `getSummerAltitudeApprox(lat)` as `min(|lat| + 23.5, 90)` with hemisphere sign handling
    - _Requirements: 3.1_
  - [ ]* 3.2 Write property test for summer altitude cap (Property 7)
    - **Property 7: Summer altitude approximation is capped at 90°**
    - **Validates: Requirements 3.1**
  - [x] 3.3 Implement `getWinterAltitudeApprox(lat)` as `max(|lat| − 23.5, 0)` with hemisphere sign handling
    - _Requirements: 3.2_
  - [ ]* 3.4 Write property test for winter altitude floor (Property 8)
    - **Property 8: Winter altitude approximation is floored at 0°**
    - **Validates: Requirements 3.2**
  - [x] 3.5 Implement `isPolarLatitude(lat)` returning `true` when `|lat| >= 66.5`
    - _Requirements: 6.4_
  - [ ]* 3.6 Write property test for polar latitude detection (Property 15)
    - **Property 15: Polar latitude detection is correct**
    - **Validates: Requirements 6.4**

- [x] 4. Implement solar-engine.js — passive solar gain and orientation
  - [x] 4.1 Implement `getOptimalAzimuth(lat)` returning 180 for Northern Hemisphere, 0 for Southern
    - _Requirements: 2.5_
  - [x] 4.2 Implement `calcPassiveSolarGain(windowArea, altitudeDeg)` as `windowArea × cos(altitudeDeg × π/180)`
    - _Requirements: 2.2_
  - [ ]* 4.3 Write property test for passive solar gain formula (Property 4)
    - **Property 4: Passive solar gain equals the formula**
    - **Validates: Requirements 2.2**
  - [x] 4.4 Implement `calcRelativeGainRatio(orientationDeg, altitudeDeg)` returning 0–100; ratio = 100 at deviation 0°
    - _Requirements: 2.3_
  - [ ]* 4.5 Write property test for relative gain ratio bounds and maximum at zero deviation (Property 5)
    - **Property 5: Relative gain ratio is bounded and maximised at zero deviation**
    - **Validates: Requirements 2.3**
  - [x] 4.6 Implement orientation warning logic: return `true` when `|deviation_from_optimal| > 30`
    - _Requirements: 2.4_
  - [ ]* 4.7 Write property test for orientation warning threshold (Property 6)
    - **Property 6: Orientation warning fires exactly when deviation exceeds 30°**
    - **Validates: Requirements 2.4**
  - [ ]* 4.8 Write property test for hemisphere orientation and zone placement (Property 10 — solar-engine portion)
    - **Property 10: Hemisphere determines optimal orientation**
    - **Validates: Requirements 2.5**

- [x] 5. Implement solar-engine.js — overhang calculator and SunCalc integration
  - [x] 5.1 Implement `calcOverhangMin(windowHeight, summerAltitudeDeg)` as `windowHeight / tan(summerAltitudeDeg × π/180)`; return `null` when `summerAltitudeDeg <= 0`
    - _Requirements: 3.3, 3.5_
  - [x] 5.2 Implement `calcOverhangMax(windowHeight, winterAltitudeDeg)` as `windowHeight / tan(winterAltitudeDeg × π/180)`; return `null` when `winterAltitudeDeg <= 0`
    - _Requirements: 3.4_
  - [ ]* 5.3 Write property test for overhang depth formula (Property 9)
    - **Property 9: Overhang depth equals the formula**
    - **Validates: Requirements 3.3, 3.4**
  - [ ]* 5.4 Write property test for all distance outputs respecting selected unit (Property 3)
    - **Property 3: All distance outputs respect the selected unit**
    - **Validates: Requirements 1.5**
  - [x] 5.5 Implement `getWinterSolsticeAltitude(lat, lng)` using `SunCalc.getPosition` at solar noon on the appropriate December/June solstice date; convert radians to degrees
    - _Requirements: 2.1_
  - [x] 5.6 Implement `getSunlightDuration(lat, lng, solstice)` using `SunCalc.getTimes`; detect polar day/night via `isNaN(sunrise)` / `isNaN(sunset)`; return `{ durationMs, isPolarDay, isPolarNight }`
    - _Requirements: 6.1, 6.2, 6.4_
  - [ ]* 5.7 Write property test for sunrise < noon < sunset ordering (Property 13)
    - **Property 13: Sunrise precedes solar noon precedes sunset (non-polar)**
    - **Validates: Requirements 6.1**
  - [ ]* 5.8 Write property test for sunlight duration equals sunset minus sunrise (Property 14)
    - **Property 14: Sunlight duration equals sunset minus sunrise**
    - **Validates: Requirements 6.2**

- [ ] 6. Checkpoint — Ensure all solar-engine tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement site-planner.js
  - [x] 7.1 Implement `buildArcData(lat, lng, solstice)`: call `SunCalc.getTimes` to get sunrise/sunset, then loop in 30-minute steps calling `SunCalc.getPosition`; convert azimuth from SunCalc south-based radians to north-clockwise degrees via `(azimuth * 180/π) + 180`; tag sunrise, solar noon, and sunset points with `label`
    - _Requirements: 4.1, 4.3_
  - [ ]* 7.2 Write property test for arc points ordered and within daylight bounds (Property 11)
    - **Property 11: Sun arc points are ordered and within daylight bounds**
    - **Validates: Requirements 4.1**
  - [x] 7.3 Implement `calcShadowLength(objectHeight, altitudeDeg)` as `objectHeight / tan(altitudeDeg × π/180)`; return `Infinity` when `altitudeDeg <= 0`
    - _Requirements: 5.1_
  - [ ]* 7.4 Write property test for shadow length formula (Property 12)
    - **Property 12: Shadow length equals the formula**
    - **Validates: Requirements 5.1**
  - [x] 7.5 Implement `calcPlantingZones(lat, summerShadowLength, winterShadowLength)`: return `{ deciduous: ZoneGeometry, evergreen: ZoneGeometry }` with hemisphere-correct angle sectors — Northern Hemisphere: deciduous south/west (90°–270°), evergreen north/northwest (270°–360°/0°–45°); Southern Hemisphere: mirror
    - _Requirements: 5.2, 5.3_
  - [ ]* 7.6 Write property test for hemisphere planting zone placement (Property 10 — site-planner portion)
    - **Property 10: Hemisphere determines planting zones**
    - **Validates: Requirements 5.2, 5.3**

- [x] 8. Implement canvas-renderer.js
  - [x] 8.1 Implement `clearCanvas(canvas)`: fill with background colour and reset transform
    - _Requirements: 4.2_
  - [x] 8.2 Implement arc drawing helper: map each `ArcPoint` to canvas coordinates using `canvasX = cx + r × sin(θ_rad)`, `canvasY = cy − r × cos(θ_rad)`; draw summer arc in amber, winter arc in blue; connect points as a polyline
    - _Requirements: 4.2, 4.5_
  - [x] 8.3 Implement label drawing: place "Sunrise", "Noon", "Sunset" text at the labelled `ArcPoint` positions on each arc
    - _Requirements: 4.3_
  - [x] 8.4 Implement planting zone overlay: draw filled arc sectors for deciduous zone (green, semi-transparent) and evergreen zone (dark-green, semi-transparent) using `ctx.arc()` with the `ZoneGeometry` angle ranges; draw compass rose (N/S/E/W labels) and scale bar in user-selected units
    - _Requirements: 4.5, 5.4, 4.6_
  - [x] 8.5 Implement `hitTestArcPoint(canvasX, canvasY, points, thresholdPx)`: iterate all points, compute pixel distance, return nearest within threshold or `null`
    - _Requirements: 4.4_
  - [x] 8.6 Implement `renderAll(canvas, summerArc, winterArc, deciduousZone, evergreenZone, options)`: call clear, draw zones, draw arcs, draw labels, draw scale bar in sequence
    - _Requirements: 4.2, 4.3, 4.5, 4.6, 5.4_

- [x] 9. Implement app.js — orchestration and DOM wiring
  - [x] 9.1 Implement form submit handler: read all input values, call `validateCoordinates`, display per-field errors below inputs on failure; on success call all engine and planner functions, collect into `AnalysisResult`, call `renderAll`, populate all result DOM elements (gain, ratio, overhang range, sunlight durations, orientation recommendation, warning if deviation > 30°)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.6, 3.6, 6.3_
  - [x] 9.2 Implement geolocation handler: call `navigator.geolocation.getCurrentPosition`, populate lat/lng fields on success; on error map codes 1/2/3 to the specified messages and display in the UI
    - _Requirements: 1.3, 1.4_
  - [x] 9.3 Implement unit toggle: on change re-run `convertDistance` on all displayed distance values and update labels; re-render canvas with updated `metersPerPixel` scale
    - _Requirements: 1.5_
  - [x] 9.4 Implement canvas `mousemove` listener: call `hitTestArcPoint` for both arcs; show tooltip div with time, altitude, and azimuth when a point is within threshold; hide tooltip otherwise
    - _Requirements: 4.4_
  - [x] 9.5 Implement `generateTextExport(result)`: build a plain-text string containing passive solar gain, overhang depth range, summer/winter sunlight durations, and tree placement recommendations; export as `.txt` via `URL.createObjectURL(new Blob([text]))`
    - _Requirements: 7.2, 7.3_
  - [ ]* 9.6 Write property test for text export completeness (Property 16)
    - **Property 16: Text export contains all required fields**
    - **Validates: Requirements 7.2**
  - [x] 9.7 Implement PNG export: call `canvas.toDataURL('image/png')` and trigger download via a temporary `<a>` element; enable/disable export buttons based on `analysisComplete` flag
    - _Requirements: 7.1, 7.3, 7.4_

- [ ] 10. Checkpoint — Ensure all module tests pass and canvas renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Write example-based tests and smoke checks
  - [ ]* 11.1 Write example-based unit tests for solar-engine.js: specific known-value scenarios for `validateCoordinates`, `calcPassiveSolarGain`, `calcOverhangMin`/`Max`, `getSunlightDuration` (polar and non-polar), `getOptimalAzimuth`
    - _Requirements: 1.1, 1.2, 2.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.4_
  - [ ]* 11.2 Write example-based unit tests for site-planner.js: `buildArcData` returns sunrise/noon/sunset labels; `calcShadowLength` returns `Infinity` at 0°; `calcPlantingZones` hemisphere cases
    - _Requirements: 4.1, 4.3, 5.1, 5.2, 5.3_
  - [ ]* 11.3 Write example-based integration tests for app.js (using jsdom or happy-dom): geolocation success populates fields; geolocation error codes 1/2/3 produce correct messages; export buttons disabled before analysis and enabled after; `<noscript>` element present in HTML; PNG export calls `toDataURL`
    - _Requirements: 1.3, 1.4, 7.1, 7.3, 7.4, 8.5_
  - [ ]* 11.4 Write smoke checks: assert Tailwind CDN `<script>` tag present in `index.html`; assert all `<script>`/`<link>` tags reference CDN URLs (no local server paths); assert `<canvas id="site-canvas">` present
    - _Requirements: 8.1, 8.4_

- [ ] 12. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (16 total, matching design document)
- Unit tests validate specific examples and edge cases
- SunCalc azimuth conversion: `(azimuth * 180/π) + 180` (south-based radians → north-clockwise degrees)
- Canvas coordinate mapping: `canvasX = cx + r*sin(θ_rad)`, `canvasY = cy − r*cos(θ_rad)` (north = top)
- Polar day/night detected by `isNaN(SunCalc.getTimes(...).sunrise)` or `isNaN(...sunset)`
- Test runner: Vitest (or Jest) with fast-check for property tests; run with `--run` flag for single execution
- `style.css` can be emptied or removed once Tailwind CDN is in place

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "3.3", "3.5", "4.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.4", "3.6", "4.2", "4.4", "4.6"] },
    { "id": 3, "tasks": ["2.4", "4.3", "4.5", "4.7", "4.8", "5.1", "5.2"] },
    { "id": 4, "tasks": ["5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["5.7", "5.8", "7.1", "7.3", "7.5"] },
    { "id": 6, "tasks": ["7.2", "7.4", "7.6", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3", "8.5"] },
    { "id": 8, "tasks": ["8.4", "8.6"] },
    { "id": 9, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 10, "tasks": ["9.4", "9.5"] },
    { "id": 11, "tasks": ["9.6", "9.7"] },
    { "id": 12, "tasks": ["11.1", "11.2"] },
    { "id": 13, "tasks": ["11.3", "11.4"] }
  ]
}
```
