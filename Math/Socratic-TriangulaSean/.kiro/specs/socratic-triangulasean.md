# Specification: Socratic TriangulaSean v2.0

## 1. Vision & Layout
**Goal:** A mobile-responsive, precisely-timed interactive trigonometry simulator, hosted statically on GitHub.

### Three-Column Responsive Layout
The UI SHALL use a CSS Grid/Flexbox three-column split on desktop, stacking vertically on mobile (Socratic -> Visualizer -> Ledger).

* **Left Column (Socratic Tutor):**
    * Displays the deterministic dialogue and "Leading Questions."
    * Contains standard controls: **Pause**, **Previous**, **Next**, **Save**.
* **Middle Column (Interactive Triangle Visualizer):**
    * An SVG-based triangle.
    * Uses animations and bold flashing to highlight parts as they are discovered or selected.
* **Right Column (Data Ledger & Trig Cheatsheet):**
    * Dynamic list of triangle parts ($a, b, c, \angle A, \angle B, \angle C$).
    * **Calculated Values:** Shows SOHCAHTOA and inverse trig ratios ($\csc, \sec, \cot$) as they are discovered.
    * **Trig Cheatsheet:** A dedicated accordion/section listing all the Law of Cosines, Law of Sines, and SOHCAHTOA identities used by the engine.

---

## 2. Dynamic State & URL Persistence

The state of the application SHALL be managed in the browser and persistently mirrored in the URL parameters.

### Required State Model
* `triangleType`: [SSS, SAS, ASA, AAS, SSA, HL, Custom]
* `knowns`: Object { a, b, c, A, B, C } (stores known numerical values).
* `activeSequence`: List of logic steps (e.g., ["LawCosines_c", "LawSines_B", "AngleSum_A"]).
* `stepIndex`: The current active logic step in the sequence.
* `simulationState`: [IDLE, PAUSED, TUTOR_PROMPT, DISPLAYING_VALUE, SOLVED_REVIEW].
* `isScreensaver`: Boolean.

### URL Parameter Mapping
THE application SHALL update and read from the URL parameters using the following format:
`?type=[TYPE]&a=[V]&b=[V]&c=[V]&A=[V]&B=[V]&C=[V]&step=[V]&mode=[screensaver/tutor]`

---

## 3. Screensaver Simulation Flow & Timing
This sequence MUST be implemented using a rigid state machine. For each `stepIndex`:

1.  **State `TUTOR_PROMPT` (Duration: 10s):**
    * THE system SHALL display the next Socratic leading question (deterministic lookup based on `stepIndex`).
    * THE UI SHALL pause all animation on the triangle and ledger.
2.  **State `DISPLAYING_VALUE` (Duration: 5s):**
    * THE system SHALL notify the user of the new discovered part:
        1.  Highlight the new numerical text on the Right Ledger in **BOLD** or **FLASHING**.
        2.  Fill in the corresponding side/angle on the SVG visualizer, using color/animation.
3.  **End of Sequence:**
    * GIVEN the entire triangle is solved, THE system SHALL enter state `SOLVED_REVIEW` (Duration: 30s).
    * The dialogue column SHALL display the **final result**, a full breakdown of the logic used ("First used Law of Cosines to find side c... then Angle Sum for Angle A...").
    * The Trig Cheatsheet on the right column SHALL highlight the actual formulas applied.
    * THE system SHALL generate a *new* problem case and repeat the sequence.

---

## 4. User Interaction & Controls

### General Controls
* **Save:**
    * THE system SHALL generate a unique shareable URL based on the current state and parameters.
    * THE system SHALL copy this URL to the clipboard.
    * THE problem data SHALL also be persisted to `localStorage`.
* **Play/Pause:** Toggles the `simulationState` timer loop.
* **Next / Previous:** Navigates the `stepIndex` manually. Previous steps "un-solve" parts of the triangle.

### Mobile Gestures (FR-MOBILE)
* **Press and Hold (3s):** Trigger the `Save` functionality.
* **Swipe Right (horizontal):** Trigger the `Next` step functionality.
* **Swipe Left (horizontal):** Trigger the `Previous` step functionality.

---

## 5. Visual Specifications

### Triangle Highlighting
THE system SHALL animate the transition of a triangle part (side or angle) from unknown (dashed/grey) to known (solid/colored). Flashing text should use a distinct accent color.

### Trigonometric Color Coding (Required)
The Data Ledger column and corresponding triangle parts MUST use the specific color codes referenced in the `Unit Circle Quiz` asset provided (image_0.png):

* **Sin (y) / Opposite / Angle Side: RED**
* **Cos (x) / Adjacent / Angle Side: BLUE**
* **Tan ($O/A$) & Cot ($A/O$): PURPLE**
* **Sec ($H/A$) & Csc ($H/O$): (Refer to image, typically inverse/lighter variants of base color)**