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

## Setup Instructions

### 1. Get Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Sheets API
   - Google Drive API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Add authorized JavaScript origins: `http://localhost:8000` (for testing) and your GitHub Pages URL
   - Add authorized redirect URIs: Same as above
5. Create an API Key:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to Google Sheets API and Google Drive API

### 2. Configure the App

Edit `script.js` and replace the placeholder values:

```javascript
const CONFIG = {
    CLIENT_ID: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
    API_KEY: 'YOUR_ACTUAL_API_KEY',
    // ... rest stays the same
};
```

**Important:** Make sure your OAuth 2.0 Client ID has the correct authorized origins:
- For local testing: `http://localhost:8000`
- For GitHub Pages: `https://[username].github.io`

The app will show an error if credentials aren't configured.

### 3. Test Locally

```bash
# Simple HTTP server with Python
python -m http.server 8000

# Or with Node.js
npx http-server -p 8000
```

Visit `http://localhost:8000`

### 4. Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select your branch and root folder
4. Your app will be available at `https://[username].github.io/[repo-name]`

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

### "Can't sign in with Google"

1. **Check credentials are configured**: Open browser console (F12) and look for errors
2. **Verify authorized origins**: In Google Cloud Console, make sure your OAuth client has:
   - `http://localhost:8000` (for local testing)
   - Your GitHub Pages URL (for production)
3. **Check API restrictions**: Make sure your API key allows:
   - Google Sheets API
   - Google Drive API
4. **Clear browser cache**: Sometimes old credentials get cached
5. **Try incognito mode**: Rules out extension conflicts

### Common Errors

- **"idpiframe_initialization_failed"**: Your domain isn't in authorized origins
- **"popup_closed_by_user"**: User closed the popup - just try again
- **"access_denied"**: User didn't grant permissions - need to accept all scopes

### Console Logs

The app logs helpful messages to the browser console:
- "Page loaded, initializing..." - App started
- "Google API initialized successfully" - API ready
- "User signed in" - Authentication successful

## Notes

- A new spreadsheet is created each year
- Browser notifications will alert you when the timer completes
- Today's exercises are displayed in the app for quick reference
- All data is stored in your personal Google Drive
- The app needs both Google Sheets API and Google Drive API enabled
