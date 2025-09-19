# Markdown Preview Tool

A comprehensive markdown preview tool with mathematical notation support, built for GitHub Pages. Features real-time preview, extensive template system, and MathJax integration for scientific writing.

## 🚀 Features Overview

### Core Functionality
- **Real-time preview**: See your markdown rendered as you type with instant updates
- **Mathematical notation**: Full LaTeX/MathJax support for inline ($E = mc^2$) and display math ($$\frac{a}{b}$$)
- **GitHub-flavored markdown**: Complete support for tables, code blocks, task lists, and more
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile devices
- **Static hosting**: Runs entirely in the browser, perfect for GitHub Pages deployment

### Template System
- **Comprehensive markdown examples**: 11 categories covering all markdown syntax
- **Mathematical formula library**: 13 categories from basic operations to advanced physics/chemistry
- **Interactive popups**: Click any dropdown item to see examples with live preview
- **Copy functionality**: Easy copy-paste of example code into your document

### User Interface
- **Split-pane editor**: Markdown input on left, live preview on right
- **Clean, minimal design**: Distraction-free writing environment
- **Keyboard shortcuts**: Tab support in editor, ESC to close popups
- **URL sharing**: Save and share your work via URL parameters

## 🎛️ Button Functions

### Control Buttons
| Button | Function |
|--------|----------|
| **Clear** | Empties the markdown input field completely |
| **Copy All** | Copies all text from the markdown input to clipboard |
| **Save to URL** | Saves current content to URL parameters and copies shareable link |

### Template Dropdowns
| Dropdown | Function |
|----------|----------|
| **📝 All Markdown Syntax** | Shows popup with markdown examples (headers, tables, links, etc.) |
| **🧮 Math Formula Guide** | Shows popup with LaTeX math examples (fractions, symbols, equations, etc.) |

### Popup Controls
- **Copy Code**: Copies the example code to clipboard
- **Dropdown selector**: Switch between different examples within the popup
- **× Close button**: Closes the popup
- **ESC key**: Closes any open popup
- **Click outside**: Closes popup when clicking outside the modal

## 📚 Template Categories

### Markdown Syntax Examples
1. **Headers** - H1 through H6 with alternative syntax
2. **Text Emphasis** - Bold, italic, strikethrough, highlighting
3. **Lists & Checkboxes** - Ordered, unordered, nested, and task lists
4. **Links & Images** - URLs, references, images with titles
5. **Code & Syntax Highlighting** - Inline code and language-specific blocks
6. **Tables** - Basic and aligned tables with various content
7. **Blockquotes & Callouts** - Simple and nested quotations
8. **Horizontal Rules** - Different rule styles and syntax
9. **HTML in Markdown** - Embedded HTML elements and tags
10. **Advanced Features** - Footnotes, definition lists, escapes
11. **Complete Example** - Full document showcasing all features

### Mathematical Formula Examples
1. **Basic Operations** - Addition, subtraction, multiplication, division
2. **Fractions** - Simple, nested, and complex fractions
3. **Exponents & Roots** - Powers, square roots, nth roots
4. **Subscripts & Superscripts** - Indices and notation
5. **Greek Letters** - Complete alphabet with variants
6. **Mathematical Operators** - Comparison, set, and logic operators
7. **Functions & Trigonometry** - Trig functions, logs, exponentials
8. **Calculus Symbols** - Derivatives, integrals, limits, series
9. **Matrices & Vectors** - Different bracket types and operations
10. **Sets & Logic** - Set theory and logical notation
11. **Statistics Symbols** - Probability, distributions, hypothesis testing
12. **Common Math Formulas** - Algebra, geometry, sequences, logarithms

### Physics Formulas
13. **Physics: Mechanics** - Newton's laws, kinematics, energy, rotational motion
14. **Physics: Thermodynamics** - Laws, gas theory, heat transfer, entropy
15. **Physics: Electromagnetism** - Electric fields, magnetic fields, Maxwell equations
16. **Physics: Quantum & Modern** - Quantum mechanics, relativity, nuclear physics

### Chemistry Formulas
17. **Chemistry: General** - Atomic structure, gas laws, solutions, equilibrium
18. **Chemistry: Organic** - Functional groups, nomenclature, mechanisms, spectroscopy
19. **Chemistry: Physical** - Kinetics, thermodynamics, electrochemistry, quantum chemistry

### Engineering Formulas
20. **Engineering: Mechanical** - Statics, dynamics, fluid mechanics, heat transfer, machine design
21. **Engineering: Electrical** - Circuit analysis, AC circuits, electromagnetics, control systems, power systems
22. **Engineering: Civil** - Structural analysis, concrete/steel design, geotechnical, hydraulics, transportation

## 🛠️ Usage Instructions

### Basic Usage
1. Open `index.html` in your browser or visit the live site
2. Type markdown in the left panel
3. See real-time preview in the right panel
4. Use dropdowns to explore examples and copy useful syntax

### Mathematical Notation
- Inline math: `$E = mc^2$` renders as $E = mc^2$
- Display math: `$$\frac{a}{b}$$` renders as centered equation
- Use backslashes to escape special characters: `\$` for literal dollar sign

### Sharing Your Work
1. Write your content in the markdown input
2. Click "Save to URL" to generate a shareable link
3. The URL contains your content and can be bookmarked or shared

### Keyboard Shortcuts
- **Tab** in editor: Insert tab character (doesn't change focus)
- **ESC**: Close any open popup modal
- **Ctrl+A** then **Copy All**: Select and copy all content

## 🚀 Local Development

No build process required! Simply:
1. Clone or download the repository
2. Open `index.html` in any modern browser
3. Start writing markdown immediately

## 🌐 GitHub Pages Deployment

1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Your site will be available at `https://[username].github.io/[repository-name]`

## 🔧 Technologies Used

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Grid layout, flexbox, and responsive design
- **JavaScript (ES6+)**: Real-time parsing and DOM manipulation
- **Marked.js**: GitHub-flavored markdown parsing
- **MathJax 3**: LaTeX mathematical notation rendering
- **CDN delivery**: No local dependencies required

## 📱 Browser Support

Works in all modern browsers supporting:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Modern DOM APIs

Tested on Chrome, Firefox, Safari, and Edge.

## 📄 License

MIT License - feel free to use, modify, and distribute as needed.

---

## 📝 Quick Summary

**Markdown Preview Tool**: A comprehensive web-based markdown editor with real-time preview, MathJax mathematical notation support, extensive template system with 24 categories of examples, URL sharing, and responsive design - perfect for technical writing, documentation, and scientific content creation.