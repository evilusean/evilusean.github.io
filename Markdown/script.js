document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const markdownOutput = document.getElementById('markdown-output');
    
    // Default markdown content
    const defaultMarkdown = `# Welcome to Markdown Preview

This is a **live markdown preview** tool. Start typing in the left panel to see the rendered output here.

## Features

- Real-time preview
- GitHub-flavored markdown support
- Responsive design
- Clean, minimal interface

## Examples

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

### Blockquote
> This is a blockquote. It can span multiple lines and is great for highlighting important information.

---

Start editing the markdown in the left panel to see your content rendered here!`;

    // Initialize with default content
    markdownInput.value = defaultMarkdown;
    updatePreview();
    
    // Update preview on input
    markdownInput.addEventListener('input', updatePreview);
    
    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        markdownOutput.innerHTML = htmlOutput;
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