// Global variables
let kanjiData = [];
let selectedKanji = [];
let currentIndex = 0;
let isPaused = false;
let historyList = [];
let defaultRange = "1-100";

// Fetch the JSON data when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('RTK_Kanji_Meanings.json');
        const data = await response.json();
        kanjiData = data;
        
        // Set default value for input
        document.getElementById('index-range').value = defaultRange;
        
        // Setup event listeners
        document.getElementById('start-button').addEventListener('click', startGame);
        document.getElementById('pause-button').addEventListener('click', togglePause);
        document.getElementById('history-toggle').addEventListener('click', toggleHistory);
        
        // Hide history section initially
        document.getElementById('history-section').style.display = 'none';
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
    
    // Get range from input or use default
    const rangeInput = document.getElementById('index-range').value || defaultRange;
    let [start, end] = rangeInput.split('-').map(Number);
    
    // Validate input
    if (isNaN(start) || isNaN(end) || start < 1 || end > kanjiData.length || start > end) {
        alert(`Please enter a valid range between 1 and ${kanjiData.length}`);
        return;
    }
    
    // Adjust for zero-based index
    start = Math.max(0, start - 1);
    end = Math.min(kanjiData.length, end);
    
    // Get selected kanji and shuffle them
    selectedKanji = kanjiData.slice(start, end);
    shuffleArray(selectedKanji);
    
    // Reset game state
    currentIndex = 0;
    isPaused = false;
    document.getElementById('pause-button').textContent = 'Pause';
    
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
    historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
}
