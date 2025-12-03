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
    tokenCheckInterval: null, // Frequent token check interval
    visibilityListenerAdded: false, // Track if visibility listener is added
    audioContext: null, // Shared audio context for all sounds
    allExercises: [], // Store all exercises for filtering
    sortCategories: [], // Store sort categories
    pomodoroSubjects: [], // Store pomodoro subjects
    workoutMode: false, // Track if in workout mode
    allWorkouts: [], // Store all workouts
    currentWorkoutIndex: 0, // Track current position in workout
    currentSetCount: 0, // Track how many sets completed for current exercise
    completedExercises: {} // Track completed exercises: {exerciseIndex: setsCompleted}
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
        setsGroup: document.getElementById('setsGroup'),
        sets: document.getElementById('sets'),
        weight: document.getElementById('weight'),
        reps: document.getElementById('reps'),
        time: document.getElementById('time'),
        statusMessage: document.getElementById('statusMessage'),
        todayLog: document.getElementById('todayLog'),
        manageExercises: document.getElementById('manageExercises'),
        viewWorkoutLog: document.getElementById('viewWorkoutLog'),
        updateCurrentExercise: document.getElementById('updateCurrentExercise'),
        deleteLastExercise: document.getElementById('deleteLastExercise'),
        workoutModeToggle: document.getElementById('workoutModeToggle'),
        workoutModeSection: document.getElementById('workoutModeSection'),
        workoutSelect: document.getElementById('workoutSelect'),
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
        deleteLastPomodoro: document.getElementById('deleteLastPomodoro'),
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

// Wrapper for API calls that handles auth errors
async function apiCallWithAuth(apiFunction) {
    try {
        return await apiFunction();
    } catch (error) {
        // Check if it's an auth error (401 or 403)
        if (error.status === 401 || error.status === 403 || 
            (error.result && (error.result.error?.code === 401 || error.result.error?.code === 403))) {
            console.log('🔐 Authentication expired, requesting new token...');
            
            // Try to refresh token silently
            return new Promise((resolve, reject) => {
                state.tokenClient.requestAccessToken({ 
                    prompt: 'none',
                    callback: async (response) => {
                        if (response.error) {
                            console.error('Silent refresh failed, requiring user login');
                            // Clear session and require re-login
                            localStorage.removeItem('googleAccessToken');
                            localStorage.removeItem('tokenExpiry');
                            localStorage.removeItem('userConsent');
                            state.isSignedIn = false;
                            updateSignInStatus(false);
                            alert('Session expired. Please sign in again.');
                            reject(error);
                        } else {
                            // Token refreshed successfully, retry the API call
                            console.log('✅ Token refreshed, retrying API call...');
                            try {
                                const result = await apiFunction();
                                resolve(result);
                            } catch (retryError) {
                                reject(retryError);
                            }
                        }
                    }
                });
            });
        }
        // Not an auth error, rethrow
        throw error;
    }
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
                    
                    // Set access token for gapi.client
                    gapi.client.setToken({
                        access_token: response.access_token
                    });
                    
                    // Save session to localStorage
                    // Google tokens expire after 1 hour, so we set expiry to 50 minutes
                    localStorage.setItem('googleAccessToken', response.access_token);
                    localStorage.setItem('tokenExpiry', Date.now() + (50 * 60 * 1000)); // 50 minutes
                    localStorage.setItem('userConsent', 'true'); // Remember user gave consent
                    localStorage.setItem('lastActivity', Date.now().toString()); // Track last activity
                    
                    updateSignInStatus(true);
                    initializeApp();
                    
                    // Auto-refresh token every 45 minutes (well before 60 min expiry)
                    if (state.tokenRefreshInterval) {
                        clearInterval(state.tokenRefreshInterval);
                    }
                    state.tokenRefreshInterval = setInterval(() => {
                        console.log('🔄 Auto-refreshing access token (50 min interval)...');
                        if (state.isSignedIn) {
                            // Request new token (will show popup if needed)
                            state.tokenClient.requestAccessToken({ prompt: 'none' });
                        }
                    }, 50 * 60 * 1000); // 50 minutes
                    
                    // Also check on visibility change (when user returns to tab)
                    if (!state.visibilityListenerAdded) {
                        document.addEventListener('visibilitychange', () => {
                            if (!document.hidden && state.isSignedIn) {
                                console.log('👀 Tab visible, checking token...');
                                refreshTokenIfNeeded();
                            }
                        });
                        state.visibilityListenerAdded = true;
                    }
                    
                    // Add token check every 10 minutes
                    if (state.tokenCheckInterval) {
                        clearInterval(state.tokenCheckInterval);
                    }
                    state.tokenCheckInterval = setInterval(() => {
                        if (state.isSignedIn) {
                            refreshTokenIfNeeded();
                        }
                    }, 2 * 60 * 1000); // 2 minutes
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

// Refresh token if it's close to expiring
function refreshTokenIfNeeded() {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (!tokenExpiry) {
        console.log('⚠️ No token expiry found');
        return;
    }
    
    const now = Date.now();
    const expiryTime = parseInt(tokenExpiry);
    const timeUntilExpiry = expiryTime - now;
    
    // If less than 10 minutes until expiry, refresh now
    if (timeUntilExpiry < 10 * 60 * 1000) {
        console.log('⚠️ Token expiring soon (less than 10 min), refreshing...');
        localStorage.setItem('lastActivity', now.toString());
        // Use 'none' instead of empty string for silent refresh
        state.tokenClient.requestAccessToken({ prompt: 'none' });
    } else {
        console.log(`✅ Token still valid for ${Math.round(timeUntilExpiry / 60000)} minutes`);
    }
}

// Check for existing session in localStorage
function checkExistingSession() {
    const savedToken = localStorage.getItem('googleAccessToken');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const userConsent = localStorage.getItem('userConsent');
    
    if (savedToken && tokenExpiry && userConsent) {
        const now = Date.now();
        const expiryTime = parseInt(tokenExpiry);
        
        // Check if token is still valid (not expired)
        if (now < expiryTime) {
            console.log('🔄 Restoring previous session...');
            state.accessToken = savedToken;
            state.isSignedIn = true;
            
            // Set access token for gapi.client
            gapi.client.setToken({
                access_token: savedToken
            });
            
            updateSignInStatus(true);
            initializeApp();
            
            // Set up auto-refresh
            if (state.tokenRefreshInterval) {
                clearInterval(state.tokenRefreshInterval);
            }
            
            // Check if token needs immediate refresh
            refreshTokenIfNeeded();
            
            // Set up periodic refresh every 50 minutes
            state.tokenRefreshInterval = setInterval(() => {
                console.log('🔄 Periodic token refresh (50 min)...');
                if (state.isSignedIn) {
                    state.tokenClient.requestAccessToken({ prompt: 'none' });
                }
            }, 50 * 60 * 1000);
            
            // Add token check every 10 minutes
            if (state.tokenCheckInterval) {
                clearInterval(state.tokenCheckInterval);
            }
            state.tokenCheckInterval = setInterval(() => {
                if (state.isSignedIn) {
                    refreshTokenIfNeeded();
                }
            }, 10 * 60 * 1000); // 10 minutes
        } else {
            // Token expired, try to refresh silently
            console.log('⚠️ Saved token expired, attempting silent refresh...');
            if (userConsent) {
                // User previously gave consent, try silent refresh
                state.tokenClient.requestAccessToken({ prompt: 'none' });
            } else {
                // Clear expired token
                localStorage.removeItem('googleAccessToken');
                localStorage.removeItem('tokenExpiry');
            }
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
            localStorage.removeItem('userConsent');
            
            // Clear token refresh intervals
            if (state.tokenRefreshInterval) {
                clearInterval(state.tokenRefreshInterval);
                state.tokenRefreshInterval = null;
            }
            if (state.tokenCheckInterval) {
                clearInterval(state.tokenCheckInterval);
                state.tokenCheckInterval = null;
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
    await checkAndAddDaySeparator();
    await loadTodayExercises();
    await loadTodayPomodoros();
    await ensureWorkoutsSheet();
    await loadWorkouts();
    restoreLastExercise();
}

// Find or create the yearly spreadsheet
async function findOrCreateSpreadsheet() {
    const year = new Date().getFullYear();
    const month = new Date().toLocaleString('en-US', { month: 'long' });
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
            
            // Set current month as workout log sheet
            state.workoutLogSheetName = month;
            
            // Ensure current month sheet exists
            await ensureMonthSheet(month);
            await ensureExercisesSheet();
        } else {
            // Check if previous year exists to copy exercises
            const previousYear = year - 1;
            const previousYearSheet = `${previousYear}-Sesh-Seans-Workouts`;
            let previousExercises = null;
            
            const prevSearchResponse = await fetch(
                `https://www.googleapis.com/drive/v3/files?q=name='${previousYearSheet}' and mimeType='application/vnd.google-apps.spreadsheet'&fields=files(id,name)`,
                {
                    headers: {
                        'Authorization': `Bearer ${state.accessToken}`
                    }
                }
            );
            
            const prevSearchData = await prevSearchResponse.json();
            if (prevSearchData.files && prevSearchData.files.length > 0) {
                // Get exercises from previous year
                previousExercises = await getExercisesFromSpreadsheet(prevSearchData.files[0].id);
            }
            
            // Create new spreadsheet with current month and Exercises sheet
            const createResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: sheetName
                },
                sheets: [
                    {
                        properties: {
                            title: month,
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
            state.workoutLogSheetName = month;
            console.log('Created new spreadsheet:', state.spreadsheetId);
            
            // Add header row to current month
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: state.spreadsheetId,
                range: `${month}!A1:E1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['Date', 'Time', 'Exercise', 'Weight', 'Reps/Time']]
                }
            });
            
            // Initialize Exercises sheet (with previous year's data if available)
            await initializeExercisesSheet(previousExercises);
        }
        
        // Load exercises into dropdown
        await loadExercises();
    } catch (error) {
        console.error('Error with spreadsheet:', error);
        showStatus('Error accessing Google Sheets. Check console.', 'error');
    }
}

// Ensure current month sheet exists
async function ensureMonthSheet(monthName) {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: state.spreadsheetId
        });
        
        const sheets = response.result.sheets;
        const monthSheet = sheets.find(sheet => sheet.properties.title === monthName);
        
        if (!monthSheet) {
            console.log(`Creating ${monthName} sheet...`);
            
            // Create the month sheet
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: state.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: monthName,
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        }
                    }]
                }
            });
            
            // Add header row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: state.spreadsheetId,
                range: `${monthName}!A1:E1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['Date', 'Time', 'Exercise', 'Weight', 'Reps/Time']]
                }
            });
        }
    } catch (error) {
        console.error('Error ensuring month sheet:', error);
    }
}

// Get exercises from a spreadsheet (for year rollover)
async function getExercisesFromSpreadsheet(spreadsheetId) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: 'Exercises!A:E'
        });
        
        return response.result.values || null;
    } catch (error) {
        console.error('Error getting exercises from previous year:', error);
        return null;
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

// Ensure Workouts sheet exists in existing spreadsheet
async function ensureWorkoutsSheet() {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: state.spreadsheetId
        });
        
        const sheets = response.result.sheets;
        const hasWorkoutsSheet = sheets.some(sheet => sheet.properties.title === 'Workouts');
        
        if (!hasWorkoutsSheet) {
            // Add Workouts sheet
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: state.spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: 'Workouts',
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        }
                    }]
                }
            });
            
            await initializeWorkoutsSheet();
        }
    } catch (error) {
        console.error('Error ensuring Workouts sheet:', error);
    }
}

// Initialize Workouts sheet with default workouts
async function initializeWorkoutsSheet() {
    console.log('Initializing Workouts sheet...');
    
    if (typeof getDefaultWorkouts !== 'function') {
        console.error('getDefaultWorkouts is not defined! Check if workout-data.js loaded.');
        alert('Error: Workout data not loaded. Check console.');
        return;
    }
    
    const workoutsToAdd = getDefaultWorkouts();
    console.log(`Adding ${workoutsToAdd.length} default workout entries`);
    
    await appendToSheet(workoutsToAdd, 'Workouts');
    console.log('Workouts sheet initialized successfully');
}

// Load workouts from Workouts sheet
async function loadWorkouts() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Workouts!A2:F' // Skip header row, include Sets column
        });
        
        const values = response.result.values || [];
        state.allWorkouts = [];
        const workoutNames = new Set();
        
        values.forEach(row => {
            const workoutName = row[0];
            const exercise = row[1];
            const sets = row[2] || '1';
            const weight = row[3] || '0';
            const reps = row[4] || '0';
            const time = row[5] || '0';
            
            // Skip empty rows, comments, and category headers
            if (!workoutName || workoutName.trim() === '' || workoutName.startsWith('#')) {
                return;
            }
            
            workoutNames.add(workoutName);
            
            state.allWorkouts.push({
                workoutName,
                exercise,
                sets: parseInt(sets),
                weight,
                reps,
                time
            });
        });
        
        // Populate workout dropdown
        elements.workoutSelect.innerHTML = '<option value="">Select a workout...</option>';
        Array.from(workoutNames).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            elements.workoutSelect.appendChild(option);
        });
        
        console.log(`Loaded ${state.allWorkouts.length} workout entries with ${workoutNames.size} unique workouts`);
    } catch (error) {
        console.error('Error loading workouts:', error);
        showStatus('Error loading workouts. Check console.', 'error');
    }
}

// Initialize Exercises sheet with default exercises
async function initializeExercisesSheet(previousExercises = null) {
    console.log('Initializing Exercises sheet...');
    
    let exercisesToAdd;
    
    if (previousExercises && previousExercises.length > 0) {
        // Use exercises from previous year
        console.log(`Copying ${previousExercises.length} exercises from previous year`);
        exercisesToAdd = previousExercises;
    } else {
        // Use default exercises
        if (typeof getDefaultExercisesWithDescriptions !== 'function') {
            console.error('getDefaultExercisesWithDescriptions is not defined! Check if exercise-data.js loaded.');
            alert('Error: Exercise data not loaded. Check console.');
            return;
        }
        
        exercisesToAdd = getDefaultExercisesWithDescriptions();
        console.log(`Adding ${exercisesToAdd.length} default exercises`);
    }
    
    await appendToSheet(exercisesToAdd, 'Exercises');
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
    const month = new Date().toLocaleString('en-US', { month: 'long' });
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
            
            // Ensure current month sheet exists
            await ensurePomodoroMonthSheet(month);
        } else {
            // Create new spreadsheet with current month sheet
            const createResponse = await gapi.client.sheets.spreadsheets.create({
                properties: {
                    title: sheetName
                },
                sheets: [{
                    properties: {
                        title: month,
                        gridProperties: {
                            frozenRowCount: 1
                        }
                    }
                }]
            });
            
            state.pomodoroSpreadsheetId = createResponse.result.spreadsheetId;
            console.log('Created new Pomodoro spreadsheet:', state.pomodoroSpreadsheetId);
            
            // Add header row to current month
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: state.pomodoroSpreadsheetId,
                range: `${month}!A1:F1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['Date', 'Time', 'Subject', 'Study Duration (min)', 'Break Duration (min)', 'Notes']]
                }
            });
        }
    } catch (error) {
        console.error('Error with Pomodoro spreadsheet:', error);
    }
}

// Ensure Pomodoro month sheet exists
async function ensurePomodoroMonthSheet(monthName) {
    try {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: state.pomodoroSpreadsheetId
        });
        
        const sheets = response.result.sheets;
        const monthSheet = sheets.find(sheet => sheet.properties.title === monthName);
        
        if (!monthSheet) {
            console.log(`Creating Pomodoro ${monthName} sheet...`);
            
            // Create the month sheet
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: state.pomodoroSpreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: monthName,
                                gridProperties: {
                                    frozenRowCount: 1
                                }
                            }
                        }
                    }]
                }
            });
            
            // Add header row
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: state.pomodoroSpreadsheetId,
                range: `${monthName}!A1:F1`,
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [['Date', 'Time', 'Subject', 'Study Duration (min)', 'Break Duration (min)', 'Notes']]
                }
            });
        }
    } catch (error) {
        console.error('Error ensuring Pomodoro month sheet:', error);
    }
}

// Append data to Pomodoro sheet
async function appendToPomodoroSheet(values) {
    try {
        const month = new Date().toLocaleString('en-US', { month: 'long' });
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: state.pomodoroSpreadsheetId,
            range: `${month}!A:F`,
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

// Get or create shared audio context
async function getAudioContext() {
    if (!state.audioContext) {
        try {
            state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('🔊 Audio context created, state:', state.audioContext.state);
        } catch (e) {
            console.error('❌ Web Audio API not supported:', e);
            return null;
        }
    }
    
    // Resume if suspended (browser autoplay policy)
    if (state.audioContext.state === 'suspended') {
        console.log('⏸️ Audio context suspended, resuming...');
        await state.audioContext.resume();
        console.log('▶️ Audio context resumed, state:', state.audioContext.state);
    }
    
    console.log('🔊 Audio context state:', state.audioContext.state);
    return state.audioContext;
}

async function playIntervalSound() {
    console.log('🔔 Playing interval sound...');
    
    // Try using a simple beep sound with higher volume
    try {
        const audioContext = await getAudioContext();
        if (!audioContext) {
            console.error('❌ No audio context available');
            return;
        }
        
        // Create a louder, longer beep
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = 800;
        osc.type = 'square'; // Square wave is louder
        gain.gain.setValueAtTime(0.5, audioContext.currentTime); // Louder volume
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + 0.5);
        
        console.log('✅ Interval sound started at volume 0.5');
    } catch (e) {
        console.error('❌ Error creating interval sound:', e);
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Interval Complete!', {
            body: 'Next interval starting...',
            icon: '⏰'
        });
    }
}

async function playWorkoutSound() {
    // Play triple beep for workout timer
    const audioContext = await getAudioContext();
    if (!audioContext) return;
    
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
    
    // Exercise section toggle
    const exerciseToggle = document.getElementById('exerciseToggle');
    if (exerciseToggle) {
        exerciseToggle.addEventListener('click', () => {
            document.querySelector('.exercise-section').classList.toggle('collapsed');
        });
    }

    // Manage Pomodoro Sheet button
    elements.managePomodoroSheet.addEventListener('click', async () => {
        if (state.pomodoroSpreadsheetId) {
            try {
                const month = new Date().toLocaleString('en-US', { month: 'long' });
                const response = await gapi.client.sheets.spreadsheets.get({
                    spreadsheetId: state.pomodoroSpreadsheetId
                });
                
                const sheets = response.result.sheets;
                const monthSheet = sheets.find(sheet => sheet.properties.title === month);
                
                if (monthSheet) {
                    const sheetId = monthSheet.properties.sheetId;
                    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.pomodoroSpreadsheetId}/edit#gid=${sheetId}`;
                    window.open(spreadsheetUrl, '_blank');
                } else {
                    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.pomodoroSpreadsheetId}/edit`;
                    window.open(spreadsheetUrl, '_blank');
                }
            } catch (error) {
                console.error('Error opening Pomodoro sheet:', error);
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.pomodoroSpreadsheetId}/edit`;
                window.open(spreadsheetUrl, '_blank');
            }
        } else {
            showStatus('Pomodoro spreadsheet not yet created. Start a session first!', 'error');
        }
    });

    // Delete Last Pomodoro button
    elements.deleteLastPomodoro.addEventListener('click', async () => {
        if (!state.pomodoroSpreadsheetId) {
            showStatus('No Pomodoro sessions to delete.', 'error');
            return;
        }

        if (!confirm('Delete the last Pomodoro session?')) {
            return;
        }

        try {
            const month = new Date().toLocaleString('en-US', { month: 'long' });
            
            // Get all data from current month
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: state.pomodoroSpreadsheetId,
                range: `${month}!A:F`
            });

            const values = response.result.values || [];
            
            // Find the last non-empty row (skip header at row 0)
            let lastRowIndex = -1;
            for (let i = values.length - 1; i >= 1; i--) {
                if (values[i] && values[i].some(cell => cell && cell.trim() !== '')) {
                    lastRowIndex = i;
                    break;
                }
            }

            if (lastRowIndex === -1) {
                showStatus('No Pomodoro sessions to delete.', 'error');
                return;
            }

            // Delete the row by clearing it
            const rowNumber = lastRowIndex + 1; // Convert to 1-based index
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: state.pomodoroSpreadsheetId,
                range: `${month}!A${rowNumber}:F${rowNumber}`
            });

            showStatus('Last Pomodoro session deleted successfully!', 'success');
            
            // Reload today's Pomodoros
            await loadTodayPomodoros();
        } catch (error) {
            console.error('Error deleting last Pomodoro:', error);
            showStatus('Error deleting Pomodoro session. Check console.', 'error');
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
    const month = new Date().toLocaleString('en-US', { month: 'long' });
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.pomodoroSpreadsheetId,
            range: `${month}!A:F`
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
            
            if (date === today && subject && subject.trim() !== '') {
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

async function playPomodoroBreakSound() {
    // Ascending tone for break time
    const audioContext = await getAudioContext();
    if (!audioContext) return;
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

async function playPomodoroStudySound() {
    // Descending tone for study time
    const audioContext = await getAudioContext();
    if (!audioContext) return;
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

async function playAlarmSound() {
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
    
    // Get shared audio context
    const audioContext = await getAudioContext();
    if (!audioContext) return;
    
    // Loop alarm sound continuously
    let alarmInterval;
    const playAlarmBeep = () => {
        try {
            
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
        } catch (e) {
            console.error('Error playing alarm sound:', e);
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
    
    if (state.workoutMode) {
        // Update workout entry in Workouts sheet
        await updateWorkoutInSheet(exerciseName, weight, reps, time);
    } else if (exerciseName === 'Custom') {
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

// Update workout entry in Workouts sheet
async function updateWorkoutInSheet(exerciseName, weight, reps, time) {
    try {
        const selectedWorkout = elements.workoutSelect.value;
        if (!selectedWorkout) {
            showStatus('No workout selected', 'error');
            return;
        }
        
        // Get all workouts
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: 'Workouts!A:F'
        });
        
        const values = response.result.values || [];
        
        // Find the current exercise in the current workout
        const workoutExercises = state.allWorkouts.filter(w => w.workoutName === selectedWorkout);
        const currentExercise = workoutExercises[state.currentWorkoutIndex];
        
        // Find the row in the sheet
        let rowIndex = -1;
        let matchCount = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[i][0] === selectedWorkout && values[i][1] === currentExercise.exercise) {
                if (matchCount === state.currentWorkoutIndex) {
                    rowIndex = i + 1; // Convert to 1-based index
                    break;
                }
                matchCount++;
            }
        }
        
        if (rowIndex === -1) {
            showStatus('Could not find workout entry to update', 'error');
            return;
        }
        
        // Update the row (keep Sets column, update Weight, Reps, Time)
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: state.spreadsheetId,
            range: `Workouts!D${rowIndex}:F${rowIndex}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[weight, reps, time]]
            }
        });
        
        showStatus('Workout entry updated successfully!', 'success');
        
        // Reload workouts to reflect changes
        setTimeout(async () => {
            await loadWorkouts();
            // Restore the current workout selection
            elements.workoutSelect.value = selectedWorkout;
            loadWorkoutExercises(selectedWorkout);
        }, 1000);
        
    } catch (error) {
        console.error('Error updating workout:', error);
        showStatus('Error updating workout. Check console.', 'error');
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
    console.log('🔧 Setting up exercise listeners...');
    
    // Update Current Exercise button
    elements.updateCurrentExercise.addEventListener('click', async () => {
        await updateCurrentExercise();
    });

    // View Workout Log button
    elements.viewWorkoutLog.addEventListener('click', async () => {
        try {
            // Get the sheet ID for the current month's workout log
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: state.spreadsheetId
            });
            
            const sheets = response.result.sheets;
            const workoutSheet = sheets.find(sheet => sheet.properties.title === state.workoutLogSheetName);
            
            if (workoutSheet) {
                const sheetId = workoutSheet.properties.sheetId;
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit#gid=${sheetId}`;
                window.open(spreadsheetUrl, '_blank');
            } else {
                // Fallback
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit`;
                window.open(spreadsheetUrl, '_blank');
            }
        } catch (error) {
            console.error('Error opening workout log:', error);
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit`;
            window.open(spreadsheetUrl, '_blank');
        }
    });

    // Manage Exercises/Workouts button
    elements.manageExercises.addEventListener('click', async () => {
        try {
            const sheetName = state.workoutMode ? 'Workouts' : 'Exercises';
            
            // Get the sheet ID for the target sheet
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: state.spreadsheetId
            });
            
            const sheets = response.result.sheets;
            const targetSheet = sheets.find(sheet => sheet.properties.title === sheetName);
            
            if (targetSheet) {
                const sheetId = targetSheet.properties.sheetId;
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit#gid=${sheetId}`;
                window.open(spreadsheetUrl, '_blank');
                
                if (state.workoutMode) {
                    showStatus('Edit the "Workouts" sheet. Add "Sets" column to control repetitions. Refresh to see changes.', 'success');
                } else {
                    showStatus('Edit the "Exercises" sheet. Use "# === CATEGORY ===" to create sort categories. Refresh to see changes.', 'success');
                }
            } else {
                // Fallback to just opening the spreadsheet
                const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit`;
                window.open(spreadsheetUrl, '_blank');
                showStatus(`${sheetName} sheet not found. Opening spreadsheet.`, 'error');
            }
        } catch (error) {
            console.error('Error opening sheet:', error);
            // Fallback
            const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${state.spreadsheetId}/edit`;
            window.open(spreadsheetUrl, '_blank');
        }
    });

    // Delete Last Exercise button
    elements.deleteLastExercise.addEventListener('click', async () => {
        if (!confirm('Delete the last exercise entry?')) {
            return;
        }

        try {
            // Get all data from current month
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: state.spreadsheetId,
                range: `${state.workoutLogSheetName}!A:E`
            });

            const values = response.result.values || [];
            
            // Find the last non-empty row (skip header at row 0)
            let lastRowIndex = -1;
            for (let i = values.length - 1; i >= 1; i--) {
                if (values[i] && values[i].some(cell => cell && cell.trim() !== '')) {
                    lastRowIndex = i;
                    break;
                }
            }

            if (lastRowIndex === -1) {
                showStatus('No exercises to delete.', 'error');
                return;
            }

            // Delete the row by clearing it
            const rowNumber = lastRowIndex + 1; // Convert to 1-based index
            await gapi.client.sheets.spreadsheets.values.clear({
                spreadsheetId: state.spreadsheetId,
                range: `${state.workoutLogSheetName}!A${rowNumber}:E${rowNumber}`
            });

            showStatus('Last exercise deleted successfully!', 'success');
            
            // Reload today's exercises
            await loadTodayExercises();
        } catch (error) {
            console.error('Error deleting last exercise:', error);
            showStatus('Error deleting exercise. Check console.', 'error');
        }
    });

    // Sort filter
    elements.sortFilter.addEventListener('change', (e) => {
        displayExercises(e.target.value);
    });

    // Exercise selection
    elements.exerciseName.addEventListener('change', (e) => {
        // Save selected exercise to localStorage
        localStorage.setItem('lastSelectedExercise', e.target.value);
        
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

    // Workout Mode Toggle
    elements.workoutModeToggle.addEventListener('change', (e) => {
        state.workoutMode = e.target.checked;
        if (state.workoutMode) {
            elements.workoutModeSection.classList.remove('hidden');
            elements.setsGroup.classList.remove('hidden');
            elements.exerciseName.disabled = false; // Allow exercise selection in workout mode
            elements.sortFilter.disabled = true;
            elements.manageExercises.textContent = 'Manage Workouts';
            elements.updateCurrentExercise.textContent = 'Update Workout';
        } else {
            elements.workoutModeSection.classList.add('hidden');
            elements.setsGroup.classList.add('hidden');
            elements.exerciseName.disabled = false;
            elements.sortFilter.disabled = false;
            elements.manageExercises.textContent = 'Manage Exercises';
            elements.updateCurrentExercise.textContent = 'Update Exercise';
        }
    });
    
    // Workout Selection
    elements.workoutSelect.addEventListener('change', (e) => {
        const selectedWorkout = e.target.value;
        if (selectedWorkout) {
            loadWorkoutExercises(selectedWorkout);
        }
    });
    
    console.log('📋 Attaching form submit listener to:', elements.exerciseForm);
    elements.exerciseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('📝 Log Exercise button clicked');
        
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
            
            // If in workout mode, cycle to next exercise
            if (state.workoutMode) {
                cycleToNextWorkoutExercise();
            }
        } catch (error) {
            console.error('Error logging exercise:', error);
            showStatus('Error logging exercise. Please try again.', 'error');
        }
    });
}

// Restore last selected exercise from localStorage
function restoreLastExercise() {
    const lastExercise = localStorage.getItem('lastSelectedExercise');
    
    if (lastExercise) {
        // Try to find and select the exercise
        const options = elements.exerciseName.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].value === lastExercise) {
                elements.exerciseName.selectedIndex = i;
                console.log(`🔄 Restored last exercise: ${lastExercise}`);
                break;
            }
        }
    }
    
    // Set defaults for the selected exercise
    setExerciseDefaults();
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
    
    console.log(`📋 Loading exercises from sheet: ${state.workoutLogSheetName}`);
    
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: state.spreadsheetId,
            range: `${state.workoutLogSheetName}!A:E`
        });
        
        const values = response.result.values || [];
        state.todayExercises = [];
        
        console.log(`📊 Found ${values.length} total rows in ${state.workoutLogSheetName}`);
        
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
        console.log(`✅ Loaded ${state.todayExercises.length} exercises from today (${today})`);
    } catch (error) {
        console.error('❌ Error loading today\'s exercises:', error);
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

// Load workout exercises for selected workout
function loadWorkoutExercises(workoutName) {
    const workoutExercises = state.allWorkouts.filter(w => w.workoutName === workoutName);
    if (workoutExercises.length === 0) {
        showStatus('No exercises found for this workout.', 'error');
        return;
    }
    
    state.currentWorkoutIndex = 0;
    state.currentSetCount = 0;
    state.completedExercises = {}; // Reset completion tracking
    setWorkoutExercise(workoutExercises[0]);
    showStatus(`Loaded ${workoutExercises.length} exercises for ${workoutName}`, 'success');
}

// Set exercise from workout
function setWorkoutExercise(workoutExercise) {
    // Find the exercise in the dropdown
    const options = elements.exerciseName.options;
    let found = false;
    for (let i = 0; i < options.length; i++) {
        if (options[i].value === workoutExercise.exercise) {
            elements.exerciseName.selectedIndex = i;
            found = true;
            break;
        }
    }
    
    if (!found) {
        console.warn(`Exercise "${workoutExercise.exercise}" not found in dropdown`);
        return;
    }
    
    // Set the values
    elements.sets.value = workoutExercise.sets;
    elements.weight.value = workoutExercise.weight;
    elements.reps.value = workoutExercise.reps;
    elements.time.value = workoutExercise.time;
    
    // Update description
    setExerciseDefaults();
    
    // Auto-set workout timer if enabled
    if (elements.autoSetWorkoutTimer.checked) {
        const timeValue = parseInt(workoutExercise.time);
        if (timeValue > 0) {
            state.workoutTimerSeconds = timeValue;
            updateWorkoutTimerDisplay();
        }
    }
    
    // Update exercise styling based on completion
    updateExerciseCompletionStatus();
}

// Cycle to next exercise in workout
function cycleToNextWorkoutExercise() {
    const selectedWorkout = elements.workoutSelect.value;
    if (!selectedWorkout) return;
    
    const workoutExercises = state.allWorkouts.filter(w => w.workoutName === selectedWorkout);
    if (workoutExercises.length === 0) return;
    
    const currentExercise = workoutExercises[state.currentWorkoutIndex];
    state.currentSetCount++;
    
    // Track completion
    state.completedExercises[state.currentWorkoutIndex] = state.currentSetCount;
    
    // Check if we've completed all sets for this exercise
    if (state.currentSetCount >= currentExercise.sets) {
        // Mark as fully completed
        state.completedExercises[state.currentWorkoutIndex] = currentExercise.sets;
        
        // Move to next exercise
        const previousIndex = state.currentWorkoutIndex;
        state.currentWorkoutIndex = (state.currentWorkoutIndex + 1) % workoutExercises.length;
        state.currentSetCount = 0;
        const nextExercise = workoutExercises[state.currentWorkoutIndex];
        
        setWorkoutExercise(nextExercise);
        
        // Show which exercise we're on
        const position = state.currentWorkoutIndex + 1;
        showStatus(`✅ Completed ${currentExercise.exercise}! Exercise ${position}/${workoutExercises.length}: ${nextExercise.exercise} - Set 1/${nextExercise.sets}`, 'success');
    } else {
        // Same exercise, next set
        const setNum = state.currentSetCount + 1;
        showStatus(`${currentExercise.exercise} - Set ${setNum}/${currentExercise.sets}`, 'success');
    }
    
    updateExerciseCompletionStatus();
}

// Update exercise completion status visual feedback
function updateExerciseCompletionStatus() {
    if (!state.workoutMode) return;
    
    const selectedWorkout = elements.workoutSelect.value;
    if (!selectedWorkout) return;
    
    const workoutExercises = state.allWorkouts.filter(w => w.workoutName === selectedWorkout);
    const currentExercise = workoutExercises[state.currentWorkoutIndex];
    
    // Check if current exercise is completed
    const setsCompleted = state.completedExercises[state.currentWorkoutIndex] || 0;
    const isCompleted = setsCompleted >= currentExercise.sets;
    
    // Update exercise name dropdown styling
    if (isCompleted) {
        elements.exerciseName.style.backgroundColor = '#1a3300';
        elements.exerciseName.style.color = '#66ff66';
        elements.exerciseName.style.borderColor = '#339900';
    } else {
        elements.exerciseName.style.backgroundColor = '';
        elements.exerciseName.style.color = '';
        elements.exerciseName.style.borderColor = '';
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
