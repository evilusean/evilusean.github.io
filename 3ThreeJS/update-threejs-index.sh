#!/bin/bash

# Get current date
current_date=$(date +"%B %d, %Y")

# Project descriptions mapping
declare -A descriptions
descriptions["2DaMoon"]="Interactive 3D moon scene with realistic lighting and space environment"
descriptions["RapierPhysicSean"]="Physics simulation with gravity orbs using Rapier physics engine"
descriptions["TransISean"]="Smooth scene transitions and visual effects showcase"
descriptions["Wormhole"]="Journey through a dynamic wormhole with camera movement along spline curves"

# Icon mapping for different project types
declare -A icons
icons["2DaMoon"]="bx-planet"
icons["RapierPhysicSean"]="bx-atom"
icons["TransISean"]="bx-shuffle"
icons["Wormhole"]="bx-trip"

# Start building the HTML
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sean's Three.js Projects</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="glow-text" data-text="Three.js Projects">Three.js Projects</div>
        <p>Interactive 3D experiences and WebGL experiments</p>
        <div class="nav-back">
            <a href="../index.html" class="btn-back"><i class="bx bx-arrow-back"></i> Back to Portfolio</a>
        </div>
    </header>
    
    <main>
        <section class="projects">
            <h2 class="heading">3D Projects</h2>
            <div class="project-grid">
EOF

# Loop through directories and add project cards
for dir in */; do
    # Remove trailing slash
    dir_name=${dir%/}
    
    # Skip hidden directories and files
    if [[ $dir_name == .* ]] || [[ ! -d $dir_name ]]; then
        continue
    fi
    
    # Skip directories with #hidden comment in their index.html
    if [ -f "$dir_name/index.html" ] && head -n 5 "$dir_name/index.html" | grep -q "^<!-- #hidden -->"; then
        echo "🙈 Skipping hidden 3D project: $dir_name"
        continue
    fi
    
    # Get description and icon
    description=${descriptions[$dir_name]:-"Three.js project: $dir_name"}
    icon=${icons[$dir_name]:-"bx-cube"}
    
    # Check for different project types
    index_path=""
    project_status=""
    
    if [ -f "$dir_name/index.html" ]; then
        # Standard HTML project
        index_path="$dir_name/index.html"
        project_status=""
    elif [ -f "$dir_name/CenterGravityOrbs/index.html" ]; then
        # Subdirectory with index
        index_path="$dir_name/CenterGravityOrbs/index.html"
        project_status=""
    elif [ -f "$dir_name/package.json" ]; then
        # Check for different types of Node.js projects
        if [ -f "$dir_name/src/app/page.tsx" ]; then
            # Next.js project with app router
            index_path="https://github.com/evilusean/evilusean.github.io/tree/main/3ThreeJS/$dir_name"
            project_status=" (Next.js - see GitHub)"
        elif [ -f "$dir_name/src/index.tsx" ] || [ -f "$dir_name/src/index.js" ]; then
            # React project
            index_path="https://github.com/evilusean/evilusean.github.io/tree/main/3ThreeJS/$dir_name"
            project_status=" (React - see GitHub)"
        else
            # Generic Node.js project
            index_path="https://github.com/evilusean/evilusean.github.io/tree/main/3ThreeJS/$dir_name"
            project_status=" (Node.js - see GitHub)"
        fi
    fi
    
    if [ -n "$index_path" ]; then
        # Add project card to HTML
        cat >> index.html << EOF
                <div class="project-card">
                    <div class="project-info">
                        <i class="bx $icon"></i>
                        <h3><a href="$index_path">$dir_name</a></h3>
                        <p>$description$project_status</p>
                        <div class="btn"><a href="$index_path" target="_blank">View Project</a></div>
                    </div>
                </div>
EOF
    else
        # Add disabled card for projects without any entry point
        cat >> index.html << EOF
                <div class="project-card">
                    <div class="project-info">
                        <i class="bx $icon"></i>
                        <h3>$dir_name</h3>
                        <p>$description (no entry point)</p>
                        <div class="btn disabled">No Index</div>
                    </div>
                </div>
EOF
    fi
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

echo "✅ 3ThreeJS index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "." | wc -l) Three.js projects"