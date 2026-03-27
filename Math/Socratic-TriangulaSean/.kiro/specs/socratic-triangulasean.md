# Specification: Socratic TriangulaSean v5.5

## 1. Vision & Layout
**Goal:** A mobile-responsive, precisely-timed interactive trigonometry simulator with a unified control scheme, dual math modes (Integer vs. Random), and integrated workspace tools.

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
    * **Interactive Inputs:** Fields that sync with the SVG in real-time.
    * **Identity Vault:** Interactive accordion containing all trig identities. Clicking one triggers a "Practice Case" from the Integer Library.
    * **Mistake Ledger:** Persistent list of failed problem URLs stored in `localStorage`.

---

## 2. Comprehensive Math Engine

### 2.1 The Six Logic Cases
| Case | Knowns | Primary Logic Path |
| :--- | :--- | :--- |
| **SSS** | 3 Sides (a, b, c) | Law of Cosines -> Law of Sines |
| **SAS** | 2 Sides + Included Angle | Law of Cosines -> Law of Sines |
| **ASA** | 2 Angles + Included Side | Angle Sum (180°) -> Law of Sines |
| **AAS** | 2 Angles + Non-Included Side | Angle Sum (180°) -> Law of Sines |
| **SSA** | 2 Sides + Non-Included Angle | **Ambiguous Case Logic** (Handles 0, 1, or 2 triangles) |
| **HL** | Hypotenuse + Leg (Right triangle) | Pythagorean Theorem + SOHCAHTOA |

### 2.2 SSA "Ambiguous Case" Deterministic Logic
1.  **If Angle A < 90°:**
    * a < b sin(A) -> **0 Triangles**.
    * a = b sin(A) -> **1 Right Triangle**.
    * b sin(A) < a < b -> **2 Triangles**.
    * a >= b -> **1 Triangle**.
2.  **If Angle A >= 90°:**
    * a <= b -> **0 Triangles**.
    * a > b -> **1 Triangle**.

### 2.3 Problem Generation Modes
* **Perfect Integers:** Pulls from a library of (3,4,5), (5,12,13), (8,15,17), (7,24,25), (30-60-90), and (45-45-90) cases.
* **Completely Random:** Uses `Math.random()` to generate valid triangles (Side A + Side B > Side C) with decimal values.

---

## 3. Unified Control System & Interaction

### Global Input Mapping
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
All UI elements (text, SVG lines, ledger fields) MUST follow this scheme:
* **Red:** Sin / Y-Axis / Vertical Components / Csc.
* **Blue:** Cos / X-Axis / Horizontal Components / Sec.
* **Purple:** Tan / Slopes / Cot.

### Operation Modes
* **Quiz Mode:** System prompts the user; user can input on right hand side ledger which will then update the svg triangle; Right Arrow or "Skip" auto-fills the current step.
* **Screensaver Mode:**
    1. **TUTOR_PROMPT (10s):** Question displays (affected by speed slider).
    2. **ANIMATION_TRIGGER (5s):** Ledger auto-fills; SVG part pulses and changes color.
    3. **REVIEW (30s):** Full formula display and step-by-step logic recap.

---

## 5. Persistence & Tools
* **Scratchpad:** Canvas overlay for notes (stylus/mouse).
* **Calculator:** Floating scientific calculator.
* **URL Sync:** Mirror state in `?type=SAS&a=3&b=4&C=90&mode=integer&step=2&tools=none`.
* **Mistake Ledger:** IF a user fails a prompt, the problem is tagged. The user can "Copy All Failed URLs" from the sidebar.