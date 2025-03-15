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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        kanjiData = data;
        
        // Set default values for inputs
        document.getElementById('start-range').value = defaultStartRange;
        document.getElementById('end-range').value = defaultEndRange;
        
        // Setup event listeners
        document.getElementById('start-button').addEventListener('click', startGame);
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
    if (startRange < 1 || endRange > 2200 || startRange > endRange) {
        alert(`Please enter a valid range between 1 and 2200`);
        return;
    }
    
    // Adjust for zero-based index
    const start = Math.max(0, startRange - 1);
    const end = Math.min(2200, endRange);
    
    // Get selected kanji and shuffle them
    selectedKanji = kanjiData.slice(start, end);
    shuffleArray(selectedKanji);
    
    // Reset game state
    currentIndex = 0;
    isPaused = false;
    
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
    const trailElements = [];
    
    // Add a delay before starting the trail
    setTimeout(() => {
        // Create trail effect
        const trailInterval = setInterval(() => {
            if (isPaused || !kanjiElement.isConnected) {
                clearInterval(trailInterval);
                return;
            }
            
            const rect = kanjiElement.getBoundingClientRect();
            if (rect.top > 0) {
                // Create a trail element at the current position of the kanji
                const trailElement = document.createElement('div');
                trailElement.className = 'kanji-trail';
                trailElement.textContent = kanjiElement.textContent;
                trailElement.style.left = `${xPosition}%`;
                trailElement.style.top = `${rect.top - 130}px`; // Position further behind the kanji
                
                kanjiDisplay.appendChild(trailElement);
                trailElements.push(trailElement);
                
                // Remove trail element after animation completes
                setTimeout(() => {
                    if (trailElement.parentNode) {
                        trailElement.remove();
                    }
                }, 1000); // Remove after 1 second (matching the fade animation)
            }
        }, 150); // Create a new trail every 150ms (slightly slower)
        
        // Clean up all trail elements when the kanji is removed
        kanjiElement.addEventListener('animationend', () => {
            clearInterval(trailInterval);
            trailElements.forEach(el => {
                if (el.parentNode) {
                    el.remove();
                }
            });
        });
    },);
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

function toggleHistory() {
    const historySection = document.getElementById('history-section');
    const currentDisplay = historySection.style.display;
    
    // Hide vocab section if showing history
    document.getElementById('vocab-section').style.display = 'none';
    
    // Toggle history section
    historySection.style.display = currentDisplay === 'none' ? 'block' : 'none';
    
    // Adjust kanji display area
    adjustKanjiDisplayArea();
}

function toggleVocab() {
    const vocabSection = document.getElementById('vocab-section');
    const currentDisplay = vocabSection.style.display;
    
    // Hide history section if showing vocab
    document.getElementById('history-section').style.display = 'none';
    
    // Toggle vocab section
    vocabSection.style.display = currentDisplay === 'none' ? 'block' : 'none';
    
    // Adjust kanji display area
    adjustKanjiDisplayArea();
}

function adjustKanjiDisplayArea() {
    const kanjiDisplay = document.getElementById('kanji-display');
    const historyVisible = document.getElementById('history-section').style.display === 'block';
    const vocabVisible = document.getElementById('vocab-section').style.display === 'block';
    
    if (historyVisible || vocabVisible) {
        kanjiDisplay.style.height = '60%'; // Adjust height to 60% of container
        kanjiDisplay.style.width = '100%'; // Keep full width
    } else {
        kanjiDisplay.style.height = '100%';
        kanjiDisplay.style.width = '100%';
    }
}
