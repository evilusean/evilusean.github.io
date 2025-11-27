# Setup Checklist ✓

## 1️⃣ Google Cloud Console Setup

### Enable APIs
- [ ] Go to https://console.developers.google.com/
- [ ] Enable **Google Sheets API**
- [ ] Enable **Google Drive API**

### Create OAuth 2.0 Client ID
- [ ] Go to **Credentials** → **Create Credentials** → **OAuth client ID**
- [ ] Application type: **Web application**
- [ ] Name it something like "Workout Tracker"

### Add Authorized JavaScript Origins
Add ALL of these:
- [ ] `http://localhost:5500` (VS Code Live Server)
- [ ] `http://127.0.0.1:5500` (VS Code Live Server IP)
- [ ] `http://localhost:8000` (Python server)
- [ ] `http://127.0.0.1:8000` (Python server IP)
- [ ] `https://[your-username].github.io` (GitHub Pages - if deploying)

### Create API Key
- [ ] Go to **Credentials** → **Create Credentials** → **API Key**
- [ ] (Optional) Restrict to Google Sheets API and Google Drive API

### Copy Your Credentials
- [ ] Copy your **Client ID** (ends with `.apps.googleusercontent.com`)
- [ ] Copy your **API Key** (starts with `AIza`)

---

## 2️⃣ Local Setup

### Create config.js
- [ ] File `config.js` exists (should already be created)
- [ ] Open `config.js` in your editor

### Add Your Credentials
- [ ] Replace `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` with your actual Client ID
- [ ] Replace `YOUR_GOOGLE_API_KEY` with your actual API Key
- [ ] Save the file

### Test Locally
- [ ] Run: `python -m http.server 8000` (or use VS Code Live Server)
- [ ] Open browser to the local URL
- [ ] Check console: Should see "Google API initialized successfully"
- [ ] Click "Sign in with Google"
- [ ] Sign-in popup should open
- [ ] Grant permissions
- [ ] Should see "Logged in as: [Your Name]"
- [ ] App content should appear (timer, exercise form)

---

## 3️⃣ GitHub Pages Deployment (Optional)

### Add GitHub Secrets
- [ ] Go to your repo → **Settings** → **Secrets and variables** → **Actions**
- [ ] Click **New repository secret**
- [ ] Add secret: Name = `GOOGLE_CLIENT_ID`, Value = your Client ID
- [ ] Add secret: Name = `GOOGLE_API_KEY`, Value = your API Key

### Enable GitHub Pages
- [ ] Go to **Settings** → **Pages**
- [ ] Source: Select **GitHub Actions**
- [ ] Save

### Push Your Code
- [ ] `git add .`
- [ ] `git commit -m "Deploy workout tracker"`
- [ ] `git push origin main`

### Verify Deployment
- [ ] Go to **Actions** tab
- [ ] Watch the workflow run (should turn green ✓)
- [ ] Visit your GitHub Pages URL
- [ ] Test sign-in on the live site

---

## 🎯 Success Indicators

### Local Testing Success:
✅ Console shows: "Google API initialized successfully"
✅ Console shows: "User signed in"
✅ Button shows: "Sign Out"
✅ See: "Logged in as: [Your Name]"
✅ Timer and exercise form are visible

### Common Issues:
❌ "Not a valid origin" → Add your URL to authorized origins
❌ "Missing config.js" → Create config.js from template
❌ "Configure Credentials First" → Add real credentials to config.js
❌ "idpiframe_initialization_failed" → Check authorized origins

---

## 📚 Help Files

- **FIX_ORIGIN_ERROR.md** - Fix "Not a valid origin" errors
- **SETUP.md** - Detailed local setup guide
- **GITHUB_PAGES_SETUP.md** - Deployment guide
- **QUICK_START.md** - Fast overview

---

## 🔒 Security Check

✅ `config.js` is in `.gitignore`
✅ `config.js` is NOT pushed to GitHub
✅ Only `config-template.js` (without credentials) is in git
✅ GitHub Secrets are encrypted
✅ Credentials are never visible in code or logs
