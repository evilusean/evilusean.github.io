# ✍️ Handwriting Animator

A fully static web app that converts text into animated cursive handwriting. Perfect for learning cursive letters, creating handwritten-style graphics, or just having fun with typography.

## 🌟 Features

- **Animated Handwriting**: Watch text being written stroke-by-stroke in beautiful cursive
- **Multiple Fonts**: Choose between Satisfy and Pacifico cursive fonts
- **Customization**: Adjust color and size (24-80px)
- **Multi-line Support**: Type multiple lines and watch them animate sequentially
- **Export Options**: Download as PNG or SVG
- **Share URLs**: Generate shareable links with your custom settings
- **Fully Responsive**: Works great on desktop, tablet, and mobile
- **No Backend Required**: Runs entirely in the browser
- **Privacy-Safe**: No data sent to servers, no tracking

## 🚀 Live Demo

[View Demo](https://yourusername.github.io/handwriting-animator) *(Update with your GitHub Pages URL)*

## 📖 How to Use

1. **Type your text** in the text box (supports multiple lines)
2. **Click "Generate Handwriting"** to see the animation
3. **Customize** your handwriting:
   - Choose between Satisfy or Pacifico fonts
   - Pick your text color
   - Adjust text size with the slider
4. **Download** your creation as PNG or SVG
5. **Share** your settings via URL

## 🛠️ Technologies Used

- **HTML5/CSS3/JavaScript** - Core web technologies
- **Vara.js** - Handwriting animation library
- **Google Fonts** - Dancing Script for UI
- **Canvas API** - PNG export functionality
- **SVG** - Vector graphics and export

## 📦 Installation

### GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Select "main" branch as source
4. Your app will be live at `https://yourusername.github.io/handwriting-animator`

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/handwriting-animator.git
cd handwriting-animator
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

That's it! No build process or dependencies needed.

## 📁 Project Structure

```
handwriting-animator/
├── index.html          # Main HTML file
├── style.css           # All styles and responsive design
├── script.js           # Application logic and animations
└── README.md           # This file
```

## 🔗 URL Parameters

Share custom configurations using URL parameters:

```
?text=hello%20world&font=Satisfy&color=dc2626&size=48
```

**Parameters:**
- `text` - The text to display (URL encoded)
- `font` - Font choice (`Satisfy` or `Pacifico`)
- `color` - Hex color without # (e.g., `dc2626`)
- `size` - Font size in pixels (24-80)

**Example:**
```
https://yourusername.github.io/handwriting-animator/?text=Learn%20Cursive&font=Pacifico&color=0000ff&size=60
```

## 🎨 Customization

### Adding New Fonts

To add more Vara.js fonts, update the `fonts` object in `script.js`:

```javascript
const fonts = {
    'Pacifico': 'https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Pacifico/PacificoSLO.json',
    'Satisfy': 'https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json',
    'YourFont': 'path/to/your/font.json'
};
```

Then add the option to the select element in `index.html`.

### Changing Color Scheme

The app uses a black and red theme. To change colors, update these CSS variables in `style.css`:

- Background: `#0a0a0a` to `#1a1a1a`
- Accent color: `#dc2626` (red)
- Text color: `#e0e0e0` (light gray)

## ⚠️ Important Note

This app is **not "high fidelity" cursive handwriting**. True cursive is written in one continuous stroke per word without lifting the pen. This tool uses digital fonts that approximate cursive style but render letters individually.

For learning proper cursive technique, check out:
- [IAMPETH - International Association of Master Penmen](https://www.iampeth.com/)
- [YouTube Cursive Tutorials](https://www.youtube.com/results?search_query=cursive+handwriting+tutorial)

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Credits

- **Vara.js** - Handwriting animation library by [Akzhy](https://github.com/akzhy/Vara)
- **Google Fonts** - Dancing Script font
- Inspired by the need to preserve cursive handwriting skills

## 📧 Contact

Have questions or suggestions? Open an issue or reach out!

---

Made with ❤️ for keeping cursive alive
