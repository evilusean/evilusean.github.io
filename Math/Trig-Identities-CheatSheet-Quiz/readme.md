# 📐 Trig Cheatsheet & Quiz App

A comprehensive, interactive web app for learning trigonometric identities with a beautiful cheatsheet and intelligent quiz mode. Features MathJax rendering, color-coded functions, and phase-based navigation.

## ✨ Features

### 🎨 Visual Learning
- **Color-Coded Trig Functions**: Consistent color scheme across the app
  - sin (red), cos (blue), tan (purple)
  - csc (pink), sec (light blue), cot (light purple)
- **MathJax Rendering**: Beautiful mathematical typography for all formulas
- **Visual Notifications**: Clear feedback for all actions (copy, save, download)
- **Responsive Design**: Works seamlessly on desktop and mobile

### 📚 Cheatsheet Mode
- Browse 50+ essential trig identities
- Expandable sections with descriptions, usage examples, and detailed explanations
- Click any formula to copy to clipboard
- Select/deselect identities for quiz mode
- Engineering-essential identities pre-selected by default
- Select All / Deselect All buttons for quick management

### 🎯 Quiz Mode
- **Randomized Order**: Identities appear in random order each cycle
- **Phase-Based Navigation**: 
  - Phase 0: Name (5 seconds)
  - Phase 1: Formula (5 seconds)
  - Phase 2: Description (5 seconds)
  - Phase 3: Usage (5 seconds)
  - Phase 4: Example (5 seconds)
- **Smart Navigation**: Next/Prev buttons move through phases, not just questions
- **Auto-Advance**: Automatically progresses through phases
- **Pause/Resume**: Space bar to pause and resume
- **Save for Review**: Mark difficult identities (Enter key)

### 💾 Save & Share
- **Save to URL**: Generate shareable links with your selected identities
- **Save for Review**: Mark identities during quiz mode for later study
- **Download Options**:
  - TXT format: Clean text file with all saved identities
  - CSV format: Spreadsheet-compatible for further organization
- **Persistent Storage**: Selections and saved items stored in browser

### ⌨️ Keyboard Shortcuts (Quiz Mode)
- **Arrow Left/Right**: Navigate through phases
- **Space**: Pause/Resume auto-advance
- **Enter**: Save current identity for review
- **ESC**: Exit quiz mode

### 📱 Mobile Support
- Touch-optimized interface
- Swipe left/right to navigate phases
- Responsive button layout
- Compact legend display

## 🎓 How to Use

### Cheatsheet Mode
1. Browse all trig identities with formulas and explanations
2. Check the boxes next to identities you want to study
3. Click any identity name to expand/collapse details
4. Click any formula to copy it to clipboard
5. Use "Save to URL" to share your selection with others

### Quiz Mode
1. Select identities in cheatsheet mode
2. Click "Quiz Mode" to start
3. Watch as each identity reveals progressively:
   - Name appears first (think about it!)
   - Formula appears next
   - Description, usage, and examples follow
4. Use Next/Prev to navigate through phases
5. Press Enter to save difficult identities for review
6. Press Space to pause and study at your own pace

### Saved Items
1. Click "💾 Saved" button in header to view saved identities
2. Download as TXT or CSV for offline study
3. Remove individual items or clear all

## 🔗 Related Resources

- [Interactive Unit Circle App](https://evilusean.github.io/Math/Unit-CirculaSean/index.html) - Visualize trig functions on the unit circle

## 🚀 GitHub Pages Deployment

This is a static site - just push to GitHub and enable Pages in repository settings. No build process required.

## 💻 Local Development

Simply open `index.html` in a browser. All dependencies (MathJax) are loaded from CDN.

## 🎨 Color Scheme

Colors are consistent with the Unit Circle app for a unified learning experience:
- **cos**: #5b9bd5 (blue)
- **sin**: #e06666 (red)
- **tan**: #b388ff (purple)
- **sec**: #6fa8dc (light blue)
- **csc**: #ea9999 (pink)
- **cot**: #c9a3ff (light purple)

## 📋 Included Identities

- Fundamental Identities (Reciprocal, Quotient)
- Pythagorean Identities
- Sum and Difference Formulas
- Double Angle Formulas
- Power Reduction Formulas
- Half Angle Formulas
- Product-to-Sum Formulas
- Sum-to-Product Formulas
- Even/Odd Identities
- Cofunction Identities
- Law of Sines
- Law of Cosines
- Triangle Area Formulas

## 🛠️ Technical Details

- Pure vanilla JavaScript (no frameworks)
- MathJax 3 for mathematical rendering
- LocalStorage for persistence
- Fisher-Yates shuffle for randomization
- Responsive CSS with mobile-first approach
- Static site (works offline after first load)

## 📄 License

Open source - feel free to use and modify for educational purposes.
