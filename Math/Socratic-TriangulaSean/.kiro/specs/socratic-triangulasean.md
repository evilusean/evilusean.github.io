# Specification: Socratic TriangulaSean v5.0

## 1. Vision & Layout
**Goal:** A mobile-responsive, precisely-timed interactive trigonometry simulator with a unified control scheme for desktop and touch devices.

### Unified Control System (State & Navigation)
THE system SHALL support a "Global Listener" for the following inputs, affecting both the Simulation and the Workspace Tools (Calculator/Scratchpad).

| Action | Desktop Keyboard | Mobile / Touch Gesture |
| :--- | :--- | :--- |
| **Play/Pause** | `Space` | Double Tap (on Visualizer) |
| **Save to Ledger** | `Enter` | Press and Hold (3s) |
| **Next Step** | `Right Arrow` | Swipe Right (Horizontal) |
| **Previous Step** | `Left Arrow` | Swipe Left (Horizontal) |
| **Exit / Close All** | `Esc` | Swipe Down (on Modal/Tool) |
| **Next Problem** | `Shift + Right` | Two-Finger Swipe Right |

---

## 2. Interactive Tools & Overlays

### Tool Management (Modals)
* **Escape Key (`Esc`) / Swipe Down Logic:** * IF the Calculator or Scratchpad is open, `Esc` SHALL close the active tool first.
    * IF no tools are open, `Esc` SHALL reset the current problem or return to the main menu.
* **Scratchpad:** A transparent canvas overlay for stylus/mouse notes.
* **Calculator:** A floating scientific calculator for "Random Mode" calculations.

---

## 3. UI/UX & Visual Feedback

### Three-Column Responsive Layout
* **Left Column (Socratic Tutor):** Displays deterministic dialogue. Includes a **Speed Slider** for the Screensaver and **Mode Toggles** (Integer vs. Random).
* **Middle Column (Interactive SVG):** * **Dynamic Transformation:** SVG points update to match actual triangle ratios.
    * **Highlighting:** When a value is updated via the Right Column or Screensaver, the SVG part SHALL **Pulse/Grow** and turn its designated color:
        * **Red:** Sin / Y / Vertical.
        * **Blue:** Cos / X / Horizontal.
        * **Purple:** Tan / Cot / Slopes.
* **Right Column (Data Ledger):** * Interactive fields that sync with the SVG. 
    * **Mistake Ledger:** Persistent list of failed problem URLs for review.

---

## 4. Operation Modes

### Quiz Mode (Manual)
* The user is prompted by the Socratic dialogue.
* The user can either input the value manually in the Right Column or press `Right Arrow` / `Swipe Right` to **Skip/Auto-Fill** the current step.

### Screensaver Mode (Auto-Pilot)
1. **TUTOR_PROMPT (10s base):** Question displays; `Space` can pause/resume this timer.
2. **ANIMATION_TRIGGER (5s base):** The system auto-fills the ledger and pulses the SVG part.
3. **REVIEW (30s):** Final logic breakdown + Formula display.

---

## 5. Persistence & State
* **URL Sync:** `?type=SAS&a=3&b=4&C=90&mode=integer&step=2&tools=none`
* **Local Storage:** Stores the "Mistake Ledger" and user preferences (e.g., Screensaver Speed).