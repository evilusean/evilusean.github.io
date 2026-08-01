# Specification: Static Visual Timeline Web App

## Overview
A fully client-side, single-page static timeline application hosted on GitHub Pages. It features a Google Sheets backend with Google Identity Services (OAuth) authentication, full CRUD capabilities (Create, Read, Update, Delete), CSV/Spreadsheet import and export, automatic hashtag-based connection mapping, visual heatmap generation, and a responsive emoji-driven timeline track.

## Tech Stack
* HTML5, modern CSS (CSS Grid, Flexbox, or Tailwind via CDN), and vanilla JavaScript.
* Google Identity Services (GIS) & Google Sheets API v4 for backend synchronization.
* PapaParse (via CDN) for local CSV import/export processing.

## Core Features & Requirements

### 1. Authentication & Backend Sync
* **Google Sign-In**: User authenticates using Google OAuth to grant read/write access to their personal Google Sheet.
* **Direct Sheet Link**: Provide a UI button/link allowing the user to open and edit their Google Sheet directly in a new tab.
* **Manual Data Sync**: Buttons to pull latest data from the sheet or push local changes back to the sheet.

### 2. Full CRUD & Local Backup
* **Create**: A modal form within the web app to add a new event matching the schema. Appends to local state and syncs to Google Sheets.
* **Read**: Fetches rows, parses dates, validates schema, and populates the timeline.
* **Update**: Inline or modal editing of existing events, syncing updates back to the sheet.
* **Delete**: Remove an event locally and via API sync.
* **Import/Export**: Drag-and-drop or file picker to import local CSV/Spreadsheet files, and an export button to download the current state as a CSV.

### 3. Timeline Visualization & Interactions
* **Emoji Markers**: Every event renders its assigned emoji along a dynamically scaled horizontal/vertical temporal axis.
* **Dynamic Scaling**: The timeline axis automatically scales (zooms/pans) based on the date range of the dataset, preventing crowding.
* **Hashtag Connections**: The app automatically parses `#tags` across events to draw relationship lines, compute a visual network/heatmap, and cluster related nodes.
* **Hover & Click Preview**: Hovering over an emoji marker triggers a popover card displaying the event name, date range, thumbnail image, and description. Clicking the image or title opens the primary source link (e.g., Wikipedia).

### 4. Data Schema Specification
Every row/record strictly maintains:
* `id` (string, unique)
* `version` (number, e.g., 1)
* `event_name` (string)
* `date_start` (YYYY-MM-DD)
* `date_end` (YYYY-MM-DD)
* `description` (string)
* `sources` (string/URL)
* `image_url` (string/URL)
* `emoji` (string, single emoji character)
* `category` (string)
* `tags` (string, comma/space separated hashtags)
* `importance` (number)