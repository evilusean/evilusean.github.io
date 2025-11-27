# Check API Key Configuration

Your OAuth origins look correct! The issue might be with your API Key restrictions.

## Check Your API Key:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your **API Key** (not OAuth client)
3. Click on it to edit

## API Key Should Have:

### Application Restrictions:
**Option 1: None (Easiest for testing)**
- Select "None"
- This allows the key to work from any origin

**Option 2: HTTP referrers (More secure)**
- Select "HTTP referrers (web sites)"
- Add these referrers:
  ```
  http://localhost:8000/*
  http://127.0.0.1:5500/*
  http://localhost:5500/*
  https://evilusean.github.io/*
  ```

### API Restrictions:
- Select "Restrict key"
- Make sure these are checked:
  - ✅ Google Sheets API
  - ✅ Google Drive API

## If Your API Key is Restricted to IP Addresses:
This won't work for browser apps! Change to "None" or "HTTP referrers"

## Test Without Restrictions:
1. Temporarily set API Key to "None" (no restrictions)
2. Save
3. Wait 2 minutes
4. Try your app again
5. If it works, the issue was API Key restrictions

## Common API Key Issues:
- ❌ Restricted to wrong referrers
- ❌ Restricted to IP addresses (doesn't work for browser apps)
- ❌ Not enabled for Sheets/Drive APIs
- ❌ Using wrong API key in config.js

## Quick Test:
Set your API Key to "None" (no restrictions) temporarily to see if that's the issue.
