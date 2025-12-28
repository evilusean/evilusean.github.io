let varaInstance = null;
let currentText = '';
let currentColor = '#dc2626';
let currentFontSize = 48;
let currentFont = 'Satisfy';
let animationInterval = null;

// Check if mobile device and adjust default font size
function getDefaultFontSize() {
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    if (isSmallMobile) return 32;
    if (isMobile) return 36;
    return 48;
}

// Initialize with responsive font size
currentFontSize = getDefaultFontSize();

// Available fonts with their CDN paths
const fonts = {
    'Pacifico': 'https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Pacifico/PacificoSLO.json',
    'Satisfy': 'https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json'
};

// DOM Elements
const textInput = document.getElementById('textInput');
const generateBtn = document.getElementById('generateBtn');
const downloadSection = document.getElementById('downloadSection');
const controlsSection = document.getElementById('controlsSection');
const colorPicker = document.getElementById('colorPicker');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeValue = document.getElementById('fontSizeValue');
const fontSelector = document.getElementById('fontSelector');
const downloadPngBtn = document.getElementById('downloadPng');
const downloadSvgBtn = document.getElementById('downloadSvg');
const varaContainer = document.getElementById('vara-container');
const clearBtn = document.getElementById('clearBtn');
const infoBtn = document.getElementById('infoBtn');
const infoModal = document.getElementById('infoModal');
const closeModal = document.querySelector('.close');
const shareBtn = document.getElementById('shareBtn');

// Load settings from URL parameters
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('text')) {
        textInput.value = decodeURIComponent(params.get('text'));
    }
    
    if (params.has('font')) {
        const font = params.get('font');
        if (fonts[font]) {
            currentFont = font;
            fontSelector.value = font;
        }
    }
    
    if (params.has('color')) {
        const color = '#' + params.get('color');
        currentColor = color;
        colorPicker.value = color;
    }
    
    if (params.has('size')) {
        const size = parseInt(params.get('size'));
        if (size >= 24 && size <= 80) {
            currentFontSize = size;
            fontSizeSlider.value = size;
            fontSizeValue.textContent = size;
        }
    }
}

// Generate shareable URL
function generateShareURL() {
    const params = new URLSearchParams();
    params.set('text', encodeURIComponent(textInput.value));
    params.set('font', currentFont);
    params.set('color', currentColor.replace('#', ''));
    params.set('size', currentFontSize);
    
    const url = window.location.origin + window.location.pathname + '?' + params.toString();
    
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
        // Show success feedback
        const originalText = shareBtn.textContent;
        shareBtn.textContent = '✓ Copied!';
        shareBtn.style.background = 'rgba(34, 197, 94, 0.2)';
        shareBtn.style.borderColor = '#22c55e';
        
        setTimeout(() => {
            shareBtn.textContent = originalText;
            shareBtn.style.background = '';
            shareBtn.style.borderColor = '';
        }, 2000);
    }).catch(() => {
        // Fallback: show URL in prompt
        prompt('Copy this URL to share:', url);
    });
}

// Generate handwriting animation
function generateHandwriting() {
    const text = textInput.value.trim();
    
    if (!text) {
        alert('Please enter some text first!');
        return;
    }

    currentText = text;
    currentColor = colorPicker.value;
    currentFontSize = parseInt(fontSizeSlider.value);
    currentFont = fontSelector.value;
    
    // Clear previous animation and interval
    varaContainer.innerHTML = '';
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    // Show controls immediately if this isn't the first generation
    const isFirstGeneration = controlsSection.style.display === 'none';
    if (!isFirstGeneration) {
        controlsSection.style.display = 'flex';
        downloadSection.style.display = 'flex';
    }
    
    // Split text into lines for proper wrapping
    const lines = text.split('\n').filter(line => line.trim());
    const textElements = lines.map((line, index) => ({
        text: line,
        fontSize: currentFontSize,
        strokeWidth: 2.5,
        color: currentColor,
        duration: 3000,
        textAlign: 'center',
        autoAnimation: true,
        queued: true, // Changed to true for sequential animation
        letterSpacing: 0,
        y: index * (currentFontSize * 1.5) // Space lines vertically
    }));
    
    // Create new Vara instance with looping animation
    varaInstance = new Vara(
        '#vara-container',
        fonts[currentFont],
        textElements,
        {
            strokeWidth: 2.5,
            color: currentColor,
            fontSize: currentFontSize,
            autoAnimation: true
        }
    );

    // Show controls and download buttons after first animation (only if hidden)
    if (isFirstGeneration) {
        setTimeout(() => {
            controlsSection.style.display = 'flex';
            downloadSection.style.display = 'flex';
        }, lines.length * 3000 + 500); // Wait for all lines to finish
    }
    
    // Loop the animation - wait for all lines to complete
    const totalDuration = lines.length * 3000;
    setTimeout(() => {
        animationInterval = setInterval(() => {
            if (varaInstance) {
                varaInstance.playAll();
            }
        }, totalDuration + 1000); // Add 1 second pause between loops
    }, totalDuration);
}

// Update color when user changes it
colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    if (varaInstance) {
        // Update the color of existing SVG paths
        const paths = varaContainer.querySelectorAll('path');
        paths.forEach(path => {
            path.setAttribute('stroke', currentColor);
        });
    }
});

// Update font size when user changes it
fontSizeSlider.addEventListener('input', (e) => {
    currentFontSize = parseInt(e.target.value);
    fontSizeValue.textContent = currentFontSize;
    
    // Regenerate with new size
    if (varaInstance && currentText) {
        generateHandwriting();
    }
});

// Update font when user changes it
fontSelector.addEventListener('change', (e) => {
    currentFont = e.target.value;
    
    // Regenerate with new font
    if (varaInstance && currentText) {
        generateHandwriting();
    }
});

// Download as PNG - captures complete text without animation
function downloadAsPNG() {
    const svg = varaContainer.querySelector('svg');
    if (!svg) {
        alert('Please generate handwriting first!');
        return;
    }

    // Get SVG dimensions
    const bbox = svg.getBBox();
    const padding = 40;
    const width = bbox.width + (padding * 2);
    const height = bbox.height + (padding * 2);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Clone and prepare SVG with current color and remove animation
    const svgClone = svg.cloneNode(true);
    const paths = svgClone.querySelectorAll('path');
    paths.forEach(path => {
        path.setAttribute('stroke', currentColor);
        // Remove animation attributes to show complete text
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
        path.style.animation = 'none';
        path.removeAttribute('stroke-dasharray');
        path.removeAttribute('stroke-dashoffset');
    });
    
    svgClone.setAttribute('width', width);
    svgClone.setAttribute('height', height);
    svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    // Load image and draw to canvas
    const img = new Image();
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        // Download PNG
        canvas.toBlob(function(blob) {
            const link = document.createElement('a');
            link.download = 'handwriting.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
        });
    };
    img.src = url;
}

// Download as SVG - captures complete text without animation
function downloadAsSVG() {
    const svg = varaContainer.querySelector('svg');
    if (!svg) {
        alert('Please generate handwriting first!');
        return;
    }

    // Clone SVG
    const svgClone = svg.cloneNode(true);
    
    // Update colors and remove all animation attributes
    const paths = svgClone.querySelectorAll('path');
    paths.forEach(path => {
        path.setAttribute('stroke', currentColor);
        // Remove animation to show complete text
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
        path.style.animation = 'none';
        path.removeAttribute('stroke-dasharray');
        path.removeAttribute('stroke-dashoffset');
    });
    
    // Get bounding box and add padding
    const bbox = svg.getBBox();
    const padding = 40;
    const width = bbox.width + (padding * 2);
    const height = bbox.height + (padding * 2);

    // Set proper dimensions
    svgClone.setAttribute('width', width);
    svgClone.setAttribute('height', height);
    svgClone.setAttribute('viewBox', `${bbox.x - padding} ${bbox.y - padding} ${width} ${height}`);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Add white background
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', '#ffffff');
    svgClone.insertBefore(rect, svgClone.firstChild);

    // Convert to string and download
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = 'handwriting.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

// Event Listeners
generateBtn.addEventListener('click', generateHandwriting);

textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateHandwriting();
    }
});

downloadPngBtn.addEventListener('click', downloadAsPNG);
downloadSvgBtn.addEventListener('click', downloadAsSVG);

// Clear button functionality
clearBtn.addEventListener('click', () => {
    textInput.value = '';
    varaContainer.innerHTML = '';
    controlsSection.style.display = 'none';
    downloadSection.style.display = 'none';
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    varaInstance = null;
    currentText = '';
});

// Info modal functionality
infoBtn.addEventListener('click', () => {
    infoModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.style.display = 'none';
    }
});

// Share button functionality
shareBtn.addEventListener('click', generateShareURL);

// Load from URL and auto-generate on page load
loadFromURL();
window.addEventListener('load', () => {
    // Set responsive font size if not overridden by URL
    if (!new URLSearchParams(window.location.search).has('size')) {
        currentFontSize = getDefaultFontSize();
        fontSizeSlider.value = currentFontSize;
        fontSizeValue.textContent = currentFontSize;
    }
    
    // Auto-generate handwriting on page load
    setTimeout(() => {
        generateHandwriting();
    }, 500);
});
