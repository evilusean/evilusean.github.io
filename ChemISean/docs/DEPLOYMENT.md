# Deployment Guide

## GitHub Pages Deployment

This static website is ready to deploy to GitHub Pages instantly. Follow these steps:

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository (e.g., `periodic-tables`)
4. Choose "Public" visibility
5. Click "Create repository"

### Step 2: Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Dual periodic tables"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/yourusername/periodic-tables.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click "Save"

### Step 4: Access Your Site

After a few minutes, your site will be live at:
```
https://yourusername.github.io/periodic-tables/
```

GitHub will show you the URL in the Pages settings.

## Alternative Deployment Options

### Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Drag and drop your project folder
3. Your site is live instantly!

### Vercel

1. Go to [Vercel](https://vercel.com/)
2. Import your GitHub repository
3. Deploy with one click

### Local Testing

Before deploying, test locally:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server installed)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Custom Domain (Optional)

### GitHub Pages with Custom Domain

1. Buy a domain from any registrar (Namecheap, GoDaddy, etc.)
2. In your repository, create a file named `CNAME` with your domain:
   ```
   yourdomain.com
   ```
3. In your domain registrar's DNS settings, add:
   - Type: `A` Record
   - Host: `@`
   - Value: GitHub Pages IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Or Type: `CNAME`
   - Host: `www`
   - Value: `yourusername.github.io`

4. Wait for DNS propagation (can take up to 48 hours)

## Performance Optimization

The site is already optimized, but for even better performance:

1. **Minify CSS/JS** (optional):
   ```bash
   # Install minifiers
   npm install -g clean-css-cli uglify-js
   
   # Minify CSS
   cleancss -o styles.min.css styles.css
   
   # Minify JS
   uglifyjs script.js -o script.min.js
   
   # Update index.html to use minified versions
   ```

2. **Enable Caching**: GitHub Pages automatically handles this

3. **CDN**: GitHub Pages uses a CDN automatically

## Troubleshooting

### Site Not Loading
- Wait 5-10 minutes after enabling Pages
- Check that index.html is in the root directory
- Verify branch and folder settings in Pages configuration

### 404 Errors
- Ensure all file paths are relative (no leading `/`)
- Check file names match exactly (case-sensitive)

### Elements Not Showing
- Open browser console (F12) to check for errors
- Verify elements.json is loading correctly
- Check that fetch API is working (requires HTTPS or localhost)

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear cache and reload

## Updates and Maintenance

To update your site:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes within a few minutes.

## Security Notes

- This is a static site with no backend, so security concerns are minimal
- All data is client-side only
- No user data is collected or stored
- No cookies are used (except localStorage for theme preference)

## Browser Compatibility Testing

Test your deployed site on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

Use tools like:
- [BrowserStack](https://www.browserstack.com/)
- [LambdaTest](https://www.lambdatest.com/)
- Chrome DevTools Device Mode (F12 → Toggle Device Toolbar)

---

**Your site is now live and accessible to the world!** 🎉
