# Requirements Document

## Introduction

The Projectile Physics Sandbox is a high-fidelity, browser-based educational application hosted on GitHub Pages. It replaces the existing minimal skeleton (index.html, script.js, style.css) with a fully interactive simulation where students and enthusiasts can explore projectile motion by adjusting physical parameters and immediately observing the effects on live equations, a real-time canvas animation, and a trajectory plot. The application requires no build step and runs entirely in the browser using vanilla JavaScript ES6 modules, TailwindCSS via CDN, Chart.js, and KaTeX.

---

## Glossary

- **Engine**: The `engine.js` ES6 module responsible for all numerical integration and physics calculations.
- **UI**: The `ui.js` ES6 module responsible for event handling, slider/input state management, and coordinating updates across modules.
- **Renderer**: The `renderer.js` ES6 module responsible for Canvas animation and Chart.js trajectory plotting.
- **Euler Integration**: An iterative numerical method that advances the simulation state by small time steps `dt` using the current velocity and acceleration at each step.
- **Drag Force (Fd)**: Aerodynamic resistance force defined as `Fd = 0.5 * rho * v^2 * Cd * A`, where `rho` is air density, `v` is speed, `Cd` is the drag coefficient, and `A` is the cross-sectional area of the projectile.
- **Projectile**: The object being simulated, described by mass, diameter, and drag coefficient.
- **Preset**: A named configuration of projectile parameters (mass, diameter, Cd) representing a real-world object.
- **Trajectory**: The computed sequence of (x, y) positions over time from launch until the projectile returns to ground level (y = 0).
- **Equation_Dashboard**: The KaTeX-rendered UI panel displaying active physics equations with highlighted variables.
- **Trajectory_Plot**: The Chart.js chart displaying the full computed trajectory as a fixed-axis graph.
- **Canvas_Animation**: The HTML5 Canvas element that animates the projectile moving along the computed trajectory in real time.
- **Vacuum_Mode**: A simulation mode where air density is set to zero, disabling drag forces entirely.
- **Realistic_Mode**: A simulation mode where air density is set to 1.225 kg/m³ (sea-level standard atmosphere), enabling full drag calculation.
- **Control_Panel**: The left-column UI section containing all input sliders, preset selector, and mode toggles.
- **State**: The complete set of current simulation parameters (angle, velocity, mass, diameter, Cd, air density, gravity) held in `ui.js`.

---

## Requirements

### Requirement 1: Modular Architecture

**User Story:** As a developer maintaining this project, I want the codebase split into focused ES6 modules, so that each concern is isolated and the code remains readable and maintainable without a build step.

#### Acceptance Criteria

1. THE Engine SHALL be implemented as `engine.js` and export the functions `computeTrajectory(params)` and `eulerStep(state, params)` for computing the full trajectory array and for advancing a single Euler integration step, respectively.
2. THE UI SHALL be implemented as `ui.js` and export the functions `getState()` and `onStateChange(listener)` for reading current parameter state and for registering change listeners, respectively.
3. THE Renderer SHALL be implemented as `renderer.js` and export the functions `drawFrame(ctx, trajectoryPoint, trailPoints)` and `updatePlot(chart, trajectoryData)` for drawing the Canvas_Animation frame and for updating the Trajectory_Plot, respectively.
4. THE Engine SHALL contain no DOM manipulation code.
5. THE Renderer SHALL contain no numerical integration, force computation, or kinematic state update code as defined in the Engine's responsibilities in the Glossary.
6. WHEN `index.html` loads, `ui.js` SHALL be the single entry-point module referenced in the `<script type="module">` tag, and `ui.js` SHALL import `engine.js` and `renderer.js` via ES6 `import` statements without requiring a local build or bundler.

---

### Requirement 2: Physics Engine — Euler Integration

**User Story:** As a student, I want the simulation to accurately model real-world projectile motion including aerodynamic drag, so that I can understand how air resistance affects trajectories compared to idealized vacuum flight.

#### Acceptance Criteria

1. THE Engine SHALL compute trajectories using an iterative Euler method with a time step `dt` in the range [0.0001, 0.005] seconds, and SHALL cap the trajectory array at 1,000,000 state objects to prevent runaway computation.
2. WHEN computing each Euler step, THE Engine SHALL apply the user-provided gravity value as a constant downward acceleration.
3. WHEN the user has not set a custom gravity value, THE Engine SHALL default to 9.81 m/s² downward.
4. WHEN computing each Euler step in Realistic_Mode, THE Engine SHALL compute Drag Force as `Fd = 0.5 * rho * v^2 * Cd * A` where `A` is the cross-sectional area derived from the projectile's diameter.
5. WHEN computing each Euler step in Vacuum_Mode, THE Engine SHALL set Drag Force to 0 for every step, regardless of projectile parameters.
6. THE Engine SHALL terminate trajectory computation when the projectile's y-position transitions from positive to zero or below (ground impact), and SHALL linearly interpolate between the last two states to produce a terminal state at y = 0.
7. WHEN the launch height is at or below y = 0 and the initial vertical velocity component is zero or negative, THE Engine SHALL return an empty trajectory array without performing any integration steps.
8. THE Engine SHALL return the full trajectory as an array of state objects, where each state object contains at minimum: `{ t, x, y, vx, vy, speed }`.
9. WHEN initial launch speed is zero or negative, THE Engine SHALL return an empty trajectory array.
10. THE Engine SHALL accept a gravity parameter in the range [0.1, 25.0] m/s² to allow exploration of different planetary environments.

---

### Requirement 3: Physics Engine — Drag Model Accuracy

**User Story:** As a student comparing vacuum and realistic trajectories, I want the drag model to use correct aerodynamic formulas with accurate preset values, so that the simulation reflects real-world physics.

#### Acceptance Criteria

1. THE Engine SHALL compute cross-sectional area `A` from the projectile diameter `d` as `A = π * (d/2)^2`.
2. THE Engine SHALL accept air density `rho` as an input parameter in the range [0.0, 1.5] kg/m³, where 0.0 produces Vacuum_Mode behavior and 1.225 produces Realistic_Mode behavior.
3. WHEN drag force magnitude exceeds the force of gravity on the projectile at any step, THE Engine SHALL still apply both forces independently, allowing drag to dominate at high velocities.
4. WHEN projectile speed is greater than zero, THE Engine SHALL decompose drag deceleration into x and y components proportional to the respective velocity components divided by total speed.
5. WHEN projectile speed is zero, THE Engine SHALL apply zero drag deceleration in both x and y components, avoiding division by zero.

---

### Requirement 4: Vacuum vs. Realistic Mode Toggle

**User Story:** As a student, I want to instantly switch between a vacuum simulation and a realistic air-resistance simulation, so that I can visually compare the two trajectories and understand the effect of drag.

#### Acceptance Criteria

1. THE UI SHALL provide a toggle control with two states labeled "Vacuum" and "Realistic" that switches the simulation mode without requiring a page reload.
2. WHEN the toggle is set to "Realistic", THE UI SHALL update the State `rho` value to 1.225 kg/m³ and trigger a full trajectory recomputation.
3. WHEN the toggle is set to "Vacuum", THE UI SHALL update the State `rho` value to 0.0 kg/m³ and trigger a full trajectory recomputation.
4. WHEN Vacuum_Mode is active, THE Trajectory_Plot SHALL display only the vacuum trajectory dataset in the color `rgba(59, 130, 246, 1)` (Tailwind `blue-500`) with a legend label "Vacuum".
5. WHEN Realistic_Mode is active, THE Trajectory_Plot SHALL display only the realistic trajectory dataset in the color `rgba(249, 115, 22, 1)` (Tailwind `orange-500`) with a legend label "Realistic".
6. WHEN the user has explicitly plotted both trajectories using a dedicated "Compare" action, THE Trajectory_Plot SHALL display both the Vacuum dataset (blue-500) and the Realistic dataset (orange-500) on the same chart with both legend entries visible.

---

### Requirement 5: Preset Engine

**User Story:** As a student, I want to select from real-world projectile presets, so that I can immediately explore physically accurate simulations without manually entering parameters.

#### Acceptance Criteria

1. THE UI SHALL provide a `<select>` dropdown where preset options are grouped into three visually separated, labeled `<optgroup>` elements: "Sports", "Firearms", and "Ordnance".
2. THE UI SHALL include the following Sports presets with the specified parameter values:

   | Preset       | Mass (kg) | Diameter (m) | Cd    |
   |--------------|-----------|--------------|-------|
   | Golf Ball    | 0.0459    | 0.0427       | 0.47  |
   | Basketball   | 0.6200    | 0.2400       | 0.47  |
   | Baseball     | 0.1450    | 0.0737       | 0.35  |
   | Ping Pong    | 0.0027    | 0.0400       | 0.40  |

3. THE UI SHALL include the following Firearms presets with the specified parameter values:

   | Preset      | Mass (kg) | Diameter (m) | Cd    |
   |-------------|-----------|--------------|-------|
   | .22 LR      | 0.0024    | 0.0056       | 0.17  |
   | 5.56 NATO   | 0.0040    | 0.0057       | 0.30  |
   | .45 ACP     | 0.0148    | 0.0115       | 0.20  |

4. THE UI SHALL include the following Ordnance presets with the specified parameter values:

   | Preset           | Mass (kg) | Diameter (m) | Cd    |
   |------------------|-----------|--------------|-------|
   | 60mm Mortar      | 1.3300    | 0.0600       | 0.30  |
   | Cannonball       | 5.4400    | 0.1100       | 0.47  |
   | Anti-Tank Missile| 10.500    | 0.0800       | 0.20  |

5. WHEN a preset is selected from the dropdown, THE UI SHALL update the mass, diameter, and Cd sliders and input fields to the preset's values within 100 milliseconds.
6. WHEN a preset is selected, THE UI SHALL trigger a full trajectory recomputation using the updated parameter values.
7. WHEN the user manually adjusts any slider or input field after selecting a preset, THE UI SHALL NOT reset the preset selector; the sliders hold the authoritative state.
8. WHEN the page loads, THE preset selector SHALL display a placeholder option (e.g., "— Select Preset —") with no preset parameters applied until the user makes a selection.

---

### Requirement 6: Control Panel Inputs

**User Story:** As a student, I want real-time slider controls for all simulation parameters, so that I can explore the effect of each variable without typing numeric values.

#### Acceptance Criteria

1. THE Control_Panel SHALL provide a slider and numeric display for launch angle in the range [0, 90] degrees with a step of 1 degree.
2. THE Control_Panel SHALL provide a slider and numeric display for initial launch speed in the range [1, 2000] m/s with a step of 1 m/s.
3. THE Control_Panel SHALL provide a slider and numeric display for projectile mass in the range [0.001, 50.0] kg with a step of 0.001 kg.
4. THE Control_Panel SHALL provide a slider and numeric display for projectile diameter in the range [0.005, 0.5] meters with a step of 0.001 m.
5. THE Control_Panel SHALL provide a slider and numeric display for drag coefficient Cd in the range [0.05, 1.0] with a step of 0.01.
6. THE Control_Panel SHALL provide a slider and numeric display for air density in the range [0.0, 1.5] kg/m³ with a step of 0.01 kg/m³.
7. THE Control_Panel SHALL provide a slider and numeric display for gravity in the range [0.1, 25.0] m/s² with a step of 0.1 m/s².
8. WHEN any slider value changes, THE UI SHALL update the corresponding numeric display synchronously before the next frame is rendered.
9. WHEN any slider value changes, THE UI SHALL trigger a full trajectory recomputation such that the Trajectory_Plot reflects the new values within 100 milliseconds.
10. THE numeric display fields SHALL be read-only mirrors of their paired slider values and SHALL NOT accept direct text input that could desynchronize slider and display state.

---

### Requirement 7: Equation Dashboard — KaTeX Rendering

**User Story:** As a student, I want to see the active physics equations rendered in proper mathematical notation with the variables I am changing highlighted, so that I can directly connect my input actions to the underlying mathematics.

#### Acceptance Criteria

1. WHEN the State is updated, THE Equation_Dashboard SHALL render the following equations using KaTeX:
   - Position x: `x(t) = v_0 \cos(\theta) \cdot t`
   - Position y: `y(t) = v_0 \sin(\theta) \cdot t - \frac{1}{2} g t^2`
   - Speed: `v(t) = \sqrt{v_x^2 + v_y^2}`
2. WHEN Realistic_Mode is active, THE Equation_Dashboard SHALL additionally render the Drag Force equation: `F_d = \frac{1}{2} \rho v^2 C_d A`.
3. WHEN Vacuum_Mode is active, THE Equation_Dashboard SHALL hide or remove the Drag Force equation from the display.
4. THE Equation_Dashboard SHALL display each equation in two forms: the symbolic LaTeX form and a parenthetical numeric instantiation substituting current parameter values rounded to 3 significant figures.
5. WHEN the user adjusts a slider, THE Equation_Dashboard SHALL apply a `background-color: #fef08a` (yellow-200) highlight to the HTML element(s) wrapping the changed variable's KaTeX token for a minimum of 1 second, then transition the background to transparent over 300 milliseconds.
6. WHEN multiple sliders are adjusted simultaneously (e.g., via preset selection), THE Equation_Dashboard SHALL highlight all corresponding variable tokens simultaneously.
7. WHEN the State is updated, THE Equation_Dashboard SHALL display the computed peak height in meters (2 decimal places) and total horizontal range in meters (2 decimal places) as labeled output values below the equations.
8. IF KaTeX fails to render any equation, THE Equation_Dashboard SHALL display the raw LaTeX source string prefixed with the label "⚠ Equation error:" in plain text, without throwing an uncaught exception.

---

### Requirement 8: Canvas Animation

**User Story:** As a student, I want to watch the projectile animate along its computed trajectory on a canvas, so that I can develop an intuitive sense of the shape and timing of projectile motion.

#### Acceptance Criteria

1. THE Canvas_Animation SHALL animate the projectile along the pre-computed Trajectory array using `requestAnimationFrame`, advancing through trajectory states at 1× real time (wall-clock time elapsed equals simulation time elapsed).
2. IF the active preset category is Sports, THE Canvas_Animation SHALL represent the projectile as a filled circle.
3. IF the active preset category is Firearms, THE Canvas_Animation SHALL represent the projectile as an elongated capsule with a 3:1 length-to-width ratio.
4. IF the active preset category is Ordnance, THE Canvas_Animation SHALL represent the projectile as a filled 3-vertex triangle polygon.
5. WHEN no preset is active, THE Canvas_Animation SHALL represent the projectile as a filled circle.
6. THE Canvas_Animation SHALL draw the traced trajectory path behind the moving projectile retaining the last 200 positions, with opacity interpolated linearly from 1.0 at the newest position to 0.0 at the oldest.
7. WHEN a new trajectory is computed, THE Canvas_Animation SHALL restart the animation from the launch point without requiring a user action.
8. THE Canvas_Animation SHALL scale the coordinate system so that the full trajectory fits within the canvas bounds with at least 5% padding on all sides, recalculating scale on each new trajectory.
9. THE Canvas_Animation SHALL display a ground line at y = 0 and label the x-axis with 5 evenly-spaced distance markers showing values in meters.
10. WHEN the animation completes (projectile reaches ground), THE Canvas_Animation SHALL display the landing position and total range in meters as an overlay on the canvas.

---

### Requirement 9: Trajectory Plot (Chart.js)

**User Story:** As a student, I want a fixed-axis chart showing the full trajectory from launch to landing, so that I can precisely read off range, peak height, and the effect of changing parameters.

#### Acceptance Criteria

1. THE Trajectory_Plot SHALL use Chart.js to render a line chart with the x-axis representing horizontal distance (meters) and the y-axis representing altitude (meters).
2. THE Trajectory_Plot SHALL display the complete pre-computed trajectory immediately upon each recomputation, without waiting for the Canvas_Animation to complete.
3. WHEN a new trajectory is computed, THE Trajectory_Plot SHALL reset axis maximums to fit the current trajectory data with the x-axis minimum fixed at 0 and the y-axis minimum fixed at 0.
4. THE Trajectory_Plot SHALL annotate the peak altitude point with a label showing "(x m, y m)" and the landing point with a label showing "(range m, 0 m)".
5. IF the trajectory array is empty, THE Trajectory_Plot SHALL display an empty chart with no datasets and no annotations.
6. IF both Vacuum and Realistic trajectories are available, THE Trajectory_Plot SHALL display both as separate datasets using the colors defined in Requirement 4 with a visible legend.
7. THE Trajectory_Plot SHALL update within 100 milliseconds of a slider change.

---

### Requirement 10: Responsive Layout

**User Story:** As a student using the application on various screen sizes, I want a layout that keeps controls, equations, and visualizations accessible and readable, so that I can use the tool effectively on a desktop browser.

#### Acceptance Criteria

1. THE UI SHALL implement a three-column layout using TailwindCSS with the Control_Panel in the left column, the Equation_Dashboard in the center column, and the Canvas_Animation and Trajectory_Plot stacked in the right column.
2. WHILE the viewport width is less than 1024px, THE UI SHALL collapse to a single-column layout stacking panels vertically in the order: Control_Panel, Equation_Dashboard, Canvas_Animation, Trajectory_Plot.
3. THE UI SHALL apply a dark theme using TailwindCSS utility classes `bg-gray-900` for the page background, `text-white` for primary text, and `text-blue-400` for accent text.
4. IF the Control_Panel content height exceeds the viewport height, THE Control_Panel SHALL apply `overflow-y-auto` with its height bounded to the viewport height so the panel scrolls independently without causing the page to scroll.
5. THE Canvas_Animation canvas element SHALL maintain a fixed 16:9 aspect ratio, resize responsively within its column, and SHALL NOT render below 320px wide.

---

### Requirement 11: Performance and Browser Compatibility

**User Story:** As a student using GitHub Pages, I want the application to remain responsive and smooth as I drag sliders, so that the educational feedback feels instantaneous.

#### Acceptance Criteria

1. THE Engine SHALL complete a full trajectory computation for any valid input combination in under 50 milliseconds of wall-clock time, measured from `computeTrajectory()` invocation to array return, on a device with ≥4 CPU cores, ≥4 GB RAM, running Chrome, Firefox, or Safari current stable.
2. WHILE the Canvas_Animation is actively animating, THE Canvas_Animation SHALL maintain a frame rate of at least 30 frames per second measured over any consecutive 1-second window, on the same hardware baseline defined in Criterion 1.
3. THE UI SHALL schedule slider input propagation using `requestAnimationFrame` such that at most one full trajectory recomputation is queued per animation frame; when multiple slider events fire within the same frame, only the most recent slider values are used and intermediate events are discarded.
4. THE UI SHALL load and render the initial default state (45-degree launch, Golf Ball preset, Realistic Mode, first canvas frame drawn) within 3 seconds of navigation start on a connection with ≥10 Mbps download speed.
5. WHEN running in Chrome, Firefox, or Safari current stable, ALL acceptance criteria in this document SHALL pass, no uncaught JavaScript exceptions SHALL be thrown during normal operation, and no UI element defined in the requirements SHALL be absent or non-interactive.
6. THE UI SHALL load all dependencies (TailwindCSS, Chart.js, KaTeX) via CDN `<script>` or `<link>` tags in `index.html` without a local build step or package manager.

---

### Requirement 12: State Serialization

**User Story:** As a student, I want to be able to share a specific simulation configuration via URL, so that I can show a classmate exactly the scenario I was exploring.

#### Acceptance Criteria

1. THE UI SHALL serialize the current State into a URL query string by encoding all seven numeric parameters (angle, speed, mass, diameter, Cd, rho, gravity) and the mode toggle value as URL-safe key-value pairs using `encodeURIComponent`.
2. WHEN the page loads with a non-empty query string, THE UI SHALL parse the query string and restore all recognized State parameters to the decoded values before running the initial trajectory computation.
3. WHEN any parameter changes, THE UI SHALL update the browser's URL bar via `history.replaceState` with the current serialized State without triggering a page reload.
4. IF the URL query string contains an unrecognized key, a non-numeric value for a numeric parameter, or a value outside the valid range for that parameter, THE UI SHALL ignore that key and use the default value for the corresponding parameter, logging a `console.warn` message identifying the key and the reason it was rejected.
5. FOR ALL valid State objects, serializing the State to a query string and then parsing that query string SHALL produce a State object where every numeric parameter value differs from the original by no more than 1×10⁻⁶ (absolute error).

---

### Requirement 13: Default State and Initialization

**User Story:** As a first-time visitor, I want the application to open with a visually engaging default simulation already running, so that I understand what the tool does without reading any instructions.

#### Acceptance Criteria

1. WHEN the page loads without a URL query string, or with a query string containing only a bare `?` with no key-value pairs, THE UI SHALL initialize the State with: launch angle 45°, initial speed 50 m/s, Golf Ball preset (mass 0.0459 kg, diameter 0.0427 m, Cd 0.47), Realistic_Mode (rho 1.225 kg/m³), gravity 9.81 m/s².
2. WHEN the page finishes loading, THE Engine SHALL compute the default trajectory before the Canvas_Animation begins, and THE Canvas_Animation SHALL then begin animating the default trajectory automatically without any user interaction.
3. WHEN the page finishes loading, THE Trajectory_Plot SHALL display the default Realistic_Mode trajectory dataset within 100 milliseconds of the default trajectory computation completing.
4. WHEN the page finishes loading, THE Equation_Dashboard SHALL display the default equations with the default parameter values substituted in numeric form.
5. IF any CDN dependency (Chart.js, KaTeX, or TailwindCSS) fails to load, THE UI SHALL display a visible error message in the page body identifying the failed dependency by name, and SHALL NOT throw an uncaught exception that prevents the rest of the page from rendering.
