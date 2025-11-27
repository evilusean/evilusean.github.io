// INSTRUCTIONS:
// 1. Copy this file and rename it to config.js
// 2. Fill in your actual Google API credentials below
// 3. This file is in .gitignore so it won't be uploaded to GitHub

const CONFIG = {
    // Get this from Google Cloud Console > Credentials > OAuth 2.0 Client IDs
    CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    
    // Get this from Google Cloud Console > Credentials > API Keys
    API_KEY: 'YOUR_GOOGLE_API_KEY',
    
    // These should stay the same
    DISCOVERY_DOCS: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
};

// Quick checklist:
// ✓ Enabled Google Sheets API in your project
// ✓ Enabled Google Drive API in your project
// ✓ Created OAuth 2.0 Client ID (Web application)
// ✓ Added authorized JavaScript origins (http://localhost:8000 and your GitHub Pages URL)
// ✓ Created and restricted API Key
// ✓ Replaced YOUR_GOOGLE_CLIENT_ID and YOUR_GOOGLE_API_KEY above
// ✓ Saved this file as config.js (not config-template.js)
