#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all directories in the current folder
function getDirectories() {
  return fs.readdirSync('.', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !dirent.name.startsWith('.')) // Exclude hidden folders like .git
    .map(dirent => dirent.name)
    .sort();
}

// Check if a directory has an index.html file
function hasIndexFile(dirName) {
  const indexPath = path.join(dirName, 'index.html');
  return fs.existsSync(indexPath);
}

// Generate the HTML content
function generateHTML() {
  const directories = getDirectories();
  
  const projectLinks = directories.map(dir => {
    const hasIndex = hasIndexFile(dir);
    const link = hasIndex ? `${dir}/index.html` : `#`;
    const status = hasIndex ? '' : ' (no index.html)';
    
    return `    <div class="project-card">
      <h3><a href="${link}">${dir}</a></h3>
      <p>Project: ${dir}${status}</p>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sean's Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Sean's Portfolio</h1>
        <p>Welcome to my collection of projects and experiments</p>
    </header>
    
    <main>
        <section class="projects">
            <h2>Projects</h2>
            <div class="project-grid">
${projectLinks}
            </div>
        </section>
    </main>
    
    <footer>
        <p>Last updated: ${new Date().toLocaleDateString()}</p>
    </footer>
</body>
</html>`;
}

// Write the new index.html
function updateIndex() {
  const htmlContent = generateHTML();
  fs.writeFileSync('index.html', htmlContent);
  console.log('✅ index.html updated successfully!');
  console.log(`📁 Found ${getDirectories().length} directories`);
}

// Run the update
updateIndex();