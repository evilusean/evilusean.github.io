# Project Detection System

The portfolio auto-update system now intelligently detects different types of projects and displays them appropriately.

## Supported Project Types

### 🌐 Web Projects (HTML/CSS/JS)
- **Detection**: `index.html` file in root directory
- **Icon**: `bx-globe`
- **Link**: Direct link to `index.html`
- **Example**: CV, GlowText, MatrixRain

### ⚛️ React/Next.js Projects
- **Detection**: `package.json` + `src/app/page.tsx` (Next.js) or `src/index.tsx` (React)
- **Icon**: `bxl-react`
- **Link**: GitHub repository link
- **Status**: "(Next.js - see GitHub)" or "(React - see GitHub)"
- **Example**: shad-sea-n

### 📦 Node.js Projects
- **Detection**: `package.json` + `index.js`/`app.js` or generic Node.js project
- **Icon**: `bxl-nodejs`
- **Link**: GitHub repository link
- **Status**: "(Node.js - see GitHub)"

### 📁 GitHub Projects
- **Detection**: `README.md` file (fallback for documented projects)
- **Icon**: `bxl-github`
- **Link**: GitHub repository link
- **Status**: "(see GitHub)"

### 📂 Empty Folders
- **Detection**: No recognizable entry points
- **Icon**: `bx-folder`
- **Link**: Disabled (#)
- **Status**: "(no index.html)"

## Auto-Update Features

### Main Portfolio (`update-index.sh`)
- Scans all directories in root
- Detects project types automatically
- Updates main `index.html` with appropriate icons and links
- Runs automatically on git push via GitHub Actions

### 3ThreeJS Portfolio (`3ThreeJS/update-threejs-index.sh`)
- Specialized for Three.js projects
- Custom descriptions and icons for each project
- Handles subdirectory structures (like RapierPhysicSean/CenterGravityOrbs/)
- Also detects React/Node.js projects within 3ThreeJS directory

### Languages Portfolio (`Languages/update-languages-index.sh`)
- Updates both Japanese and Slovak language learning app indexes
- Preserves original flag/coat of arms styling
- Maintains card-based layout with semi-transparent styling
- Custom project naming conventions (e.g., "Japanese Numbers TranslaSean")
- Automatically detects new language learning projects

## Adding New Projects

1. **HTML Projects**: Just add an `index.html` file
2. **React Projects**: Ensure `package.json` and `src/app/page.tsx` or `src/index.tsx` exist
3. **Node.js Projects**: Include `package.json` and main entry file
4. **Any Project**: Add a `README.md` for basic GitHub linking

The system will automatically detect and categorize your project on the next update!

## Hiding Projects

You can hide projects from appearing in the portfolio by adding a `#hidden` comment at the top of their `index.html` file:

```html
<!-- #hidden -->
<!DOCTYPE html>
<html>
...
```

**Hidden Projects:**
- Projects with `<!-- #hidden -->` comment are automatically skipped
- Also works in subdirectories (3ThreeJS, Languages/Japanese, Languages/Slovak)
- Projects without `index.html` can be hidden by adding them to the `hidden_projects` array in the script 'update-index.js'

**Currently Hidden:**
- Coursera-HTML-CSS-JS
- VaxxieATaxxie  
- PythonLiveChatApp
- SEAnSharp

## Manual Updates

```bash
# Update main portfolio
./update-index.sh

# Update 3ThreeJS portfolio
cd 3ThreeJS && ./update-threejs-index.sh

# Update Languages portfolios
cd Languages && ./update-languages-index.sh

# Update specific language
cd Languages/Japanese && ./update-japanese-index.sh
cd Languages/Slovak && ./update-slovak-index.sh

# Update everything (main script calls all sub-updates automatically)
./update-index.sh
```