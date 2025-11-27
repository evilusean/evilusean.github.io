# Security Guide: What's Safe to Share?

## 🔐 Understanding Google API Credentials

### OAuth 2.0 Client ID
**Example:** `423584880836-ndpsgj51i02q6go7upsiq7kfp1b303sh.apps.googleusercontent.com`

✅ **Safe to be public**
- Designed to be visible in client-side JavaScript
- Not a secret - it identifies your application
- Protected by "Authorized JavaScript Origins" in Google Cloud Console
- Even if someone copies it, they can't use it from their domain (unless you authorize it)

**Why it's safe:**
- Google checks the origin (domain) of requests
- Only domains you've authorized can use this Client ID
- If someone tries to use it from `evil-site.com`, Google blocks it

### API Key
**Example:** `AIzaSyAbc123def456...`

⚠️ **Should be kept private when possible**
- Can be used by anyone who has it
- Should be restricted to specific APIs
- Should be restricted to specific domains/IPs
- Can incur costs if abused (though unlikely with Sheets API)

**Why it should be private:**
- Less protection than OAuth Client ID
- Can be used from any domain unless restricted
- Better to inject at build time via GitHub Secrets

## 🛡️ How We Protect Your Credentials

### Local Development
- `config.js` contains your credentials
- `config.js` is in `.gitignore`
- Never pushed to GitHub
- Only exists on your computer

### GitHub Pages Deployment
- Credentials stored in GitHub Secrets (encrypted)
- GitHub Actions creates `config.js` during build
- `config.js` is generated on GitHub's servers
- Deployed to GitHub Pages
- **Result:** Credentials are in the deployed site, but not in your git history

## 🤔 "But won't people see my credentials in the deployed site?"

**Yes, technically they can:**
- Anyone can view source on your GitHub Pages site
- They'll see your Client ID (that's okay)
- They'll see your API Key (less ideal, but protected by restrictions)

**However, you're protected by:**

1. **Authorized Origins** (Client ID)
   - Only your GitHub Pages URL can use it
   - Copying it to another site won't work

2. **API Key Restrictions** (API Key)
   - Restrict to Google Sheets API + Drive API only
   - Restrict to your GitHub Pages domain
   - Set usage quotas

## 🔧 How to Restrict Your API Key

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Navigate to **Credentials**
3. Click on your API Key
4. Under **Application restrictions**:
   - Select **HTTP referrers (web sites)**
   - Add: `https://[your-username].github.io/*`
   - Add: `http://localhost:*` (for testing)
   - Add: `http://127.0.0.1:*` (for testing)

5. Under **API restrictions**:
   - Select **Restrict key**
   - Check: **Google Sheets API**
   - Check: **Google Drive API**

6. Click **Save**

**Now your API Key:**
- ✅ Only works on your domains
- ✅ Only works with Sheets and Drive APIs
- ✅ Can't be abused for other Google services

## 📊 Risk Assessment

### If someone gets your Client ID:
- **Risk:** Very Low
- **Impact:** They can't use it (blocked by authorized origins)
- **Action:** None needed

### If someone gets your API Key (unrestricted):
- **Risk:** Medium
- **Impact:** Could use your quota, access APIs you enabled
- **Action:** Restrict the key (see above)

### If someone gets your API Key (restricted):
- **Risk:** Low
- **Impact:** Can only use Sheets/Drive API from your domains
- **Action:** Monitor usage in Google Cloud Console

## ✅ Best Practices

1. **Always restrict your API Key** to specific APIs and domains
2. **Use GitHub Secrets** for deployment (we've set this up)
3. **Monitor usage** in Google Cloud Console
4. **Set quotas** to prevent abuse
5. **Rotate keys** if you suspect compromise

## 🚨 If You Accidentally Expose Credentials

### If you pushed API Key to GitHub:

1. **Immediately delete the key** in Google Cloud Console
2. **Create a new API Key** with restrictions
3. **Update GitHub Secrets** with new key
4. **Redeploy** your site

### To remove from git history:
```bash
# Remove sensitive file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config.js" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

## 📝 Summary

**Client ID:** Safe to be public, protected by authorized origins
**API Key:** Should be private, but protected by restrictions

**Our setup:**
- ✅ Credentials not in git repository
- ✅ Credentials injected at build time
- ✅ Protected by GitHub Secrets
- ✅ Recommend restricting API Key to your domains

**You're safe to deploy!** Just make sure to restrict your API Key as shown above.
