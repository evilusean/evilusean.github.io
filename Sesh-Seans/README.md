# Sesh Seans Workout Tracker

A workout tracking app that logs exercises to Google Sheets with a built-in timer.

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

## Usage

1. Sign in with your Google account
2. The app will create a spreadsheet named `[YEAR]-Sesh-Seans` (e.g., `2025-Sesh-Seans`)
3. Set your timer interval (default 15 minutes)
4. Start the timer when you begin your workout
5. Log exercises with weight, reps, or time
6. Each new day automatically adds a blank line separator in the sheet

## Data Format

The Google Sheet will have the following columns:
- Date (YYYY-MM-DD)
- Time (HH:MM:SS)
- Exercise
- Weight (lbs)
- Reps/Time

## Troubleshooting

See [Fix Origin Error Guide](docs/FIX_ORIGIN_ERROR.md) for the most common issue.

**Common errors:**
- "Not a valid origin" → Add your URL to authorized origins in Google Cloud Console
- "Missing config.js" → Copy config-template.js to config.js
- "Configure Credentials First" → Add real credentials to config.js

Check browser console (F12) for detailed error messages.
