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
EOF

# Loop through directories and add project cards
for dir in */; do
    # Remove trailing slash
    dir_name=${dir%/}
    
    # Skip hidden directories
    if [[ $dir_name == .* ]]; then
        continue
    fi
    
    # Check if index.html exists in the directory
    if [ -f "$dir_name/index.html" ]; then
        link="$dir_name/index.html"
        status=""
    else
        link="#"
        status=" (no index.html)"
    fi
    
    # Add project card to HTML
    cat >> index.html << EOF
                <div class="project-card">
                    <h3><a href="$link">$dir_name</a></h3>
                    <p>Project: $dir_name$status</p>
                </div>
EOF
done

# Close the HTML
cat >> index.html << EOF
            </div>
        </section>
    </main>
    
    <footer>
        <p>Last updated: $current_date</p>
    </footer>
</body>
</html>
EOF

echo "✅ index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "." | wc -l) directories"