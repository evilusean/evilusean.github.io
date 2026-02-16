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
    renderCheatsheet();
    setupEventListeners();
    loadSavedSelections();
}

function renderCheatsheet() {
    const container = document.getElementById('identities-list');
    container.innerHTML = trigIdentities.map((identity, index) => `
        <div class="identity-item">
            <div class="identity-header" onclick="toggleDetails(${index})">
                <input type="checkbox" 
                    id="check-${index}" 
                    ${selectedIdentities.has(identity.name) ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleSelection('${identity.name.replace(/'/g, "\\'")}')">
                <span class="identity-name">${identity.name}</span>
            </div>
            <div class="identity-formula">${identity.formula}</div>
            <div class="identity-details" id="details-${index}">
                <p><strong>Description:</strong> ${identity.description}</p>
                <p><strong>Usage:</strong> ${identity.usage}</p>
            </div>
        </div>
    `).join('');
}

function toggleDetails(index) {
    const details = document.getElementById(`details-${index}`);
    details.classList.toggle('visible');
}

function toggleSelection(name) {
    if (selectedIdentities.has(name)) {
        selectedIdentities.delete(name);
    } else {
        selectedIdentities.add(name);
    }
    localStorage.setItem('selectedIdentities', JSON.stringify([...selectedIdentities]));
}

function loadSavedSelections() {
    const saved = localStorage.getItem('selectedIdentities');
    if (saved) {
        selectedIdentities = new Set(JSON.parse(saved));
    }
}

function setupEventListeners() {
    document.getElementById('cheatsheet-btn').onclick = () => switchView('cheatsheet');
    document.getElementById('quiz-btn').onclick = () => switchView('quiz');
    document.getElementById('help-btn').onclick = () => switchView('help');
    
    document.getElementById('prev-btn').onclick = prevCard;
    document.getElementById('next-btn').onclick = nextCard;
    document.getElementById('pause-btn').onclick = togglePause;
    document.getElementById('save-btn').onclick = saveForReviewFunc;
    
    document.getElementById('speed-slider').oninput = updateSpeed;
    
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
        clearInterval(quizInterval);
        quizInterval = null;
    }
}

function showCard() {
    stopQuiz();
    
    const identity = quizList[currentQuizIndex];
    const nameEl = document.querySelector('.card-name');
    const formulaEl = document.querySelector('.card-formula');
    const usageEl = document.querySelector('.card-usage');
    
    // Reset
    nameEl.classList.remove('visible');
    formulaEl.classList.remove('visible');
    usageEl.classList.remove('visible');
    
    nameEl.textContent = identity.name;
    formulaEl.textContent = identity.formula;
    usageEl.textContent = identity.usage;
    
    // Reveal sequence
    setTimeout(() => nameEl.classList.add('visible'), 100);
    
    const speed = parseInt(document.getElementById('speed-slider').value);
    const delay = 11000 - speed * 1000; // 10s to 1s
    
    setTimeout(() => {
        formulaEl.classList.add('visible');
        if (document.getElementById('show-usage').checked) {
            setTimeout(() => usageEl.classList.add('visible'), delay / 2);
        }
    }, delay / 2);
    
    if (!isPaused) {
        quizInterval = setTimeout(() => {
            currentQuizIndex = (currentQuizIndex + 1) % quizList.length;
            showCard();
        }, delay * 2);
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
        
        // Visual feedback
        const card = document.getElementById('quiz-card');
        card.style.transform = 'scale(1.05)';
        card.style.borderColor = 'var(--accent)';
        setTimeout(() => {
            card.style.transform = 'scale(1)';
            card.style.borderColor = '';
        }, 300);
    }
}

function updateSpeed() {
    if (!isPaused && quizInterval) {
        showCard();
    }
}

init();