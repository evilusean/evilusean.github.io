# Quick GitHub Pages Deployment Fix

Your GitHub Pages site is showing "config.js file is missing!" because the config file with credentials isn't committed to the repo (for security).

## Fix in 3 Steps:

### 1. Add GitHub Secrets

Go to your repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these two secrets:

**Secret 1:**
- Name: `GOOGLE_CLIENT_ID`
- Value: Your Client ID from Google Cloud Console

**Secret 2:**
- Name: `GOOGLE_API_KEY`
- Value: Your API Key from Google Cloud Console

### 2. Enable GitHub Pages with Actions

Go to: **Settings** → **Pages**
- Source: Select **GitHub Actions**
- Save

### 3. Push the Workflow File

The workflow file `.github/workflows/deploy.yml` has been created. Commit and push it:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push origin main
```

## What Happens Next

1. GitHub Actions will automatically run
2. It creates `config.js` using your secrets
3. Deploys everything to GitHub Pages
4. Your site will work at: `https://evilusean.github.io/Sesh-Seans`

## Check Progress

- Go to **Actions** tab in your repo
- Watch the "Deploy to GitHub Pages" workflow
- Once complete (green checkmark), visit your site

## Important: Update Google Cloud Console

Add your GitHub Pages URL to authorized origins:

1. [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - `https://evilusean.github.io`
5. Save

## Verify It Works

After deployment completes:
1. Visit `https://evilusean.github.io/Sesh-Seans`
2. Click "Sign in with Google"
3. Should work without errors!

---

**Need more details?** See [docs/GITHUB_PAGES_SETUP.md](docs/GITHUB_PAGES_SETUP.md)
