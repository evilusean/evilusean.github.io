# Socratic TriangulaSean: Socratic Geometry Engine

A deterministic, step-by-step trigonometry tutor designed to help users master triangle congruence and solving techniques. This app is built to be hosted entirely on GitHub Pages as a static site using the **Kiro** state management library.

## Overview

**Socratic TriangulaSean** doesn't just give you the answer; it guides you through the logic. The app generates infinite problems—from classic **3-4-5** right triangles to complex **Ambiguous Case (SSA)** scenarios—and asks leading questions to help you determine which trigonometric ratio or law to apply next.

### Key Features
* **Infinite Problem Generation:** Randomly generated triangles or "Classic" presets.
* **Socratic Dialogue:** A deterministic script that asks, "What should we find next?" and "Which ratio applies here?"
* **Step Skipping:** Advanced users can input final values to bypass intermediate steps.
* **Screensaver Mode:** An automated playback mode that demonstrates the step-by-step solution process for study or display.
* **Persistent Progress:** Saves your generated problems and mastery stats to `localStorage`.

---

## Supported Triangle Cases

To solve a triangle, you generally need three pieces of information. The app supports the following logical cases:

### 1. SSS (Side-Side-Side)
* **Knowns:** Lengths of all three sides.
* **Logic:** Uses the **Law of Cosines** to find the first angle.
* **Socratic Goal:** Identifying which angle to solve for first to avoid ambiguity.

### 2. SAS (Side-Angle-Side)
* **Knowns:** Two sides and the "included" angle between them.
* **Logic:** Uses the **Law of Cosines** to find the third side.
* **Socratic Goal:** Recognizing that SOHCAHTOA cannot be used directly unless it's a right triangle.

### 3. ASA & AAS (Angle-Side-Angle / Angle-Angle-Side)
* **Knowns:** Two angles and one side.
* **Logic:** Uses the **Angle Sum Theorem** ($180^{\circ}$) and the **Law of Sines**.
* **Socratic Goal:** Finding the third angle first to simplify the Law of Sines application.

### 4. SSA / "ASS" (Side-Side-Angle)
* **Knowns:** Two sides and a non-included angle.
* **Logic:** Known as the **Ambiguous Case**.
* **Socratic Goal:** Determining if the given values result in **zero, one, or two** possible triangles.

### 5. HL (Hypotenuse-Leg)
* **Knowns:** The hypotenuse and one leg of a right triangle.
* **Logic:** Uses the **Pythagorean Theorem** and **SOHCAHTOA**.
* **Socratic Goal:** Mastering the relationship between the sine, cosine, and tangent ratios.

---

## Mathematical Toolkit

**Socratic TriangulaSean** guides you through the following formulas:

* **SOHCAHTOA:**
    * $\sin(\theta) = \frac{\text{Opposite}}{\text{Hypotenuse}}$
    * $\cos(\theta) = \frac{\text{Adjacent}}{\text{Hypotenuse}}$
    * $\tan(\theta) = \frac{\text{Opposite}}{\text{Adjacent}}$
* **Law of Sines:** $\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C}$
* **Law of Cosines:** $c^2 = a^2 + b^2 - 2ab \cos(C)$

---

## Installation & Usage

Since this is a static site, no build step is required.
1. Clone the repository.
2. Open `index.html` in any modern browser.
3. Use the "Generate" button to start a new problem or "Screensaver" to watch the logic unfold.

---

## ToDo / Future Sean Problems :
- Ran out of tokens, quiz mode is broken
- When you click on something like 'Law of Sines' or 'Law of Cosines' or whatever - it should open it in the cheatsheet - maybe add a link to https://evilusean.github.io/Math/Trig-Identities-CheatSheet-Quiz/index.html so the user can see when to use

- what is 'h'? - I know it's height, but shouldn't that be the corresponding side? Why is it asking for height?
- maybe get rid of the right hand ledger - I added the values to the top, so it seems superfluous 
- save feature is broken? or is that the bulk save the mistakes ledger 
- url parameters are weird, it kind of defeats the purpose if it tells you what the solution to each problem is in the url params, maybe fix so it doesn't update that for each new question/step
- some triangles are displaying all sides and angles while still going through socratic questioning, again, defeats the purpose - 'what is side C'... uh, it's '5', it says it right there

- quiz mode still broken, now displaying all answers at start
- size of triangle is now too big and overflowing