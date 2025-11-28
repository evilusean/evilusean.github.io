// Configuration is loaded from config.js (not tracked in git)
if (typeof CONFIG === 'undefined') {
    console.error('CONFIG not found! Please create config.js from config-template.js');
}

// Exercise descriptions
const EXERCISE_DESCRIPTIONS = {
    'Stomach Vacuum': 'Exhale all air, pull belly button toward spine, hold. Great for transverse abdominis.',
    'Plank': 'Forearms on ground, body straight from head to heels. Engage core, don\'t let hips sag.',
    'Side Plank (Left)': 'On left forearm, stack feet, lift hips. Keep body in straight line.',
    'Side Plank (Right)': 'On right forearm, stack feet, lift hips. Keep body in straight line.',
    'Hollow Body Hold': 'Lie on back, press lower back to floor, lift shoulders and legs. Arms overhead.',
    'Dead Bug': 'On back, extend opposite arm and leg while keeping core engaged. Alternate sides.',
    'Bicycle Crunches': 'On back, bring opposite elbow to knee in cycling motion. Keep core tight.',
    'Russian Twists': 'Seated, lean back, twist torso side to side. Can hold weight for resistance.',
    'Leg Raises': 'Lie on back, lift straight legs to 90°, lower slowly without touching ground.',
    'Flutter Kicks': 'On back, lift legs slightly, alternate small up-down kicks. Keep core engaged.',
    'Mountain Climbers': 'Plank position, drive knees to chest alternating quickly. Keep hips level.',
    'V-Ups': 'Lie flat, simultaneously lift legs and torso to form V shape. Touch toes.',
    'Situps': 'Lie on back, knees bent, lift torso to knees. Control the descent.',
    'Pullups': 'Hang from bar, pull chin over bar. Full range of motion, control descent.',
    'Chin-ups': 'Like pullups but palms facing you. Easier variation, works biceps more.',
    'Negative Pullups': 'Jump to top position, lower yourself slowly (5+ seconds).',
    'Dead Hang': 'Hang from bar with straight arms. Builds grip strength and decompresses spine.',
    'Hanging Knee Raises': 'Hang from bar, bring knees to chest. Control the movement.',
    'Hanging Leg Raises': 'Hang from bar, lift straight legs to 90°. Advanced core exercise.',
    'L-Sit Hold': 'Hang or support on bars, lift legs to 90° and hold. Very challenging.',
    'Push-ups': 'Hands shoulder-width, lower chest to ground, push up. Keep body straight.',
    'Diamond Push-ups': 'Hands together forming diamond, targets triceps more than regular pushups.',
    'Wide Push-ups': 'Hands wider than shoulders, emphasizes chest muscles.',
    'Pike Push-ups': 'Hips high, head toward ground. Targets shoulders, progression to handstand pushups.',
    'Burpees': 'Squat, jump back to plank, pushup, jump feet forward, jump up. Full body cardio.',
    'Squats': 'Feet shoulder-width, lower hips back and down, keep chest up. Thighs parallel to ground.',
    'Jump Squats': 'Regular squat but explode up into a jump. Land softly.',
    'Lunges': 'Step forward, lower back knee toward ground. Keep front knee over ankle.',
    'Bulgarian Split Squats': 'Back foot elevated, lunge down on front leg. Very challenging.',
    'Glute Bridges': 'On back, knees bent, lift hips high. Squeeze glutes at top.',
    'Single Leg Glute Bridge': 'Like glute bridge but one leg extended. Harder balance and strength.',
    'Wall Sit': 'Back against wall, slide down to 90° knee angle. Hold position.',
    'Calf Raises': 'Rise up on toes, lower slowly. Can do on edge of step for more range.',
    'Dumbbell Curl': 'Arms at sides, curl weights to shoulders. Keep elbows stationary.',
    'Hammer Curl': 'Like curls but palms facing each other. Works brachialis muscle.',
    'Overhead Press': 'Start at shoulders, press weights overhead. Keep core tight.',
    'Lateral Raise': 'Arms at sides, lift weights out to sides to shoulder height.',
    'Front Raise': 'Arms at sides, lift weights forward to shoulder height.',
    'Bent Over Row': 'Hinge at hips, pull weights to ribcage. Squeeze shoulder blades.',
    'Single Arm Row': 'One hand supported, row weight with other arm. Alternate sides.',
    'Chest Press (Floor)': 'Lie on floor, press weights up from chest. Good for home workouts.',
    'Chest Fly (Floor)': 'Lie on floor, arc weights out and together. Stretch and squeeze chest.',
    'Goblet Squat': 'Hold weight at chest, squat down. Great for form and depth.',
    'Dumbbell Deadlift': 'Weights at sides, hinge at hips, lower weights along legs. Keep back straight.',
    'Dumbbell Lunge': 'Hold weights at sides, perform lunges. Adds resistance to bodyweight movement.',
    'Dumbbell Shrug': 'Weights at sides, lift shoulders toward ears. Targets traps.',
    'Tricep Extension': 'Weight overhead, lower behind head, extend back up. Keep elbows still.',
    'Dumbbell Swing': 'Hinge and swing weight between legs, thrust hips to swing up. Explosive movement.',
    'Superman Hold': 'Lie face down, lift arms and legs off ground. Hold position.',
    'Bridge Hold': 'Glute bridge position held at top. Squeeze glutes throughout.',
    'Seated Soleus Raise': 'Seated, knees bent, raise heels off ground. Targets soleus muscle specifically.',
    'Seated Soleus Hold': 'Seated calf raise held at top position. Burns the soleus.',
    'Seated Calf Raise': 'Seated, raise heels up and down. Can add weight on knees.',
    'Seated Knee Extension Hold': 'Seated, extend one leg straight and hold. Isometric quad work.',
    'Seated Hip Flexor Hold': 'Seated, lift knee up and hold. Works hip flexors isometrically.',
    'Seated Glute Squeeze': 'Seated, squeeze glutes hard. Can do anywhere, anytime.',
    'Seated Ab Vacuum': 'Seated version of stomach vacuum. Pull belly button to spine.',
    'Seated Chest Squeeze': 'Press palms together in front of chest. Hold with maximum force.',
    'Seated Shoulder Blade Squeeze': 'Pull shoulder blades together and hold. Improves posture.',
    'Seated Neck Isometric (Front)': 'Push forehead into hand, resist. Strengthens neck.',
    'Seated Neck Isometric (Side)': 'Push side of head into hand, resist. Do both sides.',
    'Seated Fist Clench': 'Make tight fists and hold. Builds grip and forearm strength.',
    'Seated Forearm Plank (Desk)': 'Lean on desk with forearms, hold plank position.',
    'Seated Leg Extension Hold': 'Extend leg straight, hold. Isometric quad strengthening.',
    'Seated Ankle Dorsiflexion Hold': 'Pull toes toward shin and hold. Strengthens tibialis anterior.'
};

// State management
let state = {
    isSignedIn: false,
    accessToken: null,
    spreadsheetId: null,
    pomodoroSpreadsheetId: null,
    workoutLogSheetName: 'Sheet1', // Will be detected
    intervalTimerHandle: null,
    timerSeconds: 900, // 15 minutes default
    timerRunning: false,
    timerEndTime: null, // Timestamp when timer should end
    workoutTimerHandle: null,
    workoutTimerSeconds: 30, // 30 seconds default
    workoutTimerRunning: false,
    workoutTimerEndTime: null, // Timestamp when workout timer should end
    pomodoroTimerHandle: null,
    pomodoroSeconds: 1200, // 20 minutes default
    pomodoroRunning: false,
    pomodoroOnBreak: false,
    pomodoroBreakSeconds: 300, // 5 minutes default
    pomodoroEndTime: null, // Timestamp when pomodoro should end
    alarmTime: null,
    alarmCheckInterval: null,
    alarmMode: 'time', // 'time' or 'countdown'
    alarmCountdownHandle: null,
    alarmCountdownSeconds: 0,
    alarmCountdownEndTime: null, // Timestamp when countdown should end
    currentDate: null,
    todayExercises: [],
    todayPomodoros: [],
    tokenClient: null,
    tokenRefreshInterval: null,
    allExercises: [], // Store all exercises for filtering
    sortCategories: [], // Store sort categories
    pomodoroSubjects: [] // Store pomodoro subjects
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
        workoutTimerDisplay: document.getElementById('workoutTimerDisplay'),
        startWorkoutTimer: document.getElementById('startWorkoutTimer'),
        pauseWorkoutTimer: document.getElementById('pauseWorkoutTimer'),
        resetWorkoutTimer: document.getElementById('resetWorkoutTimer'),
        workoutTimerDuration: document.getElementById('workoutTimerDuration'),
        exerciseForm: document.getElementById('exerciseForm'),
        exerciseName: document.getElementById('exerciseName'),
        customExercise: document.getElementById('customExercise'),
        weight: document.getElementById('weight'),
        reps: document.getElementById('reps'),
        time: document.getElementById('time'),
        statusMessage: document.getElementById('statusMessage'),
        todayLog: document.getElementById('todayLog'),
        manageExercises: document.getElementById('manageExercises'),
        updateCurrentExercise: document.getElementById('updateCurrentExercise'),
        autoSetWorkoutTimer: document.getElementById('autoSetWorkoutTimer'),
        sortFilter: document.getElementById('sortFilter'),
        exerciseDescription: document.getElementById('exerciseDescription'),
        exerciseInstructions: document.getElementById('exerciseInstructions'),
        // Pomodoro elements
        pomodoroToggle: document.getElementById('pomodoroToggle'),
        pomodoroTimerDisplay: document.getElementById('pomodoroTimerDisplay'),
        pomodoroStatus: document.getElementById('pomodoroStatus'),
        startPomodoro: document.getElementById('startPomodoro'),
        pausePomodoro: document.getElementById('pausePomodoro'),
        resetPomodoro: document.getElementById('resetPomodoro'),
        pomodoroForm: document.getElementById('pomodoroForm'),
        pomodoroSubject: document.getElementById('pomodoroSubject'),
        customSubject: document.getElementById('customSubject'),
        pomodoroStudyTime: document.getElementById('pomodoroStudyTime'),
        pomodoroBreakTime: document.getElementById('pomodoroBreakTime'),
        pomodoroNotes: document.getElementById('pomodoroNotes'),
        managePomodoroSheet: document.getElementById('managePomodoroSheet'),
        todayPomodoro: document.getElementById('todayPomodoro'),
        // Alarm elements
        alarmToggle: document.getElementById('alarmToggle'),
        alarmDisplay: document.getElementById('alarmDisplay'),
        alarmHour: document.getElementById('alarmHour'),
        alarmMinute: document.getElementById('alarmMinute'),
        countdownMinutes: document.getElementById('countdownMinutes'),
        countdownSeconds: document.getElementById('countdownSeconds'),
        setAlarm: document.getElementById('setAlarm'),
        cancelAlarm: document.getElementById('cancelAlarm'),
        alarmStatus: document.getElementById('alarmStatus')
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

// Initialize Google API with new GIS library
function initGoogleAPI() {
    if (!checkCredentials()) {
        return;
    }

    // Check if libraries are loaded
    if (typeof gapi === 'undefined' || typeof google === 'undefined') {
        console.log('Waiting for Google libraries to load...');
        setTimeout(initGoogleAPI, 500);
        return;
    }

    // Initialize gapi client for Sheets API
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: CONFIG.API_KEY,
                discoveryDocs: CONFIG.DISCOVERY_DOCS
            });
            console.log('✅ Google Sheets API initialized');
            
            // Initialize Google Identity Services
            state.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: CONFIG.SCOPES,
                callback: (response) => {
                    if (response.error) {
                        console.error('Token error:', response);
                        return;
                    }
                    state.accessToken = response.access_token;
                    state.isSignedIn = true;
                    
                    // Save session to localStorage
                    localStorage.setItem('googleAccessToken', response.access_token);
                    localStorage.setItem('tokenExpiry', Date.now() + (55 * 60 * 1000)); // 55 minutes
                    
                    updateSignInStatus(true);
                    initializeApp();
                    
                    // Auto-refresh token every 50 minutes (tokens expire after 60 minutes)
                    if (state.tokenRefreshInterval) {
                        clearInterval(state.tokenRefreshInterval);
                    }
                    state.tokenRefreshInterval = setInterval(() => {
                        console.log('🔄 Refreshing access token...');
                        state.tokenClient.requestAccessToken({ prompt: '' });
                    }, 50 * 60 * 1000); // 50 minutes
                }
            });
            
            console.log('✅ Google Identity Services initialized');
            
            // Check for existing session
            checkExistingSession();
            
            setupAuthButton();
            
        } catch (error) {
            console.error('Error initializing Google API:', error);
            alert('Error initializing Google API. Check console for details.');
        }
    });
}

// Check for existing session in localStorage
function checkExistingSession() {
    const savedToken = localStorage.getItem('googleAccessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (savedToken && tokenExpiry) {
        const now = Date.now();
        const expiryTime = parseInt(tokenExpiry);
        
        // Check if token is still valid (not expired)
        if (now < expiryTime) {
            console.log('🔄 Restoring previous session...');
            state.accessToken = savedToken;
            state.isSignedIn = true;
            updateSignInStatus(true);
            initializeApp();
            
            // Set up auto-refresh for remaining time
            const remainingTime = expiryTime - now;
            if (state.tokenRefreshInterval) {
                clearInterval(state.tokenRefreshInterval);
            }
            
            // If less than 5 minutes remaining, refresh immediately
            if (remainingTime < 5 * 60 * 1000) {
                console.log('🔄 Token expiring soon, refreshing...');
                state.tokenClient.requestAccessToken({ prompt: '' });
            } else {
                // Otherwise set up refresh for later
                state.tokenRefreshInterval = setInterval(() => {
                    console.log('🔄 Refreshing access token...');
                    state.tokenClient.requestAccessToken({ prompt: '' });
                }, 50 * 60 * 1000);
            }
        } else {
            // Token expired, clear it
            console.log('⚠️ Saved token expired');
            localStorage.removeItem('googleAccessToken');
            localStorage.removeItem('tokenExpiry');
        }
    }
}

// Setup auth button handler
function setupAuthButton() {
    if (!elements.authButton) return;
    
    elements.authButton.addEventListener('click', () => {
        if (state.isSignedIn) {
            // Sign out
            state.isSignedIn = false;
            state.accessToken = null;
            
            // Clear localStorage
            localStorage.removeItem('googleAccessToken');
            localStorage.removeItem('tokenExpiry');
            
            // Clear token refresh interval
            if (state.tokenRefreshInterval) {
                clearInterval(state.tokenRefreshInterval);
                state.tokenRefreshInterval = null;
            }
            
            google.accounts.oauth2.revoke(state.accessToken, () => {
                console.log('Access token revoked');
            });
            updateSignInStatus(false);
        } else {
            // Request access token
            state.tokenClient.requestAccessToken();
        }
    });
}

// Update sign-in status
function updateSignInStatus(isSignedIn) {
    state.isSignedIn = isSignedIn;
    
    if (isSignedIn) {
        console.log('✅ User signed in');
        elements.authButton.textContent = 'Sign Out';
        elements.authButton.disabled = false;
        elements.userInfo.textContent = `Logged in`;
        elements.userInfo.classList.remove('hidden');
        elements.appContent.classList.remove('hidden');
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
    await findOrCreatePomodoroSpreadsheet();
    checkAndAddDaySeparator();
    loadTodayExercises();
    loadTodayPomodoros();
    setExerciseDefaults();
}

// Find or create the yearly spreadsheet
async function findOrCreateSpreadsheet() {
    const year = new Date().getFullYear();
    const sheetName = `${year}-Sesh-Seans-Workouts`;
    
    try {
        // Search for existing spreadsheet using Drive API
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
            {
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`
                }
            }
        );
        
        const searchData = await searchResponse.json();
        
        if (searchData.files && searchData.files.length > 0) {
            state.spreadsheetId = searchData.files[0].id;
            console.log('Found existing spreadsheet:', state.spreadsheetId);
            await detectWorkoutLogSheet();
            await ensureExercisesSheet();
        } else {
            // Create new spreadsheet with two sheets
            const createResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: sheetName
                },
                sheets: [
                    {
                        properties: {
                            title: 'Workout Log',
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        }
                    },
                    {
                        properties: {
                            title: 'Exercises',
                            gridProperties: {
                                frozenRowCount: 1
                            }
                        }
                    }
                ]
            });
            
            state.spreadsheetId = createResponse.result.spreadsheetId;
            state.workoutLogSheetName = 'Workout Log';
            console.log('Created new spreadsheet:', state.spreadsheetId);
            
            // Add header row to Workout Log
            await appendToSheet([['Date', 'Time', 'Exercise', 'Weight', 'Reps/Time']]);
            
            // Add header and default exercises to Exercises sheet
            await initializeExercisesSheet();
        }
        
        // Load exercises into dropdown
        await loadExercises();
    } catch (error) {
        console.error('Error with spreadsheet:', error);
        showStatus('Error accessing Google Sheets. Check console.', 'error');
    }
}

// Detect the workout log sheet name (could be "Sheet1" or "Workout Log")
async function detectWorkoutLogSheet() {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: state.spreadsheetId
        });
        
        const sheets = response.result.sheets;
        
        // Look for "Workout Log" first, then fall back to "Sheet1"
        const workoutLogSheet = sheets.find(sheet => 
            sheet.properties.title === 'Workout Log' || 
            sheet.properties.title === 'Sheet1'
        );
        
        if (workoutLogSheet) {
            state.workoutLogSheetName = workoutLogSheet.properties.title;
            console.log('Using workout log sheet:', state.workoutLogSheetName);
        }
    } catch (error) {
        console.error('Error detecting workout log sheet:', error);
        state.workoutLogSheetName = 'Sheet1'; // Default fallback
    }
}

// Ensure Exercises sheet exists in existing spreadsheet
async function ensureExercisesSheet() {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: state.spreadsheetId
        });
        
        const sheets = response.result.sheets;
        const hasExercisesSheet = sheets.some(sheet => sheet.properties.title === 'Exercises');
        
        if (!hasExercisesSheet) {
            // Add Exercises sheet
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: state.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: 'Exercises',
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        }
                    }]
                }
            });
            
            await initializeExercisesSheet();
        }
    } catch (error) {
        console.error('Error ensuring Exercises sheet:', error);
    }
}

// Initialize Exercises sheet with default exercises
async function initializeExercisesSheet() {
    console.log('Initializing Exercises sheet with descriptions...');
    
    // Check if function exists
    if (typeof getDefaultExercisesWithDescriptions !== 'function') {
        console.error('getDefaultExercisesWithDescriptions is not defined! Check if exercise-data.js loaded.');
        alert('Error: Exercise data not loaded. Check console.');
        return;
    }
    
    const defaultExercises = getDefaultExercisesWithDescriptions();
    console.log(`Adding ${defaultExercises.length} rows to Exercises sheet`);
    
    await appendToSheet(defaultExercises, 'Exercises');
    console.log('Exercises sheet initialized successfully');
}

// Old version kept for reference
async function initializeExercisesSheetOld() {
    const defaultExercises = [
        ['Exercise Name', 'Default Weight', 'Default Reps', 'Default Time (seconds)', 'Description'],
        ['# Add # at start of exercise name to hide it from dropdown', '', '', '', ''],
        ['', '', '', '', ''],
        ['# === AB EXERCISES ===', '', '', '', ''],
        ['Stomach Vacuum', '0', '0', '30', 'Exhale all air, pull belly button toward spine, hold. Great for transverse abdominis.'],
        ['Plank', '0', '0', '60', 'Forearms on ground, body straight from head to heels. Engage core, don\'t let hips sag.'],
        ['Side Plank (Left)', '0', '0', '30'],
        ['Side Plank (Right)', '0', '0', '30'],
        ['Hollow Body Hold', '0', '0', '30'],
        ['Dead Bug', '0', '20', '0'],
        ['Bicycle Crunches', '0', '30', '0'],
        ['Russian Twists', '0', '30', '0'],
        ['Leg Raises', '0', '15', '0'],
        ['Flutter Kicks', '0', '30', '0'],
        ['Mountain Climbers', '0', '30', '0'],
        ['V-Ups', '0', '15', '0'],
        ['Situps', '0', '30', '0'],
        ['', '', '', ''],
        ['# === PULL-UP BAR EXERCISES ===', '', '', ''],
        ['Pullups', '0', '10', '0'],
        ['Chin-ups', '0', '10', '0'],
        ['Negative Pullups', '0', '5', '0'],
        ['Dead Hang', '0', '0', '30'],
        ['Hanging Knee Raises', '0', '15', '0'],
        ['Hanging Leg Raises', '0', '10', '0'],
        ['L-Sit Hold', '0', '0', '20'],
        ['', '', '', ''],
        ['# === BODYWEIGHT/MAT EXERCISES ===', '', '', ''],
        ['Push-ups', '0', '20', '0'],
        ['Diamond Push-ups', '0', '15', '0'],
        ['Wide Push-ups', '0', '15', '0'],
        ['Pike Push-ups', '0', '12', '0'],
        ['Burpees', '0', '15', '0'],
        ['Squats', '0', '30', '0'],
        ['Jump Squats', '0', '20', '0'],
        ['Lunges', '0', '20', '0'],
        ['Bulgarian Split Squats', '0', '15', '0'],
        ['Glute Bridges', '0', '25', '0'],
        ['Single Leg Glute Bridge', '0', '15', '0'],
        ['Wall Sit', '0', '0', '60'],
        ['Calf Raises', '0', '30', '0'],
        ['', '', '', ''],
        ['# === DUMBBELL EXERCISES ===', '', '', ''],
        ['Dumbbell Curl', '20', '12', '0'],
        ['Hammer Curl', '20', '12', '0'],
        ['Overhead Press', '20', '12', '0'],
        ['Lateral Raise', '15', '15', '0'],
        ['Front Raise', '15', '12', '0'],
        ['Bent Over Row', '25', '12', '0'],
        ['Single Arm Row', '25', '12', '0'],
        ['Chest Press (Floor)', '25', '15', '0'],
        ['Chest Fly (Floor)', '20', '15', '0'],
        ['Goblet Squat', '30', '15', '0'],
        ['Dumbbell Deadlift', '40', '12', '0'],
        ['Dumbbell Lunge', '20', '20', '0'],
        ['Dumbbell Shrug', '30', '15', '0'],
        ['Tricep Extension', '20', '15', '0'],
        ['Dumbbell Swing', '25', '20', '0'],
        ['', '', '', ''],
        ['# === ISOMETRIC HOLDS ===', '', '', ''],
        ['Wall Sit', '0', '0', '60'],
        ['Plank', '0', '0', '60'],
        ['Side Plank', '0', '0', '30'],
        ['Hollow Body Hold', '0', '0', '30'],
        ['Superman Hold', '0', '0', '30'],
        ['Bridge Hold', '0', '0', '45'],
        ['Dead Hang', '0', '0', '30'],
        ['L-Sit Hold', '0', '0', '20'],
        ['', '', '', ''],
        ['# === SEATED ISOMETRIC EXERCISES ===', '', '', ''],
        ['Seated Soleus Raise', '0', '30', '0'],
        ['Seated Soleus Hold', '0', '0', '30'],
        ['Seated Calf Raise', '0', '30', '0'],
        ['Seated Knee Extension Hold', '0', '0', '30'],
        ['Seated Hip Flexor Hold', '0', '0', '30'],
        ['Seated Glute Squeeze', '0', '20', '0'],
        ['Seated Ab Vacuum', '0', '0', '20'],
        ['Seated Chest Squeeze', '0', '0', '30'],
        ['Seated Shoulder Blade Squeeze', '0', '0', '30'],
        ['Seated Neck Isometric (Front)', '0', '0', '20'],
        ['Seated Neck Isometric (Side)', '0', '0', '20'],
        ['Seated Fist Clench', '0', '0', '30'],
        ['Seated Forearm Plank (Desk)', '0', '0', '30'],
        ['Seated Leg Extension Hold', '0', '0', '30'],
        ['Seated Ankle Dorsiflexion Hold', '0', '0', '30']
    ];
    
    await appendToSheet(defaultExercises, 'Exercises');
}

// Update exercise defaults in sheet when user logs with different values
async function updateExerciseDefaults(exerciseName, weight, reps, time) {
    if (exerciseName === 'Custom') return;
    
    try {
        // Get all exercises from sheet
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Exercises!A:D'
        });
        
        const values = response.result.values || [];
        let rowIndex = -1;
        
        // Find the exercise row
        values.forEach((row, index) => {
            if (row[0] && row[0].trim() === exerciseName) {
                rowIndex = index;
            }
        });
        
        if (rowIndex > 0) { // Found the exercise (skip header at index 0)
            const currentWeight = values[rowIndex][1] || '0';
            const currentReps = values[rowIndex][2] || '0';
            const currentTime = values[rowIndex][3] || '0';
            
            // Check if values changed
            if (weight !== currentWeight || reps !== currentReps || time !== currentTime) {
                // Update the row
                const updateRange = `Exercises!B${rowIndex + 1}:D${rowIndex + 1}`;
                await gapi.client.sheets.spreadsheets.values.update({
                    spreadsheetId: state.spreadsheetId,
                    range: updateRange,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [[weight, reps, time]]
                    }
                });
                
                console.log(`Updated defaults for ${exerciseName}`);
                
                // Reload exercises to update dropdown data attributes
                await loadExercises();
            }
        }
    } catch (error) {
        console.error('Error updating exercise defaults:', error);
        // Don't show error to user - this is a background operation
    }
}

// Update exercise library (add new exercises without deleting existing)
async function updateExerciseLibrary() {
    try {
        showStatus('Updating exercise library...', 'success');
        
        // Get current exercises
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Exercises!A:E'
        });
        
        const existingValues = response.result.values || [];
        const existingExercises = new Map(); // Use Map to track row numbers
        
        // Track existing exercise names and their row numbers
        existingValues.forEach((row, index) => {
            if (index > 0 && row[0] && !row[0].startsWith('#')) {
                existingExercises.set(row[0].trim(), index + 1); // +1 for 1-based indexing
            }
        });
        
        // Get all exercises with descriptions
        const allExercises = getDefaultExercisesWithDescriptions();
        const newExercises = allExercises.slice(1); // Skip header
        
        // Separate into new exercises and updates
        const exercisesToAdd = [];
        const exercisesToUpdate = [];
        
        /*
        Old array removed - now using getDefaultExercisesWithDescriptions()
            ['# Add # at start of exercise name to hide it from dropdown', '', '', ''],
            ['', '', '', ''],
            ['# === AB EXERCISES ===', '', '', ''],
            ['Stomach Vacuum', '0', '0', '30'],
            ['Plank', '0', '0', '60'],
            ['Side Plank (Left)', '0', '0', '30'],
            ['Side Plank (Right)', '0', '0', '30'],
            ['Hollow Body Hold', '0', '0', '30'],
            ['Dead Bug', '0', '20', '0'],
            ['Bicycle Crunches', '0', '30', '0'],
            ['Russian Twists', '0', '30', '0'],
            ['Leg Raises', '0', '15', '0'],
            ['Flutter Kicks', '0', '30', '0'],
            ['Mountain Climbers', '0', '30', '0'],
            ['V-Ups', '0', '15', '0'],
            ['Situps', '0', '30', '0'],
            ['', '', '', ''],
            ['# === PULL-UP BAR EXERCISES ===', '', '', ''],
            ['Pullups', '0', '10', '0'],
            ['Chin-ups', '0', '10', '0'],
            ['Negative Pullups', '0', '5', '0'],
            ['Dead Hang', '0', '0', '30'],
            ['Hanging Knee Raises', '0', '15', '0'],
            ['Hanging Leg Raises', '0', '10', '0'],
            ['L-Sit Hold', '0', '0', '20'],
            ['', '', '', ''],
            ['# === BODYWEIGHT/MAT EXERCISES ===', '', '', ''],
            ['Push-ups', '0', '20', '0'],
            ['Diamond Push-ups', '0', '15', '0'],
            ['Wide Push-ups', '0', '15', '0'],
            ['Pike Push-ups', '0', '12', '0'],
            ['Burpees', '0', '15', '0'],
            ['Squats', '0', '30', '0'],
            ['Jump Squats', '0', '20', '0'],
            ['Lunges', '0', '20', '0'],
            ['Bulgarian Split Squats', '0', '15', '0'],
            ['Glute Bridges', '0', '25', '0'],
            ['Single Leg Glute Bridge', '0', '15', '0'],
            ['Wall Sit', '0', '0', '60'],
            ['Calf Raises', '0', '30', '0'],
            ['', '', '', ''],
            ['# === DUMBBELL EXERCISES ===', '', '', ''],
            ['Dumbbell Curl', '20', '12', '0'],
            ['Hammer Curl', '20', '12', '0'],
            ['Overhead Press', '20', '12', '0'],
            ['Lateral Raise', '15', '15', '0'],
            ['Front Raise', '15', '12', '0'],
            ['Bent Over Row', '25', '12', '0'],
            ['Single Arm Row', '25', '12', '0'],
            ['Chest Press (Floor)', '25', '15', '0'],
            ['Chest Fly (Floor)', '20', '15', '0'],
            ['Goblet Squat', '30', '15', '0'],
            ['Dumbbell Deadlift', '40', '12', '0'],
            ['Dumbbell Lunge', '20', '20', '0'],
            ['Dumbbell Shrug', '30', '15', '0'],
            ['Tricep Extension', '20', '15', '0'],
            ['Dumbbell Swing', '25', '20', '0'],
            ['', '', '', ''],
            ['# === ISOMETRIC HOLDS ===', '', '', ''],
            ['Wall Sit', '0', '0', '60'],
            ['Superman Hold', '0', '0', '30'],
            ['Bridge Hold', '0', '0', '45'],
            ['', '', '', ''],
            ['# === SEATED ISOMETRIC EXERCISES ===', '', '', ''],
            ['Seated Soleus Raise', '0', '30', '0'],
            ['Seated Soleus Hold', '0', '0', '30'],
            ['Seated Calf Raise', '0', '30', '0'],
            ['Seated Knee Extension Hold', '0', '0', '30'],
            ['Seated Hip Flexor Hold', '0', '0', '30'],
            ['Seated Glute Squeeze', '0', '20', '0'],
            ['Seated Ab Vacuum', '0', '0', '20'],
            ['Seated Chest Squeeze', '0', '0', '30'],
            ['Seated Shoulder Blade Squeeze', '0', '0', '30'],
            ['Seated Neck Isometric (Front)', '0', '0', '20'],
            ['Seated Neck Isometric (Side)', '0', '0', '20'],
            ['Seated Fist Clench', '0', '0', '30'],
            ['Seated Forearm Plank (Desk)', '0', '0', '30'],
            ['Seated Leg Extension Hold', '0', '0', '30'],
            ['Seated Ankle Dorsiflexion Hold', '0', '0', '30']
        */
        
        // Process each exercise
        newExercises.forEach(row => {
            const exerciseName = row[0] ? row[0].trim() : '';
            
            // Skip empty rows
            if (!exerciseName) return;
            
            // Always add comments/headers
            if (exerciseName.startsWith('#')) {
                exercisesToAdd.push(row);
                return;
            }
            
            // Check if exercise exists
            if (existingExercises.has(exerciseName)) {
                // Update existing exercise with description if missing
                const rowNum = existingExercises.get(exerciseName);
                const existingRow = existingValues[rowNum - 1];
                
                // If description column is missing or empty, add it to update list
                if (!existingRow[4]) {
                    exercisesToUpdate.push({
                        range: `Exercises!E${rowNum}`,
                        value: row[4] || ''
                    });
                }
            } else {
                // New exercise - add it
                exercisesToAdd.push(row);
            }
        });
        
        // Update existing exercises with descriptions
        if (exercisesToUpdate.length > 0) {
            const batchUpdateData = exercisesToUpdate.map(update => ({
                range: update.range,
                values: [[update.value]]
            }));
            
            await gapi.client.sheets.spreadsheets.values.batchUpdate({
                spreadsheetId: state.spreadsheetId,
                resource: {
                    valueInputOption: 'USER_ENTERED',
                    data: batchUpdateData
                }
            });
            
            console.log(`Updated ${exercisesToUpdate.length} exercises with descriptions`);
        }
        
        // Add new exercises
        if (exercisesToAdd.length > 0) {
            await appendToSheet(exercisesToAdd, 'Exercises');
            showStatus(`Added ${exercisesToAdd.length} new items and updated ${exercisesToUpdate.length} descriptions! Reloading...`, 'success');
        } else if (exercisesToUpdate.length > 0) {
            showStatus(`Updated ${exercisesToUpdate.length} descriptions! Reloading...`, 'success');
        } else {
            showStatus('All exercises up to date!', 'success');
        }
        
        // Reload exercises
        setTimeout(() => {
            loadExercises();
        }, 1000);
        
    } catch (error) {
        console.error('Error updating exercises:', error);
        showStatus('Error updating exercises. Check console.', 'error');
    }
}

// Load exercises from Exercises sheet
async function loadExercises() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Exercises!A2:E' // Skip header row, include description column
        });
        
        const values = response.result.values || [];
        
        state.allExercises = [];
        state.sortCategories = [];
        let currentCategory = '';
        
        // Parse exercises and categories
        values.forEach(row => {
            if (row[0]) {
                const exerciseName = row[0].trim();
                
                // Check if it's a sort category marker
                if (exerciseName.match(/^#\s*===\s*(.+?)\s*===\s*$/)) {
                    currentCategory = exerciseName.match(/^#\s*===\s*(.+?)\s*===\s*$/)[1].trim();
                    if (!state.sortCategories.includes(currentCategory)) {
                        state.sortCategories.push(currentCategory);
                    }
                    return;
                }
                
                // Skip other comments and empty
                if (exerciseName.startsWith('#') || exerciseName === '') {
                    return;
                }
                
                state.allExercises.push({
                    name: exerciseName,
                    weight: row[1] || '0',
                    reps: row[2] || '0',
                    time: row[3] || '0',
                    description: row[4] || '',
                    category: currentCategory
                });
            }
        });
        
        // Populate sort filter
        populateSortFilter();
        
        // Display all exercises initially
        displayExercises();
        
        console.log(`Loaded ${state.allExercises.length} exercises with ${state.sortCategories.length} categories`);
    } catch (error) {
        console.error('Error loading exercises:', error);
        showStatus('Error loading exercises. Using defaults.', 'error');
    }
}

// Populate sort filter dropdown
function populateSortFilter() {
    elements.sortFilter.innerHTML = '<option value="">All Exercises</option>';
    
    state.sortCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.sortFilter.appendChild(option);
    });
}

// Display exercises based on current filter
function displayExercises(filterCategory = '') {
    elements.exerciseName.innerHTML = '';
    
    const filteredExercises = filterCategory 
        ? state.allExercises.filter(ex => ex.category === filterCategory)
        : state.allExercises;
    
    filteredExercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.name;
        option.textContent = exercise.name;
        option.dataset.weight = exercise.weight;
        option.dataset.reps = exercise.reps;
        option.dataset.time = exercise.time;
        option.dataset.description = exercise.description;
        elements.exerciseName.appendChild(option);
    });
    
    // Add Custom option at the end
    const customOption = document.createElement('option');
    customOption.value = 'Custom';
    customOption.textContent = 'Custom';
    elements.exerciseName.appendChild(customOption);
    
    // Set defaults for first exercise
    if (filteredExercises.length > 0) {
        setExerciseDefaults();
    }
}

// Find or create Pomodoro spreadsheet
async function findOrCreatePomodoroSpreadsheet() {
    const year = new Date().getFullYear();
    const sheetName = `${year}-Sesh-Seans-Pomodoro`;
    
    try {
        const searchResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${sheetName}' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
            {
                headers: {
                    'Authorization': `Bearer ${state.accessToken}`
                }
            }
        );
        
        const searchData = await searchResponse.json();
        
        if (searchData.files && searchData.files.length > 0) {
            state.pomodoroSpreadsheetId = searchData.files[0].id;
            console.log('Found existing Pomodoro spreadsheet:', state.pomodoroSpreadsheetId);
        } else {
            const createResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: sheetName
                }
            });
            
            state.pomodoroSpreadsheetId = createResponse.result.spreadsheetId;
            console.log('Created new Pomodoro spreadsheet:', state.pomodoroSpreadsheetId);
            
            // Add header row
            await appendToPomodoroSheet([['Date', 'Time', 'Subject', 'Study Duration (min)', 'Break Duration (min)', 'Notes']]);
        }
    } catch (error) {
        console.error('Error with Pomodoro spreadsheet:', error);
    }
}

// Append data to Pomodoro sheet
async function appendToPomodoroSheet(values) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: state.pomodoroSpreadsheetId,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: values
            }
        });
        
        return response;
    } catch (error) {
        console.error('Error appending to Pomodoro sheet:', error);
        throw error;
    }
}

// Check if we need to add a day separator
async function checkAndAddDaySeparator() {
    const today = getLocalDate();
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: `${state.workoutLogSheetName}!A:A`
        });
        
        const values = response.result.values || [];
        
        // Skip if sheet is empty or only has header
        if (values.length <= 1) {
            state.currentDate = today;
            return;
        }
        
        // Find the last non-empty date
        let lastDate = null;
        for (let i = values.length - 1; i >= 1; i--) {
            if (values[i][0] && values[i][0].trim() !== '') {
                lastDate = values[i][0];
                break;
            }
        }
        
        // If last date is different from today and not already separated, add blank line
        if (lastDate && lastDate !== today && state.currentDate !== today) {
            console.log(`📅 New day detected. Last: ${lastDate}, Today: ${today}`);
            await appendToSheet([['', '', '', '', '']]);
            state.currentDate = today;
        } else if (!state.currentDate) {
            state.currentDate = today;
        }
    } catch (error) {
        console.error('Error checking day separator:', error);
    }
}

// Append data to sheet
async function appendToSheet(values, sheetName = null) {
    try {
        // Use workout log sheet name if not specified
        const targetSheet = sheetName || state.workoutLogSheetName;
        
        // Determine range based on sheet type
        const range = sheetName === 'Exercises' ? `${targetSheet}!A:E` : `${targetSheet}!A:E`;
        
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: state.spreadsheetId,
            range: range,
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
    // Interval Timer (Continuous)
    elements.startTimer.addEventListener('click', () => {
        if (!state.timerRunning) {
            state.timerRunning = true;
            state.timerEndTime = Date.now() + (state.timerSeconds * 1000);
            elements.startTimer.classList.add('hidden');
            elements.pauseTimer.classList.remove('hidden');
            
            state.intervalTimerHandle = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((state.timerEndTime - Date.now()) / 1000));
                state.timerSeconds = remaining;
                updateTimerDisplay();
                
                if (remaining === 0) {
                    // Timer reached zero - play sound and restart
                    playIntervalSound();
                    const intervalMinutes = parseInt(elements.timerInterval.value) || 15;
                    state.timerSeconds = intervalMinutes * 60;
                    state.timerEndTime = Date.now() + (state.timerSeconds * 1000);
                    updateTimerDisplay();
                }
            }, 100); // Check more frequently for accuracy
        }
    });

    elements.pauseTimer.addEventListener('click', () => {
        state.timerRunning = false;
        clearInterval(state.intervalTimerHandle);
        state.timerEndTime = null;
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

    // Workout Timer
    elements.startWorkoutTimer.addEventListener('click', () => {
        if (!state.workoutTimerRunning) {
            state.workoutTimerRunning = true;
            state.workoutTimerEndTime = Date.now() + (state.workoutTimerSeconds * 1000);
            elements.startWorkoutTimer.classList.add('hidden');
            elements.pauseWorkoutTimer.classList.remove('hidden');
            
            state.workoutTimerHandle = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((state.workoutTimerEndTime - Date.now()) / 1000));
                state.workoutTimerSeconds = remaining;
                updateWorkoutTimerDisplay();
                
                if (remaining === 0) {
                    // Workout timer complete
                    playWorkoutSound();
                    resetWorkoutTimer();
                }
            }, 100);
        }
    });

    elements.pauseWorkoutTimer.addEventListener('click', () => {
        state.workoutTimerRunning = false;
        clearInterval(state.workoutTimerHandle);
        state.workoutTimerEndTime = null;
        elements.startWorkoutTimer.classList.remove('hidden');
        elements.pauseWorkoutTimer.classList.add('hidden');
    });

    elements.resetWorkoutTimer.addEventListener('click', () => {
        resetWorkoutTimer();
    });

    elements.workoutTimerDuration.addEventListener('change', () => {
        if (!state.workoutTimerRunning) {
            resetWorkoutTimer();
        }
    });
}

function resetTimer() {
    state.timerRunning = false;
    clearInterval(state.intervalTimerHandle);
    const intervalMinutes = parseInt(elements.timerInterval.value) || 15;
    state.timerSeconds = intervalMinutes * 60;
    updateTimerDisplay();
    elements.startTimer.classList.remove('hidden');
    elements.pauseTimer.classList.add('hidden');
}

function resetWorkoutTimer() {
    state.workoutTimerRunning = false;
    clearInterval(state.workoutTimerHandle);
    const duration = parseInt(elements.workoutTimerDuration.value) || 15;
    state.workoutTimerSeconds = duration;
    updateWorkoutTimerDisplay();
    elements.startWorkoutTimer.classList.remove('hidden');
    elements.pauseWorkoutTimer.classList.add('hidden');
}

function updateWorkoutTimerDisplay() {
    const minutes = Math.floor(state.workoutTimerSeconds / 60);
    const seconds = state.workoutTimerSeconds % 60;
    elements.workoutTimerDisplay.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function playIntervalSound() {
    // Play double beep for interval timer
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // First beep
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.frequency.value = 800;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    osc1.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.2);
    
    // Second beep
    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.frequency.value = 800;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    osc2.start(audioContext.currentTime + 0.3);
    osc2.stop(audioContext.currentTime + 0.5);
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Interval Complete!', {
            body: 'Next interval starting...',
            icon: '⏰'
        });
    }
}

function playWorkoutSound() {
    // Play triple beep for workout timer
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    for (let i = 0; i < 3; i++) {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 1200;
        osc.type = 'square';
        const startTime = audioContext.currentTime + (i * 0.25);
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Workout Complete!', {
            body: 'Time to log your exercise!',
            icon: '💪'
        });
    }
}

// Pomodoro Timer Functions
function updatePomodoroTimerDisplay() {
    const minutes = Math.floor(state.pomodoroSeconds / 60);
    const seconds = state.pomodoroSeconds % 60;
    elements.pomodoroTimerDisplay.textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function setupPomodoroListeners() {
    // Toggle collapse
    elements.pomodoroToggle.addEventListener('click', () => {
        document.querySelector('.pomodoro-section').classList.toggle('collapsed');
    });

    // Manage Pomodoro Sheet button
    elements.managePomodoroSheet.addEventListener('click', () => {
        if (state.pomodoroSpreadsheetId) {
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.pomodoroSpreadsheetId}/edit`;
            window.open(spreadsheetUrl, '_blank');
            showStatus('You can view your Pomodoro log and add custom subjects to the dropdown!', 'success');
        } else {
            showStatus('Pomodoro spreadsheet not yet created. Start a session first!', 'error');
        }
    });

    // Subject selection
    elements.pomodoroSubject.addEventListener('change', (e) => {
        if (e.target.value === 'Custom') {
            elements.customSubject.classList.remove('hidden');
        } else {
            elements.customSubject.classList.add('hidden');
        }
    });

    // Start Pomodoro
    elements.startPomodoro.addEventListener('click', () => {
        if (!state.pomodoroRunning) {
            state.pomodoroRunning = true;
            state.pomodoroEndTime = Date.now() + (state.pomodoroSeconds * 1000);
            elements.startPomodoro.classList.add('hidden');
            elements.pausePomodoro.classList.remove('hidden');
            
            state.pomodoroTimerHandle = setInterval(() => {
                const remaining = Math.max(0, Math.ceil((state.pomodoroEndTime - Date.now()) / 1000));
                state.pomodoroSeconds = remaining;
                updatePomodoroTimerDisplay();
                
                if (remaining === 0) {
                    // Timer complete - switch between study and break
                    if (state.pomodoroOnBreak) {
                        // Break complete - back to study
                        playPomodoroStudySound();
                        state.pomodoroOnBreak = false;
                        const studyMinutes = parseInt(elements.pomodoroStudyTime.value) || 20;
                        state.pomodoroSeconds = studyMinutes * 60;
                        state.pomodoroEndTime = Date.now() + (state.pomodoroSeconds * 1000);
                        elements.pomodoroStatus.textContent = 'Study Session';
                        updatePomodoroTimerDisplay();
                    } else {
                        // Study complete - start break
                        playPomodoroBreakSound();
                        state.pomodoroOnBreak = true;
                        const breakMinutes = parseInt(elements.pomodoroBreakTime.value) || 5;
                        state.pomodoroSeconds = breakMinutes * 60;
                        state.pomodoroEndTime = Date.now() + (state.pomodoroSeconds * 1000);
                        elements.pomodoroStatus.textContent = 'Break Time!';
                        updatePomodoroTimerDisplay();
                        
                        // Remind user to log session
                        showStatus('⏸️ Break time! Don\'t forget to log your study session!', 'success');
                    }
                }
            }, 100);
        }
    });

    // Pause Pomodoro
    elements.pausePomodoro.addEventListener('click', () => {
        state.pomodoroRunning = false;
        clearInterval(state.pomodoroTimerHandle);
        state.pomodoroEndTime = null;
        elements.startPomodoro.classList.remove('hidden');
        elements.pausePomodoro.classList.add('hidden');
    });

    // Reset Pomodoro
    elements.resetPomodoro.addEventListener('click', () => {
        resetPomodoro();
    });

    // Study/Break time changes
    elements.pomodoroStudyTime.addEventListener('change', () => {
        if (!state.pomodoroRunning && !state.pomodoroOnBreak) {
            resetPomodoro();
        }
    });

    // Pomodoro form submission
    elements.pomodoroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const now = new Date();
        const date = getLocalDate();
        const time = now.toTimeString().split(' ')[0];
        
        let subject = elements.pomodoroSubject.value;
        if (subject === 'Custom') {
            subject = elements.customSubject.value || 'Custom Subject';
        }
        
        const studyDuration = elements.pomodoroStudyTime.value;
        const breakDuration = elements.pomodoroBreakTime.value;
        const notes = elements.pomodoroNotes.value;
        
        const rowData = [date, time, subject, studyDuration, breakDuration, notes];
        
        try {
            await appendToPomodoroSheet([rowData]);
            showStatus('Pomodoro session logged! 📚', 'success');
            elements.pomodoroNotes.value = ''; // Clear notes
            
            // Add to today's log
            state.todayPomodoros.push({
                time,
                subject,
                studyDuration,
                breakDuration,
                notes
            });
            updateTodayPomodoroLog();
        } catch (error) {
            console.error('Error logging Pomodoro:', error);
            showStatus('Error logging Pomodoro session.', 'error');
        }
    });
}

// Load today's Pomodoro sessions
async function loadTodayPomodoros() {
    const today = getLocalDate();
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.pomodoroSpreadsheetId,
            range: 'Sheet1!A:F'
        });
        
        const values = response.result.values || [];
        state.todayPomodoros = [];
        
        values.forEach((row, index) => {
            if (index === 0) return; // Skip header
            
            const date = row[0];
            const time = row[1];
            const subject = row[2];
            const studyDuration = row[3];
            const breakDuration = row[4];
            const notes = row[5];
            
            if (date === today && subject) {
                state.todayPomodoros.push({
                    time,
                    subject,
                    studyDuration,
                    breakDuration,
                    notes
                });
            }
        });
        
        updateTodayPomodoroLog();
        console.log(`Loaded ${state.todayPomodoros.length} Pomodoro sessions from today`);
    } catch (error) {
        console.error('Error loading today\'s Pomodoros:', error);
        state.todayPomodoros = [];
        updateTodayPomodoroLog();
    }
}

function updateTodayPomodoroLog() {
    if (state.todayPomodoros.length === 0) {
        elements.todayPomodoro.innerHTML = '<h3>Today\'s Sessions</h3><p>No Pomodoro sessions logged yet today.</p>';
    } else {
        let html = '<h3>Today\'s Sessions</h3>';
        state.todayPomodoros.forEach(session => {
            html += `
                <div class="log-entry">
                    <strong>${session.time}</strong> - ${session.subject} 
                    (${session.studyDuration}min study / ${session.breakDuration}min break)
                    ${session.notes ? `<br><em>${session.notes}</em>` : ''}
                </div>
            `;
        });
        elements.todayPomodoro.innerHTML = html;
    }
}

// Alarm Clock Functions
function setupAlarmListeners() {
    // Toggle collapse
    elements.alarmToggle.addEventListener('click', () => {
        document.querySelector('.alarm-section').classList.toggle('collapsed');
    });

    // Mode toggle buttons
    document.querySelectorAll('.alarm-mode-toggle .mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            state.alarmMode = mode;
            
            // Update active button
            document.querySelectorAll('.alarm-mode-toggle .mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show/hide appropriate mode
            if (mode === 'time') {
                document.getElementById('alarmTimeMode').classList.remove('hidden');
                document.getElementById('alarmCountdownMode').classList.add('hidden');
            } else {
                document.getElementById('alarmTimeMode').classList.add('hidden');
                document.getElementById('alarmCountdownMode').classList.remove('hidden');
            }
        });
    });

    // Set alarm
    elements.setAlarm.addEventListener('click', () => {
        if (state.alarmMode === 'time') {
            setTimeAlarm();
        } else {
            setCountdownAlarm();
        }
    });

    // Cancel alarm
    elements.cancelAlarm.addEventListener('click', () => {
        cancelAlarm();
    });
}

function setTimeAlarm() {
    const hour = parseInt(elements.alarmHour.value);
    const minute = parseInt(elements.alarmMinute.value);
    
    if (isNaN(hour) || isNaN(minute)) {
        alert('Please enter valid hour and minute');
        return;
    }
    
    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    state.alarmTime = timeString;
    
    elements.setAlarm.classList.add('hidden');
    elements.cancelAlarm.classList.remove('hidden');
    elements.alarmStatus.textContent = `Alarm set for ${timeString}`;
    elements.alarmDisplay.textContent = timeString;
    
    // Start checking for alarm
    if (state.alarmCheckInterval) {
        clearInterval(state.alarmCheckInterval);
    }
    
    state.alarmCheckInterval = setInterval(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        if (currentTime === state.alarmTime) {
            playAlarmSound();
            cancelAlarm();
            showStatus('⏰ Alarm ringing!', 'success');
        }
    }, 1000);
}

function setCountdownAlarm() {
    const minutes = parseInt(elements.countdownMinutes.value) || 0;
    const seconds = parseInt(elements.countdownSeconds.value) || 0;
    
    const totalSeconds = (minutes * 60) + seconds;
    
    if (totalSeconds === 0) {
        alert('Please enter a countdown time');
        return;
    }
    
    state.alarmCountdownSeconds = totalSeconds;
    state.alarmCountdownEndTime = Date.now() + (totalSeconds * 1000);
    
    elements.setAlarm.classList.add('hidden');
    elements.cancelAlarm.classList.remove('hidden');
    elements.alarmStatus.textContent = `Countdown started`;
    
    // Start countdown
    if (state.alarmCountdownHandle) {
        clearInterval(state.alarmCountdownHandle);
    }
    
    state.alarmCountdownHandle = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((state.alarmCountdownEndTime - Date.now()) / 1000));
        state.alarmCountdownSeconds = remaining;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        elements.alarmDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        if (remaining === 0) {
            playAlarmSound();
            cancelAlarm();
            showStatus('⏰ Countdown complete!', 'success');
        }
    }, 100);
}

function cancelAlarm() {
    state.alarmTime = null;
    state.alarmCountdownSeconds = 0;
    state.alarmCountdownEndTime = null;
    
    if (state.alarmCheckInterval) {
        clearInterval(state.alarmCheckInterval);
        state.alarmCheckInterval = null;
    }
    
    if (state.alarmCountdownHandle) {
        clearInterval(state.alarmCountdownHandle);
        state.alarmCountdownHandle = null;
    }
    
    elements.setAlarm.classList.remove('hidden');
    elements.cancelAlarm.classList.add('hidden');
    elements.alarmStatus.textContent = '';
    elements.alarmDisplay.textContent = '--:--';
}

function resetPomodoro() {
    state.pomodoroRunning = false;
    state.pomodoroOnBreak = false;
    clearInterval(state.pomodoroTimerHandle);
    const studyMinutes = parseInt(elements.pomodoroStudyTime.value) || 20;
    state.pomodoroSeconds = studyMinutes * 60;
    elements.pomodoroStatus.textContent = 'Study Session';
    updatePomodoroTimerDisplay();
    elements.startPomodoro.classList.remove('hidden');
    elements.pausePomodoro.classList.add('hidden');
}

function playPomodoroBreakSound() {
    // Ascending tone for break time
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: 'Time for a break! Remember to log your session!',
            icon: '📚'
        });
    }
}

function playPomodoroStudySound() {
    // Descending tone for study time
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.5);
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: 'Back to studying!',
            icon: '📚'
        });
    }
}

function playAlarmSound() {
    // Create alarm modal
    const modal = document.createElement('div');
    modal.className = 'alarm-modal';
    modal.innerHTML = `
        <div class="alarm-modal-content">
            <h2>⏰ ALARM!</h2>
            <p>Your alarm is ringing!</p>
            <button id="dismissAlarm" class="btn btn-primary btn-large">Dismiss Alarm</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Loop alarm sound continuously
    let alarmInterval;
    const playAlarmBeep = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 5; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 1000;
            osc.type = 'sawtooth';
            const startTime = audioContext.currentTime + (i * 0.4);
            gain.gain.setValueAtTime(0.4, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.start(startTime);
            osc.stop(startTime + 0.3);
        }
    };
    
    // Play immediately and then every 2 seconds
    playAlarmBeep();
    alarmInterval = setInterval(playAlarmBeep, 2000);
    
    // Dismiss button handler
    document.getElementById('dismissAlarm').addEventListener('click', () => {
        clearInterval(alarmInterval);
        document.body.removeChild(modal);
    });
    
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Alarm!', {
            body: 'Your alarm is ringing!',
            icon: '⏰',
            requireInteraction: true
        });
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Show exercise description
function showExerciseDescription(exerciseName) {
    const selectedOption = elements.exerciseName.options[elements.exerciseName.selectedIndex];
    const description = selectedOption.dataset.description || EXERCISE_DESCRIPTIONS[exerciseName] || '';
    
    // Populate the instructions textarea
    elements.exerciseInstructions.value = description;
}

// Update or add current exercise to sheet
async function updateCurrentExercise() {
    const exerciseName = elements.exerciseName.value;
    const weight = elements.weight.value;
    const reps = elements.reps.value;
    const time = elements.time.value;
    const instructions = elements.exerciseInstructions.value;
    
    if (exerciseName === 'Custom') {
        const customName = elements.customExercise.value.trim();
        if (!customName) {
            alert('Please enter a custom exercise name');
            return;
        }
        
        // Add custom exercise under current category
        const currentCategory = elements.sortFilter.value || 'CUSTOM EXERCISES';
        await addCustomExercise(customName, weight, reps, time, currentCategory);
    } else {
        // Update existing exercise defaults and instructions
        await updateExerciseInSheet(exerciseName, weight, reps, time, instructions);
    }
}

// Add custom exercise to sheet
async function addCustomExercise(name, weight, reps, time, category) {
    try {
        // Get all exercises to find where to insert
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Exercises!A:E'
        });
        
        const values = response.result.values || [];
        
        // Check if exercise already exists
        const existingIndex = values.findIndex((row, idx) => 
            idx > 0 && row[0] && row[0].trim() === name
        );
        
        if (existingIndex > 0) {
            showStatus(`Exercise "${name}" already exists! Use it from the dropdown to update.`, 'error');
            return;
        }
        
        // Find the category section or add at end
        let insertAfterRow = values.length;
        const categoryMarker = `# === ${category} ===`;
        
        for (let i = 0; i < values.length; i++) {
            if (values[i][0] && values[i][0].includes(category)) {
                // Found category, find end of this section
                insertAfterRow = i + 1;
                // Skip to next category or end
                for (let j = i + 1; j < values.length; j++) {
                    if (values[j][0] && values[j][0].startsWith('# ===')) {
                        insertAfterRow = j;
                        break;
                    }
                    if (values[j][0] && !values[j][0].startsWith('#')) {
                        insertAfterRow = j + 1;
                    }
                }
                break;
            }
        }
        
        // Add the exercise
        const newExercise = [[name, weight, reps, time, 'Custom exercise']];
        await appendToSheet(newExercise, 'Exercises');
        
        showStatus(`Added "${name}" to ${category}! Reloading...`, 'success');
        
        // Reload exercises
        setTimeout(() => {
            loadExercises();
        }, 1000);
        
    } catch (error) {
        console.error('Error adding custom exercise:', error);
        showStatus('Error adding exercise. Check console.', 'error');
    }
}

// Update existing exercise in sheet
async function updateExerciseInSheet(exerciseName, weight, reps, time, instructions) {
    try {
        // Get all exercises
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Exercises!A:E'
        });
        
        const values = response.result.values || [];
        
        // Find the exercise row
        let rowIndex = -1;
        for (let i = 1; i < values.length; i++) {
            if (values[i][0] && values[i][0].trim() === exerciseName) {
                rowIndex = i + 1; // +1 for 1-based indexing
                break;
            }
        }
        
        if (rowIndex === -1) {
            showStatus(`Exercise "${exerciseName}" not found in sheet!`, 'error');
            return;
        }
        
        // Update the row (including instructions in column E)
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: state.spreadsheetId,
            range: `Exercises!B${rowIndex}:E${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[weight, reps, time, instructions || '']]
            }
        });
        
        showStatus(`Updated "${exerciseName}" defaults! Reloading...`, 'success');
        
        // Reload exercises
        setTimeout(() => {
            loadExercises();
        }, 1000);
        
    } catch (error) {
        console.error('Error updating exercise:', error);
        showStatus('Error updating exercise. Check console.', 'error');
    }
}

// Exercise form handling
function setupExerciseListeners() {
    // Update Current Exercise button
    elements.updateCurrentExercise.addEventListener('click', async () => {
        await updateCurrentExercise();
    });

    // Manage Exercises button
    elements.manageExercises.addEventListener('click', () => {
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit#gid=`;
        window.open(spreadsheetUrl, '_blank');
        showStatus('Edit the "Exercises" sheet. Use "# === CATEGORY ===" to create sort categories. Refresh to see changes.', 'success');
    });

    // Sort filter
    elements.sortFilter.addEventListener('change', (e) => {
        displayExercises(e.target.value);
    });

    // Exercise selection
    elements.exerciseName.addEventListener('change', (e) => {
        if (e.target.value === 'Custom') {
            elements.customExercise.classList.remove('hidden');
            elements.exerciseDescription.classList.add('hidden');
            elements.exerciseInstructions.value = '';
            elements.updateCurrentExercise.textContent = 'Add to Sheet';
        } else {
            elements.customExercise.classList.add('hidden');
            setExerciseDefaults();
            showExerciseDescription(e.target.value);
            elements.updateCurrentExercise.textContent = 'Update Exercise';
        }
    });

    elements.exerciseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const now = new Date();
        const date = getLocalDate();
        const time = now.toTimeString().split(' ')[0];
        
        let exerciseName = elements.exerciseName.value;
        if (exerciseName === 'Custom') {
            exerciseName = elements.customExercise.value || 'Custom Exercise';
        }
        
        const weight = elements.weight.value;
        const reps = elements.reps.value;
        const timeValue = elements.time.value;
        
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
            
            // Update exercise defaults in sheet if values changed
            await updateExerciseDefaults(exerciseName, weight, reps, timeValue);
            
            showStatus('Exercise logged successfully! 💪', 'success');
            
            state.todayExercises.push({
                time,
                exercise: exerciseName,
                weight,
                repsTime
            });
            updateTodayLog();
        } catch (error) {
            console.error('Error logging exercise:', error);
            showStatus('Error logging exercise. Please try again.', 'error');
        }
    });
}

function setExerciseDefaults() {
    const selectedOption = elements.exerciseName.options[elements.exerciseName.selectedIndex];
    
    if (selectedOption.value === 'Custom') {
        // Don't set defaults for custom
        return;
    }
    
    // Get defaults from data attributes
    const weight = selectedOption.dataset.weight || '0';
    const reps = selectedOption.dataset.reps || '0';
    const time = selectedOption.dataset.time || '0';
    
    elements.weight.value = weight;
    elements.reps.value = reps;
    elements.time.value = time;
    
    // Show exercise description/instructions
    showExerciseDescription(selectedOption.value);
    
    // Auto-set workout timer if enabled and exercise has a time default
    if (elements.autoSetWorkoutTimer.checked && parseInt(time) > 0) {
        elements.workoutTimerDuration.value = time;
        // Update the workout timer display if not running
        if (!state.workoutTimerRunning) {
            state.workoutTimerSeconds = parseInt(time);
            updateWorkoutTimerDisplay();
        }
    }
}

// Get local date in YYYY-MM-DD format
function getLocalDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const localDate = `${year}-${month}-${day}`;
    console.log(`📅 Local date: ${localDate}`);
    return localDate;
}

function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = type;
    
    setTimeout(() => {
        elements.statusMessage.textContent = '';
        elements.statusMessage.className = '';
    }, 5000);
}

async function loadTodayExercises() {
    const today = getLocalDate();
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: `${state.workoutLogSheetName}!A:E`
        });
        
        const values = response.result.values || [];
        state.todayExercises = [];
        
        // Find today's exercises (skip header and empty rows)
        values.forEach((row, index) => {
            if (index === 0) return; // Skip header
            
            const date = row[0];
            const time = row[1];
            const exercise = row[2];
            const weight = row[3];
            const repsTime = row[4];
            
            // Only include rows with today's date AND an exercise name (skip blank separator rows)
            if (date === today && exercise && exercise.trim() !== '') {
                state.todayExercises.push({
                    time,
                    exercise,
                    weight,
                    repsTime
                });
            }
        });
        
        updateTodayLog();
        console.log(`Loaded ${state.todayExercises.length} exercises from today (${today})`);
    } catch (error) {
        console.error('Error loading today\'s exercises:', error);
        state.todayExercises = [];
        updateTodayLog();
    }
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
    
    // Ensure app content is hidden until signed in
    if (elements.appContent) {
        elements.appContent.classList.add('hidden');
        console.log('App content hidden - waiting for sign in');
    }
    
    setupTimerListeners();
    setupExerciseListeners();
    setupPomodoroListeners();
    setupAlarmListeners();
    updateTimerDisplay();
    updateWorkoutTimerDisplay();
    updatePomodoroTimerDisplay();
    
    setTimeout(() => {
        initGoogleAPI();
    }, 500);
});
