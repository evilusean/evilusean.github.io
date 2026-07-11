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

1. THE Engine SHALL be implemented as `engine.js` and export functions for computing the full trajectory array and for advancing a single Euler integration step.
2. THE UI SHALL be implemented as `ui.js` and export functions for reading current parameter state and for registering change listeners.
3. THE Renderer SHALL be implemented as `renderer.js` and export functions for drawing the Canvas_Animation frame and for updating the Trajectory_Plot.
4. THE Engine SHALL contain no DOM manipulation code.
5. THE Renderer SHALL contain no physics calculation code.
6. WHEN `index.html` loads, THE UI SHALL import Engine and Renderer as ES6 modules using `<script type="module">` without requiring a local build or bundler.

---

### Requirement 2: Physics Engine — Euler Integration

**User Story:** As a student, I want the simulation to accurately model real-world projectile motion including aerodynamic drag, so that I can understand how air resistance affects trajectories compared to idealized vacuum flight.

#### Acceptance Criteria

1. THE Engine SHALL compute trajectories using an iterative Euler method with a configurable time step `dt` of no greater than 0.005 seconds.
2. WHEN computing each Euler step, THE Engine SHALL apply gravity as a constant downward acceleration of 9.81 m/s² unless the user has set a custom gravity value.
3. WHEN computing each Euler step in Realistic_Mode, THE Engine SHALL compute Drag Force as `Fd = 0.5 * rho * v^2 * Cd * A` where `A` is the cross-sectional area derived from the projectile's diameter.
4. WHEN computing each Euler step in Vacuum_Mode, THE Engine SHALL set Drag Force to 0 for every step, regardless of projectile parameters.
5. THE Engine SHALL terminate trajectory computation when the projectile's y-position transitions from positive to zero or below (ground impact).
6. THE Engine SHALL return the full trajectory as an array of state objects, where each state object contains at minimum: `{ t, x, y, vx, vy, speed }`.
7. WHEN initial launch speed is zero or negative, THE Engine SHALL return an empty trajectory array.
8. THE Engine SHALL support a configurable gravity value in the range [0.1, 25.0] m/s² to allow exploration of different planetary environments.

---

### Requirement 3: Physics Engine — Drag Model Accuracy

**User Story:** As a student comparing vacuum and realistic trajectories, I want the drag model to use correct aerodynamic formulas with accurate preset values, so that the simulation reflects real-world physics.

#### Acceptance Criteria

1. THE Engine SHALL compute cross-sectional area `A` from the projectile diameter `d` as `A = π * (d/2)^2`.
2. THE Engine SHALL accept air density `rho` as an input parameter rather than a hard-coded constant, allowing the UI to pass 0 (Vacuum) or 1.225 kg/m³ (Realistic) or a user-defined value.
3. WHEN drag force magnitude exceeds the force of gravity on the projectile at any step, THE Engine SHALL still apply both forces independently, allowing drag to dominate at high velocities.
4. THE Engine SHALL decompose drag deceleration into x and y components proportional to the respective velocity components relative to total speed.

---

### Requirement 4: Vacuum vs. Realistic Mode Toggle

**User Story:** As a student, I want to instantly switch between a vacuum simulation and a realistic air-resistance simulation, so that I can visually compare the two trajectories and understand the effect of drag.

#### Acceptance Criteria

1. THE UI SHALL provide a toggle control labeled "Vacuum" and "Realistic" that switches the simulation mode without requiring a page reload.
2. WHEN the toggle is changed, THE UI SHALL update the State to reflect the new air density value and immediately trigger a full trajectory recomputation.
3. WHEN Vacuum_Mode is active, THE Trajectory_Plot SHALL display the vacuum trajectory in a distinct color (e.g., blue) with a legend label "Vacuum".
4. WHEN Realistic_Mode is active, THE Trajectory_Plot SHALL display the realistic trajectory in a distinct color (e.g., orange) with a legend label "Realistic".
5. WHERE both trajectories are plotted simultaneously for comparison, THE Trajectory_Plot SHALL display both curves on the same chart with their respective legend labels and colors.

---

### Requirement 5: Preset Engine

**User Story:** As a student, I want to select from real-world projectile presets, so that I can immediately explore physically accurate simulations without manually entering parameters.

#### Acceptance Criteria

1. THE UI SHALL provide a dropdown selector containing presets grouped into three categories: Sports, Firearms, and Ordnance.
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

5. WHEN a preset is selected from the dropdown, THE UI SHALL update the mass, diameter, and Cd sliders and input fields to the preset's values and immediately trigger a full trajectory recomputation.
6. WHEN the user manually adjusts any slider after selecting a preset, THE UI SHALL NOT reset the preset selector; the sliders hold the authoritative state.

---

### Requirement 6: Control Panel Inputs

**User Story:** As a student, I want real-time slider controls for all simulation parameters, so that I can explore the effect of each variable without typing numeric values.

#### Acceptance Criteria

1. THE Control_Panel SHALL provide a slider and numeric display for launch angle in the range [0, 90] degrees with a step of 1 degree.
2. THE Control_Panel SHALL provide a slider and numeric display for initial launch speed in the range [1, 2000] m/s with a step of 1 m/s.
3. THE Control_Panel SHALL provide a slider and numeric display for projectile mass in the range [0.001, 50.0] kg.
4. THE Control_Panel SHALL provide a slider and numeric display for projectile diameter in the range [0.005, 0.5] meters.
5. THE Control_Panel SHALL provide a slider and numeric display for drag coefficient Cd in the range [0.05, 1.0].
6. THE Control_Panel SHALL provide a slider and numeric display for air density in the range [0.0, 1.5] kg/m³.
7. THE Control_Panel SHALL provide a slider and numeric display for gravity in the range [0.1, 25.0] m/s².
8. WHEN any slider value changes, THE UI SHALL update the corresponding numeric display synchronously and trigger a full trajectory recomputation within the same event loop tick.

---

### Requirement 7: Equation Dashboard — KaTeX Rendering

**User Story:** As a student, I want to see the active physics equations rendered in proper mathematical notation with the variables I am changing highlighted, so that I can directly connect my input actions to the underlying mathematics.

#### Acceptance Criteria

1. THE Equation_Dashboard SHALL render the following equations using KaTeX on every state update:
   - Position: `x(t) = v_0 \cos(\theta) \cdot t`
   - Position: `y(t) = v_0 \sin(\theta) \cdot t - \frac{1}{2} g t^2`
   - Speed: `v(t) = \sqrt{v_x^2 + v_y^2}`
   - Drag Force: `F_d = \frac{1}{2} \rho v^2 C_d A`
2. THE Equation_Dashboard SHALL substitute the current numeric values of all parameters into the rendered equations alongside the symbolic form, so that both the formula and the instantiated values are visible.
3. WHEN the user adjusts a slider, THE Equation_Dashboard SHALL highlight the LaTeX token(s) corresponding to the changed variable using a distinct background color (e.g., yellow) for a minimum of 1 second before fading back to the default style.
4. THE Equation_Dashboard SHALL display the computed peak height and total horizontal range as derived output values below the equations, updating on every recomputation.
5. IF KaTeX fails to render any equation, THE Equation_Dashboard SHALL display the equation in plain text fallback format without throwing an uncaught exception.

---

### Requirement 8: Canvas Animation

**User Story:** As a student, I want to watch the projectile animate along its computed trajectory on a canvas, so that I can develop an intuitive sense of the shape and timing of projectile motion.

#### Acceptance Criteria

1. THE Canvas_Animation SHALL animate the projectile along the pre-computed Trajectory array using `requestAnimationFrame`, advancing through trajectory states at a rate proportional to the simulation time step.
2. THE Canvas_Animation SHALL represent the projectile as a shape appropriate to its preset category: a circle for sports projectiles, a elongated capsule for firearms, and a filled polygon for ordnance. When no preset is active, THE Canvas_Animation SHALL use a circle.
3. THE Canvas_Animation SHALL draw the traced trajectory path behind the moving projectile as a fading line, retaining the last 200 positions.
4. WHEN a new trajectory is computed, THE Canvas_Animation SHALL restart the animation from the launch point without requiring a user action.
5. THE Canvas_Animation SHALL scale the coordinate system so that the full trajectory fits within the canvas bounds at all times, recalculating scale on each new trajectory.
6. THE Canvas_Animation SHALL display a ground line at y = 0 and label the x-axis with distance markers derived from the scaled coordinate system.
7. WHEN the animation completes (projectile reaches ground), THE Canvas_Animation SHALL display the landing position and total range in meters as an overlay on the canvas.

---

### Requirement 9: Trajectory Plot (Chart.js)

**User Story:** As a student, I want a fixed-axis chart showing the full trajectory from launch to landing, so that I can precisely read off range, peak height, and the effect of changing parameters.

#### Acceptance Criteria

1. THE Trajectory_Plot SHALL use Chart.js to render a line chart with the x-axis representing horizontal distance (meters) and the y-axis representing altitude (meters).
2. THE Trajectory_Plot SHALL display the complete pre-computed trajectory immediately upon each recomputation, without waiting for the Canvas_Animation to complete.
3. THE Trajectory_Plot SHALL fix the x-axis minimum at 0 and the y-axis minimum at 0, expanding the maximums to fit the current trajectory data.
4. THE Trajectory_Plot SHALL annotate the peak altitude point and the landing point (x-axis crossing) with labeled markers.
5. WHEN both Vacuum and Realistic trajectories are plotted, THE Trajectory_Plot SHALL display both as separate datasets with distinct colors and a visible legend.
6. THE Trajectory_Plot SHALL update within 100 milliseconds of a slider change to maintain the perception of real-time response.

---

### Requirement 10: Responsive Layout

**User Story:** As a student using the application on various screen sizes, I want a layout that keeps controls, equations, and visualizations accessible and readable, so that I can use the tool effectively on a desktop browser.

#### Acceptance Criteria

1. THE UI SHALL implement a three-column layout using TailwindCSS with the Control_Panel in the left column, the Equation_Dashboard in the center column, and the Canvas_Animation and Trajectory_Plot stacked in the right column.
2. WHILE the viewport width is less than 1024px, THE UI SHALL collapse to a single-column layout stacking panels vertically in the order: Control_Panel, Equation_Dashboard, Canvas_Animation, Trajectory_Plot.
3. THE UI SHALL apply a dark theme (dark gray background, white and blue text) using TailwindCSS utility classes consistent with the existing `bg-gray-900` color scheme.
4. THE Control_Panel SHALL remain visible and scrollable without the page scrolling when the panel content exceeds the viewport height.
5. THE Canvas_Animation canvas element SHALL maintain a fixed aspect ratio of 16:9 and resize responsively within its column.

---

### Requirement 11: Performance and Browser Compatibility

**User Story:** As a student using GitHub Pages, I want the application to remain responsive and smooth as I drag sliders, so that the educational feedback feels instantaneous.

#### Acceptance Criteria

1. THE Engine SHALL complete a full trajectory computation for any valid input combination in under 50 milliseconds on a modern desktop browser.
2. THE Canvas_Animation SHALL maintain a frame rate of at least 30 frames per second during active animation on a modern desktop browser.
3. THE UI SHALL debounce or use `requestAnimationFrame` scheduling when propagating rapid slider input events to the Engine, ensuring that no more than one full recomputation is queued per animation frame.
4. THE UI SHALL load and render the initial default state (45-degree launch, Golf Ball preset, Realistic Mode) within 3 seconds of the page being opened on a standard broadband connection.
5. THE UI SHALL function correctly in the current stable versions of Chrome, Firefox, and Safari without requiring any browser extensions or plugins.
6. THE UI SHALL load all dependencies (TailwindCSS, Chart.js, KaTeX) via CDN `<script>` tags in `index.html` without a local build step or package manager.

---

### Requirement 12: Parser and Serializer — State Serialization

**User Story:** As a student, I want to be able to share a specific simulation configuration via URL, so that I can show a classmate exactly the scenario I was exploring.

#### Acceptance Criteria

1. THE UI SHALL serialize the current State into a URL query string by encoding all parameter key-value pairs as URL-safe strings.
2. WHEN the page loads with a query string present, THE UI SHALL parse the query string and restore all State parameters to the encoded values before running the initial trajectory computation.
3. THE UI SHALL update the browser's URL bar (via `history.replaceState`) with the current serialized State whenever any parameter changes, without triggering a page reload.
4. IF the URL query string contains an unrecognized key or an out-of-range value, THE UI SHALL ignore that key and use the default value for the corresponding parameter, logging a warning to the browser console.
5. FOR ALL valid State objects, serializing then parsing the resulting query string SHALL produce a State object where every parameter value is equal to the original within floating-point rounding precision (round-trip property).

---

### Requirement 13: Default State and Initialization

**User Story:** As a first-time visitor, I want the application to open with a visually engaging default simulation already running, so that I understand what the tool does without reading any instructions.

#### Acceptance Criteria

1. WHEN the page loads without a URL query string, THE UI SHALL initialize the State with: launch angle 45°, initial speed 50 m/s, Golf Ball preset (mass 0.0459 kg, diameter 0.0427 m, Cd 0.47), Realistic_Mode, standard gravity 9.81 m/s², air density 1.225 kg/m³.
2. WHEN the page finishes loading, THE Canvas_Animation SHALL begin animating the default trajectory automatically without any user interaction.
3. WHEN the page finishes loading, THE Trajectory_Plot SHALL display the default trajectory immediately.
4. WHEN the page finishes loading, THE Equation_Dashboard SHALL display the default equations with the default parameter values substituted in.
