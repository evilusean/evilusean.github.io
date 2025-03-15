// Global variables
let kanjiData = [];
let selectedKanji = [];
let currentIndex = 0;
let isPaused = false;
let historyList = [];
let defaultStartRange = 1;
let defaultEndRange = 20;
let trailElements = [];

// Fetch the JSON data when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('RTK_Kanji_Meanings.json');
        const data = await response.json();
        kanjiData = data;
        
        // Set default values for inputs
        document.getElementById('start-range').value = defaultStartRange;
        document.getElementById('end-range').value = defaultEndRange;
        
        // Setup event listeners
        document.getElementById('start-button').addEventListener('click', startGame);
        document.getElementById('pause-button').addEventListener('click', togglePause);
        document.getElementById('history-toggle').addEventListener('click', toggleHistory);
        document.getElementById('vocab-toggle').addEventListener('click', toggleVocab);
        
        // Hide sections initially
        document.getElementById('history-section').style.display = 'none';
        document.getElementById('vocab-section').style.display = 'none';
    } catch (error) {
        console.error('Error loading kanji data:', error);
        alert('Failed to load kanji data. Please check your connection and try again.');
    }
});

function startGame() {
    // Clear previous game state
    document.getElementById('kanji-display').innerHTML = '';
    document.getElementById('meaning-display').innerHTML = '';
    historyList = [];
    document.getElementById('history-list').innerHTML = '';
    
    // Get range from inputs
    const startRange = parseInt(document.getElementById('start-range').value) || defaultStartRange;
    const endRange = parseInt(document.getElementById('end-range').value) || defaultEndRange;
    
    // Validate input
    if (startRange < 1 || endRange > kanjiData.length || startRange > endRange) {
        alert(`Please enter a valid range between 1 and ${kanjiData.length}`);
        return;
    }
    
    // Adjust for zero-based index
    const start = Math.max(0, startRange - 1);
    const end = Math.min(kanjiData.length, endRange);
    
    // Get selected kanji and shuffle them
    selectedKanji = kanjiData.slice(start, end);
    shuffleArray(selectedKanji);
    
    // Reset game state
    currentIndex = 0;
    isPaused = false;
    document.getElementById('pause-button').textContent = 'Pause';
    
    // Populate vocab list
    populateVocabList(start, end);
    
    // Start dropping kanji
    dropNextKanji();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function dropNextKanji() {
    if (isPaused || currentIndex >= selectedKanji.length) {
        if (currentIndex >= selectedKanji.length) {
            // Restart with the same selection when all kanji have been shown
            shuffleArray(selectedKanji);
            currentIndex = 0;
        }
        return;
    }
    
    const kanjiObj = selectedKanji[currentIndex];
    const kanjiDisplay = document.getElementById('kanji-display');
    
    // Create kanji element
    const kanjiElement = document.createElement('div');
    kanjiElement.className = 'kanji';
    kanjiElement.textContent = kanjiObj.kanji;
    
    // Randomize horizontal position
    const randomX = Math.random() * 80 + 10; // Between 10% and 90% of the screen width
    kanjiElement.style.left = `${randomX}%`;
    
    // Add to display
    kanjiDisplay.appendChild(kanjiElement);
    
    // Create matrix trail effect
    createMatrixTrail(kanjiElement, randomX);
    
    // When animation ends, show meaning and drop next kanji
    kanjiElement.addEventListener('animationend', () => {
        showMeaning(kanjiObj);
        kanjiElement.remove();
        
        // Add to history
        addToHistory(kanjiObj);
        
        // Move to next kanji
        currentIndex++;
        
        // Schedule next drop
        setTimeout(() => {
            dropNextKanji();
        }, 2000); // Wait 2 seconds after showing meaning
    });
}

function createMatrixTrail(kanjiElement, xPosition) {
    const kanjiDisplay = document.getElementById('kanji-display');
    const trailInterval = setInterval(() => {
        if (isPaused) return;
        
        // Get current position of the kanji
        const rect = kanjiElement.getBoundingClientRect();
        const kanjiTop = rect.top;
        
        if (kanjiTop > 0 && kanjiTop < window.innerHeight) {
            // Create a trail element
            const trailElement = document.createElement('div');
            trailElement.className = 'kanji-trail';
            trailElement.textContent = kanjiElement.textContent;
            trailElement.style.left = `${xPosition}%`;
            trailElement.style.top = `${kanjiTop}px`;
            
            kanjiDisplay.appendChild(trailElement);
            
            // Remove trail element after animation completes
            trailElement.addEventListener('animationend', () => {
                trailElement.remove();
            });
        }
        
        // Stop creating trails if the kanji is no longer visible
        if (!kanjiElement.isConnected) {
            clearInterval(trailInterval);
        }
    }, 150); // Create a new trail every 150ms
}

function showMeaning(kanjiObj) {
    const meaningDisplay = document.getElementById('meaning-display');
    meaningDisplay.innerHTML = `
        <div class="meaning-container">
            <div class="kanji-large">${kanjiObj.kanji}</div>
            <div class="meaning-text">${kanjiObj.meaning}</div>
        </div>
    `;
    
    // Clear meaning after 2 seconds
    setTimeout(() => {
        meaningDisplay.innerHTML = '';
    }, 2000);
}

function addToHistory(kanjiObj) {
    historyList.push(kanjiObj);
    
    const historyListElement = document.getElementById('history-list');
    const listItem = document.createElement('div');
    listItem.className = 'history-item';
    listItem.innerHTML = `
        <span class="history-kanji">${kanjiObj.kanji}</span>
        <span class="history-meaning">${kanjiObj.meaning}</span>
    `;
    
    historyListElement.appendChild(listItem);
    
    // Scroll to bottom of history list
    historyListElement.scrollTop = historyListElement.scrollHeight;
}

function populateVocabList(start, end) {
    const vocabListElement = document.getElementById('vocab-list');
    vocabListElement.innerHTML = '';
    
    // Get all kanji in the selected range
    const vocabKanji = kanjiData.slice(start, end);
    
    vocabKanji.forEach(kanji => {
        const listItem = document.createElement('div');
        listItem.className = 'vocab-item';
        listItem.innerHTML = `
            <span class="vocab-kanji">${kanji.kanji}</span>
            <span class="vocab-meaning">${kanji.meaning}</span>
        `;
        
        vocabListElement.appendChild(listItem);
    });
}

function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pause-button');
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    
    if (!isPaused) {
        dropNextKanji();
    }
}

function toggleHistory() {
    const historySection = document.getElementById('history-section');
    const currentDisplay = historySection.style.display;
    
    // Hide vocab section if showing history
    if (currentDisplay === 'none') {
        document.getElementById('vocab-section').style.display = 'none';
    }
    
    historySection.style.display = currentDisplay === 'none' ? 'block' : 'none';
}

function toggleVocab() {
    const vocabSection = document.getElementById('vocab-section');
    const currentDisplay = vocabSection.style.display;
    
    // Hide history section if showing vocab
    if (currentDisplay === 'none') {
        document.getElementById('history-section').style.display = 'none';
    }
    
    vocabSection.style.display = currentDisplay === 'none' ? 'block' : 'none';
}
