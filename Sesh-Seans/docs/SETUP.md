# Quick Setup Guide

## Step 1: Create config.js (Already Done!)
The file `config.js` has been created for you. Now edit it with your credentials.

## Step 2: Add Your Credentials

Open `config.js` and replace:
- `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
- `YOUR_GOOGLE_API_KEY` with your actual API Key

## Step 3: Test Locally

```bash
# Start a local server
python -m http.server 8000

# Or with Node.js
npx http-server -p 8000
```

Visit: http://localhost:8000

## Step 4: Verify Setup

When you open the app, you should see:
- ✅ "Sign in with Google" button (blue, enabled)
- ❌ NOT "Configure Credentials First" (red, disabled)
- ❌ NOT "Missing config.js" error

## Common Issues

### "Missing config.js" error
- Make sure `config.js` exists in the same folder as `index.html`
- Check that you copied from `config-template.js`

### "Configure Credentials First" error
- You still have placeholder values in `config.js`
- Replace `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_API_KEY` with real values

### Sign-in popup closes immediately
- Check authorized origins in Google Cloud Console
- Add `http://localhost:8000` to authorized JavaScript origins

## Your Credentials Are Safe

- `config.js` is in `.gitignore`
- It will NOT be uploaded to GitHub
- Only `config-template.js` (without credentials) is tracked in git

## Next Steps

Once sign-in works locally, you can:
1. Use the app locally (easiest)
2. Deploy to a hosting service that supports environment variables
3. Set up a build process to inject credentials at deploy time
