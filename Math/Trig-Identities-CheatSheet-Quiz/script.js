// Essential engineering identities (auto-selected by default)
const engineeringEssentials = [
    'Pythagorean Identity',
    'Secant Identity',
    'Cosecant Identity',
    'Double Angle Sine',
    'Double Angle Cosine',
    'Sum of Sine',
    'Sum of Cosine',
    'Law of Sines',
    'Law of Cosines (side a)',
    'Quotient: Tangent'
];

// Preset configurations - Updated with exact Unicode characters from identity names
const presets = {
    engineering: [
        'Pythagorean Identity',
        'Secant Identity',
        'Cosecant Identity',
        'Double Angle Sine',
        'Double Angle Cosine',
        'Sum of Sine',
        'Sum of Cosine',
        'Law of Sines',
        'Law of Cosines (side a)',
        'Law of Cosines (side b)',
        'Law of Cosines (side c)',
        'Quotient: Tangent',
        'Quotient: Cotangent'
    ],
    beginner: [
        'Reciprocal: Cosecant',
        'Reciprocal: Secant',
        'Reciprocal: Cotangent',
        'Quotient: Tangent',
        'Quotient: Cotangent',
        'Pythagorean Identity',
        'Even/Odd: Sine',
        'Even/Odd: Cosine',
        'Even/Odd: Tangent',
        'Cofunction: sin/cos',
        'Cofunction: cos/sin'
    ],
    intermediate: [
        'Pythagorean Identity',
        'Secant Identity',
        'Cosecant Identity',
        'Sum of Sine',
        'Difference of Sine',
        'Sum of Cosine',
        'Difference of Cosine',
        'Double Angle Sine',
        'Double Angle Cosine',
        'Double Angle Tangent',
        'Power Reduction: sin²',
        'Power Reduction: cos²'
    ],
    advanced: [
        'Sum of Tangent',
        'Difference of Tangent',
        'Half Angle Sine',
        'Half Angle Cosine',
        'Product to Sum: sin·cos',
        'Product to Sum: cos·sin',
        'Product to Sum: cos·cos',
        'Product to Sum: sin·sin',
        'Sum to Product: sin+sin',
        'Sum to Product: sin−sin',
        'Sum to Product: cos+cos',
        'Sum to Product: cos−cos'
    ],
    calculus: [
        'Pythagorean Identity',
        'Secant Identity',
        'Cosecant Identity',
        'Double Angle Sine',
        'Double Angle Cosine',
        'Power Reduction: sin²',
        'Power Reduction: cos²',
        'Product to Sum: sin·cos',
        'Product to Sum: cos·cos',
        'Product to Sum: sin·sin',
        'Sum of Sine',
        'Sum of Cosine'
    ],
    geometry: [
        'Pythagorean Identity',
        'Law of Sines',
        'Law of Cosines (side a)',
        'Law of Cosines (side b)',
        'Law of Cosines (side c)',
        'Triangle Area (SAS)',
        'Heron\'s Formula',
        'Cofunction: sin/cos',
        'Cofunction: cos/sin',
        'Quotient: Tangent'
    ]
};

// State
let selectedIdentities = new Set(engineeringEssentials);
let savedForReview = JSON.parse(localStorage.getItem('savedTrig')) || [];
let currentQuizIndex = 0;
let currentPhase = 0; // Track current phase: 0=name, 1=formula, 2=desc, 3=usage, 4=example
let quizList = [];
let quizInterval = null;
let isPaused = false;
let isFullscreen = false;
let currentQuizMode = 'screensaver';
let quizRevealShown = false;
let longPressTimer = null;
let longPressTriggered = false;
let isCheatsheetQuizActive = false;
let revealedQuizItems = new Set();

// Initialize
function init() {
    loadFromURL();
    loadSavedSelections();
    renderCheatsheet();
    setupEventListeners();
    updateSavedCount();
}

// Parse identities to separate description, usage, and example
function parseIdentity(identity) {
    const parts = {
        description: '',
        usage: '',
        example: ''
    };
    
    // Split usage field into usage and example
    if (identity.usage) {
        const usageParts = identity.usage.split('\n\nEXAMPLE:');
        parts.usage = usageParts[0].replace('WHEN TO USE:', '').trim();
        
        if (usageParts[1]) {
            const exampleParts = usageParts[1].split('\n\nWHY IT WORKS:');
            parts.example = exampleParts[0].trim();
        }
    }
    
    parts.description = identity.description || '';
    
    return parts;
}

// Color code formulas and text
function colorCodeText(text) {
    if (!text) return text;
    
    // Color code trig functions - more comprehensive patterns
    text = text.replace(/\bsin\s*θ/gi, '<span class="sin">sin θ</span>');
    text = text.replace(/\bcos\s*θ/gi, '<span class="cos">cos θ</span>');
    text = text.replace(/\btan\s*θ/gi, '<span class="tan">tan θ</span>');
    text = text.replace(/\bcsc\s*θ/gi, '<span class="csc">csc θ</span>');
    text = text.replace(/\bsec\s*θ/gi, '<span class="sec">sec θ</span>');
    text = text.replace(/\bcot\s*θ/gi, '<span class="cot">cot θ</span>');
    
    // Color code with various notations
    text = text.replace(/\bsin\(([^)]+)\)/gi, '<span class="sin">sin($1)</span>');
    text = text.replace(/\bcos\(([^)]+)\)/gi, '<span class="cos">cos($1)</span>');
    text = text.replace(/\btan\(([^)]+)\)/gi, '<span class="tan">tan($1)</span>');
    text = text.replace(/\bcsc\(([^)]+)\)/gi, '<span class="csc">csc($1)</span>');
    text = text.replace(/\bsec\(([^)]+)\)/gi, '<span class="sec">sec($1)</span>');
    text = text.replace(/\bcot\(([^)]+)\)/gi, '<span class="cot">cot($1)</span>');
    
    // Standalone trig functions
    text = text.replace(/\bsin\b(?![θ(])/gi, '<span class="sin">sin</span>');
    text = text.replace(/\bcos\b(?![θ(])/gi, '<span class="cos">cos</span>');
    text = text.replace(/\btan\b(?![θ(])/gi, '<span class="tan">tan</span>');
    text = text.replace(/\bcsc\b(?![θ(])/gi, '<span class="csc">csc</span>');
    text = text.replace(/\bsec\b(?![θ(])/gi, '<span class="sec">sec</span>');
    text = text.replace(/\bcot\b(?![θ(])/gi, '<span class="cot">cot</span>');
    
    // Color code with superscripts
    text = text.replace(/\bsin²\s*θ/gi, '<span class="sin">sin² θ</span>');
    text = text.replace(/\bcos²\s*θ/gi, '<span class="cos">cos² θ</span>');
    text = text.replace(/\btan²\s*θ/gi, '<span class="tan">tan² θ</span>');
    text = text.replace(/\bsin²/gi, '<span class="sin">sin²</span>');
    text = text.replace(/\bcos²/gi, '<span class="cos">cos²</span>');
    text = text.replace(/\btan²/gi, '<span class="tan">tan²</span>');
    
    // Color code with x variable
    text = text.replace(/\bsinx\b/gi, '<span class="sin">sinx</span>');
    text = text.replace(/\bcosx\b/gi, '<span class="cos">cosx</span>');
    text = text.replace(/\btanx\b/gi, '<span class="tan">tanx</span>');
    text = text.replace(/\bcscx\b/gi, '<span class="csc">cscx</span>');
    text = text.replace(/\bsecx\b/gi, '<span class="sec">secx</span>');
    text = text.replace(/\bcotx\b/gi, '<span class="cot">cotx</span>');
    
    // Bold key terms
    text = text.replace(/\b(WHY|WHEN TO USE|EXAMPLE|NOTE|IMPORTANT|Area|Slope)\b/g, '<strong>$1</strong>');
    
    // Bold formulas in text (anything with θ or = or mathematical notation)
    text = text.replace(/([\w\s]*[=≠<>±√∫∑][^\.,;]+)/g, '<strong>$1</strong>');
    
    return text;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Convert formula to MathJax format
function toMathJax(formula) {
    if (!formula) return formula;
    
    let math = formula;
    
    // Replace Greek letters
    math = math.replace(/θ/g, '\\theta');
    math = math.replace(/π/g, '\\pi');
    
    // Handle superscripts BEFORE trig functions
    math = math.replace(/²/g, '^2');
    
    // Handle fractions - be more careful with parentheses
    // Match patterns like (a+b)/c or a/(b+c) or simple a/b
    math = math.replace(/\(([^)]+)\)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
    math = math.replace(/(\d+)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    math = math.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    
    // Simple fractions (number/number or letter/letter)
    math = math.replace(/(\d+)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
    
    // Replace trig functions with colored versions (using colors from unit circle app)
    const trigColorMap = {
        sin: '#e06666',
        cos: '#5b9bd5',
        tan: '#b388ff',
        csc: '#ea9999',
        sec: '#6fa8dc',
        cot: '#c9a3ff'
    };

    math = math.replace(/\\?(sin|cos|tan|csc|sec|cot)(?![A-Za-z])/g, (match, name) => {
        const color = trigColorMap[name];
        if (!color) return match;
        return match.startsWith('\\') ? `\\color{${color}}{${match}}` : `\\color{${color}}{\\${name}}`;
    });
    
    // Handle square roots
    math = math.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    math = math.replace(/√(\d+)/g, '\\sqrt{$1}');
    
    return `$${math}$`;
}

// Get plain text from MathJax for copying
function getPlainFormula(formula) {
    return formula; // Return original formula for copying
}

// Refresh MathJax rendering
function refreshMathJax() {
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch((err) => console.log('MathJax error:', err));
    }
}

function renderCheatsheet() {
    const container = document.getElementById('identities-list');
    container.innerHTML = trigIdentities.map((identity, index) => {
        const parsed = parseIdentity(identity);
        const isSelected = selectedIdentities.has(identity.name);
        const escapedName = identity.name.replace(/'/g, "\\'");
        const isRevealed = revealedQuizItems.has(identity.name);
        const quizModeContent = isCheatsheetQuizActive && !isRevealed
            ? '<span class="quiz-reveal-prompt">Click to reveal formula</span>'
            : toMathJax(identity.formula);
        
        return `
        <div class="identity-item ${isCheatsheetQuizActive ? 'quiz-mode' : ''}">
            <div class="identity-header" onclick="toggleIdentityCard(${index}, '${escapedName}')">
                <input type="checkbox" 
                    id="check-${index}" 
                    ${isSelected ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleSelection(${index}, '${escapedName}')">
                <span class="identity-name">${identity.name}</span>
            </div>
            <div class="identity-formula ${isCheatsheetQuizActive && !isRevealed ? 'quiz-hidden' : ''}" title="${identity.formula}" data-formula="${identity.formula.replace(/"/g, '&quot;')}">${quizModeContent}</div>
            ${!isCheatsheetQuizActive ? `
            <div class="identity-details ${isSelected ? 'visible' : ''}" id="details-${index}">
                <div class="identity-section">
                    <h4>📖 Description</h4>
                    <p>${colorCodeText(parsed.description)}</p>
                </div>
                <div class="identity-section">
                    <h4>🎯 When to Use</h4>
                    <p>${colorCodeText(parsed.usage)}</p>
                </div>
                <div class="identity-section">
                    <h4>💡 Example</h4>
                    <p>${colorCodeText(parsed.example)}</p>
                </div>
            </div>` : ''}
        </div>
    `;
    }).join('');
    
    document.querySelectorAll('.identity-formula').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const formula = el.getAttribute('data-formula');
            if (isCheatsheetQuizActive) {
                const identityName = el.closest('.identity-item')?.querySelector('.identity-name')?.textContent;
                if (identityName) {
                    toggleQuizIdentityReveal(identityName);
                }
            } else {
                navigator.clipboard.writeText(formula).then(() => {
                    showNotification('📋 Formula copied!', 'copied');
                });
            }
        });
    });
    
    refreshMathJax();
}

function toggleIdentityCard(index, name) {
    if (isCheatsheetQuizActive) {
        toggleQuizIdentityReveal(name);
    } else {
        toggleDetails(index);
    }
}

function toggleQuizIdentityReveal(name) {
    if (!isCheatsheetQuizActive) return;

    if (revealedQuizItems.has(name)) {
        revealedQuizItems.delete(name);
    } else {
        revealedQuizItems.add(name);
    }

    renderCheatsheet();
}

function toggleDetails(index) {
    const details = document.getElementById(`details-${index}`);
    details.classList.toggle('visible');
}

function toggleSelection(index, name) {
    const details = document.getElementById(`details-${index}`);
    
    if (selectedIdentities.has(name)) {
        selectedIdentities.delete(name);
        details.classList.remove('visible');
    } else {
        selectedIdentities.add(name);
        details.classList.add('visible');
    }
    saveSelections();
}

function saveSelections() {
    localStorage.setItem('selectedIdentities', JSON.stringify([...selectedIdentities]));
}

function loadSavedSelections() {
    const saved = localStorage.getItem('selectedIdentities');
    if (saved) {
        selectedIdentities = new Set(JSON.parse(saved));
    } else {
        // If nothing saved, use engineering defaults
        selectedIdentities = new Set(engineeringEssentials);
    }
}

function loadPreset(presetName) {
    if (presets[presetName]) {
        selectedIdentities = new Set(presets[presetName]);
        saveSelections();
        renderCheatsheet();
        
        // Debug: log what was loaded
        console.log(`Loaded preset: ${presetName}`, presets[presetName]);
        
        showNotification(`✨ ${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset loaded!`, 'success');
    } else {
        console.error(`Preset not found: ${presetName}`);
        showNotification(`⚠️ Preset not found`, 'success');
    }
}

function selectAll() {
    selectedIdentities = new Set(trigIdentities.map(id => id.name));
    saveSelections();
    renderCheatsheet();
}

function deselectAll() {
    selectedIdentities.clear();
    saveSelections();
    renderCheatsheet();
}

function saveToURL() {
    const indices = trigIdentities
        .map((id, idx) => selectedIdentities.has(id.name) ? idx : null)
        .filter(idx => idx !== null);
    
    const encoded = btoa(indices.join(','));
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
        showNotification('🔗 URL copied to clipboard!', 'success');
    }).catch(() => {
        prompt('Copy this URL:', url);
    });
}

function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    
    if (encoded) {
        try {
            const indices = atob(encoded).split(',').map(Number);
            selectedIdentities = new Set(
                indices.map(idx => trigIdentities[idx]?.name).filter(Boolean)
            );
            saveSelections();
        } catch (e) {
            console.error('Invalid URL parameter');
        }
    }
}

function setupEventListeners() {
    document.getElementById('cheatsheet-btn').onclick = () => switchView('cheatsheet');
    document.getElementById('screensaver-btn').onclick = () => switchView('screensaver');
    document.getElementById('quiz-btn').onclick = toggleCheatsheetQuizMode;
    document.getElementById('help-btn').onclick = () => switchView('help');
    document.getElementById('view-saved-btn-header').onclick = showSavedModal;
    
    document.getElementById('select-all-btn').onclick = selectAll;
    document.getElementById('deselect-all-btn').onclick = deselectAll;
    document.getElementById('save-url-btn').onclick = saveToURL;
    
    document.getElementById('preset-dropdown').onchange = (e) => {
        if (e.target.value) {
            loadPreset(e.target.value);
            e.target.value = ''; // Reset dropdown
        }
    };
    
    document.getElementById('exit-quiz-btn').onclick = () => switchView('cheatsheet');
    document.getElementById('prev-btn').onclick = prevCard;
    document.getElementById('next-btn').onclick = nextCard;
    document.getElementById('pause-btn').onclick = togglePause;
    document.getElementById('save-btn').onclick = saveForReviewFunc;
    document.getElementById('fullscreen-btn').onclick = toggleFullscreen;
    
    document.getElementById('speed-slider').oninput = updateSpeed;
    
    // Modal close
    document.querySelector('.close').onclick = closeSavedModal;
    document.getElementById('download-txt-btn').onclick = downloadTXT;
    document.getElementById('download-csv-btn').onclick = downloadCSV;
    document.getElementById('clear-saved-btn').onclick = clearSaved;
    
    window.onclick = (e) => {
        const modal = document.getElementById('saved-modal');
        if (e.target === modal) {
            closeSavedModal();
        }
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('quiz-view').classList.contains('active')) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
            if (e.key === ' ') {
                e.preventDefault();
                if (currentQuizMode === 'quiz') {
                    saveForReviewFunc();
                } else {
                    togglePause();
                }
            }
            if (e.key === 'Enter') { e.preventDefault(); saveForReviewFunc(); }
            if (e.key === 'Escape') { 
                e.preventDefault(); 
                if (isFullscreen) {
                    toggleFullscreen();
                } else {
                    switchView('cheatsheet');
                }
            }
            if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
        }
    });
    
    // Touch swipe for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const quizCard = document.getElementById('quiz-card');
    
    quizCard.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    quizCard.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    quizCard.addEventListener('click', (e) => {
        if (currentQuizMode === 'quiz' && !e.target.closest('.card-formula')) {
            toggleQuizReveal();
        }
    });

    quizCard.addEventListener('pointerdown', (e) => {
        if (currentQuizMode !== 'quiz') return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
            longPressTriggered = true;
            saveForReviewFunc();
        }, 450);
    });

    quizCard.addEventListener('pointerup', clearLongPressTimer);
    quizCard.addEventListener('pointerleave', clearLongPressTimer);
    quizCard.addEventListener('pointercancel', clearLongPressTimer);
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextCard();
        if (touchEndX > touchStartX + 50) prevCard();
    }

    function clearLongPressTimer() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }
}

function toggleCheatsheetQuizMode() {
    if (!document.getElementById('cheatsheet-view').classList.contains('active')) {
        switchView('cheatsheet');
    }

    isCheatsheetQuizActive = !isCheatsheetQuizActive;
    revealedQuizItems.clear();
    document.getElementById('quiz-btn').classList.toggle('active', isCheatsheetQuizActive);
    document.getElementById('cheatsheet-btn').classList.toggle('active', !isCheatsheetQuizActive);
    renderCheatsheet();
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    const secondaryNav = document.querySelector('.secondary-nav');
    
    // Exit fullscreen when switching views
    if (isFullscreen) {
        toggleFullscreen();
    }
    
    if (view === 'cheatsheet') {
        document.getElementById('cheatsheet-view').classList.add('active');
        document.getElementById('cheatsheet-btn').classList.add('active');
        secondaryNav.classList.remove('hidden');
        stopQuiz();
        document.getElementById('quiz-btn').classList.toggle('active', isCheatsheetQuizActive);
    } else if (view === 'screensaver') {
        document.getElementById('quiz-view').classList.add('active');
        document.getElementById('screensaver-btn').classList.add('active');
        document.getElementById('quiz-btn').classList.remove('active');
        secondaryNav.classList.add('hidden');
        startQuiz('screensaver');
    } else if (view === 'quiz') {
        document.getElementById('quiz-view').classList.add('active');
        document.getElementById('quiz-btn').classList.add('active');
        secondaryNav.classList.add('hidden');
        startQuiz('quiz');
    } else if (view === 'help') {
        document.getElementById('help-view').classList.add('active');
        document.getElementById('help-btn').classList.add('active');
        document.getElementById('quiz-btn').classList.remove('active');
        secondaryNav.classList.remove('hidden');
        stopQuiz();
    }
}

function startQuiz(mode = 'screensaver') {
    currentQuizMode = mode;
    quizRevealShown = false;

    quizList = trigIdentities.filter(id => selectedIdentities.has(id.name));
    if (quizList.length === 0) {
        alert('Please select at least one identity in cheatsheet mode');
        switchView('cheatsheet');
        return;
    }
    
    // Shuffle the quiz list for random order
    quizList = shuffleArray(quizList);
    
    currentQuizIndex = 0;
    currentPhase = 0;
    isPaused = false;
    showCard();
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function stopQuiz() {
    if (quizInterval) {
        clearTimeout(quizInterval);
        quizInterval = null;
    }
}

function showCard() {
    stopQuiz();
    
    const identity = quizList[currentQuizIndex];
    if (!identity) return;

    const parsed = parseIdentity(identity);
    
    const nameEl = document.querySelector('.card-name');
    const formulaEl = document.querySelector('.card-formula');
    const descEl = document.querySelector('.card-description');
    const usageEl = document.querySelector('.card-usage');
    const exampleEl = document.querySelector('.card-example');
    const pauseBtn = document.getElementById('pause-btn');
    const quizCard = document.getElementById('quiz-card');
    
    // Reset all visibility
    nameEl.classList.remove('visible');
    formulaEl.classList.remove('visible');
    descEl.classList.remove('visible');
    usageEl.classList.remove('visible');
    exampleEl.classList.remove('visible');
    formulaEl.classList.remove('quiz-prompt');
    
    nameEl.textContent = identity.name;
    formulaEl.setAttribute('data-formula', identity.formula);
    formulaEl.title = 'Click to copy: ' + identity.formula;
    formulaEl.style.cursor = 'pointer';
    quizCard.style.cursor = currentQuizMode === 'quiz' ? 'pointer' : 'default';
    
    if (currentQuizMode === 'quiz' && !quizRevealShown) {
        formulaEl.innerHTML = '<span class="quiz-prompt">Tap to reveal the formula</span>';
        formulaEl.classList.add('quiz-prompt');
        formulaEl.onclick = (e) => {
            e.stopPropagation();
            toggleQuizReveal();
        };
        descEl.innerHTML = '';
        usageEl.innerHTML = '';
        exampleEl.innerHTML = '';
        pauseBtn.textContent = 'Hide';
        nameEl.classList.add('visible');
        formulaEl.classList.add('visible');
        refreshMathJax();
        return;
    }

    formulaEl.innerHTML = toMathJax(identity.formula);
    
    // Add click to copy for quiz card
    formulaEl.onclick = () => {
        navigator.clipboard.writeText(identity.formula).then(() => {
            showNotification('📋 Formula copied!', 'copied');
        });
    };
    
    descEl.innerHTML = colorCodeText(parsed.description);
    usageEl.innerHTML = colorCodeText(parsed.usage);
    exampleEl.innerHTML = colorCodeText(parsed.example);
    
    refreshMathJax();
    
    const showDetails = document.getElementById('show-usage').checked;
    const maxPhase = showDetails ? 4 : 1; // 0-4 with details, 0-1 without
    
    // Show phases up to current phase instantly
    setTimeout(() => {
        if (currentPhase >= 0) nameEl.classList.add('visible');
        if (currentPhase >= 1) formulaEl.classList.add('visible');
        if (showDetails) {
            if (currentPhase >= 2) descEl.classList.add('visible');
            if (currentPhase >= 3) usageEl.classList.add('visible');
            if (currentPhase >= 4) exampleEl.classList.add('visible');
        }
    }, 100);
    
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused && currentQuizMode === 'screensaver') {
        // Auto-advance to next phase after 5 seconds
        quizInterval = setTimeout(() => {
            advancePhase();
        }, 5000);
    }
}

function toggleQuizReveal() {
    if (currentQuizMode !== 'quiz') return;
    if (longPressTriggered) {
        longPressTriggered = false;
        return;
    }
    quizRevealShown = !quizRevealShown;
    showCard();
}

function advancePhase() {
    const showDetails = document.getElementById('show-usage').checked;
    const maxPhase = showDetails ? 4 : 1;
    
    if (currentPhase < maxPhase) {
        // Move to next phase of current question
        currentPhase++;
        showCard();
    } else {
        // Move to next question, reset phase
        currentPhase = 0;
        currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
        
        // Reshuffle when we complete a full cycle
        if (currentQuizIndex === 0) {
            quizList = shuffleArray(quizList);
        }
        
        showCard();
    }
}

function nextCard() {
    if (currentQuizMode === 'quiz') {
        quizRevealShown = false;
    }

    const showDetails = document.getElementById('show-usage').checked;
    const maxPhase = showDetails ? 4 : 1;
    
    if (currentPhase < maxPhase) {
        // Move to next phase
        currentPhase++;
    } else {
        // Move to next question
        currentPhase = 0;
        currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
    }
    showCard();
}

function prevCard() {
    if (currentQuizMode === 'quiz') {
        quizRevealShown = false;
    }

    if (currentPhase > 0) {
        // Move to previous phase
        currentPhase--;
    } else {
        // Move to previous question, last phase
        currentQuizIndex = (currentQuizIndex - 1 + quizList.length) % quizList.length;
        const showDetails = document.getElementById('show-usage').checked;
        currentPhase = showDetails ? 4 : 1;
    }
    showCard();
}

function togglePause() {
    if (currentQuizMode === 'quiz') {
        quizRevealShown = false;
        showCard();
        return;
    }

    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        // Resume auto-advance
        quizInterval = setTimeout(() => {
            advancePhase();
        }, 5000);
    } else {
        stopQuiz();
    }
}

function saveForReviewFunc() {
    const identity = quizList[currentQuizIndex];
    const existingIndex = savedForReview.findIndex(item => item.name === identity.name);
    
    if (existingIndex === -1) {
        savedForReview.push({
            name: identity.name,
            formula: identity.formula
        });
        localStorage.setItem('savedTrig', JSON.stringify(savedForReview));
        updateSavedCount();
        
        showNotification('💾 Saved for review!', 'saved');
    } else {
        showNotification('Already saved!', 'success');
    }
}

function updateSavedCount() {
    const count = savedForReview.length;
    document.getElementById('saved-count-header').textContent = count;
}

function showSavedModal() {
    const modal = document.getElementById('saved-modal');
    const list = document.getElementById('saved-list');
    
    if (savedForReview.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No items saved yet. Press Space or click "💾 Save for Review" during quiz mode.</p>';
    } else {
        list.innerHTML = savedForReview.map((item, idx) => `
            <div class="saved-item">
                <div class="saved-item-name">${item.name}</div>
                <div class="saved-item-formula">${toMathJax(item.formula)}</div>
                <button onclick="removeSaved(${idx})" style="float: right; background: var(--accent); border: none; color: white; padding: 0.4rem 0.8rem; cursor: pointer; border-radius: 4px; margin-top: 0.5rem; font-weight: 600;">Remove</button>
            </div>
        `).join('');
        refreshMathJax();
    }
    
    modal.classList.add('active');
}

function downloadTXT() {
    if (savedForReview.length === 0) {
        showNotification('⚠️ No saved items', 'success');
        return;
    }
    
    let content = 'SAVED TRIG IDENTITIES FOR REVIEW\n';
    content += '='.repeat(50) + '\n\n';
    
    savedForReview.forEach((item, idx) => {
        content += `${idx + 1}. ${item.name}\n`;
        content += `   Formula: ${item.formula}\n\n`;
    });
    
    content += '\nGenerated by Trig Cheatsheet & Quiz App\n';
    content += new Date().toLocaleString();
    
    downloadFile(content, 'trig-identities-saved.txt', 'text/plain');
    showNotification('📄 Downloaded as TXT!', 'success');
}

function downloadCSV() {
    if (savedForReview.length === 0) {
        showNotification('⚠️ No saved items', 'success');
        return;
    }
    
    let content = 'Name,Formula\n';
    
    savedForReview.forEach(item => {
        // Escape quotes in CSV
        const name = `"${item.name.replace(/"/g, '""')}"`;
        const formula = `"${item.formula.replace(/"/g, '""')}"`;
        content += `${name},${formula}\n`;
    });
    
    downloadFile(content, 'trig-identities-saved.csv', 'text/csv');
    showNotification('📊 Downloaded as CSV!', 'success');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function closeSavedModal() {
    document.getElementById('saved-modal').classList.remove('active');
}

function removeSaved(index) {
    savedForReview.splice(index, 1);
    localStorage.setItem('savedTrig', JSON.stringify(savedForReview));
    updateSavedCount();
    showSavedModal();
}

function clearSaved() {
    if (confirm('Clear all saved items?')) {
        savedForReview = [];
        localStorage.setItem('savedTrig', JSON.stringify(savedForReview));
        updateSavedCount();
        closeSavedModal();
        showNotification('🗑️ All items cleared', 'success');
    }
}

function updateSpeed() {
    if (!isPaused && quizInterval) {
        showCard();
    }
}

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    const quizView = document.getElementById('quiz-view');
    const body = document.body;
    const btn = document.getElementById('fullscreen-btn');
    
    if (isFullscreen) {
        quizView.classList.add('fullscreen');
        body.classList.add('fullscreen-mode');
        btn.textContent = '⛶ Exit Fullscreen';
        showNotification('🖥️ Fullscreen mode (ESC to exit)', 'success');
    } else {
        quizView.classList.remove('fullscreen');
        body.classList.remove('fullscreen-mode');
        btn.textContent = '⛶ Fullscreen';
    }
}

init();
