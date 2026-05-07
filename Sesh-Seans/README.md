# 💪 Sesh Seans Workout/Study Tracker and Timer

A comprehensive productivity app that tracks workouts and study sessions to Google Sheets with multiple built-in timers.

**[Live Demo](https://evilusean.github.io/Sesh-Seans)**

## Features

### 🏋️ Workout Tracking
- 🔐 **Google OAuth Authentication** - Secure sign-in with Google Identity Services
- ⏱️ **Interval Timer** - Continuous repeating timer with configurable intervals (default 15 min)
- 💪 **Workout Timer** - Per-exercise countdown timer (default 30 sec)
- 📊 **60+ Pre-configured Exercises** with detailed descriptions
- 🏋️ **Exercise Categories**: Abs, Pull-up Bar, Bodyweight, Dumbbells, Isometric, Seated
- 🏋️ **Workout Mode** - Cycle through pre-defined workout routines automatically
- 📋 **Default Workouts** - 3-day split (Legs+Arms, Back+Pull, Chest+Core), Full Body, Stretching
- 🔄 **Auto-Cycling** - In Workout Mode, logging an exercise automatically loads the next one
- 📝 **Custom Exercise Creation** - Add your own exercises on the fly
- 🔄 **Auto-set Workout Timer** - Automatically sets timer based on exercise defaults
- 📈 **Exercise Management** - Update exercise defaults and view descriptions
- 🗑️ **Delete Last Entry** - Quick correction for mistakes
- 📅 **Automatic Day Separation** - Blank lines between different days in spreadsheet
- 📊 **Today's Log Display** - See all exercises logged today
- 📱 **Fully Responsive Design** - Works on desktop, tablet, and mobile

### 📚 Study Tracking (Pomodoro)
- 📚 **Pomodoro Timer** - Study/break cycles with auto-switching (default 20/5 min)
- 📖 **Subject Tracking** - Pre-configured subjects plus custom subject support
- 📝 **Session Notes** - Add notes about what you're working on
- 📊 **Separate Pomodoro Spreadsheet** - Dedicated tracking for study sessions
- 🔔 **Unique Study/Break Sounds** - Different tones for study and break transitions
- 📈 **Today's Sessions Display** - View all Pomodoro sessions logged today
- ⏯️ **Pause/Resume** - Full control over your study sessions
- 🎯 **Collapsible Section** - Keep your workspace clean when not studying

### ⏰ Alarm Clock
- ⏰ **Dual Mode Alarm** - Set specific time OR countdown timer
- 🕐 **Set Time Mode** - Set alarm for specific hour and minute (24-hour format)
- ⏲️ **Countdown Mode** - Set alarm for X minutes and Y seconds from now
- 🔊 **Continuous Alarm** - Alarm loops until manually dismissed
- 🚨 **Full-Screen Modal** - Impossible to miss with pulsing background and shaking alert
- 🔴 **Red Theme** - Urgent, attention-grabbing color scheme
- 🎵 **Loud Repeating Sound** - Distinctive alarm sound that repeats every 2 seconds
- 🔕 **Manual Dismiss** - Must click "Dismiss Alarm" button to stop
- 🎯 **Collapsible Section** - Keeps interface clean when not in use

### 🎵 Multiple Independent Timers
- ✅ **All Timers Run Simultaneously** - No conflicts between timers
- 🎨 **Color-Coded Sections** - Red (Workout), Green (Pomodoro), Red (Alarm)
- 🔊 **Unique Sounds** - Each timer has distinctive audio cues
- ⏯️ **Individual Controls** - Start, pause, reset each timer independently

## Quick Start

1. **Get Google API credentials** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Copy config template:** `cp config-template.js config.js`
3. **Add your credentials** to `config.js`
4. **Test locally:** `python -m http.server 8000`
5. **Visit:** http://localhost:8000
6. **⚠️ IMPORTANT: Allow popups** - The app uses popups to refresh your login every 50 minutes. If popups are blocked, you'll be logged out after 1 hour. Enable popups for this site to stay logged in indefinitely.

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Fast setup overview
- **[Setup Guide](docs/SETUP.md)** - Detailed local setup
- **[GitHub Pages Deployment](docs/GITHUB_PAGES_SETUP.md)** - Deploy to GitHub Pages
- **[Checklist](docs/CHECKLIST.md)** - Complete setup checklist
- **[Security Guide](docs/SECURITY.md)** - Credential safety information

## 🎵 Timer Sounds

Each timer has a unique sound to help you distinguish them:
- **Interval Timer**: Double beep (800Hz) - Signals interval completion
- **Workout Timer**: Triple beep (1200Hz) - Exercise time complete
- **Pomodoro Break**: Ascending tone (400Hz → 600Hz) - Break time!
- **Pomodoro Study**: Descending tone (600Hz → 400Hz) - Back to work!
- **Alarm Clock**: Loud repeating sawtooth wave (1000Hz) - Loops every 2 seconds until dismissed

## How It Works

### Single Exercise Mode (Default)
1. Sign in with Google → Creates `[YEAR]-Sesh-Seans-Workouts` spreadsheet with Exercises and Workouts sheets
2. Use Interval Timer for continuous workout tracking
3. Use Workout Timer for timed exercises
4. Select exercise from dropdown (or create custom)
5. Log exercise → Saved to Google Sheets with timestamp
6. New day → Automatic blank line separator

### Workout Mode (Guided Routines)
1. Enable "Workout Mode" checkbox
2. Select a workout from dropdown (Day 1: Legs+Arms, Day 2: Back+Pull, Day 3: Chest+Core, etc.)
3. First exercise loads automatically with defaults
4. Complete exercise and click "Log Exercise"
5. Next exercise in sequence loads automatically
6. Cycles through entire workout routine
7. Edit Workouts sheet in Google Sheets to customize routines

### Study Mode (Pomodoro)
1. Creates separate `[YEAR]-Sesh-Seans-Pomodoro` spreadsheet
2. Select subject and set study/break durations
3. Start Pomodoro → Auto-switches between study and break
4. Add notes about what you're working on
5. Log session → Saved with subject, duration, and notes

### Alarm Clock
1. Choose between two modes:
   - **Set Time**: Set alarm for specific hour:minute (24-hour format)
   - **Countdown**: Set alarm for X minutes and Y seconds from now
2. Click "Set Alarm" to activate
3. Alarm triggers with full-screen modal and continuous sound
4. Must click "Dismiss Alarm" button to stop
5. Perfect for reminders, scheduled breaks, and time-sensitive tasks

## Troubleshooting

See [Fix Origin Error Guide](docs/FIX_ORIGIN_ERROR.md) for the most common issue.

**Common errors:**
- "Not a valid origin" → Add your URL to authorized origins in Google Cloud Console
- "Missing config.js" → Copy config-template.js to config.js
- "Configure Credentials First" → Add real credentials to config.js

Check browser console (F12) for detailed error messages.

## TODO/Future Sean Problems :
- Just tested on mobile : Screen Autolocks after 1 min
