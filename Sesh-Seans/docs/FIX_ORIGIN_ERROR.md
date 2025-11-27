# Fix "Not a valid origin" Error

## The Error
```
Not a valid origin for the client: http://127.0.0.1:5500 has not been registered
```

## Quick Fix

### Step 1: Go to Google Cloud Console
Visit: https://console.developers.google.com/

### Step 2: Navigate to Credentials
1. Select your project
2. Click **APIs & Services** → **Credentials** (left sidebar)

### Step 3: Edit OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID: `423584880836-ndpsgj51i02q6go7upsiq7kfp1b303sh.apps.googleusercontent.com`
2. Click the **pencil icon** (edit) next to it

### Step 4: Add Authorized JavaScript Origins
Under **Authorized JavaScript origins**, click **+ ADD URI** and add:

```
http://127.0.0.1:5500
```

**Also add these common development URLs:**
```
http://localhost:5500
http://localhost:8000
http://127.0.0.1:8000
```

### Step 5: Save
Click **SAVE** at the bottom

### Step 6: Wait & Refresh
- Wait 1-2 minutes for changes to propagate
- Refresh your browser page
- Try signing in again

## Common Development Ports

Add all of these to avoid future issues:

| URL | Used By |
|-----|---------|
| `http://localhost:5500` | VS Code Live Server |
| `http://127.0.0.1:5500` | VS Code Live Server (IP) |
| `http://localhost:8000` | Python http.server |
| `http://127.0.0.1:8000` | Python http.server (IP) |
| `http://localhost:3000` | React/Node dev servers |

## For Production

When deploying to GitHub Pages, also add:
```
https://[your-username].github.io
```

## Screenshot Guide

Your OAuth client settings should look like:

```
Authorized JavaScript origins
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
http://localhost:5500
http://127.0.0.1:5500
http://localhost:8000
http://127.0.0.1:8000
https://[your-username].github.io
```

## Still Not Working?

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Try incognito mode**
3. **Wait 5 minutes** - Google can take time to update
4. **Check you saved** - Make sure you clicked SAVE in Google Console
5. **Verify Client ID** - Make sure the Client ID in the error matches the one you edited

## Success!

Once added, you should see:
- ✅ "Google API initialized successfully" in console
- ✅ Blue "Sign in with Google" button
- ✅ Sign-in popup opens when clicked
