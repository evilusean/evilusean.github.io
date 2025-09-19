// MathJax configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: { '[+]': ['ams', 'newcommand', 'configmacros'] }
    },
    options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
    },
    startup: {
        ready: () => {
            MathJax.startup.defaultReady();
            console.log('MathJax is loaded and ready.');
        }
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const markdownInput = document.getElementById('markdown-input');
    const markdownOutput = document.getElementById('markdown-output');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const saveBtn = document.getElementById('save-btn');
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
- URL saving and sharing
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

    // Wait for MathJax to be ready before initial preview
    if (window.MathJax) {
        MathJax.startup.promise.then(() => {
            updatePreview();
        });
    } else {
        // Fallback if MathJax isn't loaded yet
        setTimeout(updatePreview, 1000);
    }

    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    markdownTemplates.addEventListener('change', handleMarkdownDropdown);
    mathTemplates.addEventListener('change', handleMathDropdown);

    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        markdownOutput.innerHTML = htmlOutput;

        // Re-render MathJax with better error handling and delay
        setTimeout(() => {
            if (window.MathJax) {
                if (MathJax.typesetPromise) {
                    MathJax.typesetPromise([markdownOutput]).catch((err) => {
                        console.log('MathJax rendering error:', err.message);
                    });
                } else if (MathJax.Hub) {
                    // Fallback for older MathJax versions
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, markdownOutput]);
                }
            }
        }, 100);
    }

    function clearContent() {
        markdownInput.value = '';
        updatePreview();
    }

    function copyContent() {
        // Copy everything in the markdown input field
        markdownInput.select();
        markdownInput.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            // Visual feedback
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            // Fallback for modern browsers
            navigator.clipboard.writeText(markdownInput.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            });
        }
    }

    function saveToURL() {
        // Save current markdown input content to URL parameters
        const content = markdownInput.value;
        const encoded = encodeURIComponent(content);
        const url = window.location.origin + window.location.pathname + '?content=' + encoded;

        // Update the browser URL without reloading
        window.history.pushState({}, '', url);

        // Copy URL to clipboard
        navigator.clipboard.writeText(url).then(() => {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'URL Saved & Copied!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
            }, 2000);
        }).catch(() => {
            // Fallback if clipboard API fails
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'URL Saved!';
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

    // Handle dropdown selections - show popup with examples
    function handleMarkdownDropdown() {
        const template = markdownTemplates.value;
        if (template) {
            showMarkdownPopup(template);
            markdownTemplates.value = ''; // Reset dropdown
        }
    }

    function handleMathDropdown() {
        const template = mathTemplates.value;
        if (template) {
            showMathPopup(template);
            mathTemplates.value = ''; // Reset dropdown
        }
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
    });

    // Modal functionality
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

    // Close modals when clicking outside or pressing ESC
    window.addEventListener('click', (e) => {
        if (e.target === markdownModal) markdownModal.style.display = 'none';
        if (e.target === mathModal) mathModal.style.display = 'none';
    });

    // Close modals with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (markdownModal.style.display === 'block') {
                markdownModal.style.display = 'none';
            }
            if (mathModal.style.display === 'block') {
                mathModal.style.display = 'none';
            }
        }
    });

    function showMarkdownPopup(selectedTemplate = null) {
        markdownModal.style.display = 'block';
        if (selectedTemplate) {
            modalMarkdownSelect.value = selectedTemplate;
        }
        updateMarkdownModal();
    }

    function showMathPopup(selectedTemplate = null) {
        mathModal.style.display = 'block';
        if (selectedTemplate) {
            modalMathSelect.value = selectedTemplate;
        }
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

        // Re-render MathJax in modal with delay
        setTimeout(() => {
            if (window.MathJax) {
                if (MathJax.typesetPromise) {
                    MathJax.typesetPromise([modalMathPreview]).catch((err) => {
                        console.log('MathJax modal rendering error:', err.message);
                    });
                } else if (MathJax.Hub) {
                    // Fallback for older MathJax versions
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub, modalMathPreview]);
                }
            }
        }, 200);
    }

    function copyModalMarkdown() {
        modalMarkdownCode.select();
        modalMarkdownCode.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
        } catch (err) {
            navigator.clipboard.writeText(modalMarkdownCode.value);
        }

        const originalText = copyMarkdownCode.textContent;
        copyMarkdownCode.textContent = 'Copied!';
        setTimeout(() => {
            copyMarkdownCode.textContent = originalText;
        }, 2000);
    }

    function copyModalMath() {
        modalMathCode.select();
        modalMathCode.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
        } catch (err) {
            navigator.clipboard.writeText(modalMathCode.value);
        }

        const originalText = copyMathCode.textContent;
        copyMathCode.textContent = 'Copied!';
        setTimeout(() => {
            copyMathCode.textContent = originalText;
        }, 2000);
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

            'common-math': `# Common Mathematical Formulas

## Algebra
- Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
- Distance formula: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$
- Slope: $m = \\frac{y_2-y_1}{x_2-x_1}$
- Point-slope form: $y - y_1 = m(x - x_1)$

## Geometry
- Circle area: $A = \\pi r^2$
- Circle circumference: $C = 2\\pi r$
- Sphere volume: $V = \\frac{4}{3}\\pi r^3$
- Sphere surface area: $A = 4\\pi r^2$
- Triangle area: $A = \\frac{1}{2}bh$
- Pythagorean theorem: $a^2 + b^2 = c^2$

## Trigonometry
- Sine rule: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$
- Cosine rule: $c^2 = a^2 + b^2 - 2ab\\cos C$
- Area formula: $A = \\frac{1}{2}ab\\sin C$

## Logarithms & Exponentials
- Change of base: $\\log_a x = \\frac{\\log_b x}{\\log_b a}$
- Product rule: $\\log(xy) = \\log x + \\log y$
- Quotient rule: $\\log\\left(\\frac{x}{y}\\right) = \\log x - \\log y$
- Power rule: $\\log(x^n) = n\\log x$
- Exponential growth: $N(t) = N_0 e^{rt}$

## Sequences & Series
- Arithmetic sequence: $a_n = a_1 + (n-1)d$
- Geometric sequence: $a_n = a_1 r^{n-1}$
- Arithmetic series: $S_n = \\frac{n}{2}(2a_1 + (n-1)d)$
- Geometric series: $S_n = a_1\\frac{1-r^n}{1-r}$
- Infinite geometric series: $S = \\frac{a_1}{1-r}$ (for $|r| < 1$)`,

            'physics-mechanics': `# Physics: Classical Mechanics

## Newton's Laws
- First law: $\\sum F = 0$ (equilibrium)
- Second law: $F = ma = \\frac{dp}{dt}$
- Third law: $F_{12} = -F_{21}$
- Universal gravitation: $F = G\\frac{m_1 m_2}{r^2}$

## Kinematics
- Position: $x = x_0 + v_0 t + \\frac{1}{2}at^2$
- Velocity: $v = v_0 + at$
- Velocity squared: $v^2 = v_0^2 + 2a(x-x_0)$
- Average velocity: $\\bar{v} = \\frac{\\Delta x}{\\Delta t}$

## Energy & Work
- Kinetic energy: $KE = \\frac{1}{2}mv^2$
- Gravitational PE: $PE = mgh$
- Elastic PE: $PE = \\frac{1}{2}kx^2$
- Work-energy theorem: $W = \\Delta KE$
- Power: $P = \\frac{dW}{dt} = F \\cdot v$

## Momentum & Collisions
- Momentum: $p = mv$
- Impulse: $J = \\Delta p = F \\Delta t$
- Conservation: $\\sum p_i = \\sum p_f$
- Elastic collision (1D): $v_1' = \\frac{(m_1-m_2)v_1 + 2m_2v_2}{m_1+m_2}$

## Rotational Motion
- Angular displacement: $\\theta = \\omega_0 t + \\frac{1}{2}\\alpha t^2$
- Angular velocity: $\\omega = \\frac{d\\theta}{dt}$
- Angular acceleration: $\\alpha = \\frac{d\\omega}{dt}$
- Moment of inertia: $I = \\sum m_i r_i^2$
- Torque: $\\tau = I\\alpha = r \\times F$
- Angular momentum: $L = I\\omega$
- Rotational KE: $KE_{rot} = \\frac{1}{2}I\\omega^2$

## Simple Harmonic Motion
- Position: $x(t) = A\\cos(\\omega t + \\phi)$
- Velocity: $v(t) = -A\\omega\\sin(\\omega t + \\phi)$
- Acceleration: $a(t) = -A\\omega^2\\cos(\\omega t + \\phi)$
- Period: $T = \\frac{2\\pi}{\\omega}$
- Spring: $\\omega = \\sqrt{\\frac{k}{m}}$
- Pendulum: $\\omega = \\sqrt{\\frac{g}{L}}$`,

            'physics-thermodynamics': `# Physics: Thermodynamics

## Laws of Thermodynamics
- Zeroth law: Thermal equilibrium is transitive
- First law: $\\Delta U = Q - W$
- Second law: $\\Delta S \\geq 0$ (isolated system)
- Third law: $S \\to 0$ as $T \\to 0$

## Ideal Gas Laws
- Ideal gas law: $PV = nRT = Nk_BT$
- Boyle's law: $PV = \\text{constant}$ (isothermal)
- Charles's law: $\\frac{V}{T} = \\text{constant}$ (isobaric)
- Gay-Lussac's law: $\\frac{P}{T} = \\text{constant}$ (isochoric)

## Kinetic Theory
- Average kinetic energy: $\\langle KE \\rangle = \\frac{3}{2}k_BT$
- RMS speed: $v_{rms} = \\sqrt{\\frac{3k_BT}{m}} = \\sqrt{\\frac{3RT}{M}}$
- Maxwell-Boltzmann distribution: $f(v) = 4\\pi n\\left(\\frac{m}{2\\pi k_BT}\\right)^{3/2}v^2e^{-mv^2/2k_BT}$

## Heat Transfer
- Conduction: $q = -kA\\frac{dT}{dx}$ (Fourier's law)
- Convection: $q = hA(T_s - T_\\infty)$
- Radiation: $q = \\sigma A T^4$ (Stefan-Boltzmann)
- Heat capacity: $C = \\frac{dQ}{dT}$

## Entropy & Free Energy
- Entropy: $dS = \\frac{dQ_{rev}}{T}$
- Gibbs free energy: $G = H - TS$
- Helmholtz free energy: $F = U - TS$
- Maxwell relations: $\\left(\\frac{\\partial T}{\\partial V}\\right)_S = -\\left(\\frac{\\partial P}{\\partial S}\\right)_V$

## Heat Engines & Refrigerators
- Efficiency: $\\eta = \\frac{W}{Q_h} = 1 - \\frac{Q_c}{Q_h}$
- Carnot efficiency: $\\eta_C = 1 - \\frac{T_c}{T_h}$
- Coefficient of performance (heat pump): $COP_{hp} = \\frac{Q_h}{W}$
- Coefficient of performance (refrigerator): $COP_r = \\frac{Q_c}{W}$`,

            'physics-electromagnetism': `# Physics: Electromagnetism

## Electric Fields & Forces
- Coulomb's law: $F = k\\frac{q_1 q_2}{r^2} = \\frac{1}{4\\pi\\epsilon_0}\\frac{q_1 q_2}{r^2}$
- Electric field: $E = \\frac{F}{q} = k\\frac{Q}{r^2}$
- Electric potential: $V = k\\frac{Q}{r}$
- Electric potential energy: $U = qV = k\\frac{q_1 q_2}{r}$

## Gauss's Law
- Gauss's law: $\\oint \\mathbf{E} \\cdot d\\mathbf{A} = \\frac{Q_{enc}}{\\epsilon_0}$
- Point charge: $E = \\frac{Q}{4\\pi\\epsilon_0 r^2}$
- Infinite line: $E = \\frac{\\lambda}{2\\pi\\epsilon_0 r}$
- Infinite plane: $E = \\frac{\\sigma}{2\\epsilon_0}$

## Capacitance & Dielectrics
- Capacitance: $C = \\frac{Q}{V}$
- Parallel plate: $C = \\epsilon_0\\frac{A}{d}$
- Energy stored: $U = \\frac{1}{2}CV^2 = \\frac{1}{2}QV = \\frac{Q^2}{2C}$
- With dielectric: $C = \\kappa C_0$

## Current & Resistance
- Current: $I = \\frac{dQ}{dt}$
- Current density: $\\mathbf{J} = \\frac{I}{A}$
- Ohm's law: $V = IR$
- Resistance: $R = \\rho\\frac{L}{A}$
- Power: $P = IV = I^2R = \\frac{V^2}{R}$

## Magnetic Fields
- Lorentz force: $\\mathbf{F} = q(\\mathbf{v} \\times \\mathbf{B})$
- Biot-Savart law: $d\\mathbf{B} = \\frac{\\mu_0}{4\\pi}\\frac{Id\\mathbf{l} \\times \\mathbf{r}}{r^3}$
- Ampère's law: $\\oint \\mathbf{B} \\cdot d\\mathbf{l} = \\mu_0 I_{enc}$
- Magnetic dipole moment: $\\boldsymbol{\\mu} = I\\mathbf{A}$

## Electromagnetic Induction
- Faraday's law: $\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$
- Lenz's law: Induced current opposes change
- Motional EMF: $\\mathcal{E} = Blv$
- Self-inductance: $L = \\frac{\\Phi_B}{I}$
- Mutual inductance: $M = \\frac{\\Phi_{21}}{I_1}$

## Maxwell's Equations
- Gauss's law: $\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\epsilon_0}$
- Gauss's law (magnetism): $\\nabla \\cdot \\mathbf{B} = 0$
- Faraday's law: $\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$
- Ampère-Maxwell law: $\\nabla \\times \\mathbf{B} = \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}$`,

            'physics-quantum': `# Physics: Quantum & Modern Physics

## Quantum Mechanics Fundamentals
- Schrödinger equation (time-dependent): $i\\hbar\\frac{\\partial\\Psi}{\\partial t} = \\hat{H}\\Psi$
- Schrödinger equation (time-independent): $\\hat{H}\\psi = E\\psi$
- Probability density: $|\\Psi(x,t)|^2$
- Normalization: $\\int_{-\\infty}^{\\infty} |\\Psi(x,t)|^2 dx = 1$

## Uncertainty Principles
- Position-momentum: $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$
- Energy-time: $\\Delta E \\Delta t \\geq \\frac{\\hbar}{2}$
- Angular momentum: $\\Delta L_z \\Delta \\phi \\geq \\frac{\\hbar}{2}$

## Wave-Particle Duality
- de Broglie wavelength: $\\lambda = \\frac{h}{p}$
- Planck's equation: $E = hf = \\hbar\\omega$
- Photoelectric effect: $E_k = hf - \\phi$
- Compton scattering: $\\lambda' - \\lambda = \\frac{h}{m_e c}(1 - \\cos\\theta)$

## Quantum Harmonic Oscillator
- Energy levels: $E_n = \\hbar\\omega\\left(n + \\frac{1}{2}\\right)$
- Wave functions: $\\psi_n(x) = \\left(\\frac{m\\omega}{\\pi\\hbar}\\right)^{1/4}\\frac{1}{\\sqrt{2^n n!}}H_n\\left(\\sqrt{\\frac{m\\omega}{\\hbar}}x\\right)e^{-m\\omega x^2/2\\hbar}$

## Hydrogen Atom
- Energy levels: $E_n = -\\frac{13.6 \\text{ eV}}{n^2}$
- Bohr radius: $a_0 = \\frac{4\\pi\\epsilon_0\\hbar^2}{m_e e^2} = 0.529 \\text{ Å}$
- Rydberg formula: $\\frac{1}{\\lambda} = R_H\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$

## Special Relativity
- Lorentz factor: $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$
- Time dilation: $\\Delta t = \\gamma \\Delta t_0$
- Length contraction: $L = \\frac{L_0}{\\gamma}$
- Mass-energy: $E^2 = (pc)^2 + (m_0 c^2)^2$
- Relativistic momentum: $p = \\gamma m_0 v$

## Nuclear Physics
- Mass-energy equivalence: $E = mc^2$
- Binding energy: $BE = (Zm_H + Nm_n - M)c^2$
- Radioactive decay: $N(t) = N_0 e^{-\\lambda t}$
- Half-life: $t_{1/2} = \\frac{\\ln 2}{\\lambda}$`,

            'chemistry-general': `# Chemistry: General Chemistry

## Atomic Structure
- Atomic number: $Z$ (number of protons)
- Mass number: $A = Z + N$ (protons + neutrons)
- Isotope notation: $^A_Z X$
- Electron configuration: $1s^2 2s^2 2p^6 3s^2...$

## Gas Laws
- Ideal gas law: $PV = nRT$
- Combined gas law: $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$
- Dalton's law: $P_{total} = \\sum P_i$
- Graham's law: $\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}}$
- van der Waals equation: $\\left(P + \\frac{a}{V^2}\\right)(V - b) = RT$

## Solutions & Concentrations
- Molarity: $M = \\frac{n_{solute}}{V_{solution}}$
- Molality: $m = \\frac{n_{solute}}{kg_{solvent}}$
- Mole fraction: $\\chi_A = \\frac{n_A}{n_{total}}$
- Parts per million: $ppm = \\frac{mg_{solute}}{kg_{solution}}$
- Dilution: $M_1V_1 = M_2V_2$

## Acids & Bases
- pH: $pH = -\\log[H^+]$
- pOH: $pOH = -\\log[OH^-]$
- Water constant: $K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$
- Henderson-Hasselbalch: $pH = pK_a + \\log\\frac{[A^-]}{[HA]}$
- Acid dissociation: $K_a = \\frac{[H^+][A^-]}{[HA]}$

## Chemical Equilibrium
- Equilibrium constant: $K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$
- Reaction quotient: $Q_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$
- Le Chatelier's principle: System shifts to counteract stress
- ICE table method for equilibrium calculations

## Thermochemistry
- Enthalpy change: $\\Delta H = H_{products} - H_{reactants}$
- Heat capacity: $q = mc\\Delta T$
- Calorimetry: $q_{system} + q_{surroundings} = 0$
- Hess's law: $\\Delta H_{total} = \\sum \\Delta H_i$`,

            'chemistry-organic': `# Chemistry: Organic Chemistry

## Functional Groups
- Alkane: $R-H$
- Alkene: $R_2C=CR_2$
- Alkyne: $R-C\\equiv C-R$
- Alcohol: $R-OH$
- Ether: $R-O-R'$
- Aldehyde: $R-CHO$
- Ketone: $R-CO-R'$
- Carboxylic acid: $R-COOH$
- Ester: $R-COO-R'$
- Amine: $R-NH_2$, $R_2NH$, $R_3N$

## Nomenclature Rules
- Longest carbon chain determines base name
- Number carbons to give substituents lowest numbers
- Alphabetical order for substituents
- Functional group priority order

## Stereochemistry
- Chirality: Non-superimposable mirror images
- Optical activity: $[\\alpha] = \\frac{\\alpha_{observed}}{c \\cdot l}$
- R/S configuration using Cahn-Ingold-Prelog rules
- E/Z configuration for alkenes

## Reaction Mechanisms
- SN1 mechanism: Two-step, carbocation intermediate
- SN2 mechanism: One-step, backside attack
- E1 mechanism: Two-step elimination
- E2 mechanism: One-step elimination
- Addition reactions: Markovnikov's rule

## Aromatic Chemistry
- Hückel's rule: $4n + 2$ π electrons
- Benzene resonance energy: ~36 kcal/mol
- Electrophilic aromatic substitution
- Activating/deactivating groups
- Ortho/meta/para directing effects

## Spectroscopy
- IR stretching frequencies:
  - O-H: 3200-3600 cm⁻¹
  - C-H: 2850-3000 cm⁻¹
  - C=O: 1650-1750 cm⁻¹
  - C=C: 1620-1680 cm⁻¹
- NMR chemical shifts and coupling patterns`,

            'chemistry-physical': `# Chemistry: Physical Chemistry

## Chemical Kinetics
- Rate law: $\\text{Rate} = k[A]^m[B]^n$
- Integrated rate laws:
  - Zero order: $[A] = [A]_0 - kt$
  - First order: $\\ln[A] = \\ln[A]_0 - kt$
  - Second order: $\\frac{1}{[A]} = \\frac{1}{[A]_0} + kt$
- Half-life formulas:
  - First order: $t_{1/2} = \\frac{\\ln 2}{k}$
  - Second order: $t_{1/2} = \\frac{1}{k[A]_0}$

## Arrhenius Equation
- Temperature dependence: $k = Ae^{-E_a/RT}$
- Logarithmic form: $\\ln k = \\ln A - \\frac{E_a}{RT}$
- Two-temperature form: $\\ln\\frac{k_2}{k_1} = \\frac{E_a}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$

## Thermodynamics
- Gibbs free energy: $\\Delta G = \\Delta H - T\\Delta S$
- Equilibrium constant: $\\Delta G° = -RT\\ln K$
- van 't Hoff equation: $\\frac{d\\ln K}{dT} = \\frac{\\Delta H°}{RT^2}$
- Maxwell relations and thermodynamic potentials

## Electrochemistry
- Nernst equation: $E = E° - \\frac{RT}{nF}\\ln Q$
- At 25°C: $E = E° - \\frac{0.0592}{n}\\log Q$
- Faraday's laws of electrolysis
- Butler-Volmer equation: $i = i_0\\left[e^{\\frac{\\alpha nF\\eta}{RT}} - e^{-\\frac{(1-\\alpha)nF\\eta}{RT}}\\right]$

## Quantum Chemistry
- Schrödinger equation for atoms and molecules
- Molecular orbital theory
- Hückel method for π systems
- Density functional theory (DFT)

## Statistical Mechanics
- Boltzmann distribution: $N_i = N\\frac{g_i e^{-E_i/k_BT}}{Z}$
- Partition function: $Z = \\sum_i g_i e^{-E_i/k_BT}$
- Maxwell-Boltzmann speed distribution
- Relationship between microscopic and macroscopic properties`,

            'engineering-mechanical': `# Engineering: Mechanical Engineering

## Statics & Mechanics of Materials
- Equilibrium: $\\sum F = 0$, $\\sum M = 0$
- Stress: $\\sigma = \\frac{F}{A}$
- Strain: $\\epsilon = \\frac{\\Delta L}{L_0}$
- Hooke's law: $\\sigma = E\\epsilon$
- Shear stress: $\\tau = \\frac{V}{A}$
- Bending stress: $\\sigma = \\frac{My}{I}$
- Torsional stress: $\\tau = \\frac{Tr}{J}$

## Dynamics & Vibrations
- Newton's second law: $F = ma$
- Moment equation: $\\sum M = I\\alpha$
- Natural frequency: $\\omega_n = \\sqrt{\\frac{k}{m}}$
- Damped frequency: $\\omega_d = \\omega_n\\sqrt{1-\\zeta^2}$
- Transmissibility: $TR = \\frac{1}{\\sqrt{(1-r^2)^2 + (2\\zeta r)^2}}$

## Fluid Mechanics
- Continuity equation: $\\rho_1 A_1 V_1 = \\rho_2 A_2 V_2$
- Bernoulli's equation: $\\frac{P_1}{\\rho} + \\frac{V_1^2}{2} + gz_1 = \\frac{P_2}{\\rho} + \\frac{V_2^2}{2} + gz_2$
- Reynolds number: $Re = \\frac{\\rho VD}{\\mu}$
- Darcy-Weisbach equation: $h_f = f\\frac{L}{D}\\frac{V^2}{2g}$
- Drag force: $F_D = \\frac{1}{2}\\rho V^2 C_D A$

## Heat Transfer
- Fourier's law: $q = -kA\\frac{dT}{dx}$
- Newton's law of cooling: $q = hA(T_s - T_\\infty)$
- Stefan-Boltzmann law: $q = \\sigma A T^4$
- Overall heat transfer: $\\frac{1}{U} = \\frac{1}{h_1} + \\frac{t}{k} + \\frac{1}{h_2}$
- Fin efficiency: $\\eta_f = \\frac{\\tanh(mL)}{mL}$ where $m = \\sqrt{\\frac{hP}{kA}}$

## Thermodynamics
- First law: $\\Delta U = Q - W$
- Efficiency: $\\eta = \\frac{W_{net}}{Q_{in}}$
- Carnot efficiency: $\\eta_C = 1 - \\frac{T_L}{T_H}$
- Isentropic process: $PV^\\gamma = \\text{constant}$
- Polytropic process: $PV^n = \\text{constant}$

## Machine Design
- Factor of safety: $FS = \\frac{\\sigma_{ultimate}}{\\sigma_{working}}$
- Fatigue life (S-N curve): $\\sigma^m N = C$
- Goodman relation: $\\frac{\\sigma_a}{S_e} + \\frac{\\sigma_m}{S_{ut}} = \\frac{1}{n}$
- Bearing life: $L_{10} = \\left(\\frac{C}{P}\\right)^p$ (p=3 for ball, p=10/3 for roller)`,

            'engineering-electrical': `# Engineering: Electrical Engineering

## Circuit Analysis
- Ohm's law: $V = IR$
- Kirchhoff's current law: $\\sum I_{in} = \\sum I_{out}$
- Kirchhoff's voltage law: $\\sum V = 0$
- Power: $P = VI = I^2R = \\frac{V^2}{R}$
- Voltage divider: $V_{out} = V_{in}\\frac{R_2}{R_1 + R_2}$
- Current divider: $I_1 = I_{total}\\frac{R_2}{R_1 + R_2}$

## AC Circuit Analysis
- Impedance: $Z = R + jX = |Z|e^{j\\phi}$
- Capacitive reactance: $X_C = \\frac{1}{\\omega C}$
- Inductive reactance: $X_L = \\omega L$
- RMS values: $V_{rms} = \\frac{V_{peak}}{\\sqrt{2}}$
- Complex power: $S = P + jQ = VI^*$
- Power factor: $pf = \\cos\\phi = \\frac{P}{S}$

## Electromagnetic Fields
- Electric field: $\\mathbf{E} = -\\nabla V$
- Magnetic field: $\\mathbf{B} = \\nabla \\times \\mathbf{A}$
- Poynting vector: $\\mathbf{S} = \\frac{1}{\\mu_0}\\mathbf{E} \\times \\mathbf{B}$
- Wave equation: $\\nabla^2 \\mathbf{E} = \\mu_0\\epsilon_0\\frac{\\partial^2 \\mathbf{E}}{\\partial t^2}$
- Characteristic impedance: $Z_0 = \\sqrt{\\frac{\\mu_0}{\\epsilon_0}} = 377\\,\\Omega$

## Digital Signal Processing
- Discrete Fourier Transform: $X[k] = \\sum_{n=0}^{N-1} x[n]e^{-j2\\pi kn/N}$
- Z-transform: $X(z) = \\sum_{n=-\\infty}^{\\infty} x[n]z^{-n}$
- Sampling theorem: $f_s > 2f_{max}$ (Nyquist criterion)
- Digital filter transfer function: $H(z) = \\frac{Y(z)}{X(z)}$

## Control Systems
- Transfer function: $G(s) = \\frac{Y(s)}{X(s)}$
- Closed-loop transfer function: $T(s) = \\frac{G(s)}{1 + G(s)H(s)}$
- Characteristic equation: $1 + G(s)H(s) = 0$
- PID controller: $G_c(s) = K_p + \\frac{K_i}{s} + K_d s$
- Routh-Hurwitz stability criterion
- Bode plot: $|G(j\\omega)|_{dB} = 20\\log_{10}|G(j\\omega)|$

## Power Systems
- Three-phase power: $P = \\sqrt{3}V_LI_L\\cos\\phi$
- Per-unit system: $pu = \\frac{\\text{actual value}}{\\text{base value}}$
- Transformer equation: $\\frac{V_1}{V_2} = \\frac{N_1}{N_2} = \\frac{I_2}{I_1}$
- Transmission line equations: $\\gamma = \\sqrt{ZY}$, $Z_0 = \\sqrt{\\frac{Z}{Y}}$`,

            'engineering-civil': `# Engineering: Civil Engineering

## Structural Analysis
- Moment equilibrium: $\\sum M = 0$
- Force equilibrium: $\\sum F_x = 0$, $\\sum F_y = 0$
- Bending moment: $M = \\int V \\, dx$
- Shear force: $V = \\frac{dM}{dx}$
- Deflection (Euler-Bernoulli): $EI\\frac{d^4y}{dx^4} = q(x)$
- Critical buckling load: $P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}$

## Concrete Design
- Compressive strength: $f'_c$ (28-day strength)
- Modulus of elasticity: $E_c = 4700\\sqrt{f'_c}$ (psi)
- Flexural strength: $f_r = 7.5\\sqrt{f'_c}$ (ACI)
- Reinforcement ratio: $\\rho = \\frac{A_s}{bd}$
- Balanced reinforcement: $\\rho_b = 0.85\\beta_1\\frac{f'_c}{f_y}\\frac{600}{600 + f_y}$
- Moment capacity: $M_n = A_s f_y \\left(d - \\frac{a}{2}\\right)$

## Steel Design
- Yield strength: $F_y$
- Ultimate strength: $F_u$
- Slenderness ratio: $\\frac{KL}{r}$
- Euler buckling: $F_e = \\frac{\\pi^2 E}{(KL/r)^2}$
- AISC interaction equation: $\\frac{P_r}{P_c} + \\frac{8}{9}\\frac{M_r}{M_c} \\leq 1.0$

## Geotechnical Engineering
- Effective stress: $\\sigma' = \\sigma - u$
- Terzaghi bearing capacity: $q_{ult} = cN_c + qN_q + \\frac{1}{2}\\gamma BN_\\gamma$
- Consolidation settlement: $S = \\frac{C_c H}{1 + e_0}\\log\\frac{\\sigma'_0 + \\Delta\\sigma}{\\sigma'_0}$
- Mohr-Coulomb failure: $\\tau = c + \\sigma'\\tan\\phi$
- Coefficient of permeability: $k = \\frac{vL}{h}$ (Darcy's law)

## Hydraulics & Hydrology
- Manning's equation: $V = \\frac{1}{n}R^{2/3}S^{1/2}$
- Hazen-Williams: $V = 1.318C R^{0.63}S^{0.54}$
- Rational method: $Q = CiA$
- Time of concentration: $t_c = t_{inlet} + t_{travel}$
- Hydraulic radius: $R = \\frac{A}{P}$
- Froude number: $Fr = \\frac{V}{\\sqrt{gD}}$

## Transportation Engineering
- Stopping sight distance: $SSD = 1.47Vt + \\frac{V^2}{30(f \\pm G)}$
- Horizontal curve radius: $R = \\frac{V^2}{15(e + f)}$
- Vertical curve length: $L = \\frac{AV^2}{100\\sqrt{2h_1} + \\sqrt{2h_2}}^2$
- Traffic flow: $q = kv$ (flow = density × speed)
- Level of service based on volume/capacity ratio`
        };

        return templates[template] || '';
    }
});