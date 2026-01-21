#!/bin/bash

# Get current date
current_date=$(date +"%B %d, %Y")

# Start building the HTML
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Math Projects - Sean's Portfolio</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="../favicon.ico" type="image/x-icon">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="glow-text" data-text="Math Projects">Math Projects</div>
        <p>Collection of interactive math visualizations and educational tools</p>
    </header>
    
    <main>
        <section class="projects">
            <h2 class="heading">Math Projects</h2>
            <div class="project-grid">
EOF

# Function to get project type based on content
get_project_type() {
    local dir_name="$1"
    local index_file="$dir_name/index.html"
    
    if [ ! -f "$index_file" ]; then
        echo "folder"
        return
    fi
    
    # Check for specific project types
    if grep -qi "three\.js\|THREE" "$index_file"; then
        echo "threejs"
    elif grep -qi "react\|React" "$index_file"; then
        echo "react"
    elif grep -qi "circle\|Circle\|trig\|Trig" "$index_file"; then
        echo "geometry"
    elif grep -qi "graph\|Graph\|plot\|Plot" "$index_file"; then
        echo "graphing"
    elif grep -qi "animation\|Animation" "$index_file"; then
        echo "animation"
    elif grep -qi "canvas\|Canvas" "$index_file"; then
        echo "visualization"
    else
        echo "math"
    fi
}

# Function to get project icon
get_project_icon() {
    local project_type="$1"
    case $project_type in
        "threejs") echo "bx-cube" ;;
        "geometry") echo "bx-shape-circle" ;;
        "graphing") echo "bx-chart" ;;
        "animation") echo "bx-movie" ;;
        "visualization") echo "bx-paint" ;;
        "math") echo "bx-calculator" ;;
        "web") echo "bx-globe" ;;
        *) echo "bx-folder" ;;
    esac
}

# Function to get project description
get_project_description() {
    local dir_name="$1"
    local index_file="$dir_name/index.html"
    
    if [ -f "$index_file" ]; then
        # Try to extract title from HTML
        local title=$(grep -i "<title>" "$index_file" | sed 's/.*<title>\(.*\)<\/title>.*/\1/' | head -1)
        if [ -n "$title" ] && [ "$title" != "Math Projects - Sean's Portfolio" ]; then
            echo "$title"
        else
            echo "$dir_name - Math Project"
        fi
    else
        echo "$dir_name - Math Project"
    fi
}

# Loop through directories and add project cards
for dir in */; do
    # Remove trailing slash
    dir_name=${dir%/}
    
    # Skip hidden directories
    if [[ $dir_name == .* ]]; then
        continue
    fi
    
    # Skip the update scripts
    if [[ $dir_name == update-* ]]; then
        continue
    fi
    
    # Check for different project types
    link="#"
    status=""
    project_type=$(get_project_type "$dir_name")
    icon=$(get_project_icon "$project_type")
    description=$(get_project_description "$dir_name")
    
    if [ -f "$dir_name/index.html" ]; then
        # Standard HTML project
        link="$dir_name/index.html"
        status=""
    else
        # No recognizable entry point
        link="#"
        status=" (no index.html)"
    fi
    
    # Add project card to HTML
    cat >> index.html << EOF
                <div class="project-card">
                    <div class="project-info">
                        <i class="bx $icon"></i>
                        <h3><a href="$link">$dir_name</a></h3>
                        <p>$description$status</p>
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

echo "✅ Math index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "update-*" | wc -l) Math projects"

# Make the script executable
chmod +x update-math-index.sh
