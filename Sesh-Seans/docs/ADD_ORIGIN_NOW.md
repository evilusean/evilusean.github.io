# ⚠️ ACTION REQUIRED: Add Origin to Google Cloud Console

## Your Error:
```
Not a valid origin for the client: http://127.0.0.1:5500
```

## What This Means:
Google is blocking your app because `http://127.0.0.1:5500` is not authorized.

## Fix It Now (5 minutes):

### Step 1: Open Google Cloud Console
Click this link: https://console.cloud.google.com/apis/credentials

### Step 2: Find Your OAuth Client
Look for: `423584880836-ndpsgj51i02q6go7upsiq7kfp1b303sh.apps.googleusercontent.com`

Click the **pencil icon** (✏️) to edit it.

### Step 3: Add Authorized JavaScript Origins
Scroll down to **"Authorized JavaScript origins"**

Click **"+ ADD URI"**

Add these EXACT URLs (one at a time):
```
http://127.0.0.1:5500
http://localhost:5500
http://127.0.0.1:8000
http://localhost:8000
```

### Step 4: Save
Click the **SAVE** button at the bottom.

### Step 5: Wait
- Wait **2-3 minutes** for Google to update
- Clear your browser cache (Ctrl+Shift+Delete)
- Refresh your page

### Step 6: Test
Refresh your app and try signing in again.

## ⏰ How Long to Wait?
- **Minimum:** 1-2 minutes
- **Typical:** 2-5 minutes
- **Maximum:** Up to 10 minutes in rare cases

## ✅ Success Looks Like:
Console will show:
```
Page loaded, initializing...
Google API initialized successfully
```

Button will be blue and say "Sign in with Google"

## ❌ Still Not Working After 10 Minutes?

1. **Double-check you saved** - Go back to Google Cloud Console and verify the origins are there
2. **Check the exact URL** - Make sure it's `http://127.0.0.1:5500` (not https, not different port)
3. **Try incognito mode** - Sometimes browser cache causes issues
4. **Check you edited the right Client ID** - Verify the Client ID matches the one in your config.js

## 🎯 Quick Checklist:
- [ ] Opened https://console.cloud.google.com/apis/credentials
- [ ] Found OAuth 2.0 Client ID
- [ ] Clicked edit (pencil icon)
- [ ] Added `http://127.0.0.1:5500` to Authorized JavaScript origins
- [ ] Clicked SAVE
- [ ] Waited 2-3 minutes
- [ ] Cleared browser cache
- [ ] Refreshed the page

## Screenshot of What to Look For:

Your OAuth client settings should have a section like:

```
Authorized JavaScript origins
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URIs                                    [Delete]
http://127.0.0.1:5500                   [🗑️]
http://localhost:5500                   [🗑️]
http://127.0.0.1:8000                   [🗑️]
http://localhost:8000                   [🗑️]

[+ ADD URI]
```

## No, You Can't Skip This Step!
The error won't go away by waiting. You MUST add the origin in Google Cloud Console.
