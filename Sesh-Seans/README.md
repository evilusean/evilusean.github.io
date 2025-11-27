# 💪 Sesh Seans Workout/Study Tracker and Timer

A comprehensive productivity app that tracks workouts and study sessions to Google Sheets with multiple built-in timers.

**[Live Demo](https://evilusean.github.io/Sesh-Seans)**

## Features

### Workout Tracking
- 🔐 Google OAuth authentication
- ⏱️ **Interval Timer** - Continuous timer with configurable intervals (default 15 min)
- 💪 **Workout Timer** - Per-exercise timer (default 30 sec)
- 📊 60+ pre-configured exercises with descriptions
- 🏋️ Categories: Abs, Pull-up Bar, Bodyweight, Dumbbells, Isometric, Seated
- 📝 Custom exercise creation
- 📅 Automatic day separation in spreadsheet
- 📱 Fully responsive design

### Study Tracking (Pomodoro)
- 📚 **Pomodoro Timer** - Study/break cycles (default 20/5 min)
- 📖 Subject tracking with custom subjects
- 📝 Session notes
- 📊 Separate Pomodoro spreadsheet
- 🔔 Different sounds for study/break transitions

### Additional Features
- ⏰ **Alarm Clock** - Set specific time alarms
- 🎵 Unique sounds for each timer type
- 📈 Today's workout and study session logs
- 🔄 Auto-update exercise defaults
- 🎨 Color-coded timers (Red: Workout, Green: Pomodoro, Yellow: Alarm)

## Quick Start

1. **Get Google API credentials** from [Google Cloud Console](https://console.cloud.google.com/)
2. **Copy config template:** `cp config-template.js config.js`
3. **Add your credentials** to `config.js`
4. **Test locally:** `python -m http.server 8000`
5. **Visit:** http://localhost:8000

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Fast setup overview
- **[Setup Guide](docs/SETUP.md)** - Detailed local setup
- **[GitHub Pages Deployment](docs/GITHUB_PAGES_SETUP.md)** - Deploy to GitHub Pages
- **[Checklist](docs/CHECKLIST.md)** - Complete setup checklist
- **[Security Guide](docs/SECURITY.md)** - Credential safety information

## 🎵 Timer Sounds

Each timer has a unique sound to help you distinguish them:
- **Interval Timer**: Double beep (800Hz)
- **Workout Timer**: Triple beep (1200Hz)
- **Pomodoro Break**: Ascending tone (break time!)
- **Pomodoro Study**: Descending tone (back to work!)
- **Alarm Clock**: Loud repeating alarm (5 beeps)

## How It Works

### Workout Mode
1. Sign in with Google → Creates `[YEAR]-Sesh-Seans-Workouts` spreadsheet
2. Use Interval Timer for continuous workout tracking
3. Use Workout Timer for timed exercises
4. Select exercise from dropdown (or create custom)
5. Log exercise → Saved to Google Sheets with timestamp
6. New day → Automatic blank line separator

### Study Mode (Pomodoro)
1. Creates separate `[YEAR]-Sesh-Seans-Pomodoro` spreadsheet
2. Select subject and set study/break durations
3. Start Pomodoro → Auto-switches between study and break
4. Add notes about what you're working on
5. Log session → Saved with subject, duration, and notes

### Alarm Clock
1. Set specific time for alarm
2. Alarm rings with distinctive sound
3. Perfect for reminders and scheduled breaks

## Troubleshooting

See [Fix Origin Error Guide](docs/FIX_ORIGIN_ERROR.md) for the most common issue.

**Common errors:**
- "Not a valid origin" → Add your URL to authorized origins in Google Cloud Console
- "Missing config.js" → Copy config-template.js to config.js
- "Configure Credentials First" → Add real credentials to config.js

Check browser console (F12) for detailed error messages.
