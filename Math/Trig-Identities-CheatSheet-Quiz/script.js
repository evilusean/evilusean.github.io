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

// State
let selectedIdentities = new Set(engineeringEssentials);
let savedForReview = JSON.parse(localStorage.getItem('savedTrig')) || [];
let currentQuizIndex = 0;
let quizList = [];
let quizInterval = null;
let isPaused = false;

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
    math = math.replace(/\\sin/g, '\\color{#e06666}{\\sin}');
    math = math.replace(/sin(?![\w])/g, '\\color{#e06666}{\\sin}');
    
    math = math.replace(/\\cos/g, '\\color{#5b9bd5}{\\cos}');
    math = math.replace(/cos(?![\w])/g, '\\color{#5b9bd5}{\\cos}');
    
    math = math.replace(/\\tan/g, '\\color{#b388ff}{\\tan}');
    math = math.replace(/tan(?![\w])/g, '\\color{#b388ff}{\\tan}');
    
    math = math.replace(/\\csc/g, '\\color{#ea9999}{\\csc}');
    math = math.replace(/csc(?![\w])/g, '\\color{#ea9999}{\\csc}');
    
    math = math.replace(/\\sec/g, '\\color{#6fa8dc}{\\sec}');
    math = math.replace(/sec(?![\w])/g, '\\color{#6fa8dc}{\\sec}');
    
    math = math.replace(/\\cot/g, '\\color{#c9a3ff}{\\cot}');
    math = math.replace(/cot(?![\w])/g, '\\color{#c9a3ff}{\\cot}');
    
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
        
        return `
        <div class="identity-item">
            <div class="identity-header" onclick="toggleDetails(${index})">
                <input type="checkbox" 
                    id="check-${index}" 
                    ${isSelected ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleSelection(${index}, '${identity.name.replace(/'/g, "\\'")}')">
                <span class="identity-name">${identity.name}</span>
            </div>
            <div class="identity-formula" title="${identity.formula}" data-formula="${identity.formula.replace(/"/g, '&quot;')}">${toMathJax(identity.formula)}</div>
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
            </div>
        </div>
    `;
    }).join('');
    
    // Add copy functionality to formulas
    document.querySelectorAll('.identity-formula').forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const formula = el.getAttribute('data-formula');
            navigator.clipboard.writeText(formula).then(() => {
                showNotification('📋 Formula copied!', 'copied');
            });
        });
    });
    
    refreshMathJax();
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
    document.getElementById('quiz-btn').onclick = () => switchView('quiz');
    document.getElementById('help-btn').onclick = () => switchView('help');
    document.getElementById('view-saved-btn-header').onclick = showSavedModal;
    
    document.getElementById('select-all-btn').onclick = selectAll;
    document.getElementById('deselect-all-btn').onclick = deselectAll;
    document.getElementById('save-url-btn').onclick = saveToURL;
    
    document.getElementById('exit-quiz-btn').onclick = () => switchView('cheatsheet');
    document.getElementById('prev-btn').onclick = prevCard;
    document.getElementById('next-btn').onclick = nextCard;
    document.getElementById('pause-btn').onclick = togglePause;
    document.getElementById('save-btn').onclick = saveForReviewFunc;
    
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
            if (e.key === ' ') { e.preventDefault(); togglePause(); }
            if (e.key === 'Enter') { e.preventDefault(); saveForReviewFunc(); }
            if (e.key === 'Escape') { e.preventDefault(); switchView('cheatsheet'); }
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
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) nextCard();
        if (touchEndX > touchStartX + 50) prevCard();
    }
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    const secondaryNav = document.querySelector('.secondary-nav');
    
    if (view === 'cheatsheet') {
        document.getElementById('cheatsheet-view').classList.add('active');
        document.getElementById('cheatsheet-btn').classList.add('active');
        secondaryNav.classList.remove('hidden');
        stopQuiz();
    } else if (view === 'quiz') {
        document.getElementById('quiz-view').classList.add('active');
        document.getElementById('quiz-btn').classList.add('active');
        secondaryNav.classList.add('hidden');
        startQuiz();
    } else if (view === 'help') {
        document.getElementById('help-view').classList.add('active');
        document.getElementById('help-btn').classList.add('active');
        secondaryNav.classList.remove('hidden');
        stopQuiz();
    }
}

function startQuiz() {
    quizList = trigIdentities.filter(id => selectedIdentities.has(id.name));
    if (quizList.length === 0) {
        alert('Please select at least one identity in cheatsheet mode');
        switchView('cheatsheet');
        return;
    }
    currentQuizIndex = 0;
    isPaused = false;
    showCard();
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
    const parsed = parseIdentity(identity);
    
    const nameEl = document.querySelector('.card-name');
    const formulaEl = document.querySelector('.card-formula');
    const descEl = document.querySelector('.card-description');
    const usageEl = document.querySelector('.card-usage');
    const exampleEl = document.querySelector('.card-example');
    
    // Reset
    nameEl.classList.remove('visible');
    formulaEl.classList.remove('visible');
    descEl.classList.remove('visible');
    usageEl.classList.remove('visible');
    exampleEl.classList.remove('visible');
    
    nameEl.textContent = identity.name;
    formulaEl.innerHTML = toMathJax(identity.formula);
    formulaEl.setAttribute('data-formula', identity.formula);
    formulaEl.title = 'Click to copy: ' + identity.formula;
    formulaEl.style.cursor = 'pointer';
    
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
    
    const speed = parseInt(document.getElementById('speed-slider').value);
    const baseDelay = 12000 - speed * 1000; // Base timing
    
    // Phase 1: Show name (3 seconds)
    setTimeout(() => nameEl.classList.add('visible'), 100);
    
    // Phase 2: Show formula (5 seconds after name)
    setTimeout(() => {
        formulaEl.classList.add('visible');
        
        if (document.getElementById('show-usage').checked) {
            // Phase 3: Show description (3 seconds after formula)
            setTimeout(() => {
                descEl.classList.add('visible');
                
                // Phase 4: Show usage (3 seconds after description)
                setTimeout(() => {
                    usageEl.classList.add('visible');
                    
                    // Phase 5: Show example (3 seconds after usage)
                    setTimeout(() => {
                        exampleEl.classList.add('visible');
                    }, 3000);
                }, 3000);
            }, 3000);
        }
    }, 5000);
    
    if (!isPaused) {
        // Total time: 3s (name) + 5s (formula) + 3s + 3s + 3s (details) = 17s base
        const totalTime = document.getElementById('show-usage').checked ? 17000 : 8000;
        quizInterval = setTimeout(() => {
            currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
            showCard();
        }, totalTime);
    }
}

function nextCard() {
    currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
    showCard();
}

function prevCard() {
    currentQuizIndex = (currentQuizIndex - 1 + quizList.length) % quizList.length;
    showCard();
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
    if (!isPaused) {
        showCard();
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

init();
