// MathJax configuration is in index.html to avoid conflicts

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

Select from the dropdowns above to see examples and copy code!`;

    // Load content from URL parameters or use default
    loadFromURL() || (markdownInput.value = defaultMarkdown);

    // Initialize preview with delay - wait for MathJax to be ready
    function initializePreview() {
        if (window.MathJax && (MathJax.typesetPromise || MathJax.Hub || MathJax.typeset)) {
            updatePreview();
        } else {
            // MathJax not ready yet, try again
            setTimeout(initializePreview, 500);
        }
    }

    setTimeout(initializePreview, 1000);

    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    markdownTemplates.addEventListener('change', handleMarkdownDropdown);
    mathTemplates.addEventListener('change', handleMathDropdown);

    function updatePreview() {
        try {
            const markdownText = markdownInput.value;
            const htmlOutput = marked.parse(markdownText);
            markdownOutput.innerHTML = htmlOutput;

            // Re-render MathJax with better compatibility
            setTimeout(function () {
                if (window.MathJax) {
                    try {
                        if (MathJax.typesetPromise) {
                            // MathJax v3 - check if it returns a promise
                            var promise = MathJax.typesetPromise([markdownOutput]);
                            if (promise && promise.catch) {
                                promise.catch(function (err) {
                                    console.log('MathJax rendering error:', err.message);
                                });
                            }
                        } else if (MathJax.Hub) {
                            // MathJax v2 fallback
                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, markdownOutput]);
                        } else if (MathJax.typeset) {
                            // Alternative MathJax v3 method
                            MathJax.typeset([markdownOutput]);
                        }
                    } catch (err) {
                        console.log('MathJax error:', err);
                    }
                }
            }, 150);
        } catch (err) {
            console.error('Preview update error:', err);
            markdownOutput.innerHTML = '<p style="color: red;">Error rendering preview</p>';
        }
    }

    function clearContent() {
        markdownInput.value = '';
        updatePreview();
    }

    function copyContent() {
        markdownInput.select();
        markdownInput.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(function () {
                copyBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.log('Copy failed');
        }
    }

    function saveToURL() {
        const content = markdownInput.value;
        if (!content.trim()) {
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Nothing to save!';
            setTimeout(function () {
                saveBtn.textContent = originalText;
            }, 2000);
            return;
        }
        const encoded = encodeURIComponent(content);
        const url = window.location.origin + window.location.pathname + '?content=' + encoded;
        window.history.pushState({}, '', url);

        const originalText = saveBtn.textContent;
        saveBtn.textContent = '✓ URL Saved!';
        setTimeout(function () {
            saveBtn.textContent = originalText;
        }, 3000);
    }
    function loadFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const content = urlParams.get('content');
        if (content) {
            try {
                markdownInput.value = decodeURIComponent(content);
                updatePreview();
                return true;
            } catch (err) {
                console.error('Error loading from URL:', err);
            }
        }
        return false;
    }

    function handleMarkdownDropdown() {
        const template = markdownTemplates.value;
        if (template) {
            showMarkdownPopup(template);
            markdownTemplates.value = '';
        }
    }

    function handleMathDropdown() {
        const template = mathTemplates.value;
        if (template) {
            showMathPopup(template);
            mathTemplates.value = '';
        }
    }

    // Handle tab key in textarea
    markdownInput.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);
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
    if (closeMarkdown) closeMarkdown.addEventListener('click', function () { markdownModal.style.display = 'none'; });
    if (closeMath) closeMath.addEventListener('click', function () { mathModal.style.display = 'none'; });
    if (modalMarkdownSelect) modalMarkdownSelect.addEventListener('change', updateMarkdownModal);
    if (modalMathSelect) modalMathSelect.addEventListener('change', updateMathModal);
    if (copyMarkdownCode) copyMarkdownCode.addEventListener('click', copyModalMarkdown);
    if (copyMathCode) copyMathCode.addEventListener('click', copyModalMath);

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchModal = document.getElementById('search-modal');
    const closeSearch = document.getElementById('close-search');
    const searchResults = document.getElementById('search-results');
    const searchStats = document.getElementById('search-stats');

    // Search event listeners
    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (clearSearchBtn) clearSearchBtn.addEventListener('click', clearSearch);
    if (closeSearch) closeSearch.addEventListener('click', function () { searchModal.style.display = 'none'; });
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        searchInput.addEventListener('input', function () {
            if (this.value.trim()) {
                clearSearchBtn.style.display = 'inline-block';
            } else {
                clearSearchBtn.style.display = 'none';
            }
        });
    }

    // Keyboard shortcut for search (Ctrl+F)
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // Close modals when clicking outside or pressing ESC
    window.addEventListener('click', function (e) {
        if (e.target === markdownModal) markdownModal.style.display = 'none';
        if (e.target === mathModal) mathModal.style.display = 'none';
        if (e.target === searchModal) searchModal.style.display = 'none';
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (markdownModal && markdownModal.style.display === 'block') {
                markdownModal.style.display = 'none';
            }
            if (mathModal && mathModal.style.display === 'block') {
                mathModal.style.display = 'none';
            }
            if (searchModal && searchModal.style.display === 'block') {
                searchModal.style.display = 'none';
            }
        }
    });

    function showMarkdownPopup(selectedTemplate) {
        if (markdownModal) {
            markdownModal.style.display = 'block';
            if (selectedTemplate && modalMarkdownSelect) {
                modalMarkdownSelect.value = selectedTemplate;
            }
            updateMarkdownModal();
        }
    }

    function showMathPopup(selectedTemplate) {
        if (mathModal) {
            mathModal.style.display = 'block';
            if (selectedTemplate && modalMathSelect) {
                modalMathSelect.value = selectedTemplate;
            }
            updateMathModal();
        }
    }

    function updateMarkdownModal() {
        if (!modalMarkdownSelect || !modalMarkdownCode || !modalMarkdownPreview) return;
        const template = modalMarkdownSelect.value;
        const content = getMarkdownTemplate(template);
        modalMarkdownCode.value = content;
        try {
            modalMarkdownPreview.innerHTML = marked.parse(content);
        } catch (err) {
            modalMarkdownPreview.innerHTML = '<p style="color: red;">Error rendering preview</p>';
        }
    }

    function updateMathModal() {
        if (!modalMathSelect || !modalMathCode || !modalMathPreview) return;
        const template = modalMathSelect.value;
        const content = getMathTemplate(template);
        modalMathCode.value = content;
        try {
            modalMathPreview.innerHTML = marked.parse(content);

            // Re-render MathJax in modal with better compatibility
            setTimeout(function () {
                if (window.MathJax) {
                    try {
                        if (MathJax.typesetPromise) {
                            // MathJax v3 - check if it returns a promise
                            var promise = MathJax.typesetPromise([modalMathPreview]);
                            if (promise && promise.catch) {
                                promise.catch(function (err) {
                                    console.log('MathJax modal rendering error:', err.message);
                                });
                            }
                        } else if (MathJax.Hub) {
                            // MathJax v2 fallback
                            MathJax.Hub.Queue(["Typeset", MathJax.Hub, modalMathPreview]);
                        } else if (MathJax.typeset) {
                            // Alternative MathJax v3 method
                            MathJax.typeset([modalMathPreview]);
                        }
                    } catch (err) {
                        console.log('MathJax modal error:', err);
                    }
                }
            }, 300);
        } catch (err) {
            modalMathPreview.innerHTML = '<p style="color: red;">Error rendering preview</p>';
        }
    }

    function copyModalMarkdown() {
        if (!modalMarkdownCode || !copyMarkdownCode) return;
        modalMarkdownCode.select();
        modalMarkdownCode.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Copy failed');
        }
        const originalText = copyMarkdownCode.textContent;
        copyMarkdownCode.textContent = 'Copied!';
        setTimeout(function () {
            copyMarkdownCode.textContent = originalText;
        }, 2000);
    }

    function copyModalMath() {
        if (!modalMathCode || !copyMathCode) return;
        modalMathCode.select();
        modalMathCode.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
        } catch (err) {
            console.log('Copy failed');
        }
        const originalText = copyMathCode.textContent;
        copyMathCode.textContent = 'Copied!';
        setTimeout(function () {
            copyMathCode.textContent = originalText;
        }, 2000);
    }

    // Search functions
    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        const results = searchTemplates(query);
        displaySearchResults(results, query);
        searchModal.style.display = 'block';
    }

    function clearSearch() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        if (searchModal) {
            searchModal.style.display = 'none';
        }
    }

    function searchTemplates(query) {
        const results = [];
        
        // Search through markdown templates
        const markdownTemplates = {
            'headers': 'Headers (H1-H6)',
            'emphasis': 'Text Emphasis',
            'lists': 'Lists & Checkboxes',
            'links': 'Links & Images',
            'code': 'Code & Syntax Highlighting',
            'tables': 'Tables',
            'blockquotes': 'Blockquotes & Callouts',
            'horizontal-rules': 'Horizontal Rules',
            'html': 'HTML in Markdown',
            'advanced': 'Advanced Features',
            'complete-example': 'Complete Example'
        };

        // Search through math templates
        const mathTemplates = {
            'algebra1': 'Algebra 1',
            'algebra2-quadratic-functions': 'Algebra 2: Quadratic Functions',
            'algebra2-polynomials': 'Algebra 2: Polynomials',
            'algebra2-rational-functions': 'Algebra 2: Rational Functions',
            'algebra2-radical-functions': 'Algebra 2: Radical Functions',
            'algebra2-exponential-logarithmic': 'Algebra 2: Exponential & Logarithmic',
            'algebra2-trigonometry': 'Algebra 2: Trigonometry',
            'algebra2-sequences-series': 'Algebra 2: Sequences & Series',
            'algebra2-probability-statistics': 'Algebra 2: Probability & Statistics',
            'algebra2-conic-sections': 'Algebra 2: Conic Sections',
            'algebra2-matrices': 'Algebra 2: Matrices',
            'basic-operations': 'Basic Operations',
            'fractions': 'Fractions',
            'exponents': 'Exponents & Roots',
            'subscripts': 'Subscripts & Superscripts',
            'greek-letters': 'Greek Letters',
            'operators': 'Mathematical Operators',
            'functions': 'Functions & Trigonometry',
            'calculus-symbols': 'Calculus Symbols',
            'matrices': 'Matrices & Vectors',
            'sets': 'Sets & Logic',
            'statistics-symbols': 'Statistics Symbols',
            'common-math': 'Common Math Formulas',
            'physics-mechanics': 'Physics: Mechanics',
            'physics-thermodynamics': 'Physics: Thermodynamics',
            'physics-electromagnetism': 'Physics: Electromagnetism',
            'physics-quantum': 'Physics: Quantum & Modern',
            'chemistry-general': 'Chemistry: General',
            'chemistry-organic': 'Chemistry: Organic',
            'chemistry-physical': 'Chemistry: Physical',
            'engineering-mechanical': 'Engineering: Mechanical',
            'engineering-electrical': 'Engineering: Electrical',
            'engineering-civil': 'Engineering: Civil'
        };

        // Search markdown templates
        for (const [key, title] of Object.entries(markdownTemplates)) {
            const content = getMarkdownTemplate(key);
            if (content && (title.toLowerCase().includes(query) || content.toLowerCase().includes(query))) {
                results.push({
                    type: 'markdown',
                    key: key,
                    title: title,
                    content: content,
                    category: 'Markdown'
                });
            }
        }

        // Search math templates
        for (const [key, title] of Object.entries(mathTemplates)) {
            const content = getMathTemplate(key);
            if (content && (title.toLowerCase().includes(query) || content.toLowerCase().includes(query))) {
                results.push({
                    type: 'math',
                    key: key,
                    title: title,
                    content: content,
                    category: 'Math'
                });
            }
        }

        // Sort results by relevance (title matches first, then content matches)
        results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(query);
            const bTitleMatch = b.title.toLowerCase().includes(query);
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            
            return a.title.localeCompare(b.title);
        });

        return results;
    }

    function displaySearchResults(results, query) {
        if (!searchResults || !searchStats) return;

        // Update stats
        const statsText = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
        searchStats.textContent = statsText;

        // Clear previous results
        searchResults.innerHTML = '';

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <h3>No results found</h3>
                    <p>Try searching for different keywords or check your spelling.</p>
                </div>
            `;
            return;
        }

        // Display results
        results.forEach(result => {
            const preview = getPreviewText(result.content, query);
            const highlightedPreview = highlightSearchTerms(preview, query);
            
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.innerHTML = `
                <div class="search-result-header">
                    <div class="search-result-title">${highlightSearchTerms(result.title, query)}</div>
                    <div class="search-result-category">${result.category}</div>
                </div>
                <div class="search-result-preview">${highlightedPreview}</div>
            `;
            
            resultElement.addEventListener('click', function() {
                if (result.type === 'markdown') {
                    showMarkdownPopup(result.key);
                } else {
                    showMathPopup(result.key);
                }
                searchModal.style.display = 'none';
            });
            
            searchResults.appendChild(resultElement);
        });
    }

    function getPreviewText(content, query) {
        // Remove markdown formatting for preview
        let preview = content
            .replace(/#{1,6}\s+/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
            .replace(/\$\$(.*?)\$\$/g, '[Math Formula]') // Replace display math
            .replace(/\$(.*?)\$/g, '[Math]') // Replace inline math
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim();

        // Find the best matching section
        const queryLower = query.toLowerCase();
        const contentLower = preview.toLowerCase();
        
        const index = contentLower.indexOf(queryLower);
        if (index !== -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(preview.length, index + query.length + 100);
            preview = preview.substring(start, end);
            if (start > 0) preview = '...' + preview;
            if (end < content.length) preview = preview + '...';
        } else {
            // If no direct match, take first 200 characters
            preview = preview.substring(0, 200);
            if (preview.length === 200) preview += '...';
        }

        return preview;
    }

    function highlightSearchTerms(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // Markdown templates function
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

<u>Underlined text</u>

<mark>Marked text</mark>

<sub>Subscript</sub> and <sup>Superscript</sup>`,

            lists: `## Unordered Lists
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

## Ordered Lists
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

## Task Lists (Checkboxes)
- [x] Completed task
- [ ] Incomplete task`,

            links: `## Links
[Link text](https://example.com)
[Link with title](https://example.com "Title text")
<https://example.com>

## Images
![Alt text](https://via.placeholder.com/300x200)
![Image with title](https://via.placeholder.com/300x200 "Image title")

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
function hello(name) {
    console.log(\`Hello, \${name}!\`);
}
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
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
| Text         | Text           | Text          |`,

            blockquotes: `## Simple Blockquote
> This is a blockquote.
> It can span multiple lines.

## Nested Blockquotes
> This is the first level of quoting.
>
> > This is nested blockquote.
>
> Back to the first level.`,

            'horizontal-rules': `Content above the rule.

---

Content between rules.

***

More content.

___

Final content below.`,

            html: `## HTML Elements in Markdown

<div align="center">
  <h3>Centered HTML Header</h3>
</div>

<details>
<summary>Click to expand</summary>
This content is hidden by default.
</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> for keyboard shortcuts`,

            advanced: `## Escape Characters
\\*Not italic\\* \\**Not bold\\**
\\# Not a header

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

## Code Examples

### JavaScript
\`\`\`javascript
function calculateSum(numbers) {
    return numbers.reduce((sum, num) => sum + num, 0);
}

const result = calculateSum([1, 2, 3, 4, 5]);
console.log(\`Sum: \${result}\`);
\`\`\`

## Data Tables

| Language | Popularity | Use Case |
|----------|:----------:|----------|
| JavaScript | ⭐⭐⭐⭐⭐ | Web Development |
| Python | ⭐⭐⭐⭐⭐ | Data Science |
| Java | ⭐⭐⭐⭐ | Enterprise Apps |

## Links and References
- [Official Markdown Guide](https://www.markdownguide.org/)
- [GitHub Flavored Markdown](https://github.github.com/gfm/)

## Images
![Placeholder Image](https://via.placeholder.com/400x200/3498db/ffffff?text=Markdown+Example)

---

## Conclusion
This example showcases the versatility and power of Markdown for creating well-formatted documents.

### Key Benefits:
1. **Simplicity**: Easy to learn and write
2. **Portability**: Works across different platforms
3. **Readability**: Clean syntax that's human-readable
4. **Flexibility**: Supports HTML when needed

*Happy writing with Markdown!* 🚀`
        };
        return templates[template] || '';
    }

    // Math templates function
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
$2 + 3 = 5$
$10 - 4 = 6$
$7 \\times 8 = 56$
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
$\\frac{22}{7} \\approx \\pi$
$$\\frac{d}{dx}\\left(\\frac{f(x)}{g(x)}\\right) = \\frac{f'(x)g(x) - f(x)g'(x)}{[g(x)]^2}$$`,

            exponents: `# Exponents and Roots

## Basic Exponents
- Square: $x^2$
- Cube: $x^3$
- General: $x^n$
- Negative: $x^{-1} = \\frac{1}{x}$
- Fractional: $x^{1/2} = \\sqrt{x}$

## Basic Exponents

## Complex Exponents
- Multiple terms: $x^{a + b}$
- Nested: $x^{y^z}$
- With parentheses: $(x + y)^n$

## Roots
- Square root: $\\sqrt{x}$
- Cube root: $\\sqrt[3]{x}$
- nth root: $\\sqrt[n]{x}$
- Nested roots: $\\sqrt{\\sqrt{x}}$

## Examples
$e^{i\pi} + 1 = 0$
$\\sqrt{x^2 + y^2}$
$$x^{\\frac{m}{n}} = \\sqrt[n]{x^m}$$`,

            'algebra1': `# Algebra 1 Formulas

## I. Linear Equations and Graphs

**Slope Formula:**
$$m = \\frac{y_2 - y_1}{x_2 - x_1}$$

**Slope-Intercept Form:**
$$y = mx + b$$

**Standard Form:**
$$Ax + By = C$$

**Point-Slope Form:**
$$y - y_1 = m(x - x_1)$$

**Distance Formula:**
$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$

**Midpoint Formula:**
$$\\left(\\frac{x_1 + x_2}{2},\\ \\frac{y_1 + y_2}{2}\\right)$$

**Parallel Lines:**
$$m_1 = m_2$$

**Perpendicular Lines:**
$$m_1 = -\\frac{1}{m_2}$$

---

## II. Laws of Exponents

**Product Rule:**
$$a^m \\cdot a^n = a^{m+n}$$

**Quotient Rule:**
$$\\frac{a^n}{a^m} = a^{n-m}$$

**Power of a Power Rule:**
$$(a^m)^n = a^{m \\cdot n}$$

**Zero Exponent Rule:**
$$a^0 = 1$$

**Negative Exponent Rule:**
$$a^{-m} = \\frac{1}{a^m}$$

---

## III. Polynomials and Factoring

**Difference of Squares:**
$$a^2 - b^2 = (a-b)(a+b)$$

**Perfect Square Trinomial 1:**
$$a^2 + 2ab + b^2 = (a+b)^2$$

**Perfect Square Trinomial 2:**
$$a^2 - 2ab + b^2 = (a-b)^2$$

**FOIL Method:**
First, Outer, Inner, Last (for $ (a+b)(c+d) $)

---

## IV. Quadratic Equations

**Standard Form:**
$$ax^2 + bx + c = 0$$

**Quadratic Formula:**
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

**Discriminant:**
$$\\Delta = b^2 - 4ac$$

**Vertex (x-coordinate):**
$$x = -\\frac{b}{2a}$$

---

## V. Sequences

**Arithmetic Sequence (Explicit):**
$$a_n = a_1 + (n-1)d$$

**Geometric Sequence (Explicit):**
$$a_n = a_1 \\cdot r^{n-1}$$

---

## VI. Radicals and Square Roots

**Square Root:**
$$\\sqrt{x}$$

**Cube Root:**
$$\\sqrt[3]{x}$$

**nth Root:**
$$\\sqrt[n]{x}$$

**Properties:**
$$\\sqrt{a^2} = \\left| a \\right|$$

$$\\sqrt{ab} = \\sqrt{a} \\cdot \\sqrt{b}$$

$$\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}$$

$$\\sqrt{a^2 + b^2}$$


---

## VII. Inverse Functions

**Definition:**
If $f(x)$ is a function, its inverse $f^{-1}(x)$ satisfies $f(f^{-1}(x)) = x$ and $f^{-1}(f(x)) = x$.

**Finding the Inverse:**
1. Replace $f(x)$ with $y$.
2. Solve for $x$ in terms of $y$.
3. Swap $x$ and $y$.
4. Write as $f^{-1}(x)$.

**Example:**
If $f(x) = 2x + 3$, then $f^{-1}(x) = \\frac{x - 3}{2}$

---

## VIII. Rational Functions & Variations

**Rational Function:**
A function of the form $f(x) = \\frac{P(x)}{Q(x)}$, where $P$ and $Q$ are polynomials and $Q(x) \\neq 0$.

**Direct Variation:**
$y = kx$  &nbsp; or &nbsp; $y \\propto x$

**Inverse Variation:**
$y = \\frac{k}{x}$  &nbsp; or &nbsp; $y \\propto \\frac{1}{x}$

**Joint Variation:**
$y = kxz$ (varies directly with $x$ and $z$)

**Combined Variation:**
$y = \\frac{kx}{z}$ (varies directly with $x$, inversely with $z$)

---



`,

            'greek-letters': `# Greek Letters

## Lowercase Greek Letters
- Alpha: $\\alpha$
- Beta: $\\beta$  
- Gamma: $\\gamma$
- Delta: $\\delta$
- Epsilon: $\\epsilon$ or $\\varepsilon$
- Theta: $\\theta$ or $\\vartheta$
- Lambda: $\\lambda$
- Pi: $\\pi$ or $\\varpi$
- Sigma: $\\sigma$ or $\\varsigma$
- Phi: $\\phi$ or $\\varphi$
- Omega: $\\omega$

## Uppercase Greek Letters
- Gamma: $\\Gamma$
- Delta: $\\Delta$
- Theta: $\\Theta$
- Lambda: $\\Lambda$
- Pi: $\\Pi$
- Sigma: $\\Sigma$
- Phi: $\\Phi$
- Omega: $\\Omega$

$\\alpha + \\beta = \\gamma$
$\\Delta x = x_2 - x_1$
$$\\sum_{i=1}^{n} \\alpha_i$$
$\\pi r^2 = \\text{area of circle}$`,

            operators: `# Mathematical Operators

## Basic Operators
- Plus: $+$
- Minus: $-$
- Times: $\\times$ or $\\cdot$
- Division: $\\div$ or $/$
- Plus-minus: $\\pm$
- Minus-plus: $\\mp$

- Equal: $=$
- Not equal: $\\neq$ or $\\ne$
- Less than: $<$
- Greater than: $>$
- Less or equal: $\\leq$ or $\\le$
- Greater or equal: $\\geq$ or $\\ge$
- Approximately: $\\approx$
- Proportional: $\\propto$

## Set Operators
- Element of: $\\in$
- Not element of: $\\notin$
- Subset: $\\subset$
- Union: $\\cup$
- Intersection: $\\cap$
- Empty set: $\\emptyset$

## Examples
$x \\in \\mathbb{R}$
$A \\cup B = \\{x : x \\in A \\lor x \\in B\\}$`,

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

## Logarithmic Functions
- Natural log: $\\ln(x)$
- Common log: $\\log(x)$ or $\\log_{10}(x)$
- General log: $\\log_a(x)$

## Other Functions
- Exponential: $\\exp(x) = e^x$
- Absolute value: $|x|$ or $\\lvert x \\rvert$
- Floor: $\\lfloor x \\rfloor$
- Ceiling: $\\lceil x \\rceil$

## Examples
$\\sin^2(x) + \\cos^2(x) = 1$
$e^{i\\theta} = \\cos(\\theta) + i\\sin(\\theta)$
$$\\log_a(xy) = \\log_a(x) + \\log_a(y)$$`,

            'calculus-symbols': `# Calculus Symbols

## Derivatives
- First derivative: $f'(x)$ or $\\frac{df}{dx}$
- Second derivative: $f''(x)$ or $\\frac{d^2f}{dx^2}$
- nth derivative: $f^{(n)}(x)$ or $\\frac{d^nf}{dx^n}$
- Partial derivative: $\\frac{\\partial f}{\\partial x}$

## Integrals
- Indefinite integral: $\\int f(x) \\, dx$
- Definite integral: $\\int_a^b f(x) \\, dx$
- Multiple integral: $\\iint f(x,y) \\, dx \\, dy$
- Contour integral: $\\oint f(z) \\, dz$

## Limits
- Basic limit: $\\lim_{x \\to a} f(x)$
- Limit at infinity: $\\lim_{x \\to \\infty} f(x)$
- One-sided limits: $\\lim_{x \\to a^+} f(x)$

## Series and Sums
- Summation: $\\sum_{i=1}^{n} a_i$
- Infinite sum: $\\sum_{i=1}^{\\infty} a_i$
- Product: $\\prod_{i=1}^{n} a_i$

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
- Vertical bars: $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$

## Vectors
- Column vector: $\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}$
- Row vector: $\\begin{pmatrix} x & y & z \\end{pmatrix}$

## Matrix Operations
- Transpose: $A^T$
- Inverse: $A^{-1}$
- Determinant: $\\det(A)$ or $|A|$

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

## Set Relations
- Element of: $x \\in A$
- Not element of: $x \\notin A$
- Subset: $A \\subset B$ or $A \\subseteq B$
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

## Examples
$A \\cup B = \\{x : x \\in A \\lor x \\in B\\}$
$\\forall x \\in \\mathbb{R}, \\exists y \\in \\mathbb{R} : y > x$`,

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

## Examples
$$Z = \\frac{X - \\mu}{\\sigma}$$
$$\\chi^2 = \\sum_{i=1}^{n} \\frac{(O_i - E_i)^2}{E_i}$$`,

            'common-math': `# Common Mathematical Formulas

## Algebra
- Quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
- Binomial theorem: $(a + b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k$
- Difference of squares: $a^2 - b^2 = (a + b)(a - b)$
- Perfect square: $(a \\pm b)^2 = a^2 \\pm 2ab + b^2$

## Geometry
- Circle area: $A = \\pi r^2$
- Circle circumference: $C = 2\\pi r$
- Sphere volume: $V = \\frac{4}{3}\\pi r^3$
- Sphere surface area: $A = 4\\pi r^2$
- Triangle area: $A = \\frac{1}{2}bh$

## Trigonometry
- Pythagorean theorem: $a^2 + b^2 = c^2$
- Law of cosines: $c^2 = a^2 + b^2 - 2ab\\cos(C)$
- Law of sines: $\\frac{a}{\\sin(A)} = \\frac{b}{\\sin(B)} = \\frac{c}{\\sin(C)}$
- Trigonometric identity: $\\sin^2(x) + \\cos^2(x) = 1$

## Calculus
- Power rule: $\\frac{d}{dx}[x^n] = nx^{n-1}$
- Product rule: $\\frac{d}{dx}[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)$
- Chain rule: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$
- Fundamental theorem: $\\int_a^b f'(x) dx = f(b) - f(a)$

## Series
- Arithmetic series: $S_n = \\frac{n}{2}(a_1 + a_n)$
- Geometric series: $S_n = a_1 \\frac{1 - r^n}{1 - r}$ (if $r \\neq 1$)
- Infinite geometric: $S = \\frac{a_1}{1 - r}$ (if $|r| < 1$)`,

            'physics-mechanics': `# Physics: Classical Mechanics

## Kinematics
- Position: $x(t) = x_0 + v_0 t + \\frac{1}{2}at^2$
- Velocity: $v(t) = v_0 + at$
- Acceleration: $a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}$
- Kinematic equation: $v^2 = v_0^2 + 2a(x - x_0)$

## Dynamics
- Newton's second law: $\\vec{F} = m\\vec{a}$
- Momentum: $\\vec{p} = m\\vec{v}$
- Impulse-momentum theorem: $\\vec{J} = \\Delta \\vec{p} = \\int \\vec{F} dt$
- Newton's law of gravitation: $F = G\\frac{m_1 m_2}{r^2}$

## Energy
- Kinetic energy: $K = \\frac{1}{2}mv^2$
- Potential energy (gravitational): $U = mgh$
- Potential energy (spring): $U = \\frac{1}{2}kx^2$
- Work-energy theorem: $W = \\Delta K$
- Conservation of energy: $E = K + U = \\text{constant}$

## Rotational Motion
- Angular velocity: $\\omega = \\frac{d\\theta}{dt}$
- Angular acceleration: $\\alpha = \\frac{d\\omega}{dt}$
- Moment of inertia: $I = \\sum m_i r_i^2$
- Torque: $\\vec{\\tau} = \\vec{r} \\times \\vec{F} = I\\vec{\\alpha}$
- Angular momentum: $\\vec{L} = I\\vec{\\omega} = \\vec{r} \\times \\vec{p}$
- Rotational kinetic energy: $K_{rot} = \\frac{1}{2}I\\omega^2$

## Oscillations and Waves
- Simple harmonic motion: $x(t) = A\\cos(\\omega t + \\phi)$
- Period of pendulum: $T = 2\\pi\\sqrt{\\frac{L}{g}}$
- Period of spring: $T = 2\\pi\\sqrt{\\frac{m}{k}}$
- Wave equation: $y(x,t) = A\\sin(kx - \\omega t + \\phi)$
- Wave speed: $v = f\\lambda = \\frac{\\omega}{k}$`,

            'physics-thermodynamics': `# Physics: Thermodynamics

## Laws of Thermodynamics
- Zeroth law: If A = B and B = C, then A = C (thermal equilibrium)
- First law: $\\Delta U = Q - W$ (conservation of energy)
- Second law: $\\Delta S \\geq 0$ (entropy increases)
- Third law: $S \\to 0$ as $T \\to 0$ (absolute zero)

## State Variables
- Ideal gas law: $PV = nRT = Nk_BT$
- Internal energy (ideal gas): $U = \\frac{f}{2}nRT$
- Entropy: $S = k_B \\ln(\\Omega)$
- Gibbs free energy: $G = H - TS = U + PV - TS$

## Processes
- Isothermal: $T = \\text{constant}$, $PV = \\text{constant}$
- Adiabatic: $Q = 0$, $PV^\\gamma = \\text{constant}$
- Isobaric: $P = \\text{constant}$, $\\frac{V}{T} = \\text{constant}$
- Isochoric: $V = \\text{constant}$, $\\frac{P}{T} = \\text{constant}$

## Efficiency and Cycles
- Carnot efficiency: $\\eta = 1 - \\frac{T_c}{T_h}$
- Heat engine efficiency: $\\eta = \\frac{W}{Q_h} = 1 - \\frac{Q_c}{Q_h}$
- Coefficient of performance (heat pump): $COP_{hp} = \\frac{Q_h}{W}$
- Coefficient of performance (refrigerator): $COP_r = \\frac{Q_c}{W}$`,

            'physics-electromagnetism': `# Physics: Electromagnetism

## Electrostatics
- Coulomb's law: $\\vec{F} = k\\frac{q_1 q_2}{r^2}\\hat{r} = \\frac{1}{4\\pi\\epsilon_0}\\frac{q_1 q_2}{r^2}\\hat{r}$
- Electric field: $\\vec{E} = \\frac{\\vec{F}}{q} = \\frac{1}{4\\pi\\epsilon_0}\\frac{Q}{r^2}\\hat{r}$
- Electric potential: $V = \\frac{1}{4\\pi\\epsilon_0}\\frac{Q}{r}$
- Gauss's law: $\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{enc}}{\\epsilon_0}$
- Capacitance: $C = \\frac{Q}{V}$
- Energy in capacitor: $U = \\frac{1}{2}CV^2 = \\frac{1}{2}QV = \\frac{Q^2}{2C}$

## Current and Resistance
- Current: $I = \\frac{dQ}{dt}$
- Ohm's law: $V = IR$
- Resistance: $R = \\rho\\frac{L}{A}$
- Power: $P = IV = I^2R = \\frac{V^2}{R}$
- Kirchhoff's laws: $\\sum I = 0$, $\\sum V = 0$

## Magnetism
- Magnetic force on charge: $\\vec{F} = q\\vec{v} \\times \\vec{B}$
- Magnetic force on current: $\\vec{F} = I\\vec{L} \\times \\vec{B}$
- Ampère's law: $\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{enc}$
- Magnetic field of wire: $B = \\frac{\\mu_0 I}{2\\pi r}$

## Electromagnetic Induction
- Faraday's law: $\\mathcal{E} = -\\frac{d\\Phi_B}{dt}$
- Lenz's law: Induced current opposes change in flux
- Motional EMF: $\\mathcal{E} = Blv$
- Self-inductance: $L = \\frac{\\Phi_B}{I}$
- Energy in inductor: $U = \\frac{1}{2}LI^2$

## Maxwell's Equations
- Gauss's law: $\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0}$
- Gauss's law for magnetism: $\\nabla \\cdot \\vec{B} = 0$
- Faraday's law: $\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}$
- Ampère-Maxwell law: $\\nabla \\times \\vec{B} = \\mu_0\\vec{J} + \\mu_0\\epsilon_0\\frac{\\partial \\vec{E}}{\\partial t}$`,

            'physics-quantum': `# Physics: Quantum Mechanics & Modern Physics

## Quantum Mechanics Foundations
- Planck's constant: $E = h\\nu = \\hbar\\omega$
- de Broglie wavelength: $\\lambda = \\frac{h}{p}$
- Uncertainty principle: $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$
- Schrödinger equation: $i\\hbar\\frac{\\partial\\psi}{\\partial t} = \\hat{H}\\psi$
- Time-independent: $\\hat{H}\\psi = E\\psi$
- Probability density: $|\\psi(x,t)|^2$

## Atomic Physics
- Bohr model: $E_n = -\\frac{13.6 \\text{ eV}}{n^2}$
- Rydberg formula: $\\frac{1}{\\lambda} = R\\left(\\frac{1}{n_1^2} - \\frac{1}{n_2^2}\\right)$
- Fine structure constant: $\\alpha = \\frac{e^2}{4\\pi\\epsilon_0\\hbar c} \\approx \\frac{1}{137}$

## Particle Physics
- Mass-energy equivalence: $E = mc^2$
- Relativistic energy: $E^2 = (pc)^2 + (mc^2)^2$
- Lorentz factor: $\\gamma = \\frac{1}{\\sqrt{1 - v^2/c^2}}$
- Time dilation: $\\Delta t = \\gamma \\Delta t_0$
- Length contraction: $L = \\frac{L_0}{\\gamma}$

## Nuclear Physics
- Binding energy: $BE = (Zm_p + Nm_n - M)c^2$
- Radioactive decay: $N(t) = N_0 e^{-\\lambda t}$
- Half-life: $t_{1/2} = \\frac{\\ln(2)}{\\lambda}$
- Activity: $A = \\lambda N$`,

            'chemistry-general': `# Chemistry: General Chemistry

## Atomic Structure
- Atomic number: $Z$ (number of protons)
- Mass number: $A = Z + N$ (protons + neutrons)
- Effective nuclear charge: $Z_{eff} = Z - S$

## Chemical Bonding
- Ionic bond energy: $U = k\\frac{q_1 q_2}{r}$
- Bond order: $BO = \\frac{\\text{bonding e}^- - \\text{antibonding e}^-}{2}$
- Formal charge: $FC = V - N - \\frac{B}{2}$

## Thermochemistry
- Enthalpy of reaction: $\\Delta H_{rxn} = \\sum \\Delta H_f^\\circ(\\text{products}) - \\sum \\Delta H_f^\\circ(\\text{reactants})$
- Hess's law: $\\Delta H_{total} = \\sum \\Delta H_i$
- Heat capacity: $q = nC\\Delta T$

## Gas Laws
- Ideal gas law: $PV = nRT$
- Combined gas law: $\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}$
- Dalton's law: $P_{total} = \\sum P_i$
- Graham's law: $\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}}$

## Solutions
- Molarity: $M = \\frac{\\text{moles solute}}{\\text{L solution}}$
- Molality: $m = \\frac{\\text{moles solute}}{\\text{kg solvent}}$
- Mole fraction: $\\chi_A = \\frac{n_A}{n_{total}}$
- Raoult's law: $P_A = \\chi_A P_A^\\circ$

## Chemical Equilibrium
- Equilibrium constant: $K_c = \\frac{[C]^c[D]^d}{[A]^a[B]^b}$
- Le Châtelier's principle: System shifts to counteract stress

## Acids and Bases
- pH: $pH = -\\log[H^+]$
- pOH: $pOH = -\\log[OH^-]$
- Water autoionization: $K_w = [H^+][OH^-] = 1.0 \\times 10^{-14}$
- Henderson-Hasselbalch: $pH = pK_a + \\log\\frac{[A^-]}{[HA]}$`,

            'chemistry-organic': `# Chemistry: Organic Chemistry

## Nomenclature and Structure
- IUPAC naming rules for alkanes, alkenes, alkynes
- Functional group priorities: COOH > CHO > C=O > OH > NH₂
- Stereochemistry: R/S configuration, E/Z isomerism
- Conformational analysis: Newman projections, chair conformations

## Reaction Mechanisms
- Nucleophilic substitution: SN1 vs SN2
- Elimination reactions: E1 vs E2
- Addition reactions: Markovnikov's rule, anti-Markovnikov
- Electrophilic aromatic substitution: ortho/meta/para directing

## Functional Groups
- Alkenes: $C=C$ (sp² hybridized)
- Alkynes: $C≡C$ (sp hybridized)
- Alcohols: $R-OH$
- Ethers: $R-O-R'$
- Aldehydes: $R-CHO$
- Ketones: $R-CO-R'$
- Carboxylic acids: $R-COOH$
- Esters: $R-COO-R'$
- Amines: $R-NH_2$, $R_2NH$, $R_3N$

## Spectroscopy
- IR frequencies: C-H (2850-3000 cm⁻¹), C=O (1650-1750 cm⁻¹)
- NMR chemical shifts: alkyl (0.8-1.8 ppm), aromatic (7-8 ppm)
- Mass spectrometry: molecular ion peak, fragmentation patterns

## Synthesis Strategies
- Retrosynthetic analysis: working backwards from target
- Protecting groups: temporary modification of reactive sites
- Oxidation states of carbon: -4 (CH₄) to +4 (CO₂)
- Common reagents: LiAlH₄, NaBH₄, PCC, KMnO₄, OsO₄`,

            'chemistry-physical': `# Chemistry: Physical Chemistry

## Thermodynamics
- First law: $dU = \\delta q + \\delta w$
- Enthalpy: $H = U + PV$
- Entropy: $dS = \\frac{\\delta q_{rev}}{T}$
- Gibbs free energy: $G = H - TS$

## Chemical Kinetics
- Rate law: $\\text{rate} = k[A]^m[B]^n$
- Integrated rate laws:
  - Zero order: $[A] = [A]_0 - kt$
  - First order: $\\ln[A] = \\ln[A]_0 - kt$
  - Second order: $\\frac{1}{[A]} = \\frac{1}{[A]_0} + kt$
- Arrhenius equation: $k = Ae^{-E_a/RT}$

## Electrochemistry
- Nernst equation: $E = E^\\circ - \\frac{RT}{nF}\\ln Q$
- Butler-Volmer equation: $j = j_0\\left[e^{\\alpha nF\\eta/RT} - e^{-(1-\\alpha)nF\\eta/RT}\\right]$

## Surface Chemistry
- Langmuir isotherm: $\\theta = \\frac{bP}{1 + bP}$
- BET isotherm: $\\frac{P}{V(P_0 - P)} = \\frac{1}{V_m C} + \\frac{C-1}{V_m C}\\frac{P}{P_0}$`,

            'engineering-mechanical': `# Engineering: Mechanical Engineering

## Statics and Dynamics
- Equilibrium conditions: $\\sum \\vec{F} = 0$, $\\sum \\vec{M} = 0$
- Newton's second law: $\\vec{F} = m\\vec{a}$
- Moment of inertia: $I = \\int r^2 dm$
- Angular momentum: $\\vec{L} = I\\vec{\\omega}$
- Work-energy theorem: $W = \\Delta KE$

## Mechanics of Materials
- Stress: $\\sigma = \\frac{F}{A}$
- Strain: $\\epsilon = \\frac{\\Delta L}{L_0}$
- Hooke's law: $\\sigma = E\\epsilon$
- Shear stress: $\\tau = \\frac{V}{A}$
- Bending stress: $\\sigma = \\frac{My}{I}$
- Torsional stress: $\\tau = \\frac{Tr}{J}$
- Euler buckling: $P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}$

## Fluid Mechanics
- Continuity equation: $\\rho_1 A_1 V_1 = \\rho_2 A_2 V_2$
- Bernoulli's equation: $\\frac{P}{\\rho} + \\frac{V^2}{2} + gz = \\text{constant}$
- Reynolds number: $Re = \\frac{\\rho VD}{\\mu}$
- Drag force: $F_D = \\frac{1}{2}\\rho V^2 C_D A$
- Lift force: $F_L = \\frac{1}{2}\\rho V^2 C_L A$

## Heat Transfer
- Fourier's law: $q = -kA\\frac{dT}{dx}$
- Newton's law of cooling: $q = hA(T_s - T_\\infty)$
- Stefan-Boltzmann law: $q = \\epsilon\\sigma A T^4$

## Thermodynamics
- First law: $\\Delta U = Q - W$
- Entropy: $dS = \\frac{\\delta Q_{rev}}{T}$
- Carnot efficiency: $\\eta = 1 - \\frac{T_L}{T_H}$
- Isentropic process: $PV^\\gamma = \\text{constant}$`,

            'engineering-electrical': `# Engineering: Electrical Engineering

## Circuit Analysis
- Ohm's law: $V = IR$
- Kirchhoff's current law: $\\sum I = 0$
- Kirchhoff's voltage law: $\\sum V = 0$
- Power: $P = VI = I^2R = \\frac{V^2}{R}$
- Thevenin equivalent: $V_{th}$, $R_{th}$
- Norton equivalent: $I_N$, $R_N$

## AC Circuits
- Phasor representation: $V = V_m e^{j(\\omega t + \\phi)}$
- Impedance: $Z = R + jX = |Z|e^{j\\theta}$
- Capacitive reactance: $X_C = \\frac{1}{\\omega C}$
- Inductive reactance: $X_L = \\omega L$
- Power factor: $\\cos\\phi = \\frac{P}{S}$
- Complex power: $S = P + jQ$

## Transformers
- Turns ratio: $a = \\frac{N_1}{N_2}$
- Voltage transformation: $\\frac{V_1}{V_2} = \\frac{N_1}{N_2}$
- Current transformation: $\\frac{I_1}{I_2} = \\frac{N_2}{N_1}$
- Efficiency: $\\eta = \\frac{P_{out}}{P_{in}}$

## Control Systems
- Transfer function: $G(s) = \\frac{Y(s)}{X(s)}$
- Closed-loop transfer function: $T(s) = \\frac{G(s)}{1 + G(s)H(s)}$
- PID controller: $G_c(s) = K_p + \\frac{K_i}{s} + K_d s$

## Power Systems
- Three-phase power: $P = \\sqrt{3}V_LI_L\\cos\\phi$
- Per-unit system: $pu = \\frac{\\text{actual}}{\\text{base}}$`,

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
- Moment capacity: $M_n = A_s f_y \\left(d - \\frac{a}{2}\\right)$

## Steel Design
- Yield strength: $F_y$
- Ultimate strength: $F_u$
- Slenderness ratio: $\\frac{KL}{r}$
- Euler buckling: $F_e = \\frac{\\pi^2 E}{(KL/r)^2}$

## Geotechnical Engineering
- Effective stress: $\\sigma' = \\sigma - u$
- Terzaghi bearing capacity: $q_{ult} = cN_c + qN_q + \\frac{1}{2}\\gamma BN_\\gamma$
- Mohr-Coulomb failure: $\\tau = c + \\sigma'\\tan\\phi$
- Coefficient of permeability: $k = \\frac{vL}{h}$ (Darcy's law)

## Hydraulics & Hydrology
- Manning's equation: $V = \\frac{1}{n}R^{2/3}S^{1/2}$
- Rational method: $Q = CiA$
- Hydraulic radius: $R = \\frac{A}{P}$
- Froude number: $Fr = \\frac{V}{\\sqrt{gD}}$

## Transportation Engineering
- Stopping sight distance: $SSD = 1.47Vt + \\frac{V^2}{30(f \\pm G)}$
- Horizontal curve radius: $R = \\frac{V^2}{15(e + f)}$
- Traffic flow: $q = kv$ (flow = density × speed)`,

            'algebra2-quadratic-functions': `# Algebra 2: Quadratic Functions

## Forms of Quadratic Functions

**Standard Form:**
$$f(x) = ax^2 + bx + c$$

**Vertex Form:**
$$f(x) = a(x - h)^2 + k$$
where $(h, k)$ is the vertex

**Factored Form:**
$$f(x) = a(x - r_1)(x - r_2)$$
where $r_1$ and $r_2$ are the roots

## Key Properties

**Vertex:**
$$h = -\\frac{b}{2a}, \\quad k = f(h)$$

**Axis of Symmetry:**
$$x = h = -\\frac{b}{2a}$$

**Discriminant:**
$$\\Delta = b^2 - 4ac$$
- If $\\Delta > 0$: two real roots
- If $\\Delta = 0$: one real root (double root)
- If $\\Delta < 0$: two complex roots

**Quadratic Formula:**
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

## Transformations

**Vertical Shift:** $f(x) + k$ (up if $k > 0$)
**Horizontal Shift:** $f(x - h)$ (right if $h > 0$)
**Vertical Stretch/Compression:** $af(x)$ (stretch if $|a| > 1$)
**Reflection:** $-f(x)$ (reflects over x-axis)

## Completing the Square

To convert $ax^2 + bx + c$ to vertex form:
1. Factor out $a$: $a(x^2 + \\frac{b}{a}x) + c$
2. Add and subtract $(\\frac{b}{2a})^2$: $a(x^2 + \\frac{b}{a}x + (\\frac{b}{2a})^2 - (\\frac{b}{2a})^2) + c$
3. Simplify: $a(x + \\frac{b}{2a})^2 + c - \\frac{b^2}{4a}$

## Examples

**Example 1:** Find vertex of $f(x) = 2x^2 - 8x + 5$
$$h = -\\frac{-8}{2(2)} = 2$$
$$k = f(2) = 2(2)^2 - 8(2) + 5 = -3$$
Vertex: $(2, -3)$

**Example 2:** Solve $x^2 - 6x + 8 = 0$
$$x = \\frac{6 \\pm \\sqrt{36 - 32}}{2} = \\frac{6 \\pm 2}{2}$$
$$x = 4 \\text{ or } x = 2$$`,

            'algebra2-polynomials': `# Algebra 2: Polynomials

## Polynomial Basics

**Definition:** A polynomial is an expression of the form:
$$P(x) = a_nx^n + a_{n-1}x^{n-1} + \\cdots + a_1x + a_0$$

**Degree:** The highest power of $x$ (value of $n$)
**Leading Coefficient:** $a_n$ (coefficient of highest degree term)
**Constant Term:** $a_0$

## Operations on Polynomials

**Addition/Subtraction:** Combine like terms
$$(3x^2 + 2x - 1) + (x^2 - 4x + 3) = 4x^2 - 2x + 2$$

**Multiplication:** Use distributive property or FOIL
$$(x + 2)(x^2 - 3x + 1) = x^3 - 3x^2 + x + 2x^2 - 6x + 2 = x^3 - x^2 - 5x + 2$$

**Division:** Long division or synthetic division

## Factoring Techniques

**Greatest Common Factor (GCF):**
$$6x^3 + 9x^2 = 3x^2(2x + 3)$$

**Difference of Squares:**
$$a^2 - b^2 = (a + b)(a - b)$$
$$x^2 - 16 = (x + 4)(x - 4)$$

**Perfect Square Trinomials:**
$$a^2 + 2ab + b^2 = (a + b)^2$$
$$a^2 - 2ab + b^2 = (a - b)^2$$

**Sum/Difference of Cubes:**
$$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$
$$a^3 - b^3 = (a - b)(a^2 + ab + b^2)$$

**Trinomial Factoring:**
$$x^2 + bx + c = (x + p)(x + q) \\text{ where } p + q = b, pq = c$$

## Synthetic Division

Used to divide polynomials by $(x - c)$:

**Example:** Divide $x^3 - 6x^2 + 11x - 6$ by $(x - 2)$

\`\`\`
2 | 1  -6  11  -6
  |    2  -8   6
  ----------------
    1  -4   3   0
\`\`\`

Result: $x^2 - 4x + 3$

## Remainder and Factor Theorems

**Remainder Theorem:** If $P(x)$ is divided by $(x - c)$, the remainder is $P(c)$

**Factor Theorem:** $(x - c)$ is a factor of $P(x)$ if and only if $P(c) = 0$

## Rational Root Theorem

If $\\frac{p}{q}$ is a rational root of $P(x) = a_nx^n + \\cdots + a_0$, then:
- $p$ divides $a_0$
- $q$ divides $a_n$

## Examples

**Factor:** $x^3 - 8$
$$x^3 - 8 = x^3 - 2^3 = (x - 2)(x^2 + 2x + 4)$$

**Find roots:** $x^3 - 6x^2 + 11x - 6 = 0$
Possible rational roots: $\\pm 1, \\pm 2, \\pm 3, \\pm 6$
Testing $x = 1$: $1 - 6 + 11 - 6 = 0$ ✓
So $(x - 1)$ is a factor.`,

            'algebra2-rational-functions': `# Algebra 2: Rational Functions

## Definition

A rational function is a function of the form:
$$f(x) = \\frac{P(x)}{Q(x)}$$
where $P(x)$ and $Q(x)$ are polynomials and $Q(x) \\neq 0$

## Domain and Range

**Domain:** All real numbers except where $Q(x) = 0$
**Range:** Depends on the function's behavior

## Asymptotes

**Vertical Asymptotes:** Occur where $Q(x) = 0$ (but $P(x) \\neq 0$)
- Find by setting denominator equal to zero
- $x = a$ is a vertical asymptote if $\\lim_{x \\to a} f(x) = \\pm \\infty$

**Horizontal Asymptotes:** Based on degrees of numerator and denominator
- If $\\deg(P) < \\deg(Q)$: $y = 0$
- If $\\deg(P) = \\deg(Q)$: $y = \\frac{\\text{leading coefficient of } P}{\\text{leading coefficient of } Q}$
- If $\\deg(P) > \\deg(Q)$: No horizontal asymptote (may have oblique)

**Oblique Asymptotes:** When $\\deg(P) = \\deg(Q) + 1$
- Found using long division: $f(x) = mx + b + \\frac{R(x)}{Q(x)}$
- Asymptote is $y = mx + b$

## Holes (Removable Discontinuities)

Occur when both $P(x)$ and $Q(x)$ have the same factor $(x - a)$
- Cancel the common factor
- Hole at $x = a$ with $y$-coordinate found by evaluating simplified function

## Examples

**Example 1:** $f(x) = \\frac{x^2 - 4}{x^2 - 1}$

Domain: $x \\neq \\pm 1$
Vertical asymptotes: $x = 1, x = -1$
Horizontal asymptote: $y = 1$ (same degree)
Holes: None

**Example 2:** $f(x) = \\frac{x^2 - 1}{x - 1}$

$$f(x) = \\frac{(x+1)(x-1)}{x-1} = x + 1 \\text{ for } x \\neq 1$$

Hole at $x = 1$ with $y$-coordinate $f(1) = 2$

**Example 3:** $f(x) = \\frac{x^3 + 1}{x^2 - 1}$

Long division gives: $f(x) = x + \\frac{x + 1}{x^2 - 1}$
Oblique asymptote: $y = x$`,

            'algebra2-radical-functions': `# Algebra 2: Radical Functions

## Definition

A radical function is a function containing a radical expression:
$$f(x) = \\sqrt[n]{g(x)}$$
where $n$ is the index and $g(x)$ is the radicand

## Common Types

**Square Root Function:**
$$f(x) = \\sqrt{x}$$
- Domain: $x \\geq 0$
- Range: $y \\geq 0$

**Cube Root Function:**
$$f(x) = \\sqrt[3]{x}$$
- Domain: All real numbers
- Range: All real numbers

**General nth Root:**
$$f(x) = \\sqrt[n]{x}$$
- If $n$ is even: Domain $x \\geq 0$, Range $y \\geq 0$
- If $n$ is odd: Domain and Range are all real numbers

## Rational Exponents

**Definition:** $x^{1/n} = \\sqrt[n]{x}$

**Properties:**
- $x^{m/n} = (\\sqrt[n]{x})^m = \\sqrt[n]{x^m}$
- $x^{-m/n} = \\frac{1}{x^{m/n}} = \\frac{1}{\\sqrt[n]{x^m}}$

## Operations with Radicals

**Product Rule:**
$$\\sqrt[n]{a} \\cdot \\sqrt[n]{b} = \\sqrt[n]{ab}$$

**Quotient Rule:**
$$\\frac{\\sqrt[n]{a}}{\\sqrt[n]{b}} = \\sqrt[n]{\\frac{a}{b}}$$

**Power Rule:**
$$(\\sqrt[n]{a})^m = \\sqrt[n]{a^m}$$

## Simplifying Radicals

**Perfect Powers:** Extract perfect nth powers
$$\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$$

**Rationalizing Denominators:**
$$\\frac{1}{\\sqrt{3}} = \\frac{1}{\\sqrt{3}} \\cdot \\frac{\\sqrt{3}}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$$

**Conjugate Method:**
$$\\frac{1}{2 + \\sqrt{3}} = \\frac{1}{2 + \\sqrt{3}} \\cdot \\frac{2 - \\sqrt{3}}{2 - \\sqrt{3}} = \\frac{2 - \\sqrt{3}}{4 - 3} = 2 - \\sqrt{3}$$

## Solving Radical Equations

**Method:**
1. Isolate the radical
2. Raise both sides to the power of the index
3. Solve the resulting equation
4. Check solutions in original equation

**Example:** Solve $\\sqrt{x + 3} = x - 1$

1. Square both sides: $x + 3 = (x - 1)^2$
2. Expand: $x + 3 = x^2 - 2x + 1$
3. Rearrange: $0 = x^2 - 3x - 2$
4. Solve: $x = \\frac{3 \\pm \\sqrt{17}}{2}$
5. Check: Only $x = \\frac{3 + \\sqrt{17}}{2}$ works

## Transformations

**Vertical Shift:** $f(x) + k$
**Horizontal Shift:** $f(x - h)$
**Vertical Stretch/Compression:** $af(x)$
**Reflection:** $-f(x)$ or $f(-x)$

## Examples

**Simplify:** $\\sqrt[3]{54x^4y^7}$
$$\\sqrt[3]{54x^4y^7} = \\sqrt[3]{27 \\cdot 2 \\cdot x^3 \\cdot x \\cdot y^6 \\cdot y}$$
$$= 3xy^2\\sqrt[3]{2xy}$$

**Solve:** $\\sqrt{x + 5} + \\sqrt{x} = 5$
$$\\sqrt{x + 5} = 5 - \\sqrt{x}$$
$$x + 5 = 25 - 10\\sqrt{x} + x$$
$$-20 = -10\\sqrt{x}$$
$$2 = \\sqrt{x}$$
$$x = 4$$`,

            'algebra2-exponential-logarithmic': `# Algebra 2: Exponential and Logarithmic Functions

## Exponential Functions

**Definition:** $f(x) = a^x$ where $a > 0, a \\neq 1$

**Properties:**
- Domain: All real numbers
- Range: $(0, \\infty)$
- Always positive
- Horizontal asymptote: $y = 0$
- Passes through $(0, 1)$

**Growth vs Decay:**
- If $a > 1$: exponential growth
- If $0 < a < 1$: exponential decay

## Logarithmic Functions

**Definition:** $f(x) = \\log_a(x)$ where $a > 0, a \\neq 1$

**Properties:**
- Domain: $(0, \\infty)$
- Range: All real numbers
- Vertical asymptote: $x = 0$
- Passes through $(1, 0)$

**Common Logarithms:**
- Base 10: $\\log(x) = \\log_{10}(x)$
- Natural log: $\\ln(x) = \\log_e(x)$

## Properties of Logarithms

**Product Rule:**
$$\\log_a(xy) = \\log_a(x) + \\log_a(y)$$

**Quotient Rule:**
$$\\log_a\\left(\\frac{x}{y}\\right) = \\log_a(x) - \\log_a(y)$$

**Power Rule:**
$$\\log_a(x^n) = n\\log_a(x)$$

**Change of Base:**
$$\\log_a(x) = \\frac{\\log_b(x)}{\\log_b(a)}$$

**Special Values:**
- $\\log_a(1) = 0$
- $\\log_a(a) = 1$
- $\\log_a(a^x) = x$
- $a^{\\log_a(x)} = x$

## Solving Exponential Equations

**Method 1:** Same base
$$2^x = 2^3 \\Rightarrow x = 3$$

**Method 2:** Take logarithm
$$3^x = 7 \\Rightarrow x\\log(3) = \\log(7) \\Rightarrow x = \\frac{\\log(7)}{\\log(3)}$$

**Method 3:** Factor and solve
$$e^{2x} - 3e^x + 2 = 0$$
Let $u = e^x$: $u^2 - 3u + 2 = 0$
$(u - 1)(u - 2) = 0$
$u = 1$ or $u = 2$
$e^x = 1$ or $e^x = 2$
$x = 0$ or $x = \\ln(2)$

## Solving Logarithmic Equations

**Method 1:** Convert to exponential form
$$\\log_2(x) = 3 \\Rightarrow x = 2^3 = 8$$

**Method 2:** Use properties
$$\\log(x) + \\log(x - 3) = 1$$
$$\\log(x(x - 3)) = 1$$
$$x(x - 3) = 10^1 = 10$$
$$x^2 - 3x - 10 = 0$$
$$(x - 5)(x + 2) = 0$$
$$x = 5$$ (reject $x = -2$ since domain is $x > 0$)

## Applications

**Compound Interest:**
$$A = P\\left(1 + \\frac{r}{n}\\right)^{nt}$$

**Continuous Compound Interest:**
$$A = Pe^{rt}$$

**Population Growth:**
$$P(t) = P_0e^{rt}$$

**Half-Life:**
$$A(t) = A_0\\left(\\frac{1}{2}\\right)^{t/h}$$

## Examples

**Solve:** $2^{x+1} = 8^{x-1}$
$$2^{x+1} = (2^3)^{x-1} = 2^{3(x-1)}$$
$$x + 1 = 3(x - 1) = 3x - 3$$
$$4 = 2x$$
$$x = 2$$

**Solve:** $\\log_2(x^2 - 4) = 3$
$$x^2 - 4 = 2^3 = 8$$
$$x^2 = 12$$
$$x = \\pm 2\\sqrt{3}$$`,

            'algebra2-trigonometry': `# Algebra 2: Trigonometry

## Unit Circle

**Definition:** Circle with radius 1 centered at origin
$$x^2 + y^2 = 1$$

**Key Angles (in radians):**
- $0$: $(1, 0)$
- $\\frac{\\pi}{6}$: $(\\frac{\\sqrt{3}}{2}, \\frac{1}{2})$
- $\\frac{\\pi}{4}$: $(\\frac{\\sqrt{2}}{2}, \\frac{\\sqrt{2}}{2})$
- $\\frac{\\pi}{3}$: $(\\frac{1}{2}, \\frac{\\sqrt{3}}{2})$
- $\\frac{\\pi}{2}$: $(0, 1)$

## Trigonometric Functions

**Definitions (using unit circle):**
- $\\sin(\\theta) = y$-coordinate
- $\\cos(\\theta) = x$-coordinate
- $\\tan(\\theta) = \\frac{\\sin(\\theta)}{\\cos(\\theta)} = \\frac{y}{x}$

**Reciprocal Functions:**
- $\\csc(\\theta) = \\frac{1}{\\sin(\\theta)}$
- $\\sec(\\theta) = \\frac{1}{\\cos(\\theta)}$
- $\\cot(\\theta) = \\frac{1}{\\tan(\\theta)} = \\frac{\\cos(\\theta)}{\\sin(\\theta)}$

## Fundamental Identities

**Pythagorean Identities:**
$$\\sin^2(\\theta) + \\cos^2(\\theta) = 1$$
$$1 + \\tan^2(\\theta) = \\sec^2(\\theta)$$
$$1 + \\cot^2(\\theta) = \\csc^2(\\theta)$$

**Even/Odd Identities:**
- $\\sin(-\\theta) = -\\sin(\\theta)$ (odd)
- $\\cos(-\\theta) = \\cos(\\theta)$ (even)
- $\\tan(-\\theta) = -\\tan(\\theta)$ (odd)

**Cofunction Identities:**
$$\\sin\\left(\\frac{\\pi}{2} - \\theta\\right) = \\cos(\\theta)$$
$$\\cos\\left(\\frac{\\pi}{2} - \\theta\\right) = \\sin(\\theta)$$

## Sum and Difference Formulas

$$\\sin(A \\pm B) = \\sin(A)\\cos(B) \\pm \\cos(A)\\sin(B)$$
$$\\cos(A \\pm B) = \\cos(A)\\cos(B) \\mp \\sin(A)\\sin(B)$$
$$\\tan(A \\pm B) = \\frac{\\tan(A) \\pm \\tan(B)}{1 \\mp \\tan(A)\\tan(B)}$$

## Double Angle Formulas

$$\\sin(2\\theta) = 2\\sin(\\theta)\\cos(\\theta)$$
$$\\cos(2\\theta) = \\cos^2(\\theta) - \\sin^2(\\theta) = 2\\cos^2(\\theta) - 1 = 1 - 2\\sin^2(\\theta)$$
$$\\tan(2\\theta) = \\frac{2\\tan(\\theta)}{1 - \\tan^2(\\theta)}$$

## Half Angle Formulas

$$\\sin\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1 - \\cos(\\theta)}{2}}$$
$$\\cos\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1 + \\cos(\\theta)}{2}}$$
$$\\tan\\left(\\frac{\\theta}{2}\\right) = \\frac{1 - \\cos(\\theta)}{\\sin(\\theta)} = \\frac{\\sin(\\theta)}{1 + \\cos(\\theta)}$$

## Inverse Trigonometric Functions

**Definitions:**
- $\\arcsin(x)$ or $\\sin^{-1}(x)$: angle whose sine is $x$
- $\\arccos(x)$ or $\\cos^{-1}(x)$: angle whose cosine is $x$
- $\\arctan(x)$ or $\\tan^{-1}(x)$: angle whose tangent is $x$

**Domains and Ranges:**
- $\\arcsin(x)$: Domain $[-1, 1]$, Range $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$
- $\\arccos(x)$: Domain $[-1, 1]$, Range $[0, \\pi]$
- $\\arctan(x)$: Domain $(-\\infty, \\infty)$, Range $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$

## Solving Trigonometric Equations

**Basic Strategy:**
1. Isolate the trigonometric function
2. Find reference angles
3. Consider all solutions in the given interval
4. Check for extraneous solutions

**Example:** Solve $2\\sin(x) - 1 = 0$ on $[0, 2\\pi]$
$$2\\sin(x) = 1$$
$$\\sin(x) = \\frac{1}{2}$$
$$x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}$$

## Examples

**Simplify:** $\\frac{\\sin^2(x) - 1}{\\cos(x)}$
$$\\frac{\\sin^2(x) - 1}{\\cos(x)} = \\frac{-(1 - \\sin^2(x))}{\\cos(x)} = \\frac{-\\cos^2(x)}{\\cos(x)} = -\\cos(x)$$

**Find exact value:** $\\sin(75°)$
$$\\sin(75°) = \\sin(45° + 30°)$$
$$= \\sin(45°)\\cos(30°) + \\cos(45°)\\sin(30°)$$
$$= \\frac{\\sqrt{2}}{2} \\cdot \\frac{\\sqrt{3}}{2} + \\frac{\\sqrt{2}}{2} \\cdot \\frac{1}{2}$$
$$= \\frac{\\sqrt{6} + \\sqrt{2}}{4}$$`,

            'algebra2-sequences-series': `# Algebra 2: Sequences and Series

## Sequences

**Definition:** An ordered list of numbers: $a_1, a_2, a_3, \\ldots$

**Explicit Formula:** $a_n = f(n)$
**Recursive Formula:** $a_n = f(a_{n-1}, a_{n-2}, \\ldots)$

## Arithmetic Sequences

**Definition:** Each term differs from the previous by a constant $d$
$$a_n = a_1 + (n-1)d$$

**Properties:**
- Common difference: $d = a_{n+1} - a_n$
- Sum of first $n$ terms: $S_n = \\frac{n}{2}(a_1 + a_n) = \\frac{n}{2}[2a_1 + (n-1)d]$

## Geometric Sequences

**Definition:** Each term is multiplied by a constant ratio $r$
$$a_n = a_1 \\cdot r^{n-1}$$

**Properties:**
- Common ratio: $r = \\frac{a_{n+1}}{a_n}$
- Sum of first $n$ terms: $S_n = a_1 \\frac{1 - r^n}{1 - r}$ (if $r \\neq 1$)
- Infinite sum: $S = \\frac{a_1}{1 - r}$ (if $|r| < 1$)

## Sigma Notation

**Definition:** $\\sum_{i=m}^{n} a_i = a_m + a_{m+1} + \\cdots + a_n$

**Properties:**
- $\\sum_{i=1}^{n} c = nc$ (constant)
- $\\sum_{i=1}^{n} ca_i = c\\sum_{i=1}^{n} a_i$ (constant multiple)
- $\\sum_{i=1}^{n} (a_i \\pm b_i) = \\sum_{i=1}^{n} a_i \\pm \\sum_{i=1}^{n} b_i$ (addition/subtraction)

**Common Sums:**
- $\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$
- $\\sum_{i=1}^{n} i^2 = \\frac{n(n+1)(2n+1)}{6}$
- $\\sum_{i=1}^{n} i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2$

## Special Sequences

**Fibonacci Sequence:** $F_n = F_{n-1} + F_{n-2}$ with $F_1 = F_2 = 1$
$$1, 1, 2, 3, 5, 8, 13, 21, \\ldots$$

**Factorial:** $n! = n \\cdot (n-1) \\cdot (n-2) \\cdots 2 \\cdot 1$
- $0! = 1$
- $n! = n \\cdot (n-1)!$

## Examples

**Arithmetic Example:** Find the 20th term of $3, 7, 11, 15, \\ldots$
$$a_1 = 3, d = 4$$
$$a_{20} = 3 + (20-1)(4) = 3 + 19(4) = 79$$

**Geometric Example:** Find the sum of the first 10 terms of $2, 6, 18, 54, \\ldots$
$$a_1 = 2, r = 3$$
$$S_{10} = 2 \\cdot \\frac{1 - 3^{10}}{1 - 3} = 2 \\cdot \\frac{1 - 59049}{-2} = 59048$$

**Sigma Example:** Evaluate $\\sum_{i=1}^{5} (2i + 1)$
$$\\sum_{i=1}^{5} (2i + 1) = 2\\sum_{i=1}^{5} i + \\sum_{i=1}^{5} 1$$
$$= 2 \\cdot \\frac{5(6)}{2} + 5 = 30 + 5 = 35$$`,

            'algebra2-probability-statistics': `# Algebra 2: Probability and Statistics

## Basic Probability

**Definition:** $P(A) = \\frac{\\text{number of favorable outcomes}}{\\text{total number of outcomes}}$

**Properties:**
- $0 \\leq P(A) \\leq 1$
- $P(A) + P(A') = 1$ where $A'$ is the complement of $A$
- $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$

## Permutations and Combinations

**Permutations (order matters):**
$$P(n,r) = \\frac{n!}{(n-r)!}$$

**Combinations (order doesn't matter):**
$$C(n,r) = \\binom{n}{r} = \\frac{n!}{r!(n-r)!}$$

**Properties:**
- $\\binom{n}{0} = \\binom{n}{n} = 1$
- $\\binom{n}{r} = \\binom{n}{n-r}$ (symmetry)
- $\\binom{n}{r} = \\binom{n-1}{r-1} + \\binom{n-1}{r}$ (Pascal's identity)

## Conditional Probability

**Definition:** $P(A|B) = \\frac{P(A \\cap B)}{P(B)}$

**Independent Events:** $P(A|B) = P(A)$
**Dependent Events:** $P(A|B) \\neq P(A)$

## Bayes' Theorem

$$P(A|B) = \\frac{P(B|A) \\cdot P(A)}{P(B)}$$

## Descriptive Statistics

**Measures of Central Tendency:**
- Mean: $\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i$
- Median: Middle value when data is ordered
- Mode: Most frequent value

**Measures of Spread:**
- Range: $\\text{max} - \\text{min}$
- Variance: $s^2 = \\frac{1}{n-1}\\sum_{i=1}^{n} (x_i - \\bar{x})^2$
- Standard Deviation: $s = \\sqrt{s^2}$

## Normal Distribution

**Standard Normal:** $Z = \\frac{X - \\mu}{\\sigma}$
- Mean: $\\mu = 0$
- Standard deviation: $\\sigma = 1$

**Empirical Rule (68-95-99.7):**
- 68% of data within 1 standard deviation
- 95% of data within 2 standard deviations
- 99.7% of data within 3 standard deviations

## Binomial Distribution

**Definition:** $X \\sim B(n,p)$ where $n$ is number of trials, $p$ is probability of success

**Probability Mass Function:**
$$P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$$

**Mean:** $\\mu = np$
**Variance:** $\\sigma^2 = np(1-p)$

## Examples

**Permutation:** How many ways to arrange 5 books on a shelf?
$$P(5,5) = 5! = 120$$

**Combination:** How many ways to choose 3 students from 10?
$$C(10,3) = \\binom{10}{3} = \\frac{10!}{3!7!} = 120$$

**Probability:** What's the probability of rolling a sum of 7 with two dice?
Favorable outcomes: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$
$$P(\\text{sum} = 7) = \\frac{6}{36} = \\frac{1}{6}$$

**Normal Distribution:** If test scores are normally distributed with $\\mu = 75$ and $\\sigma = 10$, what percentage score above 85?
$$Z = \\frac{85 - 75}{10} = 1$$
$P(Z > 1) = 0.1587$ or about 16%`,

            'algebra2-conic-sections': `# Algebra 2: Conic Sections

## Circle

**Standard Form:** $(x - h)^2 + (y - k)^2 = r^2$
- Center: $(h, k)$
- Radius: $r$

**General Form:** $x^2 + y^2 + Dx + Ey + F = 0$

**Converting to Standard Form:** Complete the square

## Ellipse

**Standard Form:** $\\frac{(x-h)^2}{a^2} + \\frac{(y-k)^2}{b^2} = 1$
- Center: $(h, k)$
- Major axis length: $2a$
- Minor axis length: $2b$
- Foci: $(h \\pm c, k)$ where $c^2 = a^2 - b^2$

**If $a > b$:** Horizontal major axis
**If $b > a$:** Vertical major axis

## Parabola

**Vertical Parabola:** $(x - h)^2 = 4p(y - k)$
- Vertex: $(h, k)$
- Focus: $(h, k + p)$
- Directrix: $y = k - p$
- Opens up if $p > 0$, down if $p < 0$

**Horizontal Parabola:** $(y - k)^2 = 4p(x - h)$
- Vertex: $(h, k)$
- Focus: $(h + p, k)$
- Directrix: $x = h - p$
- Opens right if $p > 0$, left if $p < 0$

## Hyperbola

**Standard Form:** $\\frac{(x-h)^2}{a^2} - \\frac{(y-k)^2}{b^2} = 1$
- Center: $(h, k)$
- Transverse axis length: $2a$
- Conjugate axis length: $2b$
- Foci: $(h \\pm c, k)$ where $c^2 = a^2 + b^2$
- Asymptotes: $y - k = \\pm\\frac{b}{a}(x - h)$

**Vertical Hyperbola:** $\\frac{(y-k)^2}{a^2} - \\frac{(x-h)^2}{b^2} = 1$

## Eccentricity

**Definition:** $e = \\frac{c}{a}$ (for ellipses and hyperbolas)

**Values:**
- Circle: $e = 0$
- Ellipse: $0 < e < 1$
- Parabola: $e = 1$
- Hyperbola: $e > 1$

## Converting Between Forms

**General to Standard Form:**
1. Group like terms
2. Complete the square for both $x$ and $y$
3. Factor and simplify

## Examples

**Circle:** Find center and radius of $x^2 + y^2 - 6x + 4y - 3 = 0$
$$x^2 - 6x + y^2 + 4y = 3$$
$$(x^2 - 6x + 9) + (y^2 + 4y + 4) = 3 + 9 + 4$$
$$(x - 3)^2 + (y + 2)^2 = 16$$
Center: $(3, -2)$, Radius: $4$

**Ellipse:** Graph $\\frac{x^2}{9} + \\frac{y^2}{4} = 1$
- Center: $(0, 0)$
- $a = 3$, $b = 2$
- Major axis: horizontal, length $6$
- Minor axis: vertical, length $4$
- Foci: $(\\pm\\sqrt{5}, 0)$

**Parabola:** Find focus and directrix of $(x-2)^2 = 8(y+1)$
- Vertex: $(2, -1)$
- $4p = 8$, so $p = 2$
- Focus: $(2, -1 + 2) = (2, 1)$
- Directrix: $y = -1 - 2 = -3$`,

            'algebra2-matrices': `# Algebra 2: Matrices

## Matrix Basics

**Definition:** A rectangular array of numbers arranged in rows and columns
$$A = \\begin{pmatrix} a_{11} & a_{12} & a_{13} \\\\ a_{21} & a_{22} & a_{23} \\end{pmatrix}$$

**Dimensions:** $m \\times n$ where $m$ is number of rows, $n$ is number of columns

## Matrix Operations

**Addition:** Add corresponding elements
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} + \\begin{pmatrix} e & f \\\\ g & h \\end{pmatrix} = \\begin{pmatrix} a+e & b+f \\\\ c+g & d+h \\end{pmatrix}$$

**Scalar Multiplication:** Multiply each element by the scalar
$$k\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = \\begin{pmatrix} ka & kb \\\\ kc & kd \\end{pmatrix}$$

**Matrix Multiplication:** $C = AB$ where $c_{ij} = \\sum_{k} a_{ik}b_{kj}$

## Matrix Multiplication Rules

- $A(B + C) = AB + AC$ (distributive)
- $(A + B)C = AC + BC$ (distributive)
- $A(BC) = (AB)C$ (associative)
- $AB \\neq BA$ in general (not commutative)

## Special Matrices

**Identity Matrix:** $I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix}$
- $AI = IA = A$

**Zero Matrix:** All elements are zero
- $A + O = A$

**Transpose:** $A^T$ where $(A^T)_{ij} = A_{ji}$

## Determinants

**2×2 Matrix:**
$$\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc$$

**3×3 Matrix:** Use cofactor expansion
$$\\det\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg)$$

## Inverse of a Matrix

**2×2 Matrix:**
$$A^{-1} = \\frac{1}{\\det(A)}\\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix}$$

**Properties:**
- $AA^{-1} = A^{-1}A = I$
- $(AB)^{-1} = B^{-1}A^{-1}$
- $(A^T)^{-1} = (A^{-1})^T$

## Systems of Linear Equations

**Matrix Form:** $AX = B$ where:
- $A$ is coefficient matrix
- $X$ is variable matrix
- $B$ is constant matrix

**Solution:** $X = A^{-1}B$ (if $A$ is invertible)

**Cramer's Rule:** For system $ax + by = e$, $cx + dy = f$:
$$x = \\frac{\\det\\begin{pmatrix} e & b \\\\ f & d \\end{pmatrix}}{\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}}, \\quad y = \\frac{\\det\\begin{pmatrix} a & e \\\\ c & f \\end{pmatrix}}{\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}}$$

## Examples

**Matrix Multiplication:**
$$\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}\\begin{pmatrix} 5 & 6 \\\\ 7 & 8 \\end{pmatrix} = \\begin{pmatrix} 1(5)+2(7) & 1(6)+2(8) \\\\ 3(5)+4(7) & 3(6)+4(8) \\end{pmatrix} = \\begin{pmatrix} 19 & 22 \\\\ 43 & 50 \\end{pmatrix}$$

**Find Inverse:**
$$A = \\begin{pmatrix} 2 & 1 \\\\ 3 & 2 \\end{pmatrix}$$
$$\\det(A) = 2(2) - 1(3) = 1$$
$$A^{-1} = \\frac{1}{1}\\begin{pmatrix} 2 & -1 \\\\ -3 & 2 \\end{pmatrix} = \\begin{pmatrix} 2 & -1 \\\\ -3 & 2 \\end{pmatrix}$$

**Solve System:** $2x + y = 5$, $3x + 2y = 8$
$$\\begin{pmatrix} 2 & 1 \\\\ 3 & 2 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ 8 \\end{pmatrix}$$
$$\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 2 & -1 \\\\ -3 & 2 \\end{pmatrix}\\begin{pmatrix} 5 \\\\ 8 \\end{pmatrix} = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$$
Solution: $x = 2$, $y = 1$`
        };
        return templates[template] || '';
    }
});