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

The app extracts comprehensive metadata including:

- **File Information**: Name, size, type, MIME type, modification date
- **Image Properties**: Dimensions, megapixels, bit depth, color space
- **EXIF Data**: Camera settings, lens info, exposure, ISO, aperture, shutter speed, focal length, flash, white balance, metering mode, etc.
- **GPS Data**: Latitude, longitude, altitude, position (formatted in degrees/minutes/seconds)
- **IPTC/IIM Data**: Keywords, caption, byline, copyright, credit, source, category, location, etc.
- **XMP Data**: Creator, rights, description, title, subject, rating, usage terms, web statement, history, and Adobe Lightroom/Photoshop settings
- **Camera Information**: Make, model, lens model, software used
- **Date/Time Information**: Original date taken, creation date, modification date
- **Copyright & Attribution**: Artist, copyright notice, creator info, usage rights
- **Location Data**: City, state, country, sublocation, GPS coordinates
- **Technical Details**: Color components, encoding process, compression, resolution, orientation

The app uses the powerful **exifr** library which extracts significantly more metadata than basic EXIF readers, including IPTC, XMP, ICC profiles, and proprietary maker notes.

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
- [exifr](https://github.com/MikeKovarik/exifr) library for comprehensive metadata extraction (EXIF, IPTC, XMP, ICC, GPS)
- Responsive design with CSS Grid and Flexbox

## Privacy

All image processing happens entirely in your browser using JavaScript. No images or metadata are ever uploaded to any server. Your data stays on your device.

## License

Free to use and modify for personal or commercial projects.
