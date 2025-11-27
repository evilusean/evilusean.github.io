# 💪 Sesh Seans Workout Tracker

A workout tracking app that logs exercises to Google Sheets with a built-in timer.

**[Live Demo](https://evilusean.github.io/Sesh-Seans)** (once deployed)

## Features

- 🔐 Google OAuth authentication
- ⏱️ Configurable timer (default 15 minutes)
- 💪 Pre-configured exercises with defaults:
  - Stomach Vacuum (15 seconds)
  - Pullups (15 reps)
  - Situps (100 reps)
  - Burpees (25 reps)
- 📊 Automatic logging to Google Sheets
- 📅 Automatic day separation in the spreadsheet
- 📱 Fully responsive design

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
- **[Fix Origin Error](docs/FIX_ORIGIN_ERROR.md)** - Fix "Not a valid origin" errors
- **[Security Guide](docs/SECURITY.md)** - Credential safety information

## How It Works

1. Sign in with Google → Creates yearly spreadsheet `[YEAR]-Sesh-Seans`
2. Set timer (default 15 min) → Start your workout
3. Log exercises → Automatically saved to Google Sheets
4. New day → Adds blank line separator

**Data format:** Date | Time | Exercise | Weight | Reps/Time

## Troubleshooting

See [Fix Origin Error Guide](docs/FIX_ORIGIN_ERROR.md) for the most common issue.

**Common errors:**
- "Not a valid origin" → Add your URL to authorized origins in Google Cloud Console
- "Missing config.js" → Copy config-template.js to config.js
- "Configure Credentials First" → Add real credentials to config.js

Check browser console (F12) for detailed error messages.
