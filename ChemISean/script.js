// Global state
let elements = [];
let currentTheme = 'dark';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadElements();
    initializeTheme();
    initializeNavigation();
    generateClassicTable();
    generateRussellSpiral();
    initializeModal();
});

// Load elements data
async function loadElements() {
    try {
        const response = await fetch('elements.json');
        elements = await response.json();
        console.log(`Loaded ${elements.length} elements`);
    } catch (error) {
        console.error('Error loading elements:', error);
    }
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    document.body.setAttribute('data-theme', currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });
}

// Navigation between views
function initializeNavigation() {
    const classicBtn = document.getElementById('classicBtn');
    const russellBtn = document.getElementById('russellBtn');
    const classicView = document.getElementById('classicView');
    const russellView = document.getElementById('russellView');
    
    classicBtn.addEventListener('click', () => {
        classicBtn.classList.add('active');
        russellBtn.classList.remove('active');
        classicView.classList.add('active');
        russellView.classList.remove('active');
    });
    
    russellBtn.addEventListener('click', () => {
        russellBtn.classList.add('active');
        classicBtn.classList.remove('active');
        russellView.classList.add('active');
        classicView.classList.remove('active');
    });
}

// Generate classic periodic table
function generateClassicTable() {
    const table = document.getElementById('periodicTable');
    const lanthanides = document.getElementById('lanthanides');
    const actinides = document.getElementById('actinides');
    
    elements.forEach(element => {
        const elementDiv = createElementDiv(element);
        
        // Place lanthanides and actinides separately
        if (element.category === 'lanthanide') {
            lanthanides.appendChild(elementDiv);
        } else if (element.category === 'actinide') {
            actinides.appendChild(elementDiv);
        } else {
            // Position in main table
            elementDiv.style.gridColumn = element.col;
            elementDiv.style.gridRow = element.row;
            table.appendChild(elementDiv);
        }
    });
}

// Create element div for classic table
function createElementDiv(element) {
    const div = document.createElement('div');
    div.className = `element ${element.category}`;
    div.setAttribute('data-number', element.number);
    
    div.innerHTML = `
        <div class="atomic-number">${element.number}</div>
        <div class="symbol">${element.symbol}</div>
        <div class="name">${element.name}</div>
        <div class="mass">${element.mass}</div>
    `;
    
    div.addEventListener('click', () => showElementModal(element));
    
    return div;
}

// Generate Walter Russell spiral periodic table
function generateRussellSpiral() {
    const svg = document.getElementById('russellSpiral');
    const centerX = 600;
    const centerY = 600;
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Add background circle
    const bgCircle = createSVGElement('circle', {
        cx: centerX,
        cy: centerY,
        r: 550,
        fill: 'none',
        stroke: currentTheme === 'dark' ? '#2a2f4a' : '#e8ecf1',
        'stroke-width': 2
    });
    svg.appendChild(bgCircle);
    
    // Add center point (stillness)
    const centerPoint = createSVGElement('circle', {
        cx: centerX,
        cy: centerY,
        r: 8,
        fill: '#ffd700',
        stroke: '#fff',
        'stroke-width': 2
    });
    svg.appendChild(centerPoint);
    
    // Add center label
    const centerLabel = createSVGElement('text', {
        x: centerX,
        y: centerY - 15,
        'text-anchor': 'middle',
        fill: currentTheme === 'dark' ? '#e0e6ed' : '#1a1f3a',
        'font-size': '12',
        'font-weight': 'bold'
    });
    centerLabel.textContent = 'Zero Point';
    svg.appendChild(centerLabel);
    
    // Generate spiral path for elements
    elements.forEach((element, index) => {
        const position = calculateSpiralPosition(element, index, centerX, centerY);
        const elementGroup = createRussellElement(element, position);
        svg.appendChild(elementGroup);
    });
    
    // Add octave labels
    addOctaveLabels(svg, centerX, centerY);
}

// Calculate spiral position for Russell table
function calculateSpiralPosition(element, index, centerX, centerY) {
    // Spiral parameters
    const octave = element.russell_octave || 1;
    const baseRadius = 50;
    const radiusIncrement = 60;
    
    // Calculate radius based on octave
    const radius = baseRadius + (octave - 1) * radiusIncrement;
    
    // Calculate angle based on tone position
    let angleOffset = 0;
    const tone = element.russell_tone || '1+';
    
    // Map tones to angles (musical wave pattern)
    const toneAngles = {
        '1+': 0,
        '2+': 45,
        '3+': 90,
        '4+': 135,
        '4++': 180,  // Peak (noble gases)
        '4-': 225,
        '3-': 270,
        '2-': 315,
        '1-': 360,
        '0': 90  // Carbon at center/balance
    };
    
    angleOffset = toneAngles[tone] || (index * 15);
    
    // Add octave rotation
    const octaveRotation = (octave - 1) * 40;
    const totalAngle = (angleOffset + octaveRotation) * (Math.PI / 180);
    
    // Calculate position
    const x = centerX + radius * Math.cos(totalAngle);
    const y = centerY + radius * Math.sin(totalAngle);
    
    return { x, y, radius, angle: totalAngle };
}

// Create Russell element SVG group
function createRussellElement(element, position) {
    const group = createSVGElement('g', {
        class: 'russell-element',
        'data-number': element.number
    });
    
    // Determine color based on Russell classification
    let fillColor;
    if (element.russell_pressure_side === 'inert') {
        fillColor = '#ffd700';  // Gold for noble gases
    } else if (element.russell_pressure_side === 'generative') {
        fillColor = '#ff6b4a';  // Red-orange for generative
    } else if (element.russell_pressure_side === 'radiative') {
        fillColor = '#4a9eff';  // Blue for radiative
    } else if (element.russell_pressure_side === 'balance') {
        fillColor = '#ffffff';  // White for carbon (balance)
    } else {
        fillColor = '#a0a6b0';  // Default gray
    }
    
    // Create circle
    const circle = createSVGElement('circle', {
        cx: position.x,
        cy: position.y,
        r: 18,
        fill: fillColor,
        stroke: currentTheme === 'dark' ? '#1a1f3a' : '#ffffff',
        'stroke-width': 2
    });
    group.appendChild(circle);
    
    // Add element symbol
    const text = createSVGElement('text', {
        x: position.x,
        y: position.y + 5,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '14',
        'font-weight': 'bold',
        'pointer-events': 'none'
    });
    text.textContent = element.symbol;
    group.appendChild(text);
    
    // Add atomic number (smaller, above)
    const numberText = createSVGElement('text', {
        x: position.x,
        y: position.y - 22,
        'text-anchor': 'middle',
        fill: currentTheme === 'dark' ? '#a0a6b0' : '#5a5f7a',
        'font-size': '10',
        'pointer-events': 'none'
    });
    numberText.textContent = element.number;
    group.appendChild(numberText);
    
    // Add click handler
    group.style.cursor = 'pointer';
    group.addEventListener('click', () => showElementModal(element));
    
    return group;
}

// Add octave labels to Russell spiral
function addOctaveLabels(svg, centerX, centerY) {
    const octaves = [
        { num: 1, radius: 50, label: 'Octave 1 (H-He)' },
        { num: 2, radius: 110, label: 'Octave 2 (Li-Ne)' },
        { num: 3, radius: 170, label: 'Octave 3 (Na-Ar)' },
        { num: 4, radius: 230, label: 'Octave 4 (K-Kr)' },
        { num: 5, radius: 290, label: 'Octave 5 (Rb-Xe)' },
        { num: 6, radius: 350, label: 'Octave 6 (Cs-Rn)' },
        { num: 7, radius: 410, label: 'Octave 7 (Fr-Og)' }
    ];
    
    octaves.forEach(octave => {
        // Draw octave circle
        const circle = createSVGElement('circle', {
            cx: centerX,
            cy: centerY,
            r: octave.radius,
            fill: 'none',
            stroke: currentTheme === 'dark' ? '#3a3f5a' : '#d0d5dd',
            'stroke-width': 1,
            'stroke-dasharray': '5,5',
            opacity: 0.3
        });
        svg.insertBefore(circle, svg.firstChild);
    });
}

// Helper to create SVG elements
function createSVGElement(type, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    return element;
}

// Modal management
function initializeModal() {
    const modal = document.getElementById('elementModal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Show element modal
function showElementModal(element) {
    const modal = document.getElementById('elementModal');
    
    // Populate modal content
    document.getElementById('modalSymbol').textContent = element.symbol;
    document.getElementById('modalSymbol').style.background = getCategoryColor(element.category);
    document.getElementById('modalName').textContent = element.name;
    document.getElementById('modalNumber').textContent = `Atomic Number: ${element.number}`;
    document.getElementById('modalMass').textContent = element.mass;
    document.getElementById('modalCategory').textContent = formatCategory(element.category);
    document.getElementById('modalElectronConfig').textContent = element.electron_config;
    document.getElementById('modalDiscovery').textContent = element.discovery;
    document.getElementById('modalSummary').textContent = element.summary;
    
    // Russell-specific info
    document.getElementById('modalOctave').textContent = element.russell_octave || 'N/A';
    document.getElementById('modalTone').textContent = element.russell_tone || 'N/A';
    document.getElementById('modalPressure').textContent = formatPressureSide(element.russell_pressure_side);
    document.getElementById('modalPosition').textContent = formatPosition(element.russell_position);
    
    // Wikipedia link
    document.getElementById('modalWiki').href = element.wikipedia;
    
    // Show modal
    modal.classList.add('active');
}

// Helper functions
function getCategoryColor(category) {
    const colors = {
        'alkali-metal': '#ff6b6b',
        'alkaline-earth': '#ffd93d',
        'transition-metal': '#ffa07a',
        'post-transition': '#95e1d3',
        'metalloid': '#a8e6cf',
        'nonmetal': '#c7ceea',
        'halogen': '#ff9ff3',
        'noble-gas': '#dda0dd',
        'lanthanide': '#ffccbc',
        'actinide': '#f8bbd0'
    };
    return colors[category] || '#a0a6b0';
}

function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatPressureSide(side) {
    if (!side) return 'N/A';
    return side.charAt(0).toUpperCase() + side.slice(1);
}

function formatPosition(position) {
    if (!position) return 'N/A';
    return position.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Regenerate Russell spiral on theme change
const originalToggle = document.getElementById('themeToggle');
if (originalToggle) {
    originalToggle.addEventListener('click', () => {
        setTimeout(() => {
            generateRussellSpiral();
        }, 100);
    });
}
