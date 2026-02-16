# Design: Trig Identities Architecture

## Tech Stack
- **HTML5:** Semantic structure.
- **CSS3:** Flexbox/Grid for card layout, transitions for swiping.
- **Vanilla JS:** State management for the quiz and localStorage.

## File Architecture
- `index.html`: Main entry point.
- `style.css`: Responsive design and card animations.
- `trig_identities_complete.js`: Data file containing the `trigIdentities` array.
- `script.js`: Application state, navigation logic, and localStorage handling.

## Data Structure (Reflecting trig_identities_complete.js)
```json
{
  "name": "Reciprocal: Cosecant",
  "formula": "csc θ = 1/sin θ",
  "description": "WHY: Explanation of the logic...",
  "usage": "WHEN TO USE / EXAMPLE / WHY IT WORKS text block..."
}

## Visual Design
- **Color Palette:** Dark mode (Red/Black) with "Neon" accents for formulas (Blue for Sine, Red for Cosine).
- **Animations:** Use `IntersectionObserver` or simple `setTimeout` for the screensaver reveal logic.
- **Dynamic Elements:** - An SVG "Progress Ring" showing how much time is left before the next screensaver card.
  - A "Pulse" effect on the formula when it first appears.

## Animation Specifications

### 1. Screensaver Staggered Reveal
- **Initial State:** Name is visible; Formula and Usage have `opacity: 0` and `transform: translateY(20px)`.
- **Phase 1 (Name):** Always visible at start of cycle.
- **Phase 2 (Formula):** After 3s, add `.visible` class to Formula. 
  - *Transition:* `opacity: 1`, `transform: translateY(0)` over 0.8s.
- **Phase 3 (Usage):** After 7s, add `.visible` class to Usage container.
  - *Transition:* `opacity: 1`, `transform: translateY(0)` over 1.2s.

### 2. Interaction Feedback
- **Card Swipe:** Use `transform: translateX()` controlled by touch events. If swipe exceeds 100px, trigger `opacity: 0` and load next card.
- **"Save" (Spacebar/Long Press):** - Trigger a keyframe animation `save-pulse`.
  - The card scales up to `1.05`, then shrinks to `0` while moving toward the "Review" icon coordinates.

## Engineering Essentials List (Defaults)
The "Engineering Mode" toggle should automatically select these from `trig_identities_complete.js`:
- **Pythagorean Identity** (Fundamental)
- **Double Angle Sine & Cosine** (Crucial for integration/signals)
- **Sum/Difference of Sine/Cosine** (Phasor math/vectors)
- **Law of Cosines** (Static mechanics/force vectors)
- **Reciprocal: Cosecant/Secant** (General calculus)

## Trig Identities :
- **Add Any Trig Identities I don't already have** in the 'trig_identities_complete.js' like law of sines and cosines