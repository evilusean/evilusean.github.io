# Compound Interest & Growth Calculator

## Overview

Responsive interactive web app: compound interest from user inputs, dynamic LaTeX with substituted values, exponential growth chart, Socratic quiz mode.

## Functional Requirements

1. **Inputs:** P, r (%), n, t (years), optional monthly PMT
2. **Formulas:** Live MathJax with numeric substitution
   - \(A = P(1 + r/n)^{nt}\)
   - Monthly annuity: \(A_{\text{PMT}} = PMT \cdot \frac{(1 + r/12)^{12t} - 1}{r/12}\)
3. **Chart:** Real-time line chart (principal, contributions, total)

## Technical

- Vanilla HTML/CSS/JS, GitHub Pages
- Header ledger only (no right column)
- Quiz: `displayAll` false on init; spoilers until step validated
- URL params: `quiz`, `P`, `r`, `n`, `t`, `pmt` only (no answers)

## Files

- `index.html`, `style.css`, `app.js`, `favicon.svg`
