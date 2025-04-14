// Global variables
let kanjiData = [];
let selectedKanji = [];
let currentIndex = 0;
let isPaused = false;
let historyList = [];
let defaultStartRange = 1;
let defaultEndRange = 20;
let trailElements = [];
let animationTimer = null;
let myList = new Map(); // Map to store kanji and wrong count
let isProcessingKanji = false; // Add this with other global variables at the top
let kanjiSize = 3.0; // Default size in rem
const MIN_SIZE = 2.0;
const MAX_SIZE = 12.0;

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
        document.getElementById('previous-button').addEventListener('click', showPreviousKanji);
        document.getElementById('next-button').addEventListener('click', showNextKanji);
        document.getElementById('mylist-toggle').addEventListener('click', toggleMyList);
        document.getElementById('size-increase').addEventListener('click', () => {
            if (kanjiSize < MAX_SIZE) {
                kanjiSize += 0.5;
                updateKanjiSize();
            }
        });
        document.getElementById('size-decrease').addEventListener('click', () => {
            if (kanjiSize > MIN_SIZE) {
                kanjiSize -= 0.5;
                updateKanjiSize();
            }
        });
        
        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeyPress);
        
        // Hide sections initially
        document.getElementById('history-section').style.display = 'none';
        document.getElementById('vocab-section').style.display = 'none';
        document.getElementById('mylist-section').style.display = 'none';
    } catch (error) {
        console.error('Error loading kanji data:', error);
        alert('Failed to load kanji data. Please check your connection and try again.');
    }

    // Mobile menu handling
    const menuToggle = document.getElementById('menu-toggle');
    const controlsContainer = document.querySelector('.controls-container');
    
    menuToggle.addEventListener('click', () => {
        controlsContainer.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!controlsContainer.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            controlsContainer.classList.contains('active')) {
            controlsContainer.classList.remove('active');
        }
    });

    // Screen orientation handling
    screen.orientation?.addEventListener('change', () => {
        adjustKanjiDisplayArea();
    });

    const dropdownContent = document.querySelector('.dropdown-content');

    menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownContent.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            dropdownContent.classList.remove('active');
        }
    });
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
    if (isProcessingKanji) return; // Also modify dropNextKanji to respect the flag

    // Clear any existing timers to prevent multiple instances
    if (animationTimer) {
        clearTimeout(animationTimer);
    }
    
    if (isPaused) {
        return;
    }
    
    // Check if we've reached the end of the array
    if (currentIndex >= selectedKanji.length) {
        // Restart with the same selection when all kanji have been shown
        shuffleArray(selectedKanji);
        currentIndex = 0;
    }
    
    const kanjiObj = selectedKanji[currentIndex];
    const kanjiDisplay = document.getElementById('kanji-display');
    
    // Create kanji element
    const kanjiElement = document.createElement('div');
    kanjiElement.className = 'kanji';
    kanjiElement.textContent = kanjiObj.kanji;
    kanjiElement.style.fontSize = `${kanjiSize}rem`;
    
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
        
        // Schedule next drop with a more reliable method
        animationTimer = setTimeout(() => {
            // Use requestAnimationFrame to ensure smooth animation timing
            requestAnimationFrame(() => {
                dropNextKanji();
            });
        }, 2000); // Wait 2 seconds after showing meaning
    });
    
    // Backup timer in case the animation event doesn't fire
    setTimeout(() => {
        if (kanjiElement.parentNode) {
            // If the element is still in the DOM after 7 seconds (5s animation + 2s buffer)
            // force the next kanji to drop
            kanjiElement.remove();
            showMeaning(kanjiObj);
            addToHistory(kanjiObj);
            currentIndex++;
            
            animationTimer = setTimeout(() => {
                requestAnimationFrame(() => {
                    dropNextKanji();
                });
            }, 2000);
        }
    }, 7000);
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
                }, 2000); // Remove after 1 second (matching the fade animation)
            }
        }, 200); // Create a new trail every 150ms (slightly slower)
        
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
    
    const startIndex = Math.max(0, start - 1);
    const endIndex = Math.min(kanjiData.length, end);
    const vocabKanji = kanjiData.slice(startIndex, endIndex);
    
    vocabKanji.forEach((kanji) => {
        const listItem = document.createElement('div');
        listItem.className = 'vocab-item';
        listItem.innerHTML = `
            <div class="left-group">
                <span class="vocab-index">${kanji.index}</span>
                <span class="vocab-kanji">${kanji.kanji}</span>
            </div>
            <span class="vocab-meaning">${kanji.meaning}</span>
        `;
        vocabListElement.appendChild(listItem);
    });
}

function toggleHistory() {
    const historySection = document.getElementById('history-section');
    const vocabSection = document.getElementById('vocab-section');
    const myListSection = document.getElementById('mylist-section');
    
    // Hide all sections
    vocabSection.style.display = 'none';
    myListSection.style.display = 'none';
    
    // Toggle history section
    historySection.style.display = historySection.style.display === 'none' ? 'block' : 'none';
    
    adjustKanjiDisplayArea();
}

function toggleVocab() {
    const historySection = document.getElementById('history-section');
    const vocabSection = document.getElementById('vocab-section');
    const myListSection = document.getElementById('mylist-section');
    
    // Hide all sections
    historySection.style.display = 'none';
    myListSection.style.display = 'none';
    
    // Toggle vocab section
    vocabSection.style.display = vocabSection.style.display === 'none' ? 'block' : 'none';
    
    adjustKanjiDisplayArea();
}

function adjustKanjiDisplayArea() {
    const kanjiDisplay = document.getElementById('kanji-display');
    const historyVisible = document.getElementById('history-section').style.display === 'block';
    const vocabVisible = document.getElementById('vocab-section').style.display === 'block';
    const myListVisible = document.getElementById('mylist-section').style.display === 'block';
    
    if (historyVisible || vocabVisible || myListVisible) {
        kanjiDisplay.style.height = '60%'; // Adjust height to 60% of container
        kanjiDisplay.style.width = '100%'; // Keep full width
    } else {
        kanjiDisplay.style.height = '100%';
        kanjiDisplay.style.width = '100%';
    }
}

// Add a visibility change handler to prevent pausing when tab is inactive
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && selectedKanji.length > 0 && !isPaused) {
        // Resume the animation if the tab becomes visible again
        dropNextKanji();
    }
});

// Add a periodic check to ensure the animation keeps running
function ensureAnimationRunning() {
    if (selectedKanji.length > 0 && !isPaused && document.visibilityState === 'visible') {
        const kanjiElements = document.querySelectorAll('.kanji');
        if (kanjiElements.length === 0) {
            // No kanji elements found, animation might have stalled
            console.log("Animation appears to have stalled. Restarting...");
            dropNextKanji();
        }
    }
    
    // Check again after 10 seconds
    setTimeout(ensureAnimationRunning, 10000);
}

// Start the periodic check
setTimeout(ensureAnimationRunning, 10000);

function handleKeyPress(event) {
    if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        if (kanjiSize < MAX_SIZE) {
            kanjiSize += 0.5;
            updateKanjiSize();
        }
    } else if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        if (kanjiSize > MIN_SIZE) {
            kanjiSize -= 0.5;
            updateKanjiSize();
        }
    }
    switch(event.key) {
        case ' ': // Space bar
            event.preventDefault();
            if (isProcessingKanji) return;
            
            const currentKanji = selectedKanji[currentIndex];
            if (currentKanji) {
                const kanjiElement = document.querySelector('.kanji');
                if (kanjiElement) {
                    isProcessingKanji = true;
                    kanjiElement.style.animationPlayState = 'paused';
                    kanjiElement.classList.remove('kanji-blink');
                    void kanjiElement.offsetWidth;
                    kanjiElement.classList.add('kanji-blink');
                    
                    setTimeout(() => {
                        kanjiElement.remove();
                        showMeaning(currentKanji);
                        addToMyList(currentKanji);
                        addToHistory(currentKanji); // Add to history when space is pressed
                        
                        setTimeout(() => {
                            currentIndex++;
                            isProcessingKanji = false;
                            dropNextKanji();
                        }, 2000);
                    }, 1000);
                }
            }
            break;
        case 'ArrowLeft':
            showPreviousKanji();
            break;
        case 'ArrowRight':
            showNextKanji();
            break;
        case 'Enter':
            startGame();
            break;
        case 'h': // Toggle History
        case 'H':
            toggleHistory();
            break;
        case 'v': // Toggle Vocab List
        case 'V':
            toggleVocab();
            break;
        case 'l': // Toggle My List
        case 'L':
            toggleMyList();
            break;
    }
}

function showPreviousKanji() {
    if (currentIndex > 0) {
        currentIndex--;
        clearDisplay();
        dropNextKanji();
    }
}

function showNextKanji() {
    currentIndex++;
    if (currentIndex >= selectedKanji.length) {
        currentIndex = 0;
    }
    clearDisplay();
    dropNextKanji();
}

function clearDisplay() {
    const kanjiDisplay = document.getElementById('kanji-display');
    const meaningDisplay = document.getElementById('meaning-display');
    kanjiDisplay.innerHTML = '';
    meaningDisplay.innerHTML = '';
}

function addToMyList(kanjiObj) {
    if (!kanjiObj) return;
    
    const count = myList.get(kanjiObj.kanji)?.count || 0;
    myList.set(kanjiObj.kanji, {
        index: kanjiObj.index,
        meaning: kanjiObj.meaning,
        count: count + 1
    });
    
    updateMyListDisplay();
}

function updateMyListDisplay() {
    const myListElement = document.getElementById('mylist-list');
    myListElement.innerHTML = '';
    
    const sortedEntries = [...myList.entries()].sort((a, b) => {
        if (b[1].count !== a[1].count) {
            return b[1].count - a[1].count;
        }
        return a[1].index - b[1].index;
    });
    
    sortedEntries.forEach(([kanji, data]) => {
        const listItem = document.createElement('div');
        listItem.className = 'mylist-item';
        listItem.innerHTML = `
            <span class="copy-text">${data.index}\t${kanji}\t${data.meaning}</span>
            <div class="right-group">
                <span class="wrong-count">× ${data.count}</span>
                <button class="remove-button" onclick="removeFromMyList('${kanji}')">Remove</button>
            </div>
        `;
        myListElement.appendChild(listItem);
    });
}

function removeFromMyList(kanji) {
    myList.delete(kanji);
    updateMyListDisplay();
}

function toggleMyList() {
    const historySection = document.getElementById('history-section');
    const vocabSection = document.getElementById('vocab-section');
    const myListSection = document.getElementById('mylist-section');
    
    // Hide all sections
    historySection.style.display = 'none';
    vocabSection.style.display = 'none';
    
    // Toggle mylist section
    myListSection.style.display = myListSection.style.display === 'none' ? 'block' : 'none';
    
    adjustKanjiDisplayArea();
}

function updateKanjiSize() {
    const root = document.documentElement;
    root.style.setProperty('--kanji-size', `${kanjiSize}rem`);
    // Update the size display
    document.getElementById('current-size').textContent = kanjiSize.toFixed(1);
}