const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const filesList = document.getElementById('files-list');
const actionButtons = document.getElementById('action-buttons');
const downloadAllBtn = document.getElementById('download-all-btn');
const clearBtn = document.getElementById('clear-btn');

let processedFiles = [];

// Open file picker on click
dropZone.addEventListener('click', () => fileInput.click());

// Drag & drop visual feedback
['dragover', 'dragenter'].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'dragend', 'drop'].forEach(event => {
  dropZone.addEventListener(event, e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });
});

// Handle dropped files
dropZone.addEventListener('drop', e => handleFiles(e.dataTransfer.files));
fileInput.addEventListener('change', e => handleFiles(e.target.files));

function handleFiles(files) {
  if (!files.length) return;
  
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      processFile(file);
    }
  });
  
  fileInput.value = ''; // Reset input
}

function processFile(file) {
  const id = Date.now() + Math.random();
  const originalName = file.name.replace(/\.[^/.]+$/, "");
  const originalExt = file.name.split('.').pop().toLowerCase();
  
  // Determine output format based on input
  let outputFormat = 'jpeg';
  let outputExt = 'jpg';
  let mimeType = 'image/jpeg';
  
  if (originalExt === 'png') {
    outputFormat = 'png';
    outputExt = 'png';
    mimeType = 'image/png';
  } else if (originalExt === 'webp') {
    outputFormat = 'webp';
    outputExt = 'webp';
    mimeType = 'image/webp';
  } else if (originalExt === 'bmp') {
    outputFormat = 'bmp';
    outputExt = 'bmp';
    mimeType = 'image/bmp';
  } else if (originalExt === 'gif') {
    outputFormat = 'png';
    outputExt = 'png';
    mimeType = 'image/png';
  } else if (originalExt === 'avif') {
    outputFormat = 'avif';
    outputExt = 'avif';
    mimeType = 'image/avif';
  } else if (originalExt === 'tiff' || originalExt === 'tif') {
    outputFormat = 'png';
    outputExt = 'png';
    mimeType = 'image/png';
  }
  
  const fileData = {
    id,
    originalFile: file,
    originalName,
    outputName: `${originalName}_stripped`,
    outputFormat,
    outputExt,
    mimeType,
    blob: null,
    previewUrl: null
  };
  
  processedFiles.push(fileData);
  
  const img = new Image();
  img.onload = () => {
    // Create preview URL
    fileData.previewUrl = URL.createObjectURL(file);
    
    // Strip metadata by redrawing on canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // Handle transparency for PNG/WebP
    if (outputFormat === 'png' || outputFormat === 'webp') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.drawImage(img, 0, 0);
    
    // Convert to blob
    canvas.toBlob(blob => {
      fileData.blob = blob;
      renderFileItem(fileData);
      updateUI();
    }, mimeType, 0.95);
  };
  
  img.src = URL.createObjectURL(file);
}

function renderFileItem(fileData) {
  const item = document.createElement('div');
  item.className = 'file-item';
  item.dataset.id = fileData.id;
  
  const sizeKB = (fileData.blob.size / 1024).toFixed(1);
  const originalSizeKB = (fileData.originalFile.size / 1024).toFixed(1);
  
  item.innerHTML = `
    <div class="file-header">
      <img src="${fileData.previewUrl}" alt="Preview" class="file-preview">
      <div class="file-info">
        <div class="file-name">${fileData.originalFile.name}</div>
        <div class="file-size">${originalSizeKB} KB → ${sizeKB} KB</div>
      </div>
    </div>
    <div class="file-controls">
      <input type="text" class="name-input" value="${fileData.outputName}" placeholder="File name">
      <select class="format-select">
        <option value="jpeg" ${fileData.outputFormat === 'jpeg' ? 'selected' : ''}>JPEG</option>
        <option value="png" ${fileData.outputFormat === 'png' ? 'selected' : ''}>PNG</option>
        <option value="webp" ${fileData.outputFormat === 'webp' ? 'selected' : ''}>WebP</option>
        <option value="bmp" ${fileData.outputFormat === 'bmp' ? 'selected' : ''}>BMP</option>
        <option value="avif" ${fileData.outputFormat === 'avif' ? 'selected' : ''}>AVIF</option>
      </select>
      <button class="download-btn">Download</button>
      <button class="remove-btn">Remove</button>
    </div>
    <div class="status">✓ Metadata stripped</div>
  `;
  
  // Event listeners
  const nameInput = item.querySelector('.name-input');
  const formatSelect = item.querySelector('.format-select');
  const downloadBtn = item.querySelector('.download-btn');
  const removeBtn = item.querySelector('.remove-btn');
  
  nameInput.addEventListener('input', e => {
    fileData.outputName = e.target.value;
  });
  
  formatSelect.addEventListener('change', e => {
    const newFormat = e.target.value;
    fileData.outputFormat = newFormat;
    
    if (newFormat === 'jpeg') {
      fileData.outputExt = 'jpg';
      fileData.mimeType = 'image/jpeg';
    } else if (newFormat === 'png') {
      fileData.outputExt = 'png';
      fileData.mimeType = 'image/png';
    } else if (newFormat === 'webp') {
      fileData.outputExt = 'webp';
      fileData.mimeType = 'image/webp';
    } else if (newFormat === 'bmp') {
      fileData.outputExt = 'bmp';
      fileData.mimeType = 'image/bmp';
    } else if (newFormat === 'avif') {
      fileData.outputExt = 'avif';
      fileData.mimeType = 'image/avif';
    }
    
    // Reconvert to new format
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (newFormat === 'png' || newFormat === 'webp') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(blob => {
        if (blob) {
          fileData.blob = blob;
          const sizeKB = (blob.size / 1024).toFixed(1);
          item.querySelector('.file-size').textContent = `${originalSizeKB} KB → ${sizeKB} KB`;
        } else {
          alert(`Your browser doesn't support ${newFormat.toUpperCase()} format. Try JPEG or PNG instead.`);
        }
      }, fileData.mimeType, 0.95);
    };
    img.src = fileData.previewUrl;
  });
  
  downloadBtn.addEventListener('click', () => downloadSingle(fileData));
  removeBtn.addEventListener('click', () => removeFile(fileData.id));
  
  filesList.appendChild(item);
}

function downloadSingle(fileData) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(fileData.blob);
  a.download = `${fileData.outputName}.${fileData.outputExt}`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function removeFile(id) {
  const index = processedFiles.findIndex(f => f.id === id);
  if (index > -1) {
    const fileData = processedFiles[index];
    if (fileData.previewUrl) URL.revokeObjectURL(fileData.previewUrl);
    processedFiles.splice(index, 1);
  }
  
  const item = filesList.querySelector(`[data-id="${id}"]`);
  if (item) item.remove();
  
  updateUI();
}

function updateUI() {
  if (processedFiles.length > 0) {
    actionButtons.style.display = 'flex';
  } else {
    actionButtons.style.display = 'none';
  }
}

clearBtn.addEventListener('click', () => {
  processedFiles.forEach(f => {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
  });
  processedFiles = [];
  filesList.innerHTML = '';
  updateUI();
});

downloadAllBtn.addEventListener('click', async () => {
  if (processedFiles.length === 0) return;
  
  if (processedFiles.length === 1) {
    downloadSingle(processedFiles[0]);
    return;
  }
  
  // Create ZIP for multiple files
  const zip = new JSZip();
  
  processedFiles.forEach(fileData => {
    const fileName = `${fileData.outputName}.${fileData.outputExt}`;
    zip.file(fileName, fileData.blob);
  });
  
  downloadAllBtn.textContent = 'Creating ZIP...';
  downloadAllBtn.disabled = true;
  
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = 'stripped_images.zip';
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (error) {
    alert('Error creating ZIP file: ' + error.message);
  } finally {
    downloadAllBtn.textContent = 'Download All as ZIP';
    downloadAllBtn.disabled = false;
  }
});

// Modal functionality
const modal = document.getElementById('info-modal');
const infoBtn = document.getElementById('info-btn');
const closeBtn = document.querySelector('.close');

infoBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    modal.style.display = 'none';
  }
});
