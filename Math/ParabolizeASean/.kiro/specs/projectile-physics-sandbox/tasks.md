# Implementation Plan: Projectile Physics Sandbox

## Overview

Implement the full projectile physics sandbox as three vanilla JS ES6 modules (`engine.js`, `ui.js`, `renderer.js`) wired together through a rebuilt `index.html`. Tasks are ordered so the physics engine is completed first, the renderer and scaffold proceed in parallel, and the UI wires everything together last. Property-based tests using fast-check cover the five correctness properties defined in the design.

## Tasks

- [ ] 1. Rebuild `index.html` scaffold with CDN dependencies
  - Replace the existing placeholder `index.html` with the full page structure
  - Add `<link>` for TailwindCSS CDN and configure dark theme base classes (`bg-gray-900`, `text-white`, `text-blue-400`)
  - Add `<script>` CDN tags for Chart.js, KaTeX (CSS + JS), and fast-check
  - Add `<script type="module" src="ui.js">` as the single JS entry point
  - Define the three-column layout skeleton: `#control-panel`, `#equation-panel`, `#viz-panel`
  - Add `<canvas id="sim-canvas">` (16:9 aspect ratio, min 320px wide) and `<div id="trajectory-chart-container">` inside `#viz-panel`
  - Add responsive breakpoint: single-column stack below 1024px (`lg:grid-cols-3`)
  - Add `#cdn-error-banner` hidden div for CDN failure messages
  - _Requirements: 1.6, 10.1, 10.2, 10.3, 11.6, 13.5_

- [ ] 2. Implement `engine.js` — core physics
  - [ ] 2.1 Implement `eulerStep(state, params)` exported function
    - Convert `params.angle` from degrees to radians for all trig
    - Compute cross-sectional area: `A = π * (diameter / 2)²`
    - Compute drag magnitude: `Fd = 0.5 * rho * speed² * cd * A`
    - Guard `speed > 0` before dividing; set `ax_drag = ay_drag = 0` when `speed === 0`
    - Decompose drag into `ax_drag = -(Fd/mass)*(vx/speed)`, `ay_drag = -(Fd/mass)*(vy/speed)`
    - Apply gravity: `ay = ay_drag - gravity`
    - Advance position and velocity using Euler integration with `dt`
    - Return new `StateObject` `{ t, x, y, vx, vy, speed }`
    - _Requirements: 2.2, 2.4, 3.1, 3.4, 3.5_

  - [ ] 2.2 Implement `computeTrajectory(params)` exported function
    - Return `[]` immediately if `params.speed <= 0` (Req 2.9)
    - Compute initial `vx0 = speed * cos(θ)`, `vy0 = speed * sin(θ)`; return `[]` if `vy0 <= 0` and `y0 <= 0` (Req 2.7)
    - Build initial `StateObject` at `t=0, x=0, y=0`
    - Loop calling `eulerStep`, appending states; cap at 1,000,000 states (Req 2.1)
    - When `next.y <= 0`, compute interpolation fraction `f = prev.y / (prev.y - next.y)` and push terminal state at `y=0` then `break`
    - Use `dt` from `params.dt` defaulting to `0.001`
    - Return trajectory array
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9_

  - [ ]* 2.3 Write property test — Property 1: Vacuum analytical match
    - File: `tests/engine.property.test.js`
    - Use `fc.float({min:1, max:2000})` for speed, `fc.integer({min:1, max:89})` for angle, `fc.float({min:0.1, max:25})` for gravity
    - Call `computeTrajectory` with `rho=0`, compare final `x` against `R = v² * sin(2θ) / g` within 0.1% relative tolerance
    - `numRuns: 100`
    - Tag comment: `// Feature: projectile-physics-sandbox, Property 1: Vacuum trajectory matches analytical solution`
    - _Requirements: 2.1, 2.5, 3.1_

  - [ ]* 2.4 Write property test — Property 2: Realistic range ≤ vacuum range
    - File: `tests/engine.property.test.js`
    - Build full `PhysicsParams` arbitrary with `rho > 0` (use `fc.float({min:0.001, max:1.5})`)
    - Run `computeTrajectory` twice: once with `rho` from arbitrary, once with `rho=0`; assert `range_realistic <= range_vacuum`
    - `numRuns: 100`
    - Tag comment: `// Feature: projectile-physics-sandbox, Property 2: Realistic range never exceeds vacuum range`
    - _Requirements: 2.4, 2.5, 3.2, 3.3_

  - [ ]* 2.5 Write property test — Property 4: Empty trajectory for invalid launch
    - File: `tests/engine.property.test.js`
    - Generate params with `speed <= 0` OR `angle = 0` with ground-level launch
    - Assert `computeTrajectory` returns `[]` without throwing
    - `numRuns: 100`
    - Tag comment: `// Feature: projectile-physics-sandbox, Property 4: Empty trajectory for invalid launch conditions`
    - _Requirements: 2.7, 2.9_

  - [ ]* 2.6 Write property test — Property 5: Drag force decomposition invariant
    - File: `tests/engine.property.test.js`
    - Generate arbitrary realistic-mode trajectory, sample random non-zero-speed steps, call `eulerStep` and extract `ax_drag`, `ay_drag`
    - Assert `ax_drag² + ay_drag² ≈ (Fd/mass)²` within tolerance `1e-10`
    - `numRuns: 100`
    - Tag comment: `// Feature: projectile-physics-sandbox, Property 5: Drag force decomposition invariant`
    - _Requirements: 3.1, 3.4, 2.4_

- [ ] 3. Implement `renderer.js` — canvas and chart
  - [ ] 3.1 Implement `computeScaleInfo(trajectory, canvasW, canvasH)` exported function
    - Derive `maxX` and `maxY` from trajectory array (`Math.max` over all states)
    - Compute `scaleX = (canvasW * 0.90) / maxX`, `scaleY = (canvasH * 0.85) / maxY`
    - Set `offsetX = canvasW * 0.05`, `offsetY = canvasH * 0.95`
    - Return `CanvasScaleInfo` object; handle empty trajectory by returning safe defaults
    - _Requirements: 8.8_

  - [ ] 3.2 Implement `drawFrame(ctx, point, trail, scaleInfo, category, showLanding, range)` exported function
    - Clear canvas each frame with `ctx.clearRect`
    - Draw ground line at `canvasY(0)` spanning full width
    - Draw 5 evenly-spaced x-axis distance markers with meter values
    - Draw fading trail: iterate `trail` array and set `globalAlpha = i / (trail.length - 1)`, draw small filled circle at each point; use `globalAlpha = 1.0` when `trail.length === 1`
    - Draw projectile shape at current `point` based on `category`: circle for `'sports'` or `null`, 3:1 capsule for `'firearms'`, triangle for `'ordnance'`
    - If `showLanding === true`, draw overlay text with landing position and `range` in meters
    - Use coordinate helpers `canvasX(physX) = offsetX + physX * scaleX`, `canvasY(physY) = offsetY - physY * scaleY`
    - _Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 8.9, 8.10_

  - [ ] 3.3 Implement `updatePlot(chart, trajectoryData, mode, compareMode)` exported function
    - Map `trajectoryData` to `{x, y}` point objects for Chart.js
    - Select color: blue-500 (`rgba(59,130,246,1)`) for vacuum, orange-500 (`rgba(249,115,22,1)`) for realistic
    - If `compareMode === true`, update/add both vacuum and realistic datasets on `chart.data.datasets`
    - If `compareMode === false`, replace datasets with a single dataset for `mode`
    - Annotate peak altitude point and landing point with Chart.js annotation labels `(x m, y m)` and `(range m, 0 m)`
    - Reset `chart.options.scales.x.max` and `chart.options.scales.y.max` to fit new data
    - Call `chart.update()` to apply changes; set empty `datasets: []` when `trajectoryData` is empty
    - _Requirements: 4.4, 4.5, 4.6, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 4. Checkpoint — engine and renderer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement `ui.js` — state, inputs, and wiring
  - [ ] 5.1 Define `SimState`, `PRESETS` constant, and `initState()` function
    - Declare `PRESETS` object as specified in design (10 entries across 3 categories with `category` field)
    - `initState()` returns default state: `angle=45, speed=50, mass=0.0459, diameter=0.0427, cd=0.47, rho=1.225, gravity=9.81, mode='realistic', preset='golf-ball'`
    - Export `getState()` returning a frozen snapshot via `Object.freeze({...state})`
    - Export `onStateChange(listener)` storing listeners in an array; return unsubscribe function
    - _Requirements: 1.2, 13.1_

  - [ ] 5.2 Build the Control Panel HTML structure
    - In `ui.js` (or via `index.html`): render 7 slider + numeric-display pairs inside `#control-panel`
    - Angle: range `[0,90]`, step `1`; Speed: `[1,2000]`, step `1`; Mass: `[0.001,50]`, step `0.001`; Diameter: `[0.005,0.5]`, step `0.001`; Cd: `[0.05,1.0]`, step `0.01`; Rho: `[0.0,1.5]`, step `0.01`; Gravity: `[0.1,25.0]`, step `0.1`
    - All numeric display `<input>` elements are `readonly`
    - Add Vacuum/Realistic toggle control (two-state button or radio pair) labeled "Vacuum" and "Realistic"
    - Add `<select id="preset-select">` with `<optgroup>` elements "Sports", "Firearms", "Ordnance" and all 10 presets; first option is placeholder "— Select Preset —" with no value
    - Apply `overflow-y-auto` and max-height bounded to viewport on `#control-panel`
    - _Requirements: 6.1–6.10, 5.1, 10.4_

  - [ ] 5.3 Implement slider event handlers and rAF-gated debounce
    - Implement `handleSliderInput(event)`: update corresponding `state` field from `event.target.value`; synchronously update the paired readonly display; if no rAF is pending set `rafPending = true` and call `requestAnimationFrame(runUpdateCycle)`
    - Implement `scheduleUpdate()` helper used by preset and toggle handlers
    - Implement `runUpdateCycle(timestamp)`: set `rafPending = false`, call `computeTrajectory(buildParams(state))`, call `updatePlot`, call `renderEquations`, call `restartAnimation`
    - Attach `input` event listeners to all 7 sliders
    - _Requirements: 6.8, 6.9, 11.1, 11.3_

  - [ ] 5.4 Implement preset selector handler
    - `handlePresetSelect(event)`: look up selected key in `PRESETS`, bulk-update `state.mass`, `state.diameter`, `state.cd`, `state.preset`, `state.category`
    - Update all three corresponding slider elements and readonly displays synchronously
    - Call `scheduleUpdate()` to trigger recomputation
    - Do NOT reset `#preset-select` value when sliders are manually adjusted afterward
    - _Requirements: 5.5, 5.6, 5.7, 5.8_

  - [ ] 5.5 Implement Vacuum/Realistic toggle handler and compare mode
    - `handleModeToggle(value)`: set `state.mode`, set `state.rho = (value === 'vacuum') ? 0.0 : 1.225`, update `#rho-slider` and display synchronously, call `scheduleUpdate()`
    - Implement `compareMode` flag in animation state; add "Compare" button that stores current trajectory into the opposite dataset slot and sets `compareMode = true` before calling `updatePlot`
    - Pass `compareMode` to `updatePlot` so both datasets appear when active
    - _Requirements: 4.1, 4.2, 4.3, 4.6_

  - [ ] 5.6 Implement `renderEquations(state, stats)` using KaTeX
    - Render position x, position y, and speed equations as KaTeX symbolic strings
    - Render companion numeric instantiation strings with values rounded to 3 significant figures
    - Show drag force equation `F_d = \frac{1}{2}\rho v^2 C_d A` only in Realistic_Mode; hide/remove it in Vacuum_Mode
    - Display computed `stats.peakHeight` (2 dp) and `stats.range` (2 dp) below equations
    - Wrap each variable token in `<span data-var="...">` elements; on slider change add class `highlight-var` to matching spans, remove after 1300 ms (1 s hold + 300 ms CSS transition)
    - Catch any `katex.renderToString` exception and render `<span class="text-yellow-400">⚠ Equation error: [raw LaTeX]</span>`
    - Handle simultaneous multi-variable highlight from preset selection
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ] 5.7 Implement canvas animation loop
    - `restartAnimation(trajectory)`: cancel existing rAF handle via `cancelAnimationFrame(animHandle)`, reset `frameIndex = 0`, `trail = []`, `lastWallTime = null`, `currentSimTime = 0`, call `computeScaleInfo` to get fresh `scaleInfo`, start new rAF loop
    - `animFrame(wallTimestamp)`: compute `elapsed` ms → seconds, advance `frameIndex` while `trajectory[frameIndex+1].t <= currentSimTime + simElapsed`, push to `trail` (cap at 200 via `shift()`), call `drawFrame`, if `frameIndex < trajectory.length - 1` request next frame else show landing overlay
    - Guard canvas context unavailability: log error and skip drawing without throwing
    - _Requirements: 8.1, 8.6, 8.7, 8.8_

  - [ ] 5.8 Implement URL state serialization and initialization
    - `serializeState(state)`: encode all 7 numeric params + `mode` as `URLSearchParams`, call `history.replaceState` with the resulting query string on every state change
    - `parseQueryString(qs)`: parse recognized keys, validate numeric ranges; for each invalid/unknown key call `console.warn` with key name and reason, skip that key
    - `applyURLState(partial)`: merge valid parsed values into `state`, leaving unrecognized keys at defaults
    - On page load: if query string is non-empty and has key-value pairs, call `parseQueryString` + `applyURLState` before running the initial trajectory computation
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 5.9 Write property test — Property 3: State serialization round-trip
    - File: `tests/ui.property.test.js`
    - Use `fc.record({angle: fc.float({min:0,max:90}), speed: fc.float({min:1,max:2000}), mass: fc.float({min:0.001,max:50}), diameter: fc.float({min:0.005,max:0.5}), cd: fc.float({min:0.05,max:1.0}), rho: fc.float({min:0.0,max:1.5}), gravity: fc.float({min:0.1,max:25.0}), mode: fc.constantFrom('vacuum','realistic')})` as arbitrary
    - Serialize with `serializeState`, parse with `parseQueryString`, assert every numeric field differs by `≤ 1e-6`
    - `numRuns: 100`
    - Tag comment: `// Feature: projectile-physics-sandbox, Property 3: State serialization round-trip precision`
    - _Requirements: 12.1, 12.2, 12.5_

- [ ] 6. Implement CDN failure detection and default initialization
  - After CDN `<script>` tags in `index.html` add inline checks: test `typeof Chart`, `typeof katex`, `typeof tailwind` (or class presence); if any is `undefined`, show `#cdn-error-banner` with the dependency name
  - In `ui.js` `DOMContentLoaded` handler: call `initState()`, call `applyURLState` if URL has params, call `computeTrajectory` for default trajectory, call `updatePlot`, call `renderEquations`, call `restartAnimation`
  - Default state produces: 45° angle, 50 m/s, Golf Ball preset, Realistic mode (rho 1.225), gravity 9.81
  - _Requirements: 11.4, 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 7. Add `style.css` — highlight animation and supplemental styles
  - Replace placeholder `style.css`
  - Define `.highlight-var { background-color: #fef08a; transition: background-color 300ms ease; }` and the cleared state for removal (background transparent)
  - Add 16:9 aspect-ratio rule for `#sim-canvas` and min-width 320px guard
  - Add any TailwindCSS utility overrides needed for `overflow-y-auto` on `#control-panel`
  - _Requirements: 7.5, 8.5, 10.4, 10.5_

- [ ] 8. Final checkpoint — end-to-end validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All test files live in a `tests/` directory and import fast-check from CDN or as an ES module; they can be run directly in the browser or via a test harness that supports ES modules
- `engine.js` and `renderer.js` have no DOM dependencies and can be unit-tested in isolation
- Checkpoints at tasks 4 and 8 ensure integration is validated incrementally
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3"] },
    { "id": 3, "tasks": ["2.3", "2.4", "2.5", "2.6"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] },
    { "id": 6, "tasks": ["5.4", "5.5", "5.6"] },
    { "id": 7, "tasks": ["5.7", "5.8"] },
    { "id": 8, "tasks": ["5.9", "6", "7"] }
  ]
}
```
