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
    generateRussellHelixSineWave();
    initializeModal();
});

// Load elements data
async function loadElements() {
    try {
        const response = await fetch('assets/data/elements.json');
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

// Helper function to get Russell color for element
function getRussellColor(element) {
    if (element.category === 'noble-gas') return '#FFD700';
    if (element.russell_pressure_side === 'generative') return '#e88';
    if (element.russell_pressure_side === 'radiative') return '#88e';
    if (element.russell_pressure_side === 'balance') return '#8e8';
    return '#ccc';
}

// Generate Walter Russell helical side view with sine wave
function generateRussellHelixSineWave() {
    const svg = document.getElementById('verticalSineWave');
    if (!svg) return;
    
    svg.innerHTML = ''; // Clear existing
    
    const width = 1200;
    const height = 3000;
    const centerX = 600;
    const amplitude = 250;
    const octaveHeight = 220;
    const startY = 100; // Start at top instead of bottom
    
    // Background
    const bg = createSVGElement('rect', {
        width: width,
        height: height,
        fill: 'white'
    });
    svg.appendChild(bg);
    
    // Center line
    const centerLine = createSVGElement('line', {
        x1: centerX, y1: 0, x2: centerX, y2: height,
        stroke: '#ddd', 'stroke-width': 1, 'stroke-dasharray': '5,5'
    });
    svg.appendChild(centerLine);
    
    // Build octave data from actual element data
    const octaveData = [];
    for (let octaveNum = 1; octaveNum <= 10; octaveNum++) {
        const octaveElements = elements.filter(e => e.russell_octave === octaveNum && e.category !== 'noble-gas');
        const nobleGas = elements.find(e => e.russell_octave === octaveNum && e.category === 'noble-gas');
        
        // Distribute elements along the wave (0 to 1)
        const elementPositions = octaveElements.map((el, idx) => ({
            sym: el.symbol,
            pos: idx / Math.max(octaveElements.length - 1, 1),
            element: el
        }));
        
        octaveData.push({
            num: octaveNum,
            elements: elementPositions,
            inert: nobleGas ? nobleGas.symbol : '?',
            direction: octaveNum % 2 === 1 ? -1 : 1 // Odd left, even right
        });
    }
    
    // Draw each octave
    octaveData.forEach((octave, idx) => {
        // Increase amplitude and height for each successive octave
        const currentAmplitude = amplitude + (idx * 20); // Gets wider
        const currentHeight = octaveHeight + (idx * 10); // Gets taller
        
        const baseY = startY + octaveData.slice(0, idx).reduce((sum, _, i) => 
            sum + octaveHeight + (i * 10), 0);
        const topY = baseY + currentHeight;
        const dir = octave.direction;
        
        // Draw inertia line
        const inertiaLine = createSVGElement('line', {
            x1: 50, y1: topY, x2: 750, y2: topY,
            stroke: '#999', 'stroke-width': 1, 'stroke-dasharray': '5,5'
        });
        svg.appendChild(inertiaLine);
        
        // Octave label
        const ordinal = idx === 0 ? 'ST' : idx === 1 ? 'ND' : idx === 2 ? 'RD' : 'TH';
        const label = createSVGElement('text', {
            x: 720, y: baseY - octaveHeight/2,
            'font-size': 11, 'font-weight': 'bold', 'text-anchor': 'start'
        });
        label.textContent = `${octave.num}${ordinal} OCTAVE`;
        svg.appendChild(label);
        
        // Draw wave path for this octave
        const pathSteps = 100;
        let pathD = '';
        for (let i = 0; i <= pathSteps; i++) {
            const t = i / pathSteps;
            const y = baseY + t * currentHeight;
            const angle = t * Math.PI;
            const x = centerX + dir * Math.sin(angle) * currentAmplitude;
            pathD += (i === 0 ? 'M' : 'L') + ` ${x},${y} `;
        }
        
        const wavePath = createSVGElement('path', {
            d: pathD,
            stroke: '#000',
            'stroke-width': 3,
            fill: 'none'
        });
        svg.appendChild(wavePath);
        
        // Place elements along the wave
        octave.elements.forEach(el => {
            const t = el.pos;
            const y = baseY + t * currentHeight;
            const angle = t * Math.PI;
            const x = centerX + dir * Math.sin(angle) * currentAmplitude;
            
            const elementData = el.element;
            
            // Element circle (clickable)
            const circle = createSVGElement('circle', {
                cx: x, cy: y, r: 12,
                fill: elementData ? getRussellColor(elementData) : '#ccc',
                stroke: '#000', 'stroke-width': 1.5,
                cursor: 'pointer',
                class: 'helix-element'
            });
            
            if (elementData) {
                circle.addEventListener('click', () => showElementModal(elementData));
                circle.addEventListener('mouseenter', function() {
                    this.setAttribute('r', 15);
                    this.setAttribute('stroke-width', 2.5);
                });
                circle.addEventListener('mouseleave', function() {
                    this.setAttribute('r', 12);
                    this.setAttribute('stroke-width', 1.5);
                });
            }
            
            svg.appendChild(circle);
            
            // Element symbol
            const text = createSVGElement('text', {
                x: x, y: y + 4,
                'font-size': 10, 'font-weight': 'bold',
                'text-anchor': 'middle', fill: '#000',
                'pointer-events': 'none'
            });
            text.textContent = el.sym;
            svg.appendChild(text);
        });
        
        // Noble gas at peak (clickable)
        const nobleData = elements.find(e => e.symbol === octave.inert);
        
        const nobleBox = createSVGElement('rect', {
            x: centerX - 50, y: topY + 5,
            width: 100, height: 30,
            fill: '#FFD700', stroke: '#000', 'stroke-width': 2,
            cursor: nobleData ? 'pointer' : 'default'
        });
        
        if (nobleData) {
            nobleBox.addEventListener('click', () => showElementModal(nobleData));
            nobleBox.addEventListener('mouseenter', function() {
                this.setAttribute('stroke-width', 3);
                this.setAttribute('fill', '#FFE44D');
            });
            nobleBox.addEventListener('mouseleave', function() {
                this.setAttribute('stroke-width', 2);
                this.setAttribute('fill', '#FFD700');
            });
        }
        
        svg.appendChild(nobleBox);
        
        const nobleText = createSVGElement('text', {
            x: centerX, y: topY + 22,
            'font-size': 14, 'font-weight': 'bold',
            'text-anchor': 'middle',
            'pointer-events': 'none'
        });
        nobleText.textContent = octave.inert;
        svg.appendChild(nobleText);
        
        const toneText = createSVGElement('text', {
            x: centerX, y: topY + 32,
            'font-size': 8, 'text-anchor': 'middle', fill: '#666',
            'pointer-events': 'none'
        });
        toneText.textContent = '4++';
        svg.appendChild(toneText);
    });
    
    // Side labels
    const leftLabel = createSVGElement('text', {
        x: 80, y: 1000,
        'font-size': 11, 'font-weight': 'bold',
        fill: '#c44', transform: 'rotate(-90 80 1000)'
    });
    leftLabel.textContent = 'GENERATIVE / MALE (+) / COMPRESSION';
    svg.appendChild(leftLabel);
    
    const rightLabel = createSVGElement('text', {
        x: 720, y: 1000,
        'font-size': 11, 'font-weight': 'bold',
        fill: '#44c', transform: 'rotate(90 720 1000)'
    });
    rightLabel.textContent = 'RADIATIVE / FEMALE (−) / EXPANSION';
    svg.appendChild(rightLabel);
    
    // Title at top
    const title = createSVGElement('text', {
        x: centerX, y: 30,
        'font-size': 14, 'font-weight': 'bold',
        'text-anchor': 'middle'
    });
    title.textContent = 'DIAGRAM SHOWING THE TEN OCTAVES OF INTEGRATING LIGHT';
    svg.appendChild(title);
}

// Generate Walter Russell helical side view
function generateRussellHelix() {
    const svg = document.getElementById('russellHelix');
    if (!svg) return;
    
    const width = 1000;
    const height = 1400;
    const centerX = width / 2;
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Add title at bottom
    const title = createSVGElement('text', {
        x: centerX,
        y: height - 20,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '14',
        'font-weight': 'bold',
        'font-family': 'serif'
    });
    title.textContent = 'DIAGRAM SHOWING THE TEN OCTAVES OF INTEGRATING LIGHT';
    svg.appendChild(title);
    
    // Define octave data based on Russell's original
    const octaves = [
        { num: 1, y: 1250, elements: ['H', 'He'], label: '1ST OCTAVE', inert: 'He' },
        { num: 2, y: 1150, elements: ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'], label: '2ND OCTAVE', inert: 'Ne' },
        { num: 3, y: 1050, elements: ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'], label: '3RD OCTAVE', inert: 'Ar' },
        { num: 4, y: 950, elements: ['K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr'], label: '4TH OCTAVE', inert: 'Kr' },
        { num: 5, y: 850, elements: ['Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe'], label: '5TH OCTAVE', inert: 'Xe' },
        { num: 6, y: 700, elements: ['Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn'], label: '6TH OCTAVE', inert: 'Rn' },
        { num: 7, y: 500, elements: ['Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'], label: '7TH OCTAVE', inert: 'Og' },
        { num: 8, y: 350, elements: [], label: '8TH OCTAVE', inert: 'Nt' },
        { num: 9, y: 200, elements: [], label: '9TH OCTAVE', inert: '' },
        { num: 10, y: 50, elements: [], label: '10TH OCTAVE', inert: '' }
    ];
    
    // Draw continuous helix path
    const helixPath = createContinuousHelixPath(octaves, centerX, width);
    const mainPath = createSVGElement('path', {
        d: helixPath,
        fill: 'none',
        stroke: '#000',
        'stroke-width': 3,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
    });
    svg.appendChild(mainPath);
    
    // Add shadow for 3D effect
    const shadowPath = createSVGElement('path', {
        d: helixPath,
        fill: 'none',
        stroke: '#999',
        'stroke-width': 5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        opacity: 0.3,
        transform: 'translate(2, 2)'
    });
    svg.insertBefore(shadowPath, mainPath);
    
    // Draw octave annotations and elements
    octaves.forEach((octave, index) => {
        drawHelixOctaveAnnotations(svg, octave, centerX, width, index);
    });
    
    // Add inertia lines
    octaves.forEach(octave => {
        const line = createSVGElement('line', {
            x1: 50,
            x2: width - 50,
            y1: octave.y + 50,
            y2: octave.y + 50,
            stroke: '#666',
            'stroke-width': 1,
            'stroke-dasharray': '5,5'
        });
        svg.appendChild(line);
        
        // Inertia line label
        const label = createSVGElement('text', {
            x: width - 100,
            y: octave.y + 45,
            'text-anchor': 'end',
            fill: '#666',
            'font-size': '10',
            'font-style': 'italic'
        });
        label.textContent = 'INERTIA LINE';
        svg.appendChild(label);
    });
    
    // Add central axis
    const axis = createSVGElement('line', {
        x1: centerX,
        x2: centerX,
        y1: 30,
        y2: height - 80,
        stroke: '#999',
        'stroke-width': 2,
        'stroke-dasharray': '10,5'
    });
    svg.appendChild(axis);
    
    // Add "THE END AND THE BEGINNING" at bottom
    const endBegin = createSVGElement('text', {
        x: centerX,
        y: height - 50,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '12',
        'font-weight': 'bold'
    });
    endBegin.textContent = 'THE END AND THE BEGINNING';
    svg.appendChild(endBegin);
    
    // Add copyright
    const copyright = createSVGElement('text', {
        x: 50,
        y: height - 10,
        'text-anchor': 'start',
        fill: '#666',
        'font-size': '10'
    });
    copyright.textContent = '© Walter Russell 1926';
    svg.appendChild(copyright);
    
    // Add inset diagram for first three octaves (enlarged view)
    addInsetDiagram(svg, octaves.slice(0, 3));
    
    // Add annotations
    addHelixAnnotations(svg, width, height);
}

// Add inset diagram showing first octaves enlarged
function addInsetDiagram(svg, firstOctaves) {
    const insetX = 80;
    const insetY = 1100;
    const insetWidth = 200;
    const insetHeight = 250;
    
    // Inset background
    const insetBg = createSVGElement('rect', {
        x: insetX - 10,
        y: insetY - 10,
        width: insetWidth + 20,
        height: insetHeight + 20,
        fill: '#fff',
        stroke: '#000',
        'stroke-width': 2
    });
    svg.appendChild(insetBg);
    
    // Inset title
    const insetTitle = createSVGElement('text', {
        x: insetX + insetWidth/2,
        y: insetY + 15,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '11',
        'font-weight': 'bold'
    });
    insetTitle.textContent = 'ENLARGED DIAGRAM OF';
    svg.appendChild(insetTitle);
    
    const insetTitle2 = createSVGElement('text', {
        x: insetX + insetWidth/2,
        y: insetY + 28,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '11',
        'font-weight': 'bold'
    });
    insetTitle2.textContent = 'THE FIRST THREE';
    svg.appendChild(insetTitle2);
    
    const insetTitle3 = createSVGElement('text', {
        x: insetX + insetWidth/2,
        y: insetY + 41,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '11',
        'font-weight': 'bold'
    });
    insetTitle3.textContent = 'OCTAVES WITHIN THE OTHER';
    svg.appendChild(insetTitle3);
    
    // Draw simplified first octaves
    firstOctaves.forEach((octave, i) => {
        const y = insetY + 80 + (i * 60);
        const centerX = insetX + insetWidth/2;
        
        // Simple wave
        const path = createSVGElement('path', {
            d: createHelixWavePath(centerX, y, 140, 40),
            fill: 'none',
            stroke: '#000',
            'stroke-width': 1.5
        });
        svg.appendChild(path);
        
        // Inert gas
        if (octave.inert) {
            const inertCircle = createSVGElement('circle', {
                cx: centerX,
                cy: y - 20,
                r: 12,
                fill: '#FFD700',
                stroke: '#000',
                'stroke-width': 1.5
            });
            svg.appendChild(inertCircle);
            
            const inertText = createSVGElement('text', {
                x: centerX,
                y: y - 16,
                'text-anchor': 'middle',
                fill: '#000',
                'font-size': '9',
                'font-weight': 'bold'
            });
            inertText.textContent = octave.inert;
            svg.appendChild(inertText);
        }
        
        // Octave label
        const label = createSVGElement('text', {
            x: insetX + insetWidth + 5,
            y: y + 3,
            'text-anchor': 'start',
            fill: '#000',
            'font-size': '9',
            'font-weight': 'bold'
        });
        label.textContent = octave.label;
        svg.appendChild(label);
    });
}

// Add annotations to helix
function addHelixAnnotations(svg, width, height) {
    // Add "GENERATIVE" label on left
    const genLabel = createSVGElement('text', {
        x: 150,
        y: 700,
        'text-anchor': 'middle',
        fill: '#b91c1c',
        'font-size': '12',
        'font-weight': 'bold',
        transform: 'rotate(-90 150 700)'
    });
    genLabel.textContent = 'GENERATIVE / MALE / + / COMPRESSION';
    svg.appendChild(genLabel);
    
    // Add "RADIATIVE" label on right
    const radLabel = createSVGElement('text', {
        x: width - 150,
        y: 700,
        'text-anchor': 'middle',
        fill: '#1e40af',
        'font-size': '12',
        'font-weight': 'bold',
        transform: `rotate(90 ${width - 150} 700)`
    });
    radLabel.textContent = 'RADIATIVE / FEMALE / - / EXPANSION';
    svg.appendChild(radLabel);
    
    // Add note about Carbon at center
    const carbonNote = createSVGElement('text', {
        x: width - 200,
        y: 850,
        'text-anchor': 'start',
        fill: '#666',
        'font-size': '10',
        'font-style': 'italic'
    });
    carbonNote.textContent = 'Carbon at perfect';
    svg.appendChild(carbonNote);
    
    const carbonNote2 = createSVGElement('text', {
        x: width - 200,
        y: 863,
        'text-anchor': 'start',
        fill: '#666',
        'font-size': '10',
        'font-style': 'italic'
    });
    carbonNote2.textContent = 'balance point';
    svg.appendChild(carbonNote2);
    
    // Add stars for undiscovered elements
    const starNote = createSVGElement('text', {
        x: 50,
        y: 250,
        'text-anchor': 'start',
        fill: '#666',
        'font-size': '9'
    });
    starNote.textContent = '★ ★ ★ INDICATE MASTER-TONES';
    svg.appendChild(starNote);
    
    const starNote2 = createSVGElement('text', {
        x: 50,
        y: 262,
        'text-anchor': 'start',
        fill: '#666',
        'font-size': '9'
    });
    starNote2.textContent = 'STARS INDICATE UNDISCOVERED ELEMENTS';
    svg.appendChild(starNote2);
}

// Create continuous helix path through all octaves
function createContinuousHelixPath(octaves, centerX, width) {
    let path = '';
    const waveWidth = 350;
    const pointsPerWave = 60;
    
    octaves.forEach((octave, octaveIndex) => {
        const y = octave.y;
        
        // Determine if this octave goes left or right
        // Even octaves: start left, arc to center
        // Odd octaves: start right, arc to center
        const isEven = octaveIndex % 2 === 0;
        
        for (let i = 0; i <= pointsPerWave; i++) {
            const t = i / pointsPerWave; // 0 to 1
            
            // Create smooth arc using sine wave
            // For even octaves: go from left (-1) to center (0)
            // For odd octaves: go from right (+1) to center (0)
            let x, yOffset;
            
            if (isEven) {
                // Left to center arc
                x = centerX - waveWidth * (1 - t);
                yOffset = Math.sin(t * Math.PI) * 40; // Arc height
            } else {
                // Right to center arc (coming from previous octave)
                x = centerX + waveWidth * (1 - t);
                yOffset = Math.sin(t * Math.PI) * 40; // Arc height
            }
            
            const yPos = y - yOffset;
            
            if (octaveIndex === 0 && i === 0) {
                path += `M ${x} ${yPos}`;
            } else {
                path += ` L ${x} ${yPos}`;
            }
        }
    });
    
    return path;
}

// Draw octave annotations (labels, elements, etc.)
function drawHelixOctaveAnnotations(svg, octave, centerX, width, index) {
    const y = octave.y;
    const waveHeight = 80;
    const waveWidth = 400;
    
    // Add octave label on right
    const labelBox = createSVGElement('rect', {
        x: width - 180,
        y: y - 15,
        width: 120,
        height: 30,
        fill: 'none',
        stroke: '#000',
        'stroke-width': 2
    });
    svg.appendChild(labelBox);
    
    const label = createSVGElement('text', {
        x: width - 120,
        y: y + 5,
        'text-anchor': 'middle',
        fill: '#000',
        'font-size': '14',
        'font-weight': 'bold'
    });
    label.textContent = octave.label;
    svg.appendChild(label);
    
    // Add inert gas at peak (center of wave) - the 4++ keynote
    if (octave.inert) {
        // Position at the peak of the arc (where sin(0.5π) = 1)
        const peakY = y - 40; // At the highest point of the arc
        
        const inertBox = createSVGElement('rect', {
            x: centerX - 50,
            y: peakY - 40,
            width: 100,
            height: 28,
            fill: '#FFD700',
            stroke: '#000',
            'stroke-width': 3,
            rx: 4
        });
        svg.appendChild(inertBox);
        
        const inertText = createSVGElement('text', {
            x: centerX,
            y: peakY - 18,
            'text-anchor': 'middle',
            fill: '#000',
            'font-size': '14',
            'font-weight': 'bold',
            'font-family': 'serif'
        });
        inertText.textContent = octave.inert.toUpperCase();
        svg.appendChild(inertText);
        
        // Add 4++ marker
        const keynote = createSVGElement('text', {
            x: centerX,
            y: peakY - 48,
            'text-anchor': 'middle',
            fill: '#666',
            'font-size': '10',
            'font-weight': 'bold'
        });
        keynote.textContent = '4++';
        svg.appendChild(keynote);
    }
    
    // Add elements along the continuous helix path
    if (octave.elements.length > 0) {
        // Alternate direction for each octave
        const isEven = index % 2 === 0;
        
        octave.elements.forEach((el, i) => {
            const progress = i / octave.elements.length; // 0 to 1
            
            // Calculate position on arc
            let x, yOffset;
            
            if (isEven) {
                // Left to center arc
                x = centerX - waveWidth * (1 - progress);
                yOffset = Math.sin(progress * Math.PI) * 40;
            } else {
                // Right to center arc
                x = centerX + waveWidth * (1 - progress);
                yOffset = Math.sin(progress * Math.PI) * 40;
            }
            
            const yPos = y - yOffset;
            
            // Determine if on left (generative) or right (radiative) side
            // Elements before the peak are generative, after are radiative
            const isLeft = isEven ? (progress < 0.5) : (progress >= 0.5);
            const color = isLeft ? '#b91c1c' : '#1e40af';
            const anchor = isLeft ? 'end' : 'start';
            const offset = isLeft ? -10 : 10;
            
            const elementData = elements.find(e => e.symbol === el);
            if (elementData) {
                const text = createSVGElement('text', {
                    x: x + offset,
                    y: yPos + 4,
                    'text-anchor': anchor,
                    fill: color,
                    'font-size': '9',
                    'font-weight': 'bold',
                    'font-family': 'sans-serif',
                    style: 'cursor: pointer'
                });
                text.textContent = el.toUpperCase();
                text.addEventListener('click', () => showElementModal(elementData));
                svg.appendChild(text);
            }
        });
    }
    
    // Add tone markers along the helix
    const isEven = index % 2 === 0;
    const tonePositions = [
        { tone: '1+', pos: 0 },
        { tone: '2+', pos: 0.25 },
        { tone: '3+', pos: 0.4 },
        { tone: '4+', pos: 0.48 },
        { tone: '4++', pos: 0.5 },  // Peak
        { tone: '4-', pos: 0.52 },
        { tone: '3-', pos: 0.6 },
        { tone: '2-', pos: 0.75 },
        { tone: '1-', pos: 1 }
    ];
    
    tonePositions.forEach(({ tone, pos }) => {
        let x, yOffset;
        
        if (isEven) {
            x = centerX - waveWidth * (1 - pos);
            yOffset = Math.sin(pos * Math.PI) * 40;
        } else {
            x = centerX + waveWidth * (1 - pos);
            yOffset = Math.sin(pos * Math.PI) * 40;
        }
        
        const yPos = y - yOffset;
        
        const toneText = createSVGElement('text', {
            x: x,
            y: yPos + 22,
            'text-anchor': 'middle',
            fill: '#888',
            'font-size': '8',
            'font-family': 'monospace'
        });
        toneText.textContent = tone;
        svg.appendChild(toneText);
    });
}

// Create wave path for helix
function createHelixWavePath(centerX, y, width, height) {
    const startX = centerX - width/2;
    const endX = centerX + width/2;
    
    // Create elliptical wave using quadratic bezier curves
    let path = `M ${startX} ${y}`;
    
    // Rising part (left side)
    path += ` Q ${centerX - width/4} ${y - height/2}, ${centerX} ${y - height/2}`;
    
    // Falling part (right side)
    path += ` Q ${centerX + width/4} ${y - height/2}, ${endX} ${y}`;
    
    return path;
}

// Regenerate Russell spiral on theme change
const originalToggle = document.getElementById('themeToggle');
if (originalToggle) {
    originalToggle.addEventListener('click', () => {
        setTimeout(() => {
            generateRussellSpiral();
            generateRussellHelixSineWave();
        }, 100);
    });
}
