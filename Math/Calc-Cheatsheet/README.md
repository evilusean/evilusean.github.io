# Calc Cheatsheet & Quiz

A small, browser-based Calc 1 study app for reviewing derivative rules. It uses plain HTML, CSS, and JavaScript, with MathJax rendering the formulas.

## Contents

The current library contains 23 derivative rules in five groups:

- Basic rules: constant, power, constant multiple, and sum/difference.
- Operations and combinations: product, quotient, and chain rules.
- Exponential and logarithmic derivatives.
- The six trigonometric derivatives.
- The six inverse trigonometric derivatives.

The formula data is defined near the top of `script.js` in `formulaGroups`. Add or edit entries there to extend the library. Each entry has an `id`, `name`, TeX `formula`, `description`, `when`, and `example`.

## Open the app

Open `index.html` in a modern browser, or serve the repository with any static web server and navigate to `Math/Calc-Cheatsheet/`. There is no build step or package installation. The page loads MathJax 3 from jsDelivr, so an internet connection is needed to typeset the formulas.

## How to use it

### Cheatsheet

- Search by rule name, topic, formula text, or description.
- Use the study-set menu to select all formulas or a topic group.
- Use the checkboxes to choose formulas included in flashcards and the screensaver. Select all, clear, or copy a shareable link for the current selection.
- Select a rule’s name to expand or collapse its explanation, use case, and example.
- Select the formula itself to copy its TeX source.
- Turn on **Practice: hide formulas** to conceal formulas. Select a hidden formula to reveal it; save it for later from the expanded card.

### Screensaver

The screensaver cycles through the selected formulas in a shuffled order. Each card now has two timed stages:

1. Show the rule name first, giving you time to recall its derivative.
2. Reveal the formula and (when enabled) its explanation and example.
3. Move to the next rule after the same interval.

Adjust the interval with **Advance speed**, pause or resume the cycle, move manually, or use fullscreen. The default interval is six seconds per stage.

### Flashcards

Flashcards show a rule name without its formula. Click or tap the card, or press Space, to reveal the formula and explanation. Use Previous and Next to move through the selected study set.

### Saved formulas

Use the plus/save button on a formula card or revealed study card to save a rule. Open **Saved** in the header to review or remove entries, download a TXT or CSV copy, or clear the list.

## Keyboard controls

While in Screensaver or Flashcards:

- **Left / Right arrows:** previous or next formula.
- **Space:** pause/resume the screensaver, or reveal a flashcard.
- **F:** toggle fullscreen.
- **Esc:** exit fullscreen or return to the cheatsheet.

## Color cues and saved state

Sine-family notation is shown in warm red and cosine-family notation in blue. Tangent and reciprocal functions have their own accent colors. Formula selections and saved formulas are stored locally in this browser using Calc-specific `localStorage` keys; they do not share state with the Trig Cheatsheet app.

## Notes

- Trigonometric derivative rules assume angles are measured in radians.
- The current content is the derivative-rule set listed above. More Calc 1 topics can be added to the same grouped formula library.
- Inverse trigonometric names are rendered with MathJax `\\operatorname{...}` for consistent support, including `arctan` and `arccsc`.