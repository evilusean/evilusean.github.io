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
            <div class="identity-formula">${identity.formula}</div>
            <div class="identity-details ${isSelected ? 'visible' : ''}" id="details-${index}">
                <div class="identity-section">
                    <h4>Description</h4>
                    <p>${parsed.description}</p>
                </div>
                <div class="identity-section">
                    <h4>When to Use</h4>
                    <p>${parsed.usage}</p>
                </div>
                <div class="identity-section">
                    <h4>Example</h4>
                    <p>${parsed.example}</p>
                </div>
            </div>
        </div>
    `;
    }).join('');
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
        alert('URL copied to clipboard! Share this link to save your selection.');
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
    
    document.getElementById('select-all-btn').onclick = selectAll;
    document.getElementById('deselect-all-btn').onclick = deselectAll;
    document.getElementById('save-url-btn').onclick = saveToURL;
    document.getElementById('load-url-btn').onclick = () => {
        const url = prompt('Paste the URL:');
        if (url) {
            window.location.href = url;
        }
    };
    
    document.getElementById('prev-btn').onclick = prevCard;
    document.getElementById('next-btn').onclick = nextCard;
    document.getElementById('pause-btn').onclick = togglePause;
    document.getElementById('save-btn').onclick = saveForReviewFunc;
    document.getElementById('view-saved-btn').onclick = showSavedModal;
    
    document.getElementById('speed-slider').oninput = updateSpeed;
    
    // Modal close
    document.querySelector('.close').onclick = closeSavedModal;
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
            if (e.key === 'ArrowLeft') prevCard();
            if (e.key === 'ArrowRight') nextCard();
            if (e.key === ' ') { e.preventDefault(); saveForReviewFunc(); }
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
    
    if (view === 'cheatsheet') {
        document.getElementById('cheatsheet-view').classList.add('active');
        document.getElementById('cheatsheet-btn').classList.add('active');
        stopQuiz();
    } else if (view === 'quiz') {
        document.getElementById('quiz-view').classList.add('active');
        document.getElementById('quiz-btn').classList.add('active');
        startQuiz();
    } else if (view === 'help') {
        document.getElementById('help-view').classList.add('active');
        document.getElementById('help-btn').classList.add('active');
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
    formulaEl.textContent = identity.formula;
    descEl.textContent = parsed.description;
    usageEl.textContent = parsed.usage;
    exampleEl.textContent = parsed.example;
    
    // Reveal sequence
    setTimeout(() => nameEl.classList.add('visible'), 100);
    
    const speed = parseInt(document.getElementById('speed-slider').value);
    const delay = 11000 - speed * 1000; // 10s to 1s
    
    setTimeout(() => {
        formulaEl.classList.add('visible');
        
        if (document.getElementById('show-usage').checked) {
            setTimeout(() => {
                descEl.classList.add('visible');
                setTimeout(() => {
                    usageEl.classList.add('visible');
                    setTimeout(() => {
                        exampleEl.classList.add('visible');
                    }, delay / 4);
                }, delay / 4);
            }, delay / 4);
        }
    }, delay / 2);
    
    if (!isPaused) {
        quizInterval = setTimeout(() => {
            currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
            showCard();
        }, delay * 2.5);
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
    if (!savedForReview.includes(identity.name)) {
        savedForReview.push(identity.name);
        localStorage.setItem('savedTrig', JSON.stringify(savedForReview));
        updateSavedCount();
        
        // Visual feedback
        const card = document.getElementById('quiz-card');
        const btn = document.getElementById('save-btn');
        card.style.transform = 'scale(1.05)';
        card.style.border = '2px solid var(--accent)';
        btn.textContent = '✓ Saved!';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            card.style.border = '';
            btn.textContent = 'Save for Review';
        }, 800);
    }
}

function updateSavedCount() {
    document.getElementById('saved-count').textContent = savedForReview.length;
}

function showSavedModal() {
    const modal = document.getElementById('saved-modal');
    const list = document.getElementById('saved-list');
    
    if (savedForReview.length === 0) {
        list.innerHTML = '<p style="color: var(--text-secondary);">No items saved yet. Press Space or click "Save for Review" during quiz mode.</p>';
    } else {
        list.innerHTML = savedForReview.map((name, idx) => `
            <div class="saved-item">
                <strong>${name}</strong>
                <button onclick="removeSaved(${idx})" style="float: right; background: var(--accent); border: none; color: white; padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 3px;">Remove</button>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
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
    }
}

function updateSpeed() {
    if (!isPaused && quizInterval) {
        showCard();
    }
}

init();
