# GitHub Pages Deployment Guide

This guide shows you how to deploy the workout tracker to GitHub Pages with your credentials safely stored in GitHub Secrets.

## How It Works

1. You store your credentials as GitHub Secrets (encrypted, never visible in code)
2. GitHub Actions automatically creates `config.js` during deployment
3. Your credentials are injected at build time, not stored in the repo
4. The deployed site works with your real credentials

## Setup Steps

### Step 1: Add Your Credentials to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add these two secrets:

**Secret 1:**
- Name: `GOOGLE_CLIENT_ID`
- Value: Your actual Client ID (e.g., `123456789-abc.apps.googleusercontent.com`)
- Note: Client ID is technically safe to be public, but using secrets is cleaner

**Secret 2:**
- Name: `GOOGLE_API_KEY`
- Value: Your actual API Key (e.g., `AIzaSyAbc123...`)
- ⚠️ **Important:** API Key should NOT be in public code - use secrets!

### Step 2: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### Step 3: Update Google Cloud Console

Add your GitHub Pages URL to authorized origins:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - `https://[your-username].github.io`
5. Click **Save**

### Step 4: Deploy

Push your code to GitHub:

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

The GitHub Action will automatically:
1. Create `config.js` with your secrets
2. Deploy to GitHub Pages
3. Your app will be live at `https://[your-username].github.io/[repo-name]`

### Step 5: Verify Deployment

1. Go to the **Actions** tab in your repo
2. Watch the deployment workflow run
3. Once complete, visit your GitHub Pages URL
4. Try signing in with Google

## Checking Deployment Status

- **Actions tab**: See if the workflow succeeded
- **Settings → Pages**: See your live URL
- **Console logs**: Check browser console for any errors

## Security Notes

✅ **Safe:**
- Secrets are encrypted by GitHub
- Only visible during workflow execution
- Never appear in logs or code

✅ **Your credentials are:**
- NOT in your git history
- NOT visible in the deployed source code (they're in a generated file)
- Only accessible to your GitHub Actions

## Troubleshooting

### Workflow fails with "Secret not found"
- Make sure you named the secrets exactly: `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`
- Check they're in **Repository secrets**, not Environment secrets

### Sign-in fails on GitHub Pages
- Verify you added your GitHub Pages URL to authorized origins in Google Cloud Console
- Check browser console for specific error messages
- Make sure both APIs (Sheets + Drive) are enabled

### "idpiframe_initialization_failed" error
- Your GitHub Pages URL isn't in authorized JavaScript origins
- Add `https://[your-username].github.io` to Google Cloud Console

## Alternative: Use a Separate Deploy Branch

If you prefer not to use GitHub Actions:

1. Create a `gh-pages` branch
2. Add `config.js` with real credentials to that branch only
3. Deploy from `gh-pages` branch
4. Keep `main` branch without credentials

```bash
git checkout -b gh-pages
# Edit config.js with real credentials
git add config.js
git commit -m "Add config for deployment"
git push origin gh-pages

# In GitHub Settings → Pages, select gh-pages branch
```

## Testing Before Deployment

Always test locally first:

```bash
# Edit config.js with your credentials
python -m http.server 8000
# Visit http://localhost:8000
# Test sign-in works
```

Once local testing works, deploy to GitHub Pages!
