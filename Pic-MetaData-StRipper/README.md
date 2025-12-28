# Image Metadata Remover

A privacy-focused, client-side tool to strip EXIF data, GPS coordinates, and all metadata from your photos.

## Features

- **100% Private** - Everything happens in your browser, no uploads to any server
- **Batch Processing** - Handle multiple images at once
- **Multiple Formats** - Support for JPEG, PNG, WebP, BMP, GIF, AVIF, and TIFF
- **Format Conversion** - Convert between different image formats
- **File Renaming** - Rename files before downloading
- **ZIP Download** - Download multiple processed images as a ZIP file
- **Mobile & Desktop** - Responsive design works on all devices

## Supported Formats

### Input Formats
- JPEG/JPG
- PNG
- WebP
- BMP
- GIF (converts to PNG)
- AVIF (browser support varies)
- TIFF/TIF (converts to PNG)

### Output Formats
- JPEG - Best for photos, smaller file size
- PNG - Best for graphics with transparency
- WebP - Modern format with great compression
- BMP - Uncompressed bitmap
- AVIF - Next-gen format (Chrome/Edge only)

## How It Works

The tool uses the HTML5 Canvas API to redraw images, which naturally strips all metadata including:
- EXIF data (camera settings, timestamps)
- GPS coordinates (location data)
- Copyright information
- Camera make and model
- Software/editing history
- Thumbnails
- Color profiles (replaced with sRGB)

## Usage

1. **Upload Images**
   - Drag and drop images onto the drop zone, or
   - Click the drop zone to open the file picker
   - Select one or multiple images

2. **Processing**
   - Images are automatically processed when uploaded
   - Metadata is stripped instantly in your browser
   - Preview and file size comparison are shown

3. **Customize (Optional)**
   - Rename files using the text input field
   - Change output format using the dropdown (JPEG, PNG, WebP, BMP, AVIF)

4. **Download**
   - Click "Download" on individual files, or
   - Click "Download All as ZIP" for multiple files
   - Use "Clear All" to start over

## Privacy

- No server uploads - all processing happens locally
- No analytics or tracking
- No data collection
- Open source - inspect the code yourself

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (full support including AVIF)
- Firefox (JPEG, PNG, WebP, BMP)
- Safari (JPEG, PNG, WebP)

## Deployment

This is a static site that can be hosted on:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

## License

MIT License - Free to use and modify

## Technical Details

- Pure JavaScript (no frameworks)
- JSZip for creating ZIP archives
- Canvas API for metadata stripping
- No backend required
