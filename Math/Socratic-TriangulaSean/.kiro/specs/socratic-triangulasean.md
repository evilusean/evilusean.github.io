# Specification: Socratic TriangulaSean v5.7

## 1. Vision & Layout
**Goal:** A mobile-responsive, precisely-timed interactive trigonometry simulator with a unified control scheme, dual math modes (Integer vs. Random), and integrated workspace tools. Hosted statically on GitHub Pages.

### Three-Column Responsive Layout
* **Left Column (Socratic Tutor):**
    * Displays deterministic dialogue and "Leading Questions."
    * **Mode Toggle:** [Perfect Integers] vs. [Completely Random].
    * **Toolbox:** [Open Scratchpad], [Open Calculator], [How to Use] (Popup).
    * **Speed Slider:** Adjusts Screensaver delay (0.5x to 3.0x speed).
* **Middle Column (Interactive SVG Visualizer):**
    * **Geometric Accuracy:** SVG `points` MUST update to reflect actual internal angles and side-length ratios.
    * **Visual Feedback:** When a part is solved, it MUST **Flash**, **Pulse (Grow/Shrink)**, and transition from grey to its designated **Trig Color**.
* **Right Column (Data Ledger & Identity Vault):**
    * **Interactive Inputs:** Fields that sync with the SVG in real-time. If a user fills a value here in Quiz Mode, the SVG must update immediately.
    * **Identity Vault:** Interactive accordion containing all trig identities. 
        * **Checkboxes:** Each identity/case has a checkbox. Screensaver only cycles through checked items (All checked by default).
        * **Launchers:** Clicking an identity name triggers Quiz Mode for that specific case.
    * **Mistake Ledger:** Persistent list of failed problem URLs stored in `localStorage`.

---

## 2. Comprehensive Math Engine

### 2.1 The Six Logic Cases & Identities
| Case | Knowns | Logic / Identity |
| :--- | :--- | :--- |
| **SSS** | 3 Sides (a, b, c) | Law of Cosines -> Law of Sines |
| **SAS** | 2 Sides + Incl. Angle | Law of Cosines -> Law of Sines |
| **ASA** | 2 Angles + Incl. Side | Angle Sum (180°) -> Law of Sines |
| **AAS** | 2 Angles + Non-Incl. Side | Angle Sum (180°) -> Law of Sines |
| **SSA** | 2 Sides + Non-Incl. Angle | **Ambiguous Case Logic** (0, 1, or 2 triangles) |
| **HL** | Hypotenuse + Leg | Pythagorean Theorem + SOHCAHTOA |

### 2.2 SSA "Ambiguous Case" Logic
* **If Angle A < 90°:** a < b sin(A) (0); a = b sin(A) (1 Right); b sin(A) < a < b (2); a >= b (1).
* **If Angle A >= 90°:** a <= b (0); a > b (1).

### 2.3 Generation Modes
* **Perfect Integers:** Library of (3,4,5), (5,12,13), (8,15,17), (7,24,25), (30-60-90), (45-45-90).
* **Completely Random:** `Math.random()` valid triangles with decimal values.

---

## 3. Unified Control System & Interaction

| Action | Desktop Keyboard | Mobile / Touch Gesture |
| :--- | :--- | :--- |
| **Play/Pause** | Space | Double Tap (on Visualizer) |
| **Save to Ledger** | Enter | Press and Hold (3s) |
| **Next Step** | Right Arrow | Swipe Right (Horizontal) |
| **Previous Step** | Left Arrow | Swipe Left (Horizontal) |
| **Exit / Close Tools**| Esc | Swipe Down (on Modal/Tool) |
| **Next Problem** | Shift + Right | Two-Finger Swipe Right |

---

## 4. UI/UX & Visual Rules

### Trigonometric Color Coding
* **Red:** Sin / Y-Axis / Vertical / Csc.
* **Blue:** Cos / X-Axis / Horizontal / Sec.
* **Purple:** Tan / Slopes / Cot.

### Operation Modes
* **Quiz Mode:** System prompts; user inputs on Right Ledger (updates SVG); Right Arrow/"Skip" auto-fills.
* **Screensaver Mode:**
    1. **TUTOR_PROMPT (10s):** Question displays (speed-adjustable).
    2. **ANIMATION_TRIGGER (5s):** Ledger auto-fills; SVG pulses/colors.
    3. **REVIEW (30s):** Full formula display and logic recap.

---

## 5. Persistence & Tools
* **Scratchpad:** Canvas overlay for notes.
* **Calculator:** Floating scientific calculator.
* **URL Sync:** `?type=SAS&a=3&b=4&C=90&mode=integer&step=2&tools=none&filter=SSS,SAS...`.
* **Mistake Ledger:** Failed problems are tagged; "Copy All Failed URLs" button in sidebar.