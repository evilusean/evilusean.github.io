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
- Template system with popups
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

Select from the dropdowns above to see examples and copy code!`;

    // Load content from URL parameters or use default
    loadFromURL() || (markdownInput.value = defaultMarkdown);
    updatePreview();
    
    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    loadBtn.addEventListener('click', loadFromURL);
    markdownTemplates.addEventListener('change', handleMarkdownDropdown);
    lothTemplates.addEventListener('change', handleMathDropdown);
    
    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        markdownOutput.innerHTML = htmlOutput;
        
        // Re-render MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typinnerHTMise([markdownOutput]).catch((err) => console.log(err.message));
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
        copyBtn.texecCommand('copy');

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
    markdownInput.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;

            // Insert tab character
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);

            // Move cursor
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });    // M
Modal functionality
    const markdownModal = document.getElementById('markdown-modal');
    const mathModal = document.getElementById('math-modal');
    const closeMarkdown = document.getElementById('close-markdown');
    const closeMath = document.getElementById('close-math');
    const modalMarkdownSelect = document.getElementById('modal-markdown-select');
    const modalMathSelect = document.getElementById('modal-math-select');
    const modalMarkdownCode = document.getElementById('modal-markdown-code');
    const modalMathCode = document.getElementById('modal-math-code');
    const modalMarkdownPreview = document.getElementById('modal-markdown-preview');
    const modalMathPreview = document.getElementById('modal-math-preview');
    const copyMarkdownCode = document.getElementById('copy-markdown-code');
    const copyMathCode = document.getElementById('copy-math-code');

    // Modal event listeners
    closeMarkdown.addEventListener('click', () => markdownModal.style.display = 'none');
    closeMath.addEventListener('click', () => mathModal.style.display = 'none');
    modalMarkdownSelect.addEventListener('change', updateMarkdownModal);
    modalMathSelect.addEventListener('change', updateMathModal);
    copyMarkdownCode.addEventListener('click', copyModalMarkdown);
    copyMathCode.addEventListener('click', copyModalMath);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === markdownModal) markdownModal.style.display = 'none';
        if (e.target === mathModal) mathModal.style.display = 'none';
    });

    function showMarkdownPopup() {
        markdownModal.style.display = 'block';
        updateMarkdownModal();
    }

    function showMathPopup() {
        mathModal.style.display = 'block';
        updateMathModal();
    }

    function updateMarkdownModal() {
        const template = modalMarkdownSelect.value;
        const content = getMarkdownTemplate(template);
        modalMarkdownCode.value = content;
        modalMarkdownPreview.innerHTML = marked.parse(content);
    }

    function updateMathModal() {
        const template = modalMathSelect.value;
        const content = getMathTemplate(template);
        modalMathCode.value = content;
        modalMathPreview.innerHTML = marked.parse(content);

        // Re-render MathJax in modal
        if (window.MathJax && window.MathJax.typesetPromise) {
            MathJax.typesetPromise([modalMathPreview]).catch((err) => console.log(err.message));
        }
    }

    function copyModalMarkdown() {
        modalMarkdownCode.select();
        document.execCommand('copy');

        const originalText = copyMarkdownCode.textContent;
        copyMarkdownCode.textContent = 'Copied!';
        setTimeout(() => {
            copyMarkdownCode.textContent = originalText;
        }, 2000);
    }

    function copyModalMath() {
        modalMathCode.select();
        document.execCommand('copy');

        const originalText = copyMathCode.textContent;
        copyMathCode.textContent = 'Copied!';
        setTimeout(() => {
            copyMathCode.textContent = originalText;
        }, 2000);
    }

    // Template functions for dropdowns (original functionality)
    function loadMarkdownTemplate() {
        const template = markdownTemplates.value;
        if (!template) return;

        const content = getMarkdownTemplate(template);
        markdownInput.value = content;
        updatePreview();
        markdownTemplates.value = '';
    }

    function loadMathTemplate() {
        const template = mathTemplates.value;
        if (!template) return;

        const content = getMathTemplate(template);
        const currentContent = markdownInput.value;
        const newContent = currentContent + (currentContent ? '\n\n' : '') + content;
        markdownInput.value = newContent;
        updatePreview();
        mathTemplates.value = '';
    }

    // Comprehensive markdown templates
    function getMarkdownTemplate(template) {
        const templates = {
            headers: `# Header 1 (H1)
## Header 2 (H2)
### Header 3 (H3)
#### Header 4 (H4)
##### Header 5 (H5)
###### Header 6 (H6)

Alternative H1
=============

Alternative H2
-------------`,

            emphasis: `*Italic text* or _italic text_

**Bold text** or __bold text__

***Bold and italic*** or ___bold and italic___

~~Strikethrough text~~

==Highlighted text== (if supported)

<u>Underlined text</u>

<mark>Marked text</mark>

<sub>Subscript</sub> and <sup>Superscript</sup>`,

            lists: `## Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
    - Deeply nested item
- Item 3

* Alternative bullet
+ Another alternative

## Ordered Lists
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

## Task Lists (Checkboxes)
- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
- [ ] Another incomplete task`,

            links: `## Links
[Link text](https://example.com)
[Link with title](https://example.com "Title text")
<https://example.com>
[Reference link][1]

## Images
![Alt text](https://via.placeholder.com/300x200)
![Image with title](https://via.placeholder.com/300x200 "Image title")

## Reference Links
[1]: https://example.com "Reference link title"

## Internal Links
[Link to header](#header-1-h1)

## Email Links
<email@example.com>
[Email me](mailto:email@example.com)`,

            code: `## Inline Code
Use \`backticks\` for inline code.

## Code Blocks
\`\`\`
Plain code block
\`\`\`

\`\`\`javascript
// JavaScript code with syntax highlighting
function hello(name) {
    console.log(\`Hello, \${name}!\`);
}
\`\`\`

\`\`\`python
# Python code
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

\`\`\`html
<!-- HTML code -->
<div class="container">
    <h1>Hello World</h1>
</div>
\`\`\`

\`\`\`css
/* CSS code */
.container {
    max-width: 1200px;
    margin: 0 auto;
}
\`\`\``,

            tables: `## Basic Table
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data     | More data|
| Row 2    | Data     | More data|

## Aligned Table
| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|--------------:|
| Left         | Center         | Right         |
| Text         | Text           | Text          |

## Table with Different Content
| Name | Age | City | Occupation |
|------|-----|------|------------|
| John | 25  | NYC  | Developer  |
| Jane | 30  | LA   | Designer   |
| Bob  | 35  | Chicago | Manager |`,

            blockquotes: `## Simple Blockquote
> This is a blockquote.
> It can span multiple lines.

## Nested Blockquotes
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.

## Blockquote with Other Elements
> ## Header in blockquote
> 
> - List item in blockquote
> - Another item
> 
> *Emphasis* and **bold** work too.

## Multi-paragraph Blockquote
> First paragraph in blockquote.
>
> Second paragraph in blockquote.`,

            'horizontal-rules': `Content above the rule.

---

Content between rules.

***

More content.

___

Final content below.

You can also use:
- Three or more hyphens: ---
- Three or more asterisks: ***
- Three or more underscores: ___`,

            html: `## HTML Elements in Markdown

<div align="center">
  <h3>Centered HTML Header</h3>
</div>

<details>
<summary>Click to expand</summary>

This content is hidden by default and can be expanded.

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> for keyboard shortcuts

<abbr title="HyperText Markup Language">HTML</abbr>

<dl>
  <dt>Definition Term</dt>
  <dd>Definition description</dd>
</dl>

<!-- HTML comments are hidden -->

<span style="color: red;">Red text</span>

<div class="custom-class">
  Custom div with class
</div>`,

            advanced: `## Footnotes
Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Definition Lists
Term 1
:   Definition 1

Term 2
:   Definition 2a
:   Definition 2b

## Escape Characters
\\*Not italic\\* \\**Not bold\\**
\\# Not a header
\\[Not a link\\](not-a-url)

## Line Breaks
Line 1  
Line 2 (two spaces at end of line 1)

Line 3

Line 4 (blank line creates paragraph break)

## Math (if MathJax enabled)
Inline math: $E = mc^2$

Block math:
$$\\sum_{i=1}^{n} x_i = x_1 + x_2 + \\cdots + x_n$$`,

            'complete-example': `# Complete Markdown Example

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Code Examples](#code-examples)
4. [Data Tables](#data-tables)
5. [Conclusion](#conclusion)

## Introduction

This document demonstrates **all major Markdown features** in a single example. It includes *various formatting options*, links, images, and more.

> **Note**: This is a comprehensive example showing the full power of Markdown.

## Features

### Text Formatting
- **Bold text** and *italic text*
- ~~Strikethrough~~ and \`inline code\`
- <u>Underlined</u> and <mark>highlighted</mark> text

### Lists and Tasks
1. Ordered list item
2. Another ordered item
   - Nested unordered item
   - Another nested item

**Task List:**
- [x] Completed task
- [ ] Pending task
- [x] Another completed task

## Code Examples

### JavaScript
\`\`\`javascript
function calculateSum(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(\`Sum: \${result}\`);
\`\`\`

### Python
\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 Fibonacci numbers
fib_sequence = [fibonacci(i) for i in range(10)]
print(fib_sequence)
\`\`\`

## Data Tables

| Language | Popularity | Use Case |
|----------|:----------:|----------|
| JavaScript | ⭐⭐⭐⭐⭐ | Web Development |
| Python | ⭐⭐⭐⭐⭐ | Data Science |
| Java | ⭐⭐⭐⭐ | Enterprise Apps |
| Go | ⭐⭐⭐ | System Programming |

## Links and References

- [Official Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)
- Email: [contact@example.com](mailto:contact@example.com)

## Images

![Placeholder Image](https://via.placeholder.com/400x200/3498db/ffffff?text=Markdown+Example)

---

## Conclusion

This example showcases the versatility and power of Markdown for creating well-formatted documents. From simple text formatting to complex tables and code blocks, Markdown provides a clean and readable syntax for content creation.

### Key Benefits:
1. **Simplicity**: Easy to learn and write
2. **Portability**: Works across different platforms
3. **Readability**: Clean syntax that's human-readable
4. **Flexibility**: Supports HTML when needed

*Happy writing with Markdown!* 🚀`
        };

        return templates[template] || '';
    }

    // Comprehensive math templates
    function getMathTemplate(template) {
        const templates = {
            'basic-operations': `# Basic Mathematical Operations

## Arithmetic Operations
- Addition: $a + b$
- Subtraction: $a - b$  
- Multiplication: $a \\times b$ or $a \\cdot b$
- Division: $a \\div b$ or $\\frac{a}{b}$

## Powers and Roots
- Square: $a^2$
- Cube: $a^3$
- General power: $a^n$
- Square root: $\\sqrt{a}$
- Cube root: $\\sqrt[3]{a}$
- nth root: $\\sqrt[n]{a}$

## Examples
$$2 + 3 = 5$$
$$10 - 4 = 6$$
$$7 \\times 8 = 56$$
$$\\frac{15}{3} = 5$$`,

            fractions: `# Fractions in LaTeX

## Basic Fractions
- Simple fraction: $\\frac{a}{b}$
- Fraction with numbers: $\\frac{3}{4}$
- Complex fraction: $\\frac{x + y}{x - y}$

## Nested Fractions
$$\\frac{1}{1 + \\frac{1}{2 + \\frac{1}{3}}}$$

## Large Fractions (Display Mode)
$$\\frac{\\sum_{i=1}^{n} x_i}{n}$$

## Binomial Coefficients
- Choose notation: $\\binom{n}{k}$
- Alternative: $C(n,k) = \\frac{n!}{k!(n-k)!}$

## Examples
$$\\frac{22}{7} \\approx \\pi$$
$$\\frac{d}{dx}\\left(\\frac{f(x)}{g(x)}\\right) = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}$$`,

            exponents: `# Exponents and Roots

## Basic Exponents
- Square: $x^2$
- Cube: $x^3$
- General: $x^n$
- Negative: $x^{-1} = \\frac{1}{x}$
- Fractional: $x^{1/2} = \\sqrt{x}$

## Complex Exponents
- Multiple terms: $x^{a + b}$
- Nested: $x^{y^z}$
- With parentheses: $(x + y)^n$

## Roots
- Square root: $\\sqrt{x}$
- Cube root: $\\sqrt[3]{x}$
- nth root: $\\sqrt[n]{x}$
- Nested roots: $\\sqrt{\\sqrt{x}}$

## Exponential Functions
- Natural exponential: $e^x$
- Base 10: $10^x$
- General base: $a^x$

## Examples
$$e^{i\\pi} + 1 = 0$$
$$\\sqrt{x^2 + y^2}$$
$$x^{\\frac{m}{n}} = \\sqrt[n]{x^m}$$`,

            subscripts: `# Subscripts and Superscripts

## Subscripts
- Basic: $x_1, x_2, x_3$
- Multiple characters: $x_{max}$
- With expressions: $x_{i+1}$

## Superscripts  
- Basic: $x^1, x^2, x^3$
- Multiple characters: $x^{max}$
- With expressions: $x^{i+1}$

## Combined
- Both: $x_1^2$
- Complex: $x_{i,j}^{(k)}$
- Nested: $x_{y_i}^{z^j}$

## Common Uses
- Sequences: $a_1, a_2, \\ldots, a_n$
- Matrices: $A_{ij}$ or $a_{i,j}$
- Derivatives: $f'(x) = f^{(1)}(x)$
- Powers: $x^n, x^{-1}, x^{1/2}$

## Examples
$$\\sum_{i=1}^{n} x_i^2$$
$$\\lim_{x \\to \\infty} \\frac{1}{x^2}$$
$$A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}$$`,

            'greek-letters': `# Greek Letters

## Lowercase Greek Letters
- Alpha: $\\alpha$
- Beta: $\\beta$  
- Gamma: $\\gamma$
- Delta: $\\delta$
- Epsilon: $\\epsilon$ or $\\varepsilon$
- Zeta: $\\zeta$
- Eta: $\\eta$
- Theta: $\\theta$ or $\\vartheta$
- Iota: $\\iota$
- Kappa: $\\kappa$
- Lambda: $\\lambda$
- Mu: $\\mu$
- Nu: $\\nu$
- Xi: $\\xi$
- Pi: $\\pi$ or $\\varpi$
- Rho: $\\rho$ or $\\varrho$
- Sigma: $\\sigma$ or $\\varsigma$
- Tau: $\\tau$
- Upsilon: $\\upsilon$
- Phi: $\\phi$ or $\\varphi$
- Chi: $\\chi$
- Psi: $\\psi$
- Omega: $\\omega$

## Uppercase Greek Letters
- Gamma: $\\Gamma$
- Delta: $\\Delta$
- Theta: $\\Theta$
- Lambda: $\\Lambda$
- Xi: $\\Xi$
- Pi: $\\Pi$
- Sigma: $\\Sigma$
- Upsilon: $\\Upsilon$
- Phi: $\\Phi$
- Psi: $\\Psi$
- Omega: $\\Omega$

## Common Usage Examples
$$\\alpha + \\beta = \\gamma$$
$$\\Delta x = x_2 - x_1$$
$$\\sum_{i=1}^{n} \\alpha_i = \\Sigma$$
$$\\pi r^2 = \\text{area of circle}$$`,

            operators: `# Mathematical Operators

## Basic Operators
- Plus: $+$
- Minus: $-$
- Times: $\\times$ or $\\cdot$
- Division: $\\div$ or $/$
- Plus-minus: $\\pm$
- Minus-plus: $\\mp$

## Comparison Operators
- Equal: $=$
- Not equal: $\\neq$ or $\\ne$
- Less than: $<$
- Greater than: $>$
- Less or equal: $\\leq$ or $\\le$
- Greater or equal: $\\geq$ or $\\ge$
- Much less: $\\ll$
- Much greater: $\\gg$
- Approximately: $\\approx$
- Proportional: $\\propto$
- Similar: $\\sim$
- Congruent: $\\cong$

## Set Operators
- Element of: $\\in$
- Not element of: $\\notin$
- Subset: $\\subset$
- Superset: $\\supset$
- Subset or equal: $\\subseteq$
- Superset or equal: $\\supseteq$
- Union: $\\cup$
- Intersection: $\\cap$
- Empty set: $\\emptyset$ or $\\varnothing$

## Logic Operators
- And: $\\land$ or $\\wedge$
- Or: $\\lor$ or $\\vee$
- Not: $\\neg$ or $\\lnot$
- Implies: $\\Rightarrow$
- If and only if: $\\Leftrightarrow$
- Therefore: $\\therefore$
- Because: $\\because$

## Examples
$$x \\in \\mathbb{R} \\land x > 0 \\Rightarrow x^2 > 0$$
$$A \\cup B = \\{x : x \\in A \\lor x \\in B\\}$$`,

            functions: `# Functions and Trigonometry

## Basic Functions
- Sine: $\\sin(x)$
- Cosine: $\\cos(x)$
- Tangent: $\\tan(x)$
- Cotangent: $\\cot(x)$
- Secant: $\\sec(x)$
- Cosecant: $\\csc(x)$

## Inverse Trigonometric Functions
- Arcsine: $\\arcsin(x)$ or $\\sin^{-1}(x)$
- Arccosine: $\\arccos(x)$ or $\\cos^{-1}(x)$
- Arctangent: $\\arctan(x)$ or $\\tan^{-1}(x)$

## Hyperbolic Functions
- Hyperbolic sine: $\\sinh(x)$
- Hyperbolic cosine: $\\cosh(x)$
- Hyperbolic tangent: $\\tanh(x)$

## Logarithmic Functions
- Natural log: $\\ln(x)$
- Common log: $\\log(x)$ or $\\log_{10}(x)$
- General log: $\\log_a(x)$

## Other Functions
- Exponential: $\\exp(x) = e^x$
- Absolute value: $|x|$ or $\\lvert x \\rvert$
- Floor: $\\lfloor x \\rfloor$
- Ceiling: $\\lceil x \\rceil$
- Maximum: $\\max(a, b)$
- Minimum: $\\min(a, b)$

## Examples
$$\\sin^2(x) + \\cos^2(x) = 1$$
$$e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)$$
$$\\log_a(xy) = \\log_a(x) + \\log_a(y)$$`,

            'calculus-symbols': `# Calculus Symbols

## Derivatives
- First derivative: $f'(x)$ or $\\frac{df}{dx}$
- Second derivative: $f''(x)$ or $\\frac{d^2f}{dx^2}$
- nth derivative: $f^{(n)}(x)$ or $\\frac{d^nf}{dx^n}$
- Partial derivative: $\\frac{\\partial f}{\\partial x}$
- Mixed partial: $\\frac{\\partial^2 f}{\\partial x \\partial y}$

## Integrals
- Indefinite integral: $\\int f(x) \\, dx$
- Definite integral: $\\int_a^b f(x) \\, dx$
- Multiple integral: $\\iint f(x,y) \\, dx \\, dy$
- Triple integral: $\\iiint f(x,y,z) \\, dx \\, dy \\, dz$
- Contour integral: $\\oint f(z) \\, dz$

## Limits
- Basic limit: $\\lim_{x \\to a} f(x)$
- Limit at infinity: $\\lim_{x \\to \\infty} f(x)$
- One-sided limits: $\\lim_{x \\to a^+} f(x)$, $\\lim_{x \\to a^-} f(x)$

## Series and Sums
- Summation: $\\sum_{i=1}^{n} a_i$
- Infinite sum: $\\sum_{i=1}^{\\infty} a_i$
- Product: $\\prod_{i=1}^{n} a_i$

## Vector Calculus
- Gradient: $\\nabla f$ or $\\text{grad } f$
- Divergence: $\\nabla \\cdot \\mathbf{F}$ or $\\text{div } \\mathbf{F}$
- Curl: $\\nabla \\times \\mathbf{F}$ or $\\text{curl } \\mathbf{F}$
- Laplacian: $\\nabla^2 f$ or $\\Delta f$

## Examples
$$\\frac{d}{dx}[x^n] = nx^{n-1}$$
$$\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
$$\\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right)^n = e$$`,

            matrices: `# Matrices and Vectors

## Basic Matrix Notation
$$A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$

$$B = \\begin{bmatrix} 1 & 2 & 3 \\\\ 4 & 5 & 6 \\end{bmatrix}$$

## Different Bracket Types
- Parentheses: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
- Square brackets: $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$
- Curly braces: $\\begin{Bmatrix} a & b \\\\ c & d \\end{Bmatrix}$
- Vertical bars: $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$
- Double bars: $\\begin{Vmatrix} a & b \\\\ c & d \\end{Vmatrix}$

## Vectors
- Column vector: $\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}$
- Row vector: $\\begin{pmatrix} x & y & z \\end{pmatrix}$
- Bold notation: $\\mathbf{v} = \\begin{pmatrix} v_1 \\\\ v_2 \\\\ v_3 \\end{pmatrix}$

## Matrix Operations
- Transpose: $A^T$ or $A^{\\top}$
- Inverse: $A^{-1}$
- Determinant: $\\det(A)$ or $|A|$
- Trace: $\\text{tr}(A)$

## Special Matrices
- Identity matrix: $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$
- Zero matrix: $O = \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix}$

## Examples
$$\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$$

$$\\mathbf{A}\\mathbf{x} = \\mathbf{b}$$`,

            sets: `# Sets and Logic

## Set Notation
- Set: $\\{1, 2, 3, 4, 5\\}$
- Empty set: $\\emptyset$ or $\\varnothing$
- Set builder: $\\{x \\mid x > 0\\}$ or $\\{x : x > 0\\}$

## Set Operations
- Union: $A \\cup B$
- Intersection: $A \\cap B$
- Difference: $A \\setminus B$ or $A - B$
- Complement: $A^c$ or $\\overline{A}$
- Symmetric difference: $A \\triangle B$

## Set Relations
- Element of: $x \\in A$
- Not element of: $x \\notin A$
- Subset: $A \\subset B$ or $A \\subseteq B$
- Proper subset: $A \\subsetneq B$
- Superset: $A \\supset B$ or $A \\supseteq B$

## Number Sets
- Natural numbers: $\\mathbb{N}$
- Integers: $\\mathbb{Z}$
- Rational numbers: $\\mathbb{Q}$
- Real numbers: $\\mathbb{R}$
- Complex numbers: $\\mathbb{C}$

## Logic Symbols
- And: $\\land$ or $\\wedge$
- Or: $\\lor$ or $\\vee$
- Not: $\\neg$ or $\\lnot$
- Implies: $\\Rightarrow$
- If and only if: $\\Leftrightarrow$
- For all: $\\forall$
- There exists: $\\exists$
- There exists unique: $\\exists!$

## Examples
$$A \\cup B = \\{x : x \\in A \\lor x \\in B\\}$$
$$\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{R} : y > x$$`,

            'statistics-symbols': `# Statistics Symbols

## Basic Statistics
- Mean: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$
- Median: $\\tilde{x}$ or $\\text{Med}(X)$
- Mode: $\\text{Mode}(X)$
- Variance: $\\sigma^2 = \\text{Var}(X)$
- Standard deviation: $\\sigma = \\sqrt{\\text{Var}(X)}$

## Probability
- Probability: $P(A)$ or $\\Pr(A)$
- Conditional probability: $P(A|B)$
- Expected value: $E[X]$ or $\\mathbb{E}[X]$
- Variance: $\\text{Var}(X) = E[(X - \\mu)^2]$

## Distributions
- Normal distribution: $X \\sim N(\\mu, \\sigma^2)$
- Binomial: $X \\sim \\text{Bin}(n, p)$
- Poisson: $X \\sim \\text{Pois}(\\lambda)$
- Uniform: $X \\sim U(a, b)$

## Greek Letters in Statistics
- Population mean: $\\mu$
- Population variance: $\\sigma^2$
- Population standard deviation: $\\sigma$
- Correlation coefficient: $\\rho$
- Regression coefficients: $\\beta_0, \\beta_1$

## Hypothesis Testing
- Null hypothesis: $H_0$
- Alternative hypothesis: $H_1$ or $H_a$
- Test statistic: $t$, $z$, $\\chi^2$, $F$
- p-value: $p$
- Significance level: $\\alpha$

## Examples
$$Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)$$
$$\\chi^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}$$
$$r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2 \\sum(y_i - \\bar{y})^2}}$$`,

            'physics-formulas': `# Physics Formulas

## Classical Mechanics
- Newton's second law: $F = ma$
- Kinetic energy: $KE = \\frac{1}{2}mv^2$
- Potential energy: $PE = mgh$
- Momentum: $p = mv$
- Work: $W = F \\cdot d = Fd\\cos\\theta$
- Power: $P = \\frac{W}{t} = Fv$

## Rotational Motion
- Angular velocity: $\\omega = \\frac{d\\theta}{dt}$
- Angular acceleration: $\\alpha = \\frac{d\\omega}{dt}$
- Moment of inertia: $I = \\sum m_i r_i^2$
- Torque: $\\tau = I\\alpha = r \\times F$
- Angular momentum: $L = I\\omega$

## Thermodynamics
- First law: $\\Delta U = Q - W$
- Ideal gas law: $PV = nRT$
- Entropy: $dS = \\frac{dQ}{T}$
- Efficiency: $\\eta = 1 - \\frac{T_c}{T_h}$

## Electromagnetism
- Coulomb's law: $F = k\\frac{q_1 q_2}{r^2}$
- Electric field: $E = \\frac{F}{q}$
- Magnetic force: $F = q(\\mathbf{v} \\times \\mathbf{B})$
- Faraday's law: $\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$

## Relativity
- Mass-energy equivalence: $E = mc^2$
- Time dilation: $\\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - v^2/c^2}}$
- Length contraction: $L = L_0\\sqrt{1 - v^2/c^2}$
- Lorentz factor: $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$

## Quantum Mechanics
- Schrödinger equation: $i\\hbar\\frac{\\partial\\Psi}{\\partial t} = \\hat{H}\\Psi$
- Uncertainty principle: $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$
- Energy levels: $E_n = \\frac{n^2\\pi^2\\hbar^2}{2mL^2}$
- de Broglie wavelength: $\\lambda = \\frac{h}{p}$`,

            'chemistry-formulas': `# Chemistry Formulas

## Gas Laws
- Ideal gas law: $PV = nRT$
- Boyle's law: $P_1V_1 = P_2V_2$
- Charles's law: $\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$
- Gay-Lussac's law: $\\frac{P_1}{T_1} = \\frac{P_2}{T_2}$
- Combined gas law: $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$

## Solutions and Concentration
- Molarity: $M = \\frac{n}{V}$
- Molality: $m = \\frac{n}{kg_{solvent}}$
- Mole fraction: $\\chi_A = \\frac{n_A}{n_{total}}$
- Parts per million: $ppm = \\frac{mass_{solute}}{mass_{solution}} \\times 10^6$

## Acids and Bases
- pH: $pH = -\\log[H^+]$
- pOH: $pOH = -\\log[OH^-]$
- Water constant: $K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$
- Henderson-Hasselbalch: $pH = pK_a + \\log\\frac{[A^-]}{[HA]}$

## Chemical Kinetics
- Rate law: $\\text{Rate} = k[A]^m[B]^n$
- Arrhenius equation: $k = Ae^{-E_a/RT}$
- Half-life (first order): $t_{1/2} = \\frac{\\ln 2}{k}$
- Integrated rate law: $\\ln[A] = \\ln[A_0] - kt$

## Thermodynamics
- Gibbs free energy: $\\Delta G = \\Delta H - T\\Delta S$
- Enthalpy: $\\Delta H = \\Delta U + \\Delta(PV)$
- Entropy change: $\\Delta S = \\frac{q_{rev}}{T}$
- Equilibrium constant: $\\Delta G° = -RT\\ln K$

## Equilibrium
- Equilibrium constant: $K_{eq} = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$
- Reaction quotient: $Q = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$
- Le Chatelier's principle: System shifts to counteract changes

## Examples
$$K_a = \\frac{[H^+][A^-]}{[HA]}$$
$$\\Delta G = \\Delta G° + RT\\ln Q$$
$$\\text{Rate} = \\frac{d[P]}{dt} = -\\frac{d[R]}{dt}$$`
        };

        return templates[template] || '';
    }
});