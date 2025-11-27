# Quick Start Guide

## 🏠 Local Development (Test First!)

1. **Edit config.js** with your credentials:
   ```javascript
   CLIENT_ID: 'your-actual-id.apps.googleusercontent.com'
   API_KEY: 'your-actual-key'
   ```

2. **Start local server:**
   ```bash
   python -m http.server 8000
   ```

3. **Test at:** http://localhost:8000

4. **Verify sign-in works** before deploying

---

## 🚀 Deploy to GitHub Pages

### One-Time Setup:

1. **Add GitHub Secrets:**
   - Go to: `Settings` → `Secrets and variables` → `Actions`
   - Add secret: `GOOGLE_CLIENT_ID` = your Client ID
   - Add secret: `GOOGLE_API_KEY` = your API Key

2. **Enable GitHub Pages:**
   - Go to: `Settings` → `Pages`
   - Source: `GitHub Actions`

3. **Update Google Cloud Console:**
   - Add to authorized origins: `https://[username].github.io`

### Deploy:

```bash
git add .
git commit -m "Deploy workout tracker"
git push origin main
```

✅ GitHub Actions automatically creates config.js with your secrets
✅ Deploys to: `https://[username].github.io/[repo-name]`

---

## 📋 Checklist

**Google Cloud Console:**
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled  
- [ ] OAuth 2.0 Client ID created
- [ ] Authorized origins include:
  - [ ] `http://localhost:8000` (for testing)
  - [ ] `https://[username].github.io` (for production)
- [ ] API Key created

**GitHub:**
- [ ] Repository created
- [ ] Secrets added: `GOOGLE_CLIENT_ID` and `GOOGLE_API_KEY`
- [ ] GitHub Pages enabled with "GitHub Actions" source

**Local:**
- [ ] config.js created with real credentials
- [ ] Tested locally and sign-in works

---

## 🔒 Security

✅ **config.js** is in .gitignore (not uploaded to GitHub)
✅ **Secrets** are encrypted by GitHub
✅ **Credentials** are injected at build time, not stored in code

---

## 🆘 Need Help?

- **Local testing issues:** See [SETUP.md](SETUP.md)
- **GitHub Pages deployment:** See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)
- **Sign-in problems:** See [FIX_ORIGIN_ERROR.md](FIX_ORIGIN_ERROR.md)
