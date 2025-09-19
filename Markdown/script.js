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
    const previewMarkdownBtn = document.getElementById('preview-markdown');
    const previewMathBtn = document.getElementById('preview-math');
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

Try the dropdowns above or click Preview buttons to see examples!`;

    // Load content from URL parameters or use default
    loadFromURL() || (markdownInput.value = defaultMarkdown);
    updatePreview();
    
    // Event listeners
    markdownInput.addEventListener('input', updatePreview);
    clearBtn.addEventListener('click', clearContent);
    copyBtn.addEventListener('click', copyContent);
    saveBtn.addEventListener('click', saveToURL);
    loadBtn.addEventListener('click', loadFromURL);
    previewMarkdownBtn.addEventListener('click', showMarkdownPopup);
    previewMathBtn.addEventListener('click', showMathPopup);
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
    });