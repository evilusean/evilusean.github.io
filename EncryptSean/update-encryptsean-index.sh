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
    <title>EncryptSean Projects - Sean's Portfolio</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="../favicon.ico" type="image/x-icon">
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="glow-text" data-text="EncryptSean Projects">EncryptSean Projects</div>
        <p>Collection of encryption and cipher experiments</p>
    </header>

    <main>
        <section class="projects">
            <h2 class="heading">EncryptSean Projects</h2>
            <div class="project-grid">
EOF

# Loop through subdirectories and add project cards
for dir in */; do
    dir_name=${dir%/}

    # Skip hidden directories and the update script itself
    if [[ $dir_name == .* ]]; then
        continue
    fi

    if [[ $dir_name == update-* ]]; then
        continue
    fi

    link="#"
    status=""
    icon="bx-folder"

    if [ -f "$dir_name/index.html" ]; then
        link="$dir_name/index.html"
        status=""
        icon="bx-lock-open-alt"
    else
        link="#"
        status=" (no index.html)"
        icon="bx-folder"
    fi

    cat >> index.html << EOF
                <div class="project-card">
                    <div class="project-info">
                        <i class="bx $icon"></i>
                        <h3><a href="$link">$dir_name</a></h3>
                        <p>$dir_name$status</p>
                        $(if [[ $link != "#" ]]; then echo '<div class="btn"><a href="'"$link"'" target="_blank">View Project</a></div>'; else echo '<div class="btn disabled">No Index</div>'; fi)
                    </div>
                </div>
EOF
done

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

echo "✅ EncryptSean index.html updated successfully!"
echo "📁 Found $(find . -maxdepth 1 -type d ! -name ".*" ! -name "update-*" | wc -l) EncryptSean projects"

chmod +x update-encryptsean-index.sh
