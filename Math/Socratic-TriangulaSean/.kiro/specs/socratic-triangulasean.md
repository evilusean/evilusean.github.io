# Specification: Socratic TriangulaSean v3.0

## 1. Vision & Layout
**Goal:** A mobile-responsive, precisely-timed interactive trigonometry simulator with a focus on "Perfect Integer" cases and error-tracking persistence.

### Three-Column Responsive Layout
* **Left Column (Socratic Tutor):** * Displays deterministic dialogue. 
    * Buttons: **Play/Pause**, **Next Step**, **Prev Step**, **Save**, **How to Use** (Popup Trigger).
    * **Speed Slider:** Adjusts Screensaver delay ($0.5x$ to $3.0x$ speed).
* **Middle Column (Interactive SVG Visualizer):**
    * Dynamic triangle rendering. 
    * **Visual Feedback:** When a part is solved, it MUST **Flash**, **Pulse (Grow/Shrink)**, and change from grey to its designated **Trig Color**.
* **Right Column (Data Ledger & Error Tracker):**
    * **Identity Cheatsheet:** Interactive accordion. Clicking an identity (e.g., Law of Sines) allows the user to trigger a "Random Practice" triangle specifically designed for that formula.
    * **Saved/Wrong Gallery:** Lists problems the user got wrong. Allows "Copy All URLs" or "Copy Individual URL" for future review.

---

## 2. Prebuilt "Clean" Problem Sets
The `TriangleEngine` SHALL include a library of non-decimal, "easy-to-work-with" triangles mapped to specific identities.

### Classic Triangle Library
| Case | Triangles (Sides/Angles) | Primary Identity Focus |
| :--- | :--- | :--- |
| **Pythagorean** | (3,4,5), (5,12,13), (8,15,17), (7,24,25) | SOHCAHTOA / Pythagoras |
| **Special Right** | (45-45-90 [1,1,√2]), (30-60-90 [1,√3,2]) | Exact Trig Values |
| **Law of Cosines** | (5,8,7 -> 60°), (3,5,7 -> 120°) | SAS / SSS Logic |
| **Law of Sines** | (Sides: 10, 10√2, Angles: 45, 90, 45) | ASA / AAS Logic |

* **Identity Quizzing:** If a user selects "Practice Law of Sines" from the cheatsheet, the engine SHALL pull a relevant case from this library.

---

## 3. Screensaver Simulation & State Management

### Step-Based Navigation
* `Next` and `Previous` buttons SHALL navigate through **Steps** (individual side/angle discoveries), not entire problems.
* **URL Persistence:** The URL SHALL update at every **Step** to ensure that refreshing the page returns the user to the exact sub-calculation they were on.

### Timing & Feedback Loop
1.  **TUTOR_PROMPT (10s base):** Socratic question appears.
2.  **ANIMATION_TRIGGER (5s base):** * Part on SVG **Flashes/Grows**.
    * Color fills: **Red (Sin/Y)**, **Blue (Cos/X)**, **Purple (Tan/Cot)**.
3.  **REVIEW (30s):** Final logic breakdown + Formula display.

---

## 4. User Persistence & Error Handling
* **The "Mistake Ledger":** * If a user fails a Socratic prompt (wrong identity/value), the problem is tagged as "Wrong."
    * These are stored in `localStorage` and displayed in the Right Column.
    * **Export:** One-click button to "Copy all failed problem URLs" to clipboard.

---

## 5. Controls & Accessibility

### Mobile Interaction (FR-MOBILE)
* **Press and Hold (3s):** Trigger "Save to Ledger."
* **Swipe Right/Left:** Navigate `Next Step` / `Prev Step`.
* **Pinch/Zoom:** Standard SVG zoom.

### "How to Use" Popup
* A modal overlay that explains:
    1. The meaning of the color coding (Red = Y/Sin, Blue = X/Cos).
    2. How to use the Screensaver for passive learning.
    3. How to "Skip" steps by inputting final values.