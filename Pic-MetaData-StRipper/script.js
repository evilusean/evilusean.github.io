const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const downloadBtn = document.getElementById('download-btn');

let originalFileName = '';

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

// Handle dropped or selected file
dropZone.addEventListener('drop', e => handleFile(e.dataTransfer.files[0]));
fileInput.addEventListener('change', e => {
  if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    return;
  }

  // Preserve original name but force .jpg output
  originalFileName = file.name.replace(/\.[^/.]+$/, "") + "_stripped.jpg";

  const img = new Image();
  img.onload = () => {
    preview.src = img.src;
    preview.style.display = 'block';

    // Redraw on canvas → strips all metadata
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Convert to blob and enable download
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName;
        a.click();
        URL.revokeObjectURL(url);
      };
      downloadBtn.disabled = false;
    }, 'image/jpeg', 0.95); // High quality JPEG
  };

  img.src = URL.createObjectURL(file);
}