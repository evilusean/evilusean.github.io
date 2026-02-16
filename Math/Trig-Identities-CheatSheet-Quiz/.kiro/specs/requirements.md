# Requirements: Trig Identities Cheatsheet & Quiz

## Functional Requirements
- **Identity Display:** Must show Name, Formula, Use Case, and Example for all standard trig identities (Pythagorean, Double Angle, etc.).
- **Selection Mode:** Home screen with clickable checkboxes/boxes to toggle which identity sets are active in the quiz.
- **Quiz Mode:**
  - Flashcard-style interface.
  - **Spacebar:** Saves the current identity to a "Review List" (Local Storage).
  - **Arrow Keys (Left/Right):** Navigate between identities.
- **Mobile Support:** - **Swipe Left/Right:** Navigation.
  - **Long Press:** Save to Review List.
- **Persistence:** Save the "Review List" to `localStorage` so it persists on page refresh.
- **Static Hosting:** Must run as a single-page app (SPA) on GitHub Pages (No backend).

## Non-Functional Requirements
- **Responsive Design:** Mobile-first approach.
- **Performance:** Instant transitions between cards.
- **Accessibility:** Keyboard shortcuts (Space/Arrows) must be functional.

## Content Data: Trig Identities
The app must utilize the following data structure for the `trigIdentities` array. 
Each identity object contains:
- `name`: Title of the identity.
- `formula`: The mathematical expression (Use LaTeX style strings or clear text).
- `description`: The "WHY" (Conceptual explanation).
- `usage`: The "WHEN TO USE", "EXAMPLE", and "WHY IT WORKS" blocks.

### Identity Rules:
- The `usage` field contains newlines (`\n\n`). The UI must preserve these line breaks.
- Use a monospaced font for the `formula` field to ensure mathematical clarity.

## New Features
- **Screensaver Mode:** Auto-advance toggle with staggered reveal (Name -> Formula -> Usage).
- **Engineering Defaults:** A "Pre-set" filter button that selects:
  - Pythagorean Identities.
  - Double Angle (essential for Integration).
  - Product-to-Sum (essential for Signal Processing).
- **Visual Feedback:** CSS-based animations for "Saving" a card (e.g., card flies into a 'Review' folder).
- **LaTeX Rendering:** Use a lightweight library like `KaTeX` or just `Unicode` (to keep it strictly static/fast).