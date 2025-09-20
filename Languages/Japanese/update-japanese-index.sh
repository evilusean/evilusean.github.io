#!/bin/bash

# Get current date
current_date=$(date +"%B %d, %Y")

# Project name mappings for better display names
declare -A project_names
project_names["Numbers"]="Japanese Numbers TranslaSean"
project_names["Time"]="Japanese Time TranslaSean"
project_names["Calendar"]="Japanese Calendar TranslaSean"
project_names["Prepositions"]="Japanese PreposiSeans"
project_names["HiraganaDrop"]="Japanese Hiragana Drop"
project_names["KanjiDrop"]="Japanese Kanji Drop"

# Start building the HTML
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Japanese Language Learning Apps</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="card-container">
EOF

# Loop through directories and add project cards
for dir in */; do
    # Remove trailing slash
    dir_name=${dir%/}
    
    # Skip hidden directories and files
    if [[ $dir_name == .* ]] || [[ ! -d $dir_name ]]; then
        continue
    fi
    
    # Check if index.html exists in the directory
    if [ -f "$dir_name/index.html" ]; then
        # Get display name (use mapping if available, otherwise use directory name)
        display_name=${project_names[$dir_name]:-"Japanese $dir_name TranslaSean"}
        
        # Add project card to HTML
        cat >> index.html << EOF
        <div class="card">
            <a href="$dir_name/index.html">$display_name</a>
        </div>
EOF
    fi
done

# Close the HTML
cat >> index.html << 'EOF'
    </div>
</body>
</html>
EOF

echo "✅ Japanese index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "." | wc -l) Japanese language projects"