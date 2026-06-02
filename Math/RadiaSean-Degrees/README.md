# 🔄 Universal Angle Converter

A modern, interactive single-page web application for converting between different angle measurement units with real-time visualization.

## Features

✨ **Multi-Unit Support**
- Degrees (°)
- Radians (rad)
- Gradians (grad)
- Degrees/Minutes/Seconds (DD MM SS format)

🎯 **Smart Conversion**
- Enter a value in any input field and press **Enter**
- All other units update instantly
- Supports floating-point precision
- No page refresh required

📊 **Dynamic Visualization**
- Canvas-based angle arc rendering
- Real-time visual feedback as you convert
- Clear baseline and angle endpoint
- Filled sector showing the angle area
- Reference circle for context

🎨 **Modern User Interface**
- Responsive grid layout (adapts to mobile)
- Gradient background design
- Focus states and smooth transitions
- Professional styling with accessibility in mind

## How to Use

1. **Enter a Value**: Type a number into any input field
   - Degrees: `45`
   - Radians: `0.7854`
   - Gradians: `50`
   - DMS: `45 30 25.5` (format: DD MM SS.SS)

2. **Press Enter**: Trigger the conversion

3. **Instant Updates**: Watch all other units update automatically

4. **Visualize**: The canvas displays the angle in real-time

## File Structure

```
RadiaSean-Degrees/
├── index.html          # Main HTML structure
├── style.css           # Stylesheet
├── script.js           # Conversion logic and visualization
├── favicon.svg         # Compass icon favicon
└── README.md           # This file
```

## Technical Details

### Conversion Formulas

- **Degrees to Radians**: `radians = degrees × (π / 180)`
- **Radians to Degrees**: `degrees = radians × (180 / π)`
- **Degrees to Gradians**: `gradians = degrees × (10 / 9)`
- **Gradians to Degrees**: `degrees = gradians × (9 / 10)`
- **Decimal to DMS**: `DD + MM/60 + SS/3600`
- **DMS to Decimal**: `degrees + (minutes/60) + (seconds/3600)`

### Browser Compatibility

Works on all modern browsers supporting:
- HTML5 Canvas API
- ES6 JavaScript
- CSS Grid and Flexbox

## Deployment

This is a static website with no backend requirements, making it perfect for GitHub Pages.

### Deploy to GitHub Pages

1. Push to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Access via `https://username.github.io/path/to/RadiaSean-Degrees/`

## Author

Created as an educational tool for angle unit conversion and mathematical visualization.

## License

Free to use and modify for educational purposes.
