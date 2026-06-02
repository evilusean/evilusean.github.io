// Conversion constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const DEG_TO_GRAD = 10 / 9;
const GRAD_TO_DEG = 9 / 10;

// Get all input elements
const degreesInput = document.getElementById('degrees');
const radiansInput = document.getElementById('radians');
const gradiansInput = document.getElementById('gradians');
const dmsInput = document.getElementById('dms');
const canvas = document.getElementById('angleCanvas');
const angleDisplay = document.getElementById('angleDisplay');

// Track which input was changed to avoid circular updates
let activeInput = null;

/**
 * Convert decimal degrees to DMS (Degrees, Minutes, Seconds)
 * @param {number} decimalDegrees - The angle in decimal degrees
 * @returns {Object} Object with degrees, minutes, seconds properties
 */
function decimalToDMS(decimalDegrees) {
    const degrees = Math.floor(decimalDegrees);
    const minutesDecimal = (Math.abs(decimalDegrees) - Math.abs(degrees)) * 60;
    const minutes = Math.floor(minutesDecimal);
    const seconds = (minutesDecimal - minutes) * 60;

    return {
        degrees: degrees,
        minutes: minutes,
        seconds: parseFloat(seconds.toFixed(2))
    };
}

/**
 * Convert DMS to decimal degrees
 * @param {string} dmsString - String in format "DD MM SS.SS"
 * @returns {number} Decimal degrees
 */
function dmsToDecimal(dmsString) {
    const parts = dmsString.trim().split(/\s+/);
    
    if (parts.length < 1) return 0;
    
    const degrees = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;

    const result = degrees + minutes / 60 + seconds / 3600;
    return parseFloat(result.toFixed(6));
}

/**
 * Format DMS object as string
 * @param {Object} dmsObj - Object with degrees, minutes, seconds
 * @returns {string} Formatted string "DD MM SS.SS"
 */
function formatDMS(dmsObj) {
    return `${dmsObj.degrees} ${dmsObj.minutes} ${dmsObj.seconds}`;
}

/**
 * Update all angle inputs based on a source value in degrees
 * @param {number} decimalDegrees - The source angle in decimal degrees
 */
function updateAllInputs(decimalDegrees) {
    // Normalize angle to 0-360 range for display purposes
    const normalizedDegrees = ((decimalDegrees % 360) + 360) % 360;

    // Update each input with appropriate precision
    if (activeInput !== 'degrees') {
        degreesInput.value = parseFloat(decimalDegrees.toFixed(6));
    }

    if (activeInput !== 'radians') {
        const radians = decimalDegrees * DEG_TO_RAD;
        radiansInput.value = parseFloat(radians.toFixed(8));
    }

    if (activeInput !== 'gradians') {
        const gradians = decimalDegrees * DEG_TO_GRAD;
        gradiansInput.value = parseFloat(gradians.toFixed(6));
    }

    if (activeInput !== 'dms') {
        const dmsObj = decimalToDMS(decimalDegrees);
        dmsInput.value = formatDMS(dmsObj);
    }

    // Update canvas visualization and display
    drawAngleArc(normalizedDegrees);
    angleDisplay.textContent = parseFloat(decimalDegrees.toFixed(2)) + '°';
}

/**
 * Draw an arc on the canvas representing the angle
 * @param {number} degrees - The angle in degrees (0-360)
 */
function drawAngleArc(degrees) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw baseline (0 degrees - pointing right)
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Draw angle arc
    const angleRad = degrees * DEG_TO_RAD;
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.4, 0, angleRad, false);
    ctx.stroke();

    // Draw angle arc fill (sector)
    ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius * 0.4, 0, angleRad, false);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw endpoint ray
    const endX = centerX + radius * Math.cos(angleRad);
    const endY = centerY + radius * Math.sin(angleRad);
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Draw angle arc curve for reference
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    ctx.stroke();

    // Draw center point
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw angle label
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelX = centerX + 50 * Math.cos(angleRad / 2);
    const labelY = centerY + 50 * Math.sin(angleRad / 2);
    ctx.fillText(degrees.toFixed(1) + '°', labelX, labelY);
}

/**
 * Create conversion handler for a specific input field
 * @param {string} inputType - The type of input ('degrees', 'radians', 'gradians', 'dms')
 * @returns {function} Event handler function
 */
function createConversionHandler(inputType) {
    return function(event) {
        if (event.key !== 'Enter') return;

        const value = this.value.trim();
        if (value === '') return;

        activeInput = inputType;
        let decimalDegrees = 0;

        try {
            if (inputType === 'degrees') {
                decimalDegrees = parseFloat(value);
            } else if (inputType === 'radians') {
                const radians = parseFloat(value);
                decimalDegrees = radians * RAD_TO_DEG;
            } else if (inputType === 'gradians') {
                const gradians = parseFloat(value);
                decimalDegrees = gradians * GRAD_TO_DEG;
            } else if (inputType === 'dms') {
                decimalDegrees = dmsToDecimal(value);
            }

            if (isNaN(decimalDegrees)) {
                console.error('Invalid input value');
                activeInput = null;
                return;
            }

            updateAllInputs(decimalDegrees);
        } catch (error) {
            console.error('Conversion error:', error);
        } finally {
            activeInput = null;
        }
    };
}

// Attach event listeners to all inputs (Enter key)
degreesInput.addEventListener('keypress', createConversionHandler('degrees'));
radiansInput.addEventListener('keypress', createConversionHandler('radians'));
gradiansInput.addEventListener('keypress', createConversionHandler('gradians'));
dmsInput.addEventListener('keypress', createConversionHandler('dms'));

// Initialize canvas with 0 degrees
drawAngleArc(0);
angleDisplay.textContent = '0.00°';