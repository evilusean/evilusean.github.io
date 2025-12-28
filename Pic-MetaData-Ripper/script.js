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
    
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            processImage(file);
        }
    });
}

function processImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            extractMetadata(file, img, e.target.result);
        };
        img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
}

function extractMetadata(file, img, dataUrl) {
    const metadata = {
        fileName: file.name,
        fileSize: formatBytes(file.size),
        fileType: file.type,
        dimensions: `${img.width} x ${img.height}`,
        lastModified: new Date(file.lastModified).toLocaleString()
    };
    
    // Extract EXIF data
    EXIF.getData(img, function() {
        const exifData = EXIF.getAllTags(this);
        
        // Add common EXIF fields
        const exifFields = {
            'Camera Make': EXIF.getTag(this, 'Make'),
            'Camera Model': EXIF.getTag(this, 'Model'),
            'Date Taken': EXIF.getTag(this, 'DateTime'),
            'Orientation': EXIF.getTag(this, 'Orientation'),
            'F-Number': EXIF.getTag(this, 'FNumber'),
            'Exposure Time': EXIF.getTag(this, 'ExposureTime'),
            'ISO': EXIF.getTag(this, 'ISOSpeedRatings'),
            'Focal Length': EXIF.getTag(this, 'FocalLength'),
            'Flash': EXIF.getTag(this, 'Flash'),
            'White Balance': EXIF.getTag(this, 'WhiteBalance'),
            'GPS Latitude': EXIF.getTag(this, 'GPSLatitude'),
            'GPS Longitude': EXIF.getTag(this, 'GPSLongitude'),
            'GPS Altitude': EXIF.getTag(this, 'GPSAltitude'),
            'Software': EXIF.getTag(this, 'Software'),
            'Artist': EXIF.getTag(this, 'Artist'),
            'Copyright': EXIF.getTag(this, 'Copyright')
        };
        
        // Filter out undefined values
        Object.keys(exifFields).forEach(key => {
            if (exifFields[key] !== undefined && exifFields[key] !== null) {
                metadata[key] = formatExifValue(exifFields[key]);
            }
        });
        
        allMetadata.push(metadata);
        displayMetadata(metadata);
        
        if (allMetadata.length > 0) {
            downloadBtn.style.display = 'block';
        }
    });
}

function formatExifValue(value) {
    if (typeof value === 'object' && value.numerator !== undefined) {
        return `${value.numerator}/${value.denominator}`;
    }
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return value;
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
    
    let html = `<h3>${metadata.fileName}</h3><div class="metadata-grid">`;
    
    Object.keys(metadata).forEach(key => {
        if (key !== 'fileName') {
            html += `<div class="metadata-item"><strong>${key}:</strong> ${metadata[key]}</div>`;
        }
    });
    
    html += '</div>';
    resultDiv.innerHTML = html;
    results.appendChild(resultDiv);
}

downloadBtn.addEventListener('click', () => {
    let textContent = 'IMAGE METADATA REPORT\n';
    textContent += '='.repeat(50) + '\n';
    textContent += `Generated: ${new Date().toLocaleString()}\n`;
    textContent += `Total Images: ${allMetadata.length}\n`;
    textContent += '='.repeat(50) + '\n\n';
    
    allMetadata.forEach((metadata, index) => {
        textContent += `IMAGE ${index + 1}\n`;
        textContent += '-'.repeat(50) + '\n';
        
        Object.keys(metadata).forEach(key => {
            textContent += `${key}: ${metadata[key]}\n`;
        });
        
        textContent += '\n';
    });
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `image-metadata-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
