let allMetadata = [];

const fileInput = document.getElementById('fileInput');
const results = document.getElementById('results');
const downloadBtn = document.getElementById('downloadBtn');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const closeModal = document.querySelector('.close');
const uploadLabel = document.querySelector('.upload-label');

// Modal controls
helpBtn.onclick = () => helpModal.style.display = 'block';
closeModal.onclick = () => helpModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === helpModal) helpModal.style.display = 'none';
};

// Drag and drop
uploadLabel.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadLabel.style.background = 'rgba(255, 0, 0, 0.25)';
});

uploadLabel.addEventListener('dragleave', () => {
    uploadLabel.style.background = 'rgba(255, 0, 0, 0.05)';
});

uploadLabel.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadLabel.style.background = 'rgba(255, 0, 0, 0.05)';
    const files = e.dataTransfer.files;
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    allMetadata = [];
    results.innerHTML = '';
    downloadBtn.style.display = 'none';
    
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            processImage(file);
        }
    });
}

async function processImage(file) {
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        const img = new Image();
        img.onload = async function() {
            await extractMetadata(file, img, e.target.result);
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

async function extractMetadata(file, img, dataUrl) {
    const metadata = {
        'File Name': file.name,
        'File Size': formatBytes(file.size),
        'File Type': file.type,
        'MIME Type': file.type,
        'Image Width': img.width,
        'Image Height': img.height,
        'Image Size': `${img.width}x${img.height}`,
        'Megapixels': ((img.width * img.height) / 1000000).toFixed(3),
        'File Modification Date/Time': new Date(file.lastModified).toLocaleString(),
        'Bits Per Sample': img.naturalWidth ? '8' : 'Unknown'
    };
    
    try {
        // Extract ALL metadata using exifr (supports EXIF, IPTC, XMP, ICC, etc.)
        const exifrData = await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
            iptc: true,
            icc: false, // Disable ICC - too technical for users
            jfif: false, // Disable JFIF - not useful
            ihdr: true,
            xmp: true,
            // Get everything
            pick: undefined,
            skip: undefined,
            translateKeys: false,
            translateValues: false,
            reviveValues: true,
            sanitize: false,
            mergeOutput: false,
            silentErrors: true
        });
        
        if (exifrData) {
            // Flatten nested objects into individual fields
            flattenObject(exifrData, '', metadata);
        }
        
        // Try to get GPS data in formatted way
        const gpsData = await exifr.gps(file);
        if (gpsData) {
            if (gpsData.latitude !== undefined) {
                metadata['GPS Latitude'] = formatGPSCoordinate(gpsData.latitude, 'lat');
            }
            if (gpsData.longitude !== undefined) {
                metadata['GPS Longitude'] = formatGPSCoordinate(gpsData.longitude, 'lon');
            }
            if (gpsData.altitude !== undefined) {
                metadata['GPS Altitude'] = `${gpsData.altitude.toFixed(2)} m Above Sea Level`;
            }
            if (gpsData.latitude !== undefined && gpsData.longitude !== undefined) {
                metadata['GPS Position'] = `${formatGPSCoordinate(gpsData.latitude, 'lat')}, ${formatGPSCoordinate(gpsData.longitude, 'lon')}`;
            }
        }
        
        // Get orientation
        const orientation = await exifr.orientation(file);
        if (orientation) {
            metadata['Orientation'] = orientation;
        }
        
        // Get thumbnail if exists
        const thumbnail = await exifr.thumbnail(file);
        if (thumbnail) {
            metadata['Thumbnail'] = 'Present (Binary data)';
        }
        
    } catch (error) {
        console.error('Error extracting metadata:', error);
        metadata['Metadata Extraction Error'] = error.message;
    }
    
    allMetadata.push(metadata);
    displayMetadata(metadata);
    
    if (allMetadata.length > 0) {
        downloadBtn.style.display = 'block';
    }
}

function flattenObject(obj, prefix, result) {
    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        
        const value = obj[key];
        const newKey = prefix ? `${prefix} > ${key}` : key;
        
        // Skip entire ICC object at top level (except for simple desc/cprt extraction)
        if (!prefix && key.toLowerCase() === 'icc') {
            // Only extract description and copyright from ICC
            if (typeof value === 'object' && value !== null) {
                if (value.desc) {
                    result['Color Profile'] = value.desc;
                }
                if (value.cprt) {
                    result['Color Profile Copyright'] = value.cprt;
                }
            }
            continue; // Skip all other ICC data
        }
        
        // Skip thumbnail, undefined, and technical fields that users don't understand
        if (shouldSkipField(key, newKey, value)) {
            continue;
        }
        
        // Handle objects with numerator/denominator (fractions)
        if (typeof value === 'object' && value.numerator !== undefined && value.denominator !== undefined) {
            result[formatKey(newKey)] = formatValue(value);
            continue;
        }
        
        // Handle arrays
        if (Array.isArray(value)) {
            // Skip arrays that are just raw binary data or color curves
            if (isRawDataArray(value)) {
                continue;
            }
            
            // If array contains only primitives, format it
            if (value.every(v => typeof v !== 'object' || v === null)) {
                result[formatKey(newKey)] = formatValue(value);
            } else {
                // If array contains objects, flatten each (but limit depth)
                const depth = (prefix.match(/>/g) || []).length;
                if (depth < 3) { // Limit nesting depth
                    value.forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                            flattenObject(item, `${newKey}[${index}]`, result);
                        } else {
                            result[formatKey(`${newKey}[${index}]`)] = formatValue(item);
                        }
                    });
                }
            }
            continue;
        }
        
        // Handle nested objects - recurse (but limit depth)
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            const depth = (prefix.match(/>/g) || []).length;
            if (depth < 3) { // Limit nesting depth
                flattenObject(value, newKey, result);
            }
            continue;
        }
        
        // Handle primitives
        result[formatKey(newKey)] = formatValue(value);
    }
}

function shouldSkipField(key, fullKey, value) {
    // Skip undefined, null, and thumbnail
    if (key === 'thumbnail' || key === 'undefined' || value === undefined || value === null) {
        return true;
    }
    
    // Skip JFIF data (not useful for users)
    if (fullKey.includes('Jfif >')) {
        return true;
    }
    
    // Skip raw EXIF numeric tags (keep named ones)
    if (fullKey.includes('Exif >') && key.match(/^[0-9]+$/)) {
        return true;
    }
    
    // Skip IFD numeric tags
    if ((fullKey.includes('Ifd0 >') || fullKey.includes('Ifd1 >')) && key.match(/^[0-9]+$/)) {
        return true;
    }
    
    // Skip GPS numeric keys (we format GPS separately)
    if (fullKey.includes('Gps >') && key.match(/^[0-9]+$/)) {
        return true;
    }
    
    // Skip IPTC numeric keys
    if (fullKey.includes('Iptc >') && key.match(/^[0-9]+$/)) {
        return true;
    }
    
    // Skip overly technical Lightroom/Camera Raw settings that are all 0 or default
    if (fullKey.includes('Crs >') && (
        key.includes('Adjustment') ||
        key.includes('Parametric') ||
        key.includes('Tone Curve') ||
        key.includes('Upright')
    ) && (value === 0 || value === '0' || value === 'No' || value === false)) {
        return true;
    }
    
    // Skip XMP history parse type (redundant)
    if (fullKey.includes('History') && key === 'parse Type') {
        return true;
    }
    
    // Skip "Default" placeholder values
    if (value === 'Default' || value === 'default') {
        return true;
    }
    
    return false;
}

function isRawDataArray(arr) {
    // Check if array looks like raw binary data or color curve data
    if (!Array.isArray(arr)) return false;
    
    // If it's a long array of just numbers, it's probably raw data
    if (arr.length > 20 && arr.every(v => typeof v === 'number' && v >= 0 && v <= 255)) {
        return true;
    }
    
    return false;
}

function formatKey(key) {
    // Convert camelCase or snake_case to Title Case
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    // Handle objects with numerator/denominator (fractions)
    if (typeof value === 'object' && value.numerator !== undefined && value.denominator !== undefined) {
        if (value.denominator === 1) {
            return value.numerator.toString();
        }
        return `${value.numerator}/${value.denominator}`;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
        // Check if it's an array of numbers (like GPS coordinates)
        if (value.every(v => typeof v === 'number')) {
            return value.join(', ');
        }
        // For other arrays, join with commas
        return value.map(v => formatValue(v)).join(', ');
    }
    
    // Handle objects
    if (typeof value === 'object') {
        // Try to stringify nicely
        try {
            const str = JSON.stringify(value);
            if (str.length < 100) {
                return str;
            }
            return '[Complex Object]';
        } catch {
            return '[Object]';
        }
    }
    
    // Handle dates
    if (value instanceof Date) {
        return value.toLocaleString();
    }
    
    // Handle numbers
    if (typeof value === 'number') {
        // Round to 2 decimal places if it's a float
        if (value % 1 !== 0) {
            return value.toFixed(2);
        }
        return value.toString();
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }
    
    // Default: convert to string
    return String(value);
}

function formatGPSCoordinate(decimal, type) {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    
    let direction;
    if (type === 'lat') {
        direction = decimal >= 0 ? 'N' : 'S';
    } else {
        direction = decimal >= 0 ? 'E' : 'W';
    }
    
    return `${degrees} deg ${minutes}' ${seconds}" ${direction}`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function displayMetadata(metadata) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'image-result';
    
    let html = `<h3>${metadata['File Name']}</h3><div class="metadata-grid">`;
    
    Object.keys(metadata).forEach(key => {
        if (key !== 'File Name') {
            const value = metadata[key];
            // Truncate very long values for display
            const displayValue = String(value).length > 200 ? String(value).substring(0, 200) + '...' : value;
            html += `<div class="metadata-item"><strong>${key}:</strong> ${displayValue}</div>`;
        }
    });
    
    html += '</div>';
    resultDiv.innerHTML = html;
    results.appendChild(resultDiv);
}

downloadBtn.addEventListener('click', () => {
    let textContent = 'IMAGE METADATA REPORT\n';
    textContent += '='.repeat(80) + '\n';
    textContent += `Generated: ${new Date().toLocaleString()}\n`;
    textContent += `Total Images: ${allMetadata.length}\n`;
    textContent += '='.repeat(80) + '\n\n';
    
    allMetadata.forEach((metadata, index) => {
        textContent += `IMAGE ${index + 1}\n`;
        textContent += '-'.repeat(80) + '\n';
        
        Object.keys(metadata).forEach(key => {
            const value = metadata[key];
            // Format the output to align values
            const paddedKey = key.padEnd(40);
            textContent += `${paddedKey}: ${value}\n`;
        });
        
        textContent += '\n';
    });
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Use first image filename for download name
    let downloadName = 'image-metadata.txt';
    if (allMetadata.length > 0 && allMetadata[0]['File Name']) {
        const firstFileName = allMetadata[0]['File Name'];
        const nameWithoutExt = firstFileName.substring(0, firstFileName.lastIndexOf('.')) || firstFileName;
        downloadName = `${nameWithoutExt}-metadata.txt`;
    }
    
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
