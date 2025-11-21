// Global state
let elements = [];
let currentTheme = 'dark';

// Filter state
let activeFilters = {
    categories: [], // Array for multiple categories
    type: 'all',
    block: 'all',
    minAtomic: null,
    maxAtomic: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadElements();
    initializeTheme();
    initializeNavigation();
    initializeFilters();
    generateClassicTable();
    generateRussellSpiral();
    generateRussellHelixSineWave();
    initializeModal();
    initializeScreensaver();
    initializeSavedElements();
    initializeSpacebarSave();
    initializeQuizMode();
    initializeTrends();
    initializeComparison();
});

// Load elements data
async function loadElements() {
    try {
        const [elementsResponse, propertiesResponse] = await Promise.all([
            fetch('assets/data/elements.json'),
            fetch('assets/data/chemical-properties.json')
        ]);
        
        elements = await elementsResponse.json();
        const chemicalProperties = await propertiesResponse.json();
        
        // Merge chemical properties into elements
        elements = elements.map(element => ({
            ...element,
            ...chemicalProperties[element.number.toString()]
        }));
        
        console.log(`Loaded ${elements.length} elements with chemical properties`);
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

// Initialize filters
function initializeFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const blockFilter = document.getElementById('blockFilter');
    const minAtomic = document.getElementById('minAtomic');
    const maxAtomic = document.getElementById('maxAtomic');
    const resetBtn = document.getElementById('resetFilters');
    
    typeFilter.addEventListener('change', (e) => {
        activeFilters.type = e.target.value;
        applyFilters();
    });
    
    blockFilter.addEventListener('change', (e) => {
        activeFilters.block = e.target.value;
        applyFilters();
    });
    
    minAtomic.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        activeFilters.minAtomic = isNaN(val) ? null : val;
        applyFilters();
    });
    
    maxAtomic.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        activeFilters.maxAtomic = isNaN(val) ? null : val;
        applyFilters();
    });
    
    resetBtn.addEventListener('click', () => {
        activeFilters = { categories: [], type: 'all', block: 'all', minAtomic: null, maxAtomic: null };
        typeFilter.value = 'all';
        blockFilter.value = 'all';
        minAtomic.value = '';
        maxAtomic.value = '';
        updateLegendHighlight();
        applyFilters();
    });
    
    // Make legend items clickable for multi-select
    const legendItems = document.querySelectorAll('.legend-item.clickable');
    legendItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            
            // Toggle category in array
            const index = activeFilters.categories.indexOf(category);
            if (index > -1) {
                // Remove if already selected
                activeFilters.categories.splice(index, 1);
            } else {
                // Add if not selected
                activeFilters.categories.push(category);
            }
            
            updateLegendHighlight();
            applyFilters();
        });
    });
    
    updateFilterStats();
}

// Update legend item highlighting
function updateLegendHighlight() {
    const legendItems = document.querySelectorAll('.legend-item.clickable');
    legendItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (activeFilters.categories.includes(category)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Apply filters to elements
function applyFilters() {
    const allElements = document.querySelectorAll('.element');
    let visibleCount = 0;
    
    allElements.forEach(elementDiv => {
        const elementNumber = parseInt(elementDiv.getAttribute('data-number'));
        const element = elements.find(e => e.number === elementNumber);
        
        if (!element) return;
        
        let visible = true;
        
        // Category filter (multiple selection)
        if (activeFilters.categories.length > 0) {
            if (!activeFilters.categories.includes(element.category)) {
                visible = false;
            }
        }
        
        // Type filter (metal/nonmetal/metalloid)
        if (activeFilters.type !== 'all') {
            const elementType = getElementType(element);
            if (elementType !== activeFilters.type) {
                visible = false;
            }
        }
        
        // Block filter
        if (activeFilters.block !== 'all' && element.block !== activeFilters.block) {
            visible = false;
        }
        
        // Atomic number range filter
        if (activeFilters.minAtomic !== null && element.number < activeFilters.minAtomic) {
            visible = false;
        }
        if (activeFilters.maxAtomic !== null && element.number > activeFilters.maxAtomic) {
            visible = false;
        }
        
        if (visible) {
            elementDiv.classList.remove('filtered-out');
            visibleCount++;
        } else {
            elementDiv.classList.add('filtered-out');
        }
    });
    
    updateFilterStats(visibleCount);
}

// Get element type (metal, nonmetal, metalloid)
function getElementType(element) {
    if (element.category === 'metalloid') return 'metalloid';
    
    const nonmetals = ['nonmetal', 'halogen', 'noble-gas'];
    if (nonmetals.includes(element.category)) return 'nonmetal';
    
    return 'metal';
}

// Update filter statistics
function updateFilterStats(visibleCount = null) {
    const statsDiv = document.getElementById('filterStats');
    
    if (visibleCount === null) {
        visibleCount = elements.length;
    }
    
    const totalCount = elements.length;
    statsDiv.textContent = `Showing ${visibleCount} of ${totalCount} elements`;
    
    if (visibleCount < totalCount) {
        statsDiv.style.color = 'var(--accent)';
        statsDiv.style.fontWeight = 'bold';
    } else {
        statsDiv.style.color = 'var(--text-secondary)';
        statsDiv.style.fontWeight = 'normal';
    }
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
    
    div.addEventListener('click', (e) => {
        if (quizModeActive) {
            handleQuizClick(element, div);
        } else {
            showElementModal(element);
        }
    });
    
    // Track hover for spacebar save
    div.addEventListener('mouseenter', () => {
        hoveredElement = element;
    });
    
    div.addEventListener('mouseleave', () => {
        hoveredElement = null;
    });
    
    return div;
}

// Generate Walter Russell spiral periodic table
function generateRussellSpiral() {
    const svg = document.getElementById('russellSpiral');
    const centerX = 700;
    const centerY = 700;
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Octave colors (different shades)
    const octaveColors = [
        '#FFE5E5', // Octave 1 - light red
        '#FFE5CC', // Octave 2 - light orange
        '#FFFFE5', // Octave 3 - light yellow
        '#E5FFE5', // Octave 4 - light green
        '#E5F5FF', // Octave 5 - light blue
        '#E5E5FF', // Octave 6 - light indigo
        '#F5E5FF', // Octave 7 - light violet
        '#FFE5F5', // Octave 8 - light pink
        '#F0F0F0', // Octave 9 - light gray
        '#E8E8E8'  // Octave 10 - lighter gray
    ];
    
    // Draw octave background rings
    for (let octave = 10; octave >= 1; octave--) {
        const radius = 50 + (octave - 1) * 60;
        const ring = createSVGElement('circle', {
            cx: centerX,
            cy: centerY,
            r: radius,
            fill: octaveColors[octave - 1],
            opacity: 0.3,
            stroke: '#999',
            'stroke-width': 1,
            'stroke-dasharray': '5,5'
        });
        svg.appendChild(ring);
    }
    
    // Sort elements by atomic number to ensure correct spiral order
    const sortedElements = [...elements].sort((a, b) => a.number - b.number);
    
    // Calculate positions for all elements in atomic number order
    const positions = [];
    sortedElements.forEach((element, index) => {
        const position = calculateSpiralPosition(element, index, centerX, centerY, sortedElements);
        positions.push({ element, position });
    });
    
    // Draw connecting spiral line
    const spiralPath = createSVGElement('path', {
        d: positions.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.position.x},${p.position.y}`
        ).join(' '),
        stroke: '#666',
        'stroke-width': 2,
        fill: 'none',
        opacity: 0.5
    });
    svg.appendChild(spiralPath);
    
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
    
    // Draw elements on top of the line
    positions.forEach(({ element, position }) => {
        const elementGroup = createRussellElement(element, position);
        svg.appendChild(elementGroup);
    });
    
    // Add octave labels
    addOctaveLabels(svg, centerX, centerY);
}

// Calculate spiral position for Russell table
function calculateSpiralPosition(element, index, centerX, centerY, allElements) {
    // Non-linear spiral: MUCH more space for first 2 octaves, then gradually tighten
    const baseRadius = 60;
    
    // Calculate cumulative radius with variable growth
    let radius = baseRadius;
    for (let i = 0; i < index; i++) {
        let growth;
        if (i < 10) {
            // First 2 octaves: HUGE spacing (10 elements)
            growth = 10 - (i * 0.3); // Start at 10, decrease to 7
        } else if (i < 20) {
            // Octave 3: Medium spacing
            growth = 7 - ((i - 10) * 0.2); // 7 down to 5
        } else if (i < 40) {
            // Octaves 4-5: Moderate spacing
            growth = 5 - ((i - 20) * 0.05); // 5 down to 4
        } else {
            // Later octaves: Tight spacing
            growth = 4 - ((i - 40) * 0.01); // 4 down to ~3.2
        }
        radius += growth;
    }
    
    // Calculate cumulative angle with variable turn rate
    let totalAngle = 0;
    for (let i = 0; i < index; i++) {
        let turn;
        if (i < 10) {
            // First 2 octaves: Wide turns
            turn = 0.35 - (i * 0.01); // Start at 0.35, decrease
        } else if (i < 20) {
            // Octave 3: Medium turns
            turn = 0.25 - ((i - 10) * 0.005);
        } else {
            // Later octaves: Tighter turns
            turn = 0.20 - ((i - 20) * 0.001);
        }
        totalAngle += turn;
    }
    
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
    
    // Add hover and click handlers
    group.style.cursor = 'pointer';
    group.style.transition = 'transform 0.2s ease';
    
    group.addEventListener('mouseenter', function() {
        // Use transform instead of changing radius to avoid position shift
        this.style.transform = 'scale(1.2)';
        this.style.transformOrigin = `${position.x}px ${position.y}px`;
        circle.setAttribute('stroke-width', 3);
    });
    
    group.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        circle.setAttribute('stroke-width', 2);
    });
    
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
    
    // Chemical properties
    document.getElementById('modalElectronegativity').textContent = element.electronegativity !== null ? element.electronegativity : 'N/A';
    document.getElementById('modalIonization').textContent = element.ionization_energy !== null ? element.ionization_energy : 'N/A';
    document.getElementById('modalRadius').textContent = element.atomic_radius !== null ? element.atomic_radius : 'N/A';
    document.getElementById('modalOxidation').textContent = element.oxidation_states ? element.oxidation_states.join(', ') : 'N/A';
    
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

// Helper function to draw an element on the helix
function drawHelixElement(svg, x, y, elementData) {
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
    
    const text = createSVGElement('text', {
        x: x, y: y + 4,
        'font-size': 10, 'font-weight': 'bold',
        'text-anchor': 'middle', fill: '#000',
        'pointer-events': 'none'
    });
    text.textContent = elementData ? elementData.symbol : '?';
    svg.appendChild(text);
}

// Generate Walter Russell helical side view with sine wave
function generateRussellHelixSineWave() {
    const svg = document.getElementById('verticalSineWave');
    if (!svg) return;
    
    svg.innerHTML = ''; // Clear existing
    
    const width = 1400;
    const height = 3500;
    const centerX = 700;
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
    
    // Helper function to calculate height for an octave
    const getOctaveHeight = (octaveIdx) => {
        if (octaveIdx < 3) {
            return octaveHeight + (octaveIdx * 10);
        } else if (octaveIdx < 5) {
            return octaveHeight + (octaveIdx * 12);
        } else if (octaveIdx < 7) {
            return octaveHeight + (octaveIdx * 20);
        } else {
            return octaveHeight + (octaveIdx * 15);
        }
    };
    
    // Draw each octave
    octaveData.forEach((octave, idx) => {
        // Variable amplitude: each octave progressively larger
        let currentAmplitude;
        
        if (idx < 3) {
            // First 3 octaves: smaller amplitude
            currentAmplitude = 150 + (idx * 15);
        } else if (idx === 3) {
            // Octave 4: start increasing
            currentAmplitude = 220;
        } else if (idx === 4) {
            // Octave 5: larger
            currentAmplitude = 270;
        } else if (idx === 5) {
            // Octave 6: much larger for lanthanides
            currentAmplitude = 340;
        } else if (idx === 6) {
            // Octave 7: largest for actinides
            currentAmplitude = 430;
        } else {
            // Octaves 8+: very large
            currentAmplitude = 520 + ((idx - 7) * 40);
        }
        
        const currentHeight = getOctaveHeight(idx);
        
        // Calculate baseY by summing all previous octave heights
        const baseY = startY + octaveData.slice(0, idx).reduce((sum, _, i) => 
            sum + getOctaveHeight(i), 0);
        const topY = baseY + currentHeight;
        const dir = octave.direction;
        
        // Draw inertia line (scaled to canvas width)
        const inertiaLine = createSVGElement('line', {
            x1: 50, y1: topY, x2: width - 50, y2: topY,
            stroke: '#999', 'stroke-width': 1, 'stroke-dasharray': '5,5'
        });
        svg.appendChild(inertiaLine);
        
        // Octave label (scaled to canvas width)
        const ordinal = idx === 0 ? 'ST' : idx === 1 ? 'ND' : idx === 2 ? 'RD' : 'TH';
        const label = createSVGElement('text', {
            x: width - 180, y: baseY + currentHeight/2,
            'font-size': 11, 'font-weight': 'bold', 'text-anchor': 'start'
        });
        label.textContent = `${octave.num}${ordinal} OCTAVE`;
        svg.appendChild(label);
        
        // For octaves 6 and 7, draw TWO sine waves to separate lanthanides/actinides
        const isDoubleWave = (idx === 5 || idx === 6); // Octaves 6 and 7
        
        if (isDoubleWave) {
            // Split THIS octave's elements into two groups
            // If an element doesn't have classification, distribute by position
            const allElements = octave.elements;
            const midpoint = Math.floor(allElements.length / 2);
            
            const generativeElements = allElements.filter((el, idx) => 
                el.element && (el.element.russell_pressure_side === 'generative' || 
                (!el.element.russell_pressure_side && idx < midpoint)));
            const radiativeElements = allElements.filter((el, idx) => 
                el.element && (el.element.russell_pressure_side === 'radiative' || 
                (!el.element.russell_pressure_side && idx >= midpoint)));
            
            const pathSteps = 100;
            
            // For octave 7, swap the wave directions to maintain visual flow
            const dir1 = (idx === 6) ? -dir : dir; // Octave 7 gets inverted
            const dir2 = (idx === 6) ? dir : -dir; // Opposite of dir1
            
            // No gap - waves connect directly
            const wave1Height = currentHeight / 2;
            const wave2Height = currentHeight / 2;
            
            // Draw first wave (top portion) for generative elements
            // Ends at center to transition to gap
            let pathD1 = '';
            for (let i = 0; i <= pathSteps; i++) {
                const t = i / pathSteps;
                const y = baseY + t * wave1Height;
                const angle = t * Math.PI;
                const x = centerX + dir1 * Math.sin(angle) * currentAmplitude;
                pathD1 += (i === 0 ? 'M' : 'L') + ` ${x},${y} `;
            }
            // Connect to center at end of first wave
            pathD1 += ` L ${centerX},${baseY + wave1Height}`;
            
            const wavePath1 = createSVGElement('path', {
                d: pathD1,
                stroke: '#c44',
                'stroke-width': 2,
                fill: 'none'
            });
            svg.appendChild(wavePath1);
            
            // Draw second wave (bottom portion) for radiative elements
            // Starts from center and curves out
            let pathD2 = `M ${centerX},${baseY + wave1Height} `;
            for (let i = 1; i <= pathSteps; i++) {
                const t = i / pathSteps;
                const y = baseY + wave1Height + t * wave2Height;
                const angle = t * Math.PI;
                const x = centerX + dir2 * Math.sin(angle) * currentAmplitude;
                pathD2 += `L ${x},${y} `;
            }
            // End at center
            pathD2 += `L ${centerX},${baseY + currentHeight}`;
            
            const wavePath2 = createSVGElement('path', {
                d: pathD2,
                stroke: '#44c',
                'stroke-width': 2,
                fill: 'none'
            });
            svg.appendChild(wavePath2);
            
            // Add explicit connecting line to next octave if this is octave 6
            if (idx === 5) {
                const nextOctaveBaseY = baseY + currentHeight;
                const connectLine = createSVGElement('line', {
                    x1: centerX,
                    y1: baseY + currentHeight,
                    x2: centerX,
                    y2: nextOctaveBaseY + 1,
                    stroke: '#000',
                    'stroke-width': 3
                });
                svg.appendChild(connectLine);
            }
            
            // Place generative elements on first wave - use full wave length
            generativeElements.forEach((el, elIdx) => {
                // Distribute across 95% of wave (small gap at end only)
                const linearT = (elIdx / Math.max(generativeElements.length, 1)) * 0.95;
                // Gentle easing to compensate for sine wave compression near peak
                const t = linearT * (1 + 0.15 * linearT);
                const clampedT = Math.min(t, 0.95);
                
                const y = baseY + clampedT * wave1Height;
                const angle = clampedT * Math.PI;
                const x = centerX + dir1 * Math.sin(angle) * currentAmplitude;
                const elementData = el.element;
                
                drawHelixElement(svg, x, y, elementData);
            });
            
            // Place radiative elements on second wave - use full wave length
            radiativeElements.forEach((el, elIdx) => {
                // Distribute across 95% of wave (small gap at end only)
                const linearT = (elIdx / Math.max(radiativeElements.length, 1)) * 0.95;
                // Gentle easing to compensate for sine wave compression near peak
                const t = linearT * (1 + 0.15 * linearT);
                const clampedT = Math.min(t, 0.95);
                
                const y = baseY + wave1Height + clampedT * wave2Height;
                const angle = clampedT * Math.PI;
                const x = centerX + dir2 * Math.sin(angle) * currentAmplitude;
                const elementData = el.element;
                
                drawHelixElement(svg, x, y, elementData);
            });
            
        } else {
            // Normal single wave for other octaves
            const pathSteps = 100;
            let pathD = '';
            
            // If this is octave 7 (idx=6) coming after octave 6 (idx=5), ensure connection
            if (idx === 6) {
                // Explicitly start from where octave 6 ended
                pathD = `M ${centerX},${baseY} `;
            } else {
                pathD = '';
            }
            
            for (let i = 0; i <= pathSteps; i++) {
                const t = i / pathSteps;
                const y = baseY + t * currentHeight;
                const angle = t * Math.PI;
                const x = centerX + dir * Math.sin(angle) * currentAmplitude;
                
                if (i === 0 && pathD === '') {
                    pathD += `M ${x},${y} `;
                } else {
                    pathD += `L ${x},${y} `;
                }
            }
            
            const wavePath = createSVGElement('path', {
                d: pathD,
                stroke: '#000',
                'stroke-width': 3,
                fill: 'none'
            });
            svg.appendChild(wavePath);
            
            // Place elements along the wave with arc-length compensation
            octave.elements.forEach(el => {
                let t = el.pos;
                // Gentle easing to compensate for sine wave compression near peak
                t = t * (1 + 0.15 * t);
                if (t > 0.95) return;
                
                const y = baseY + t * currentHeight;
                const angle = t * Math.PI;
                const x = centerX + dir * Math.sin(angle) * currentAmplitude;
                const elementData = el.element;
                
                drawHelixElement(svg, x, y, elementData);
            });
        }
        
        // Noble gas at END of octave (at the bottom/completion point)
        // This is where the octave completes and returns to inertia
        const nobleData = elements.find(e => e.symbol === octave.inert);
        const nobleY = topY + 5; // At the end of the octave (bottom)
        
        const nobleBox = createSVGElement('rect', {
            x: centerX - 50, y: nobleY,
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
            x: centerX, y: nobleY + 17,
            'font-size': 14, 'font-weight': 'bold',
            'text-anchor': 'middle',
            'pointer-events': 'none'
        });
        nobleText.textContent = octave.inert;
        svg.appendChild(nobleText);
        
        const toneText = createSVGElement('text', {
            x: centerX, y: nobleY + 27,
            'font-size': 8, 'text-anchor': 'middle', fill: '#666',
            'pointer-events': 'none'
        });
        toneText.textContent = '4++';
        svg.appendChild(toneText);
    });
    
    // Side labels (scaled to canvas size)
    const leftLabel = createSVGElement('text', {
        x: 80, y: height / 2,
        'font-size': 11, 'font-weight': 'bold',
        fill: '#c44', transform: `rotate(-90 80 ${height / 2})`
    });
    leftLabel.textContent = 'GENERATIVE / MALE (+) / COMPRESSION';
    svg.appendChild(leftLabel);
    
    const rightLabel = createSVGElement('text', {
        x: width - 80, y: height / 2,
        'font-size': 11, 'font-weight': 'bold',
        fill: '#44c', transform: `rotate(90 ${width - 80} ${height / 2})`
    });
    rightLabel.textContent = 'RADIATIVE / FEMALE (−) / EXPANSION';
    svg.appendChild(rightLabel);
    
    // Title at top
    const title = createSVGElement('text', {
        x: centerX, y: 40,
        'font-size': 16, 'font-weight': 'bold',
        'text-anchor': 'middle'
    });
    title.textContent = 'DIAGRAM SHOWING THE TEN OCTAVES OF INTEGRATING LIGHT';
    svg.appendChild(title);
    
    const subtitle = createSVGElement('text', {
        x: centerX, y: 60,
        'font-size': 11, 'text-anchor': 'middle', fill: '#666'
    });
    subtitle.textContent = 'Walter Russell - 1926';
    svg.appendChild(subtitle);
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

// Initialize saved elements panel
function initializeSavedElements() {
    const toggleBtn = document.getElementById('savedElementsBtn');
    const panel = document.getElementById('savedElementsPanel');
    const exportBtn = document.getElementById('exportSaved');
    const clearBtn = document.getElementById('clearSaved');
    const closeBtn = document.getElementById('closeSaved');
    
    toggleBtn.addEventListener('click', () => {
        panel.classList.toggle('active');
    });
    
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !toggleBtn.contains(e.target)) {
            panel.classList.remove('active');
        }
    });
    
    exportBtn.addEventListener('click', exportSavedElements);
    clearBtn.addEventListener('click', clearSavedElements);
    
    renderSavedElements();
    updateSavedCount();
}

// Initialize spacebar save functionality
function initializeSpacebarSave() {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            let elementToSave = null;
            
            // Priority: screensaver element > hovered element
            if (screensaverActive && currentScreensaverElement) {
                elementToSave = currentScreensaverElement;
                e.preventDefault(); // Prevent page scroll during screensaver
            } else if (hoveredElement) {
                elementToSave = hoveredElement;
                e.preventDefault(); // Prevent page scroll when hovering
            }
            
            if (elementToSave) {
                saveElement(elementToSave);
            }
        }
    });
}

// Save an element to the list
function saveElement(element) {
    // Check if already saved
    if (savedElements.some(e => e.number === element.number)) {
        showSaveNotification(`${element.symbol} is already saved!`, 'warning');
        return;
    }
    
    savedElements.push({
        number: element.number,
        symbol: element.symbol,
        name: element.name,
        category: element.category
    });
    
    // Save to localStorage
    localStorage.setItem('savedElements', JSON.stringify(savedElements));
    
    renderSavedElements();
    updateSavedCount();
    showSaveNotification(`${element.symbol} - ${element.name} saved!`, 'success');
}

// Remove an element from saved list
function removeSavedElement(elementNumber) {
    savedElements = savedElements.filter(e => e.number !== elementNumber);
    localStorage.setItem('savedElements', JSON.stringify(savedElements));
    renderSavedElements();
    updateSavedCount();
}

// Render saved elements list
function renderSavedElements() {
    const listContainer = document.getElementById('savedElementsList');
    
    if (savedElements.length === 0) {
        listContainer.innerHTML = '<p class="saved-empty">No elements saved yet. Press <kbd>Space</kbd> during screensaver or while hovering over elements to save them.</p>';
        return;
    }
    
    // Sort by atomic number
    const sorted = [...savedElements].sort((a, b) => a.number - b.number);
    
    listContainer.innerHTML = sorted.map(element => `
        <div class="saved-item ${element.category}">
            <span class="saved-number">${element.number}</span>
            <span class="saved-symbol">${element.symbol}</span>
            <span class="saved-name">${element.name}</span>
            <button class="remove-saved" onclick="removeSavedElement(${element.number})" title="Remove">×</button>
        </div>
    `).join('');
}

// Export saved elements
function exportSavedElements() {
    if (savedElements.length === 0) {
        alert('No elements to export!');
        return;
    }
    
    const sorted = [...savedElements].sort((a, b) => a.number - b.number);
    const text = sorted.map(e => `${e.number}. ${e.symbol} - ${e.name}`).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved-elements.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showSaveNotification('List exported!', 'success');
}

// Clear all saved elements
function clearSavedElements() {
    if (savedElements.length === 0) return;
    
    if (confirm(`Clear all ${savedElements.length} saved elements?`)) {
        savedElements = [];
        localStorage.setItem('savedElements', JSON.stringify(savedElements));
        renderSavedElements();
        updateSavedCount();
        showSaveNotification('List cleared!', 'success');
    }
}

// Update saved count in button
function updateSavedCount() {
    const countSpan = document.getElementById('savedCount');
    if (countSpan) {
        countSpan.textContent = savedElements.length;
    }
}

// Show save notification
function showSaveNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `save-notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize quiz mode
function initializeQuizMode() {
    const quizBtn = document.getElementById('quizModeBtn');
    const quizInfo = document.getElementById('quizInfo');
    
    quizBtn.addEventListener('click', () => {
        quizModeActive = !quizModeActive;
        
        if (quizModeActive) {
            quizBtn.classList.add('active');
            quizInfo.style.display = 'block';
            enterQuizMode();
        } else {
            quizBtn.classList.remove('active');
            quizInfo.style.display = 'none';
            exitQuizMode();
        }
    });
}

// Enter quiz mode - hide all element info
function enterQuizMode() {
    quizStates = {};
    
    const allElements = document.querySelectorAll('.element');
    allElements.forEach(elementDiv => {
        const elementNumber = parseInt(elementDiv.getAttribute('data-number'));
        
        // Skip filtered out elements
        if (elementDiv.classList.contains('filtered-out')) {
            return;
        }
        
        // Initialize quiz state
        quizStates[elementNumber] = 0; // 0 = hidden, 1 = number shown, 2 = symbol shown, 3 = all shown
        
        // Add quiz mode class and hide content
        elementDiv.classList.add('quiz-mode');
        updateQuizElementDisplay(elementDiv, elementNumber);
    });
}

// Exit quiz mode - show all element info
function exitQuizMode() {
    const allElements = document.querySelectorAll('.element');
    allElements.forEach(elementDiv => {
        elementDiv.classList.remove('quiz-mode', 'quiz-reveal-1', 'quiz-reveal-2', 'quiz-reveal-3');
    });
    quizStates = {};
}

// Handle click in quiz mode
function handleQuizClick(element, elementDiv) {
    const currentState = quizStates[element.number] || 0;
    const nextState = currentState + 1;
    
    if (nextState > 3) {
        // After full reveal, show modal
        showElementModal(element);
        return;
    }
    
    quizStates[element.number] = nextState;
    updateQuizElementDisplay(elementDiv, element.number);
}

// Update element display based on quiz state
function updateQuizElementDisplay(elementDiv, elementNumber) {
    const state = quizStates[elementNumber] || 0;
    
    // Remove all reveal classes
    elementDiv.classList.remove('quiz-reveal-1', 'quiz-reveal-2', 'quiz-reveal-3');
    
    // Add appropriate reveal class
    if (state === 1) {
        elementDiv.classList.add('quiz-reveal-1'); // Show atomic number
    } else if (state === 2) {
        elementDiv.classList.add('quiz-reveal-2'); // Show atomic number + symbol
    } else if (state === 3) {
        elementDiv.classList.add('quiz-reveal-3'); // Show all
    }
}

// Apply filters also updates quiz mode
const originalApplyFilters = applyFilters;
applyFilters = function() {
    originalApplyFilters();
    
    if (quizModeActive) {
        // Reset quiz states for newly filtered elements
        const allElements = document.querySelectorAll('.element');
        allElements.forEach(elementDiv => {
            const elementNumber = parseInt(elementDiv.getAttribute('data-number'));
            
            if (elementDiv.classList.contains('filtered-out')) {
                elementDiv.classList.remove('quiz-mode', 'quiz-reveal-1', 'quiz-reveal-2', 'quiz-reveal-3');
            } else if (!quizStates[elementNumber]) {
                quizStates[elementNumber] = 0;
                elementDiv.classList.add('quiz-mode');
                updateQuizElementDisplay(elementDiv, elementNumber);
            }
        });
    }
};

// Screensaver functionality
let screensaverActive = false;
let screensaverInterval = null;
let screensaverTimeout = null;
let screensaverSpeed = 'normal'; // slow, normal, fast
let currentScreensaverElement = null;
let hoveredElement = null;

// Saved elements list
let savedElements = JSON.parse(localStorage.getItem('savedElements') || '[]');

// Quiz mode
let quizModeActive = false;
let quizStates = {}; // Track reveal state for each element

// Trends mode
let trendsMode = false;
let activeTrend = 'none';

// Comparison mode
let compareMode = false;
let compareElements = [null, null];

// Speed settings (in milliseconds)
const speedSettings = {
    slow: { number: 10000, symbol: 10000, info: 10000 },
    normal: { number: 5000, symbol: 5000, info: 5000 },
    fast: { number: 3000, symbol: 3000, info: 3000 }
};

function initializeScreensaver() {
    const navButtons = document.querySelector('.nav-buttons');
    
    // Create container for screensaver controls
    const screensaverContainer = document.createElement('div');
    screensaverContainer.className = 'screensaver-controls';
    
    // Create screensaver button
    const screensaverBtn = document.createElement('button');
    screensaverBtn.id = 'screensaverBtn';
    screensaverBtn.className = 'screensaver-toggle';
    screensaverBtn.innerHTML = '🎬 Screensaver';
    screensaverBtn.title = 'Start element screensaver';
    
    // Create speed dropdown
    const speedSelect = document.createElement('select');
    speedSelect.id = 'screensaverSpeed';
    speedSelect.className = 'screensaver-speed';
    speedSelect.innerHTML = `
        <option value="slow">🐢 Slow</option>
        <option value="normal" selected>⚡ Normal</option>
        <option value="fast">🚀 Fast</option>
    `;
    speedSelect.title = 'Screensaver speed';
    
    speedSelect.addEventListener('change', (e) => {
        screensaverSpeed = e.target.value;
    });
    
    screensaverContainer.appendChild(screensaverBtn);
    screensaverContainer.appendChild(speedSelect);
    navButtons.appendChild(screensaverContainer);
    
    screensaverBtn.addEventListener('click', toggleScreensaver);
    
    // Stop screensaver on any click (except controls)
    document.addEventListener('click', (e) => {
        if (screensaverActive && !e.target.closest('.screensaver-controls')) {
            stopScreensaver();
        }
    });
}

function toggleScreensaver() {
    if (screensaverActive) {
        stopScreensaver();
    } else {
        startScreensaver();
    }
}

function startScreensaver() {
    screensaverActive = true;
    const btn = document.getElementById('screensaverBtn');
    btn.innerHTML = '⏸️ Stop';
    btn.classList.add('active');
    
    // Switch to classic view if not already there
    const classicBtn = document.getElementById('classicBtn');
    const russellBtn = document.getElementById('russellBtn');
    const classicView = document.getElementById('classicView');
    const russellView = document.getElementById('russellView');
    
    classicBtn.classList.add('active');
    russellBtn.classList.remove('active');
    classicView.classList.add('active');
    russellView.classList.remove('active');
    
    // Start the cycle
    cycleElement();
}

function stopScreensaver() {
    screensaverActive = false;
    const btn = document.getElementById('screensaverBtn');
    btn.innerHTML = '🎬 Screensaver';
    btn.classList.remove('active');
    
    if (screensaverInterval) {
        clearInterval(screensaverInterval);
        screensaverInterval = null;
    }
    
    if (screensaverTimeout) {
        clearTimeout(screensaverTimeout);
        screensaverTimeout = null;
    }
    
    // Remove any highlighting
    document.querySelectorAll('.element.screensaver-highlight').forEach(el => {
        el.classList.remove('screensaver-highlight');
    });
    
    // Remove overlay if exists
    const overlay = document.getElementById('screensaverOverlay');
    if (overlay) {
        overlay.remove();
    }
}

function cycleElement() {
    if (!screensaverActive) return;
    
    // Remove previous highlight
    document.querySelectorAll('.element.screensaver-highlight').forEach(el => {
        el.classList.remove('screensaver-highlight');
    });
    
    // Get only visible (non-filtered) elements
    const visibleElements = elements.filter(element => {
        const elementDiv = document.querySelector(`.element[data-number="${element.number}"]`);
        return elementDiv && !elementDiv.classList.contains('filtered-out');
    });
    
    if (visibleElements.length === 0) {
        // No visible elements, stop screensaver
        stopScreensaver();
        alert('No elements visible with current filters. Please adjust filters or reset them.');
        return;
    }
    
    // Pick random element from visible ones
    const randomElement = visibleElements[Math.floor(Math.random() * visibleElements.length)];
    
    // Find the element div in the table
    const elementDiv = document.querySelector(`.element[data-number="${randomElement.number}"]`);
    if (!elementDiv) {
        // Try again with next element
        screensaverTimeout = setTimeout(cycleElement, 100);
        return;
    }
    
    // Highlight the element
    elementDiv.classList.add('screensaver-highlight');
    
    // Set current screensaver element for spacebar save
    currentScreensaverElement = randomElement;
    
    // Create or get overlay
    let overlay = document.getElementById('screensaverOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'screensaverOverlay';
        overlay.className = 'screensaver-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = '';
    overlay.style.display = 'flex';
    
    // Progressive reveal
    revealElementInfo(overlay, randomElement, elementDiv);
}

function revealElementInfo(overlay, element, elementDiv) {
    const container = document.createElement('div');
    container.className = 'screensaver-content';
    overlay.appendChild(container);
    
    const speeds = speedSettings[screensaverSpeed];
    
    // Step 1: Show atomic number
    const numberDiv = document.createElement('div');
    numberDiv.className = 'screensaver-number fade-in';
    numberDiv.textContent = element.number;
    container.appendChild(numberDiv);
    
    // Step 2: Show symbol after delay
    screensaverTimeout = setTimeout(() => {
        if (!screensaverActive) return;
        
        const symbolDiv = document.createElement('div');
        symbolDiv.className = 'screensaver-symbol fade-in';
        symbolDiv.textContent = element.symbol;
        symbolDiv.style.background = getCategoryColor(element.category);
        container.appendChild(symbolDiv);
        
        // Step 3: Show full info after another delay
        screensaverTimeout = setTimeout(() => {
            if (!screensaverActive) return;
            
            const infoDiv = document.createElement('div');
            infoDiv.className = 'screensaver-info fade-in';
            infoDiv.innerHTML = `
                <h2>${element.name}</h2>
                <div class="info-grid">
                    <div><strong>Atomic Number:</strong> ${element.number}</div>
                    <div><strong>Atomic Mass:</strong> ${element.mass}</div>
                    <div><strong>Category:</strong> ${formatCategory(element.category)}</div>
                    <div><strong>Group:</strong> ${element.group || 'N/A'}</div>
                    <div><strong>Period:</strong> ${element.period || element.row}</div>
                    <div><strong>Block:</strong> ${element.block ? element.block + '-block' : 'N/A'}</div>
                    <div><strong>Electron Config:</strong> ${element.electron_config}</div>
                    <div><strong>Electronegativity:</strong> ${element.electronegativity !== null ? element.electronegativity : 'N/A'}</div>
                    <div><strong>Ionization Energy:</strong> ${element.ionization_energy !== null ? element.ionization_energy + ' kJ/mol' : 'N/A'}</div>
                    <div><strong>Atomic Radius:</strong> ${element.atomic_radius !== null ? element.atomic_radius + ' pm' : 'N/A'}</div>
                    <div><strong>Oxidation States:</strong> ${element.oxidation_states ? element.oxidation_states.join(', ') : 'N/A'}</div>
                    <div><strong>Discovery:</strong> ${element.discovery}</div>
                </div>
            `;
            container.appendChild(infoDiv);
            
            // Step 4: Hold for configured time, then move to next
            screensaverTimeout = setTimeout(() => {
                if (!screensaverActive) return;
                
                // Fade out
                overlay.classList.add('fade-out');
                elementDiv.classList.remove('screensaver-highlight');
                
                screensaverTimeout = setTimeout(() => {
                    if (!screensaverActive) return;
                    
                    overlay.classList.remove('fade-out');
                    cycleElement();
                }, 500);
            }, speeds.info);
        }, speeds.symbol);
    }, speeds.number);
}

// Initialize trends mode
function initializeTrends() {
    const trendsBtn = document.getElementById('trendsBtn');
    const trendsPanel = document.getElementById('trendsPanel');
    const closeTrends = document.getElementById('closeTrends');
    const trendButtons = document.querySelectorAll('.trend-btn');
    
    trendsBtn.addEventListener('click', () => {
        trendsPanel.classList.toggle('active');
    });
    
    closeTrends.addEventListener('click', () => {
        trendsPanel.classList.remove('active');
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!trendsPanel.contains(e.target) && !trendsBtn.contains(e.target)) {
            trendsPanel.classList.remove('active');
        }
    });
    
    trendButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const trend = btn.getAttribute('data-trend');
            activeTrend = trend;
            
            // Update active button
            trendButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            applyTrendColors(trend);
            updateTrendLegend(trend);
            updateTrendGraph(trend);
        });
    });
}

// Apply trend-based colors to elements
function applyTrendColors(trend) {
    const allElements = document.querySelectorAll('.element');
    
    if (trend === 'none') {
        // Reset to category colors
        allElements.forEach(elementDiv => {
            elementDiv.style.removeProperty('background');
        });
        return;
    }
    
    // Get property values for color mapping
    const values = elements
        .map(e => getTrendValue(e, trend))
        .filter(v => v !== null);
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    allElements.forEach(elementDiv => {
        const elementNumber = parseInt(elementDiv.getAttribute('data-number'));
        const element = elements.find(e => e.number === elementNumber);
        const value = getTrendValue(element, trend);
        
        if (value === null) {
            elementDiv.style.background = '#666';
        } else {
            const color = getHeatmapColor(value, min, max);
            elementDiv.style.background = color;
        }
    });
}

// Get trend value for an element
function getTrendValue(element, trend) {
    switch(trend) {
        case 'electronegativity':
            return element.electronegativity;
        case 'ionization':
            return element.ionization_energy;
        case 'radius':
            return element.atomic_radius;
        default:
            return null;
    }
}

// Get heatmap color (blue = low, red = high)
function getHeatmapColor(value, min, max) {
    const normalized = (value - min) / (max - min);
    
    // Blue to cyan to green to yellow to red
    if (normalized < 0.25) {
        const t = normalized / 0.25;
        return `rgb(${Math.round(0 + 0*t)}, ${Math.round(0 + 255*t)}, ${Math.round(255)})`;
    } else if (normalized < 0.5) {
        const t = (normalized - 0.25) / 0.25;
        return `rgb(${Math.round(0)}, ${Math.round(255)}, ${Math.round(255 - 255*t)})`;
    } else if (normalized < 0.75) {
        const t = (normalized - 0.5) / 0.25;
        return `rgb(${Math.round(0 + 255*t)}, ${Math.round(255)}, ${Math.round(0)})`;
    } else {
        const t = (normalized - 0.75) / 0.25;
        return `rgb(${Math.round(255)}, ${Math.round(255 - 255*t)}, ${Math.round(0)})`;
    }
}

// Update trend legend
function updateTrendLegend(trend) {
    const legendDiv = document.getElementById('trendLegend');
    
    if (trend === 'none') {
        legendDiv.innerHTML = '';
        return;
    }
    
    const values = elements
        .map(e => getTrendValue(e, trend))
        .filter(v => v !== null);
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const trendNames = {
        electronegativity: 'Electronegativity (Pauling)',
        ionization: 'Ionization Energy (kJ/mol)',
        radius: 'Atomic Radius (pm)'
    };
    
    legendDiv.innerHTML = `
        <div class="legend-title">${trendNames[trend]}</div>
        <div class="legend-gradient">
            <span class="legend-min">${min.toFixed(1)}</span>
            <div class="gradient-bar"></div>
            <span class="legend-max">${max.toFixed(1)}</span>
        </div>
    `;
}

// Update trend graph
function updateTrendGraph(trend) {
    const graphDiv = document.getElementById('trendGraph');
    
    if (trend === 'none') {
        graphDiv.innerHTML = '';
        return;
    }
    
    const trendNames = {
        electronegativity: 'Electronegativity',
        ionization: 'Ionization Energy',
        radius: 'Atomic Radius'
    };
    
    // Create simple period-based graph
    const periods = [1, 2, 3, 4, 5, 6, 7];
    const periodData = periods.map(period => {
        const periodElements = elements.filter(e => e.row === period);
        const values = periodElements
            .map(e => getTrendValue(e, trend))
            .filter(v => v !== null);
        
        return {
            period,
            avg: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
        };
    });
    
    const maxAvg = Math.max(...periodData.map(d => d.avg));
    
    graphDiv.innerHTML = `
        <div class="graph-title">Average ${trendNames[trend]} by Period</div>
        <div class="graph-bars">
            ${periodData.map(d => `
                <div class="graph-bar-container">
                    <div class="graph-bar" style="height: ${(d.avg / maxAvg * 100)}%"></div>
                    <div class="graph-label">P${d.period}</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Initialize comparison mode
function initializeComparison() {
    const compareBtn = document.getElementById('compareBtn');
    const comparePanel = document.getElementById('comparePanel');
    const closeCompare = document.getElementById('closeCompare');
    
    compareBtn.addEventListener('click', () => {
        compareMode = !compareMode;
        
        if (compareMode) {
            compareBtn.classList.add('active');
            comparePanel.classList.add('active');
            compareElements = [null, null];
            updateCompareDisplay();
        } else {
            compareBtn.classList.remove('active');
            comparePanel.classList.remove('active');
        }
    });
    
    closeCompare.addEventListener('click', () => {
        compareMode = false;
        compareBtn.classList.remove('active');
        comparePanel.classList.remove('active');
    });
}

// Handle element click in comparison mode
function handleCompareClick(element) {
    if (compareElements[0] === null) {
        compareElements[0] = element;
    } else if (compareElements[1] === null) {
        compareElements[1] = element;
    } else {
        // Reset and start over
        compareElements = [element, null];
    }
    
    updateCompareDisplay();
}

// Update comparison display
function updateCompareDisplay() {
    const slot1 = document.getElementById('compareSlot1');
    const slot2 = document.getElementById('compareSlot2');
    
    slot1.innerHTML = compareElements[0] ? createCompareCard(compareElements[0]) : '<p class="compare-empty">Click an element</p>';
    slot2.innerHTML = compareElements[1] ? createCompareCard(compareElements[1]) : '<p class="compare-empty">Click an element</p>';
}

// Create comparison card
function createCompareCard(element) {
    return `
        <div class="compare-card">
            <div class="compare-symbol" style="background: ${getCategoryColor(element.category)}">${element.symbol}</div>
            <h3>${element.name}</h3>
            <div class="compare-props">
                <div class="compare-prop">
                    <span class="prop-label">Atomic Number:</span>
                    <span class="prop-value">${element.number}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Atomic Mass:</span>
                    <span class="prop-value">${element.mass}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Category:</span>
                    <span class="prop-value">${formatCategory(element.category)}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Electronegativity:</span>
                    <span class="prop-value">${element.electronegativity !== null ? element.electronegativity : 'N/A'}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Ionization Energy:</span>
                    <span class="prop-value">${element.ionization_energy !== null ? element.ionization_energy + ' kJ/mol' : 'N/A'}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Atomic Radius:</span>
                    <span class="prop-value">${element.atomic_radius !== null ? element.atomic_radius + ' pm' : 'N/A'}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Oxidation States:</span>
                    <span class="prop-value">${element.oxidation_states ? element.oxidation_states.join(', ') : 'N/A'}</span>
                </div>
                <div class="compare-prop">
                    <span class="prop-label">Electron Config:</span>
                    <span class="prop-value">${element.electron_config}</span>
                </div>
            </div>
        </div>
    `;
}

// Update element click handler to support comparison mode
const originalCreateElementDiv = createElementDiv;
createElementDiv = function(element) {
    const div = originalCreateElementDiv(element);
    
    // Override click handler
    div.addEventListener('click', (e) => {
        if (compareMode) {
            handleCompareClick(element);
        } else if (quizModeActive) {
            handleQuizClick(element, div);
        } else {
            showElementModal(element);
        }
    }, true); // Use capture to override previous handler
    
    return div;
};
