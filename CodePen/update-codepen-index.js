#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all directories in the CodePen folder
function getCodePenDirectories() {
  return fs.readdirSync('.', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.name.startsWith('.')) // Exclude hidden folders
    .map(dirent => dirent.name)
    .sort();
}

// Check if a directory has an index.html file
function hasIndexFile(dirName) {
  const indexPath = path.join(dirName, 'index.html');
  return fs.existsSync(indexPath);
}

// Get project description from index.html or create default
function getProjectDescription(dirName) {
  const indexPath = path.join(dirName, 'index.html');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const titleMatch = content.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      return titleMatch[1];
    }
  }
  return `${dirName} - CodePen Project`;
}

// Get project type based on files
function getProjectType(dirName) {
  const indexPath = path.join(dirName, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return 'folder';
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Check for specific project types
  if (content.includes('three.js') || content.includes('THREE')) {
    return 'threejs';
  } else if (content.includes('react') || content.includes('React')) {
    return 'react';
  } else if (content.includes('vue') || content.includes('Vue')) {
    return 'vue';
  } else if (content.includes('animation') || content.includes('Animation')) {
    return 'animation';
  } else if (content.includes('css') || content.includes('CSS')) {
    return 'css';
  } else if (content.includes('javascript') || content.includes('JavaScript')) {
    return 'javascript';
  } else {
    return 'web';
  }
}

// Get icon based on project type
function getProjectIcon(projectType) {
  const iconMap = {
    'threejs': 'bx-cube',
    'react': 'bxl-react',
    'vue': 'bxl-vuejs',
    'animation': 'bx-movie',
    'css': 'bxl-css3',
    'javascript': 'bxl-javascript',
    'web': 'bx-globe',
    'folder': 'bx-folder'
  };
  return iconMap[projectType] || 'bx-globe';
}

// Generate the HTML content
function generateCodePenHTML() {
  const directories = getCodePenDirectories();
  
  const projectLinks = directories.map(dir => {
    const hasIndex = hasIndexFile(dir);
    const link = hasIndex ? `${dir}/index.html` : '#';
    const status = hasIndex ? '' : ' (no index.html)';
    const description = getProjectDescription(dir);
    const projectType = getProjectType(dir);
    const icon = getProjectIcon(projectType);
    
    return `                <div class="project-card">
                    <div class="project-info">
                        <i class="bx ${icon}"></i>
                        <h3><a href="${link}">${dir}</a></h3>
                        <p>${description}${status}</p>
                        ${hasIndex ? `<div class="btn"><a href="${link}" target="_blank">View Project</a></div>` : '<div class="btn disabled">No Index</div>'}
                    </div>
                </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodePen Projects - Sean's Portfolio</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="../favicon.ico" type="image/x-icon">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="glow-text" data-text="CodePen Projects">CodePen Projects</div>
        <p>Collection of interactive demos and experiments from CodePen</p>
    </header>
    
    <main>
        <section class="projects">
            <h2 class="heading">CodePen Projects</h2>
            <div class="project-grid">
${projectLinks}
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <div class="social">
            <a href="https://github.com/evilusean" target="_blank"><i class="bx bxl-github"></i></a>
            <a href="https://www.linkedin.com/in/evilusean/" target="_blank"><i class="bx bxl-linkedin-square"></i></a>
        </div>
        <p class="copyright">Last updated: ${new Date().toLocaleDateString()} | © Sean Teams | All Rights Reserved</p>
    </footer>

    <!-- SVG Filter for Glow Effect -->
    <svg class="filters" width='1440px' height='300px' viewBox='0 0 1440 300' xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="red-glow" color-interpolation-filters="sRGB" x="-50%" y="-200%" width="200%" height="500%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur4"/>
                <feGaussianBlur in="SourceGraphic" stdDeviation="19" result="blur19"/>
                <feColorMatrix in="blur4" result="color-0-blur" type="matrix" values="1 0 0 0 0
                          0 0.02 0 0 0
                          0 0 0.04 0 0
                          0 0 0 0.8 0"/>
                <feOffset in="color-0-blur" result="layer-0-offsetted" dx="0" dy="0"/>
                <feColorMatrix in="blur19" result="color-1-blur" type="matrix" values="0.96 0 0 0 0
                          0 0.04 0 0 0
                          0 0 0.07 0 0
                          0 0 0 1 0"/>
                <feOffset in="color-1-blur" result="layer-1-offsetted" dx="0" dy="2"/>
                <feMerge>
                    <feMergeNode in="layer-0-offsetted"/>
                    <feMergeNode in="layer-1-offsetted"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
</body>
</html>`;
}

// Write the new index.html
function updateCodePenIndex() {
  const htmlContent = generateCodePenHTML();
  fs.writeFileSync('index.html', htmlContent);
  console.log('✅ CodePen index.html updated successfully!');
  console.log(`📁 Found ${getCodePenDirectories().length} CodePen projects`);
}

// Run the update
updateCodePenIndex();
