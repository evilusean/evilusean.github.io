# Quick Start Guide

## 🚀 Get Started in 30 Seconds

### Option 1: Open Locally (Fastest)

1. **Download** all files to a folder
2. **Open** `index.html` in your browser
   - Double-click the file, or
   - Right-click → Open with → Your browser

That's it! The site works completely offline.

### Option 2: Run with a Server (Recommended)

```bash
# Navigate to the project folder
cd path/to/periodic-tables

# Start a server (choose one):
python3 -m http.server 8000
# OR
python -m SimpleHTTPServer 8000
# OR
npx http-server -p 8000

# Open in browser:
# http://localhost:8000
```

## 📱 Features Overview

### Classic View (Default)
- Standard periodic table layout
- 118 elements with full details
- Color-coded by category
- Click any element for more info

### Russell Spiral View
- Walter Russell's 1926-1953 design
- 9 octaves in spiral pattern
- Musical wave layout
- Noble gases at peaks

### Element Modal
Click any element to see:
- ✅ Atomic properties
- ✅ Discovery information
- ✅ Electron configuration
- ✅ Russell classification
- ✅ Wikipedia link

### Theme Toggle
- 🌙 Dark mode (default)
- ☀️ Light mode
- Saves your preference

## 🎯 Navigation

- **Classic View** button → Standard periodic table
- **Russell Spiral** button → Walter Russell's design
- **Theme toggle** (☀️/🌙) → Switch dark/light mode
- **Click any element** → Open detailed modal
- **ESC key** → Close modal

## 📂 Project Structure

```
periodic-tables/
├── index.html          # Main page
├── styles.css          # All styling
├── script.js           # All functionality
├── elements.json       # 118 elements data
├── README.md          # Full documentation
├── DEPLOYMENT.md      # Deploy to web
└── QUICKSTART.md      # This file
```

## 🔧 Customization

### Change Colors

Edit `styles.css` → `:root` section:

```css
:root {
    --accent: #6366f1;        /* Main accent color */
    --bg-primary: #0a0e27;    /* Background */
    /* ... more variables ... */
}
```

### Add More Element Data

Edit `elements.json` and add properties:

```json
{
    "number": 1,
    "symbol": "H",
    "name": "Hydrogen",
    "your_custom_field": "your value"
}
```

Then update `script.js` to display it in the modal.

### Modify Russell Spiral

Edit `script.js` → `calculateSpiralPosition()` function to adjust:
- Spiral radius
- Element spacing
- Angle calculations
- Octave positioning

## 🌐 Deploy to Web

### GitHub Pages (Free)

```bash
# 1. Create repo on GitHub
# 2. Push code
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/repo.git
git push -u origin main

# 3. Enable Pages in repo Settings → Pages
# 4. Your site is live at:
#    https://yourusername.github.io/repo/
```

See `DEPLOYMENT.md` for detailed instructions.

## 🐛 Troubleshooting

### Elements not showing?
- Check browser console (F12)
- Verify `elements.json` is in same folder
- Try running with a server instead of opening directly

### Modal not opening?
- Check JavaScript console for errors
- Ensure `script.js` is loading
- Try hard refresh (Ctrl+Shift+R)

### Styling looks broken?
- Verify `styles.css` is in same folder
- Check browser console for 404 errors
- Clear browser cache

### Theme not saving?
- Check if localStorage is enabled in browser
- Try in a different browser
- Check browser privacy settings

## 💡 Tips

1. **Mobile**: Works great on phones and tablets
2. **Offline**: No internet needed after first load
3. **Fast**: Pure vanilla JS, no frameworks
4. **Accessible**: Keyboard navigation supported
5. **Print**: Use browser print for reference sheets

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Walter Russell**: Search "Walter Russell periodic table"
- **Element Data**: Visit linked Wikipedia articles

## 🎨 Screenshots

### Classic View
Standard periodic table with all 118 elements, color-coded by category.

### Russell Spiral View
Revolutionary spiral design showing elements in 9 octaves with musical wave patterns.

### Element Modal
Detailed information including Russell-specific classification.

---

**Enjoy exploring the elements!** 🧪✨

Questions? Check the full README.md or open an issue on GitHub.
