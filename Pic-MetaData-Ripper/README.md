# Image Metadata Reader

A static web app that extracts and displays metadata from images, perfect for GitHub Pages hosting.

## Features

- 📁 **Multiple File Upload**: Upload one or multiple images at once
- 🖱️ **Drag & Drop**: Drag images directly onto the upload area
- 📱 **Mobile Friendly**: Works on desktop, tablet, and mobile devices
- 🔒 **Privacy First**: All processing happens in your browser - no server uploads
- 💾 **Export Metadata**: Download all metadata as a formatted text file
- 🎨 **Black/Red Theme**: Sleek dark interface with red accents

## Supported File Types

- JPG/JPEG
- PNG
- GIF
- HEIC/HEIF
- TIFF/TIF
- BMP
- WebP

## Metadata Extracted

- **File Information**: Name, size, type, last modified date
- **Image Properties**: Dimensions (width x height)
- **EXIF Data** (when available):
  - Camera make and model
  - Date and time taken
  - Camera settings (ISO, aperture, shutter speed, focal length)
  - GPS coordinates (latitude, longitude, altitude)
  - Flash settings
  - White balance
  - Software used
  - Artist/copyright information

## How to Use

1. **Upload Images**: Click the upload area or drag and drop images
2. **View Metadata**: Metadata is automatically extracted and displayed for each image
3. **Download**: Click "Download Metadata as Text" to save all metadata to a .txt file

Click the **?** button in the top right corner for in-app help.

## Deployment

This app is designed to be hosted on GitHub Pages:

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Select the main branch as the source
4. Your app will be available at `https://[username].github.io/[repository-name]`

## Technologies Used

- Pure HTML, CSS, and JavaScript (no build process required)
- [exif-js](https://github.com/exif-js/exif-js) library for EXIF data extraction
- Responsive design with CSS Grid and Flexbox

## Privacy

All image processing happens entirely in your browser using JavaScript. No images or metadata are ever uploaded to any server. Your data stays on your device.

## License

Free to use and modify for personal or commercial projects.
