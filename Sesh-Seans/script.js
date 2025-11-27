// Configuration is loaded from config.js (not tracked in git)
// If CONFIG is not defined, it means config.js is missing
if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not found! Please create config.js from config-template.js');
}

// State management
let state = {
    isSignedIn: false,
    accessToken: null,
    spreadsheetId: null,
    timerInterval: null,
    timerSeconds: 900, // 15 minutes default
    timerRunning: false,
    currentDate: null,
    todayExercises: []
};

// DOM Elements
let elements = {};

// Initialize DOM elements after page load
function initElements() {
    elements = {
        authButton: document.getElementById('authButton'),
        userInfo: document.getElementById('userInfo'),
        appContent: document.getElementById('appContent'),
        timerDisplay: document.getElementById('timerDisplay'),
        startTimer: document.getElementById('startTimer'),
        pauseTimer: document.getElementById('pauseTimer'),
        resetTimer: document.getElementById('resetTimer'),
        timerInterval: document.getElementById('timerInterval'),
        exerciseForm: document.getElementById('exerciseForm'),
        exerciseName: document.getElementById('exerciseName'),
        customExercise: document.getElementById('customExercise'),
        weight: document.getElementById('weight'),
        reps: document.getElementById('reps'),
        time: document.getElementById('time'),
        statusMessage: document.getElementById('statusMessage'),
        todayLog: document.getElementById('todayLog')
    };
}

// Check if credentials are configured
function checkCredentials() {
    if (typeof CONFIG === 'undefined') {
        const msg = '⚠️ config.js file is missing!\n\n1. Copy config-template.js to config.js\n2. Add your Google API credentials\n3. Refresh the page';
        if (elements.authButton) {
            elements.authButton.textContent = 'Missing config.js';
            elements.authButton.disabled = true;
            elements.authButton.style.backgroundColor = '#dc3545';
        }
        console.error(msg);
        alert(msg);
        return false;
    }
    
    if (CONFIG.CLIENT_ID.includes('YOUR_GOOGLE') || CONFIG.API_KEY.includes('YOUR_GOOGLE')) {
        const msg = '⚠️ Please configure your Google API credentials in config.js. See README.md for instructions.';
        if (elements.authButton) {
            elements.authButton.textContent = 'Configure Credentials First';
            elements.authButton.disabled = true;
            elements.authButton.style.backgroundColor = '#dc3545';
        }
        console.error(msg);
        alert(msg);
        return false;
    }
    return true;
}

// Initialize Google API
function initGoogleAPI() {
    if (!checkCredentials()) {
        return;
    }

    // Check if gapi is loaded
    if (typeof gapi === 'undefined') {
        console.error('Google API library not loaded');
        setTimeout(initGoogleAPI, 500);
        return;
    }

    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: CONFIG.API_KEY,
            clientId: CONFIG.CLIENT_ID,
            discoveryDocs: CONFIG.DISCOVERY_DOCS,
            scope: CONFIG.SCOPES
        }).then(() => {
            console.log('Google API initialized successfully');
            const authInstance = gapi.auth2.getAuthInstance();
            authInstance.isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(authInstance.isSignedIn.get());
            
            // Setup auth button
            setupAuthButton();
        }).catch(error => {
            console.error('Error initializing Google API:', error);
            
            let errorMsg = '❌ Google API Error\n\n';
            
            // Check for origin error
            if (error.details && error.details.includes('Not a valid origin')) {
                const currentOrigin = window.location.origin;
                errorMsg += `Your current URL (${currentOrigin}) is not authorized.\n\n`;
                errorMsg += '🔧 FIX:\n';
                errorMsg += '1. Go to: https://console.developers.google.com/\n';
                errorMsg += '2. Click APIs & Services → Credentials\n';
                errorMsg += '3. Edit your OAuth 2.0 Client ID\n';
                errorMsg += `4. Add this origin: ${currentOrigin}\n`;
                errorMsg += '5. Save and wait 1-2 minutes\n\n';
                errorMsg += 'See FIX_ORIGIN_ERROR.md for detailed instructions.';
                
                if (elements.authButton) {
                    elements.authButton.textContent = 'Origin Not Authorized';
                    elements.authButton.disabled = true;
                    elements.authButton.style.backgroundColor = '#dc3545';
                }
            } else if (error.details) {
                errorMsg += error.details;
                if (elements.authButton) {
                    elements.authButton.textContent = 'API Error - Check Console';
                    elements.authButton.disabled = true;
                }
            } else {
                errorMsg += 'Check console for details.\n';
                errorMsg += 'Make sure your credentials are correct and authorized origins are set.';
                if (elements.authButton) {
                    elements.authButton.textContent = 'API Error - Check Console';
                    elements.authButton.disabled = true;
                }
            }
            
            alert(errorMsg);
            console.log('📖 See docs/FIX_ORIGIN_ERROR.md for help with origin errors');
        });
    });
}

// Setup auth button handler
function setupAuthButton() {
    if (!elements.authButton) return;
    
    elements.authButton.addEventListener('click', () => {
        const authInstance = gapi.auth2.getAuthInstance();
        if (state.isSignedIn) {
            authInstance.signOut();
        } else {
            authInstance.signIn().catch(error => {
                console.error('Sign-in error:', error);
                alert('Sign-in failed. Please try again.');
            });
        }
    });
}

// Update sign-in status
function updateSignInStatus(isSignedIn) {
    state.isSignedIn = isSignedIn;
    
    if (isSignedIn) {
        console.log('User signed in');
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        
        elements.authButton.textContent = 'Sign Out';
        elements.authButton.disabled = false;
        elements.userInfo.textContent = `Logged in as: ${profile.getName()}`;
        elements.userInfo.classList.remove('hidden');
        elements.appContent.classList.remove('hidden');
        
        state.accessToken = user.getAuthResponse().access_token;
        initializeApp();
    } else {
        console.log('User signed out');
        elements.authButton.textContent = 'Sign in with Google';
        elements.authButton.disabled = false;
        elements.userInfo.classList.add('hidden');
        elements.appContent.classList.add('hidden');
    }
}

// Initialize app after sign-in
async function initializeApp() {
    await findOrCreateSpreadsheet();
    checkAndAddDaySeparator();
    loadTodayExercises();
    setExerciseDefaults();
}

// Find or create the yearly spreadsheet
async function findOrCreateSpreadsheet() {
    const year = new Date().getFullYear();
    const sheetName = `${year}-Sesh-Seans`;
    
    try {
        // Search for existing spreadsheet
        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/drive/v3/files',
            params: {
                q: `name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'`,
                fields: 'files(id, name)'
            }
        });
        
        if (response.result.files && response.result.files.length > 0) {
            state.spreadsheetId = response.result.files[0].id;
            console.log('Found existing spreadsheet:', state.spreadsheetId);
        } else {
            // Create new spreadsheet
            const createResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: sheetName
                }
            });
            
            state.spreadsheetId = createResponse.result.spreadsheetId;
            console.log('Created new spreadsheet:', state.spreadsheetId);
            
            // Add header row
            await appendToSheet([['Date', 'Time', 'Exercise', 'Weight', 'Reps/Time']]);
        }
    } catch (error) {
        console.error('Error with spreadsheet:', error);
        showStatus('Error accessing Google Sheets. Check console.', 'error');
    }
}

// Check if we need to add a day separator
async function checkAndAddDaySeparator() {
    const today = new Date().toISOString().split('T')[0];
    
    if (state.currentDate !== today) {
        state.currentDate = today;
        
        try {
            // Get last row to check if it's already a separator
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: state.spreadsheetId,
                range: 'Sheet1!A:A'
            });
            
            const values = response.result.values || [];
            const lastRow = values[values.length - 1];
            
            // Add separator if last row isn't empty
            if (lastRow && lastRow[0]) {
                await appendToSheet([['', '', '', '', '']]);
            }
        } catch (error) {
            console.error('Error checking day separator:', error);
        }
    }
}

// Append data to sheet
async function appendToSheet(values) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: state.spreadsheetId,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        
        return response;
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
}

// Timer functions
function updateTimerDisplay() {
    const minutes = Math.floor(state.timerSeconds / 60);
    const seconds = state.timerSeconds % 60;
    elements.timerDisplay.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setupTimerListeners() {
    elements.startTimer.addEventListener('click', () => {
        if (!state.timerRunning) {
            state.timerRunning = true;
            elements.startTimer.classList.add('hidden');
            elements.pauseTimer.classList.remove('hidden');
            
            state.timerInterval = setInterval(() => {
                if (state.timerSeconds > 0) {
                    state.timerSeconds--;
                    updateTimerDisplay();
                } else {
                    // Timer finished
                    playNotification();
                    resetTimer();
                }
            }, 1000);
        }
    });

    elements.pauseTimer.addEventListener('click', () => {
        state.timerRunning = false;
        clearInterval(state.timerInterval);
        elements.startTimer.classList.remove('hidden');
        elements.pauseTimer.classList.add('hidden');
    });

    elements.resetTimer.addEventListener('click', () => {
        resetTimer();
    });

    elements.timerInterval.addEventListener('change', () => {
        if (!state.timerRunning) {
            resetTimer();
        }
    });
}

function resetTimer() {
    state.timerRunning = false;
    clearInterval(state.timerInterval);
    const intervalMinutes = parseInt(elements.timerInterval.value) || 15;
    state.timerSeconds = intervalMinutes * 60;
    updateTimerDisplay();
    elements.startTimer.classList.remove('hidden');
    elements.pauseTimer.classList.add('hidden');
}

function playNotification() {
    // Play browser notification sound
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
            body: 'Time to log your exercise!',
            icon: '💪'
        });
    }
    // Fallback: alert
    alert('Timer Complete! Time to log your exercise!');
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Exercise form handling
function setupExerciseListeners() {
    elements.exerciseName.addEventListener('change', (e) => {
        if (e.target.value === 'Custom') {
            elements.customExercise.classList.remove('hidden');
        } else {
            elements.customExercise.classList.add('hidden');
            setExerciseDefaults();
        }
    });

    elements.exerciseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0];
        
        let exerciseName = elements.exerciseName.value;
        if (exerciseName === 'Custom') {
            exerciseName = elements.customExercise.value || 'Custom Exercise';
        }
        
        const weight = elements.weight.value;
        const reps = elements.reps.value;
        const timeValue = elements.time.value;
        
        // Format reps/time column
        let repsTime = '';
        if (parseInt(reps) > 0 && parseInt(timeValue) > 0) {
            repsTime = `${reps} reps / ${timeValue}s`;
        } else if (parseInt(reps) > 0) {
            repsTime = `${reps} reps`;
        } else if (parseInt(timeValue) > 0) {
            repsTime = `${timeValue}s`;
        }
        
        const rowData = [date, time, exerciseName, weight, repsTime];
        
        try {
            await checkAndAddDaySeparator();
            await appendToSheet([rowData]);
            
            showStatus('Exercise logged successfully! 💪', 'success');
            
            // Add to today's log
            state.todayExercises.push({
                time,
                exercise: exerciseName,
                weight,
                repsTime
            });
            updateTodayLog();
            
            // Reset timer
            resetTimer();
        } catch (error) {
            console.error('Error logging exercise:', error);
            showStatus('Error logging exercise. Please try again.', 'error');
        }
    });
}

function setExerciseDefaults() {
    const exercise = elements.exerciseName.value;
    
    switch(exercise) {
        case 'Stomach Vacuum':
            elements.weight.value = 0;
            elements.reps.value = 0;
            elements.time.value = 15;
            break;
        case 'Pullups':
            elements.weight.value = 0;
            elements.reps.value = 15;
            elements.time.value = 0;
            break;
        case 'Situps':
            elements.weight.value = 0;
            elements.reps.value = 100;
            elements.time.value = 0;
            break;
        case 'Burpees':
            elements.weight.value = 0;
            elements.reps.value = 25;
            elements.time.value = 0;
            break;
        default:
            break;
    }
}

function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = type;
    
    setTimeout(() => {
        elements.statusMessage.textContent = '';
        elements.statusMessage.className = '';
    }, 5000);
}

function loadTodayExercises() {
    // This would ideally load from the sheet, but for simplicity we'll track in session
    state.todayExercises = [];
    updateTodayLog();
}

function updateTodayLog() {
    if (state.todayExercises.length === 0) {
        elements.todayLog.innerHTML = '<h3>Today\'s Exercises</h3><p>No exercises logged yet today.</p>';
    } else {
        let html = '<h3>Today\'s Exercises</h3>';
        state.todayExercises.forEach(ex => {
            html += `
                <div class="log-entry">
                    <strong>${ex.time}</strong> - ${ex.exercise} 
                    ${ex.weight > 0 ? `(${ex.weight} lbs)` : ''} 
                    ${ex.repsTime ? `- ${ex.repsTime}` : ''}
                </div>
            `;
        });
        elements.todayLog.innerHTML = html;
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, initializing...');
    initElements();
    setupTimerListeners();
    setupExerciseListeners();
    updateTimerDisplay();
    
    // Wait a bit for Google API scripts to load
    setTimeout(() => {
        initGoogleAPI();
    }, 500);
});
