// MathJax configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownOutput = document.getElementById('markdown-output');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const markdownTemplates = document.getElementById('markdown-templates');
    const mathTemplates = document.getElementById('math-templates');
    
    // Default markdown content
    const defaultMarkdown = `# Welcome to Markdown Preview

This is a **live markdown preview** tool with mathematical notation support. Start typing in the left panel to see the rendered output here.

## Features

- Real-time preview
- GitHub-flavored markdown support
- Mathematical notation with MathJax
- Template system
- URL saving/loading
- Responsive design

## Math Examples

Inline math: $E = mc^2$ and $\\pi \\approx 3.14159$

Display math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

$$\\frac{d}{dx}\\left( \\int_{0}^{x} f(u) \\, du\\right) = f(x)$$

## Markdown Examples

### Code Block
\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item

### Table
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|

---

Try the templates above or start editing!`;

    // Load content from URL parameters or use default
    loadFromURL() || (markdownInput.value = defaultMarkdown);
    updatePreview();
    
    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    loadBtn.addEventListener('click', loadFromURL);
    markdownTemplates.addEventListener('change', loadMarkdownTemplate);
    mathTemplates.addEventListener('change', loadMathTemplate);
    
    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        markdownOutput.innerHTML = htmlOutput;
        
        // Re-render MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([markdownOutput]).catch((err) => console.log(err.message));
        }
    }
    
    function clearContent() {
        markdownInput.value = '';
        updatePreview();
    }
    
    function copyContent() {
        markdownInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
    
    function saveToURL() {
        const content = markdownInput.value;
        const encoded = encodeURIComponent(content);
        const url = window.location.origin + window.location.pathname + '?content=' + encoded;
        
        // Copy URL to clipboard
        navigator.clipboard.writeText(url).then(() => {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'URL Copied!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
            }, 2000);
        });
    }
    
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const content = urlParams.get('content');
        if (content) {
            markdownInput.value = decodeURIComponent(content);
            updatePreview();
            return true;
        }
        return false;
    }
    
    // Handle tab key in textarea
    markdownInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Insert tab character
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
            
            // Move cursor
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownOutput = document.getElementById('markdown-output');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
    const loadBtn = document.getElementById('load-btn');
    const markdownTemplates = document.getElementById('markdown-templates');
    const mathTemplates = document.getElementById('math-templates');
    
    // Default markdown content
    const defaultMarkdown = `# Welcome to Markdown Preview

This is a **live markdown preview** tool with mathematical notation support. Start typing in the left panel to see the rendered output here.

## Features

- Real-time preview
- GitHub-flavored markdown support
- Mathematical notation with MathJax
- Template system
- URL saving/loading
- Responsive design

## Math Examples

Inline math: $E = mc^2$ and $\\pi \\approx 3.14159$

Display math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

$$\\frac{d}{dx}\\left( \\int_{0}^{x} f(u) \\, du\\right) = f(x)$$

## Markdown Examples

### Code Block
\`\`\`javascript
function hello() {
    console.log("Hello, World!");
}
\`\`\`

### Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item

### Table
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|

---

Try the templates above or start editing!`;

    // Load content from URL parameters or use default
    loadFromURL() || (markdownInput.value = defaultMarkdown);
    updatePreview();
    
    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    loadBtn.addEventListener('click', loadFromURL);
    markdownTemplates.addEventListener('change', loadMarkdownTemplate);
    mathTemplates.addEventListener('change', loadMathTemplate);
    
    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        markdownOutput.innerHTML = htmlOutput;
        
        // Re-render MathJax
        if (window.MathJax) {
            MathJax.typesetPromise([markdownOutput]).catch((err) => console.log(err.message));
        }
    }
    
    function clearContent() {
        markdownInput.value = '';
        updatePreview();
    }
    
    function copyContent() {
        markdownInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
    
    function saveToURL() {
        const content = markdownInput.value;
        const encoded = encodeURIComponent(content);
        const url = window.location.origin + window.location.pathname + '?content=' + encoded;
        
        // Copy URL to clipboard
        navigator.clipboard.writeText(url).then(() => {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'URL Copied!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
            }, 2000);
        });
    }
    
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const content = urlParams.get('content');
        if (content) {
            markdownInput.value = decodeURIComponent(content);
            updatePreview();
            return true;
        }
        return false;
    }
    
    // Handle tab key in textarea
    markdownInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // Insert tab character
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
            
            // Move cursor
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });
});    
// Template functions
    function loadMarkdownTemplate() {
        const template = markdownTemplates.value;
        if (!template) return;
        
        const templates = {
            basic: `# Document Title

## Introduction

Write your introduction here.

## Main Content

### Section 1

Content for section 1.

### Section 2

Content for section 2.

## Conclusion

Wrap up your document here.`,

            readme: `# Project Name

Brief description of your project.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
const project = require('project-name');
project.doSomething();
\`\`\`

## Features

- Feature 1
- Feature 2
- Feature 3

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License`,

            blog: `# Blog Post Title

*Published on ${new Date().toLocaleDateString()}*

## Introduction

Hook your readers with an engaging introduction.

## Main Points

### Point 1

Explain your first main point here.

### Point 2

Discuss your second main point.

### Point 3

Cover your third main point.

## Conclusion

Summarize your key takeaways.

---

*Tags: #tag1 #tag2 #tag3*`,

            documentation: `# API Documentation

## Overview

Brief overview of the API.

## Authentication

\`\`\`http
Authorization: Bearer YOUR_TOKEN
\`\`\`

## Endpoints

### GET /api/users

Returns a list of users.

**Parameters:**
- \`limit\` (optional): Number of users to return
- \`offset\` (optional): Number of users to skip

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
\`\`\`

### POST /api/users

Creates a new user.

**Request Body:**
\`\`\`json
{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
\`\`\``,

            cheatsheet: `# Markdown Cheatsheet

## Headers
\`\`\`
# H1
## H2
### H3
\`\`\`

## Emphasis
\`\`\`
*italic* or _italic_
**bold** or __bold__
***bold italic***
~~strikethrough~~
\`\`\`

## Lists
\`\`\`
- Unordered list
- Item 2
  - Nested item

1. Ordered list
2. Item 2
   1. Nested item
\`\`\`

## Links & Images
\`\`\`
[Link text](URL)
![Alt text](image-url)
\`\`\`

## Code
\`\`\`
Inline \`code\`

\`\`\`language
Code block
\`\`\`
\`\`\`

## Tables
\`\`\`
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
\`\`\``
        };
        
        markdownInput.value = templates[template];
        updatePreview();
        markdownTemplates.value = '';
    }
    
    function loadMathTemplate() {
        const template = mathTemplates.value;
        if (!template) return;
        
        const templates = {
            'basic-math': `# Basic Math Formulas

## Arithmetic
- Addition: $a + b$
- Subtraction: $a - b$
- Multiplication: $a \\times b$ or $a \\cdot b$
- Division: $\\frac{a}{b}$
- Exponents: $a^n$
- Square root: $\\sqrt{a}$
- Nth root: $\\sqrt[n]{a}$

## Fractions
$$\\frac{numerator}{denominator}$$

## Summation
$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$`,

            algebra: `# Algebra Formulas

## Quadratic Formula
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Binomial Theorem
$$(a + b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k$$

## Logarithms
- $\\log_a(xy) = \\log_a(x) + \\log_a(y)$
- $\\log_a\\left(\\frac{x}{y}\\right) = \\log_a(x) - \\log_a(y)$
- $\\log_a(x^n) = n\\log_a(x)$

## Exponentials
- $a^m \\cdot a^n = a^{m+n}$
- $\\frac{a^m}{a^n} = a^{m-n}$
- $(a^m)^n = a^{mn}$`,

            calculus: `# Calculus Formulas

## Derivatives
$$\\frac{d}{dx}[f(x)] = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

## Common Derivatives
- $\\frac{d}{dx}[x^n] = nx^{n-1}$
- $\\frac{d}{dx}[e^x] = e^x$
- $\\frac{d}{dx}[\\ln(x)] = \\frac{1}{x}$
- $\\frac{d}{dx}[\\sin(x)] = \\cos(x)$
- $\\frac{d}{dx}[\\cos(x)] = -\\sin(x)$

## Integrals
$$\\int f(x) dx = F(x) + C$$

## Fundamental Theorem of Calculus
$$\\int_a^b f(x) dx = F(b) - F(a)$$`,

            statistics: `# Statistics Formulas

## Mean
$$\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i$$

## Variance
$$\\sigma^2 = \\frac{1}{n} \\sum_{i=1}^{n} (x_i - \\bar{x})^2$$

## Standard Deviation
$$\\sigma = \\sqrt{\\sigma^2}$$

## Normal Distribution
$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$

## Binomial Distribution
$$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$$`,

            physics: `# Physics Formulas

## Classical Mechanics
- Force: $F = ma$
- Kinetic Energy: $KE = \\frac{1}{2}mv^2$
- Potential Energy: $PE = mgh$
- Momentum: $p = mv$

## Relativity
- Mass-Energy: $E = mc^2$
- Time Dilation: $\\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - \\frac{v^2}{c^2}}}$

## Electromagnetism
- Coulomb's Law: $F = k\\frac{q_1 q_2}{r^2}$
- Electric Field: $E = \\frac{F}{q}$
- Magnetic Force: $F = q(v \\times B)$

## Quantum Mechanics
- Schrödinger Equation: $i\\hbar\\frac{\\partial}{\\partial t}\\Psi = \\hat{H}\\Psi$
- Uncertainty Principle: $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$`,

            chemistry: `# Chemistry Formulas

## Ideal Gas Law
$$PV = nRT$$

## Concentration
$$C = \\frac{n}{V}$$

## pH
$$pH = -\\log[H^+]$$

## Rate Law
$$\\text{Rate} = k[A]^m[B]^n$$

## Arrhenius Equation
$$k = Ae^{-\\frac{E_a}{RT}}$$

## Equilibrium Constant
$$K_{eq} = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$$

## Thermodynamics
- Gibbs Free Energy: $\\Delta G = \\Delta H - T\\Delta S$
- Enthalpy: $\\Delta H = \\Delta U + \\Delta(PV)$`
        };
        
        const currentContent = markdownInput.value;
        const newContent = currentContent + (currentContent ? '\n\n' : '') + templates[template];
        markdownInput.value = newContent;
        updatePreview();
        mathTemplates.value = '';
    }