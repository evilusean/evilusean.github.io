#!/bin/bash
#Future Sean : 'chmod +x update-index.sh' to make this script executable
# './update-index.sh'

# Get current date
current_date=$(date +"%B %d, %Y")

# Start building the HTML
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sean's Portfolio Hub</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="glow-text" data-text="Sean's Portfolio Hub">Sean's Portfolio Hub</div>
        <p>Welcome to my collection of projects and experiments</p>
    </header>
    
    <main>
        <section class="projects">
            <h2 class="heading">Projects</h2>
            <div class="project-grid">
EOF

# Loop through directories and add project cards
for dir in */; do
    # Remove trailing slash
    dir_name=${dir%/}
    
    # Skip hidden directories
    if [[ $dir_name == .* ]]; then
        continue
    fi
    
    # Skip directories with #hidden comment in their index.html or if they're in the hidden list
    hidden_projects=("PythonLiveChatApp" "SEAnSharp")
    if [[ " ${hidden_projects[@]} " =~ " ${dir_name} " ]]; then
        echo "🙈 Skipping hidden project: $dir_name"
        continue
    fi
    
    if [ -f "$dir_name/index.html" ] && head -n 5 "$dir_name/index.html" | grep -q "^<!-- #hidden -->"; then
        echo "🙈 Skipping hidden project: $dir_name"
        continue
    fi
    
    # Check for different project types
    link="#"
    status=""
    project_type="folder"
    
    if [ -f "$dir_name/index.html" ]; then
        # Standard HTML project
        link="$dir_name/index.html"
        status=""
        project_type="web"
    elif [ -f "$dir_name/package.json" ]; then
        # Check for different types of Node.js projects
        if [ -f "$dir_name/src/app/page.tsx" ]; then
            # Next.js project with app router - check if it's configured for static export
            if [ -f "$dir_name/next.config.mjs" ] && grep -q "output.*export" "$dir_name/next.config.mjs"; then
                # Static export Next.js - try to find the built files or link to GitHub Pages
                if grep -q "basePath.*$dir_name" "$dir_name/next.config.mjs"; then
                    # Has basePath configured, should be accessible as GitHub Pages subpath
                    link="https://evilusean.github.io/$dir_name/"
                    status=" (Next.js Static)"
                    project_type="react"
                else
                    # Static export but no basePath, link to GitHub
                    link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
                    status=" (Next.js - see GitHub)"
                    project_type="react"
                fi
            else
                # Regular Next.js project, needs dev server
                link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
                status=" (Next.js - run locally)"
                project_type="react"
            fi
        elif [ -f "$dir_name/src/index.tsx" ] || [ -f "$dir_name/src/index.js" ]; then
            # React project
            link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
            status=" (React - see GitHub)"
            project_type="react"
        elif [ -f "$dir_name/index.js" ] || [ -f "$dir_name/app.js" ]; then
            # Node.js project
            link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
            status=" (Node.js - see GitHub)"
            project_type="node"
        else
            # Generic Node.js project
            link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
            status=" (Node.js - see GitHub)"
            project_type="node"
        fi
    elif [ -f "$dir_name/README.md" ]; then
        # Project with README
        link="https://github.com/evilusean/evilusean.github.io/tree/main/$dir_name"
        status=" (see GitHub)"
        project_type="github"
    else
        # No recognizable entry point
        link="#"
        status=" (no index.html)"
        project_type="folder"
    fi
    
    # Set icon based on project type
    case $project_type in
        "web") icon="bx-globe" ;;
        "react") icon="bxl-react" ;;
        "node") icon="bxl-nodejs" ;;
        "github") icon="bxl-github" ;;
        *) icon="bx-folder" ;;
    esac
    
    # Add project card to HTML
    cat >> index.html << EOF
                <div class="project-card">
                    <div class="project-info">
                        <i class="bx $icon"></i>
                        <h3><a href="$link">$dir_name</a></h3>
                        <p>$dir_name$status</p>
                        $(if [[ $link != "#" ]]; then echo '<div class="btn"><a href="'$link'" target="_blank">View Project</a></div>'; else echo '<div class="btn disabled">No Index</div>'; fi)
                    </div>
                </div>
EOF
done

# Close the HTML
cat >> index.html << EOF
            </div>
        </section>
    </main>
    
    <footer class="footer">
        <div class="social">
            <a href="https://github.com/evilusean" target="_blank"><i class="bx bxl-github"></i></a>
            <a href="https://www.linkedin.com/in/evilusean/" target="_blank"><i class="bx bxl-linkedin-square"></i></a>
        </div>
        <p class="copyright">Last updated: $current_date | © Sean Teams | All Rights Reserved</p>
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
</html>
EOF

echo "✅ index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "." | wc -l) directories"

# Update 3ThreeJS index if it exists
if [ -d "3ThreeJS" ] && [ -f "3ThreeJS/update-threejs-index.sh" ]; then
    echo "🔄 Updating 3ThreeJS index..."
    (cd 3ThreeJS && ./update-threejs-index.sh)
fi

# Update Languages indexes if they exist
if [ -d "Languages" ] && [ -f "Languages/update-languages-index.sh" ]; then
    echo "🌐 Updating Languages indexes..."
    (cd Languages && ./update-languages-index.sh)
fi