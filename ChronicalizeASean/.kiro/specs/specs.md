# Specification: Static Visual Timeline Web App

## Overview
A fully client-side, single-page static timeline application hosted on GitHub Pages. It features a Google Sheets backend with Google Identity Services (OAuth) authentication, full CRUD capabilities (Create, Read, Update, Delete), CSV/Spreadsheet import and export, automatic hashtag-based connection mapping, visual heatmap generation, a responsive emoji-driven timeline track, and unlimited-depth hierarchical event nesting.

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
* **Import/Export**: Drag-and-drop or file picker to import local CSV/Spreadsheet files, and an export button to download the current state as a CSV. User can choose CSV or spreadsheet format.

### 3. Timeline Visualization & Interactions
* **Emoji Markers**: Every event renders its assigned emoji along a dynamically scaled horizontal/vertical temporal axis.
* **Dynamic Scaling**: The timeline axis automatically scales (zooms/pans) based on the date range of the dataset, preventing crowding.
* **Hashtag Connections**: The app automatically parses `#tags` across events to draw relationship lines, compute a visual network/heatmap, and cluster related nodes.
* **Hover & Click Preview**: Hovering over an emoji marker triggers a popover card displaying the event name, date range, thumbnail image, and description. Clicking the image or title opens the primary source link (e.g., Wikipedia).
* **Hierarchical Drill-Down**: Clicking a parent event can filter the timeline to show only that event and its direct/nested sub-events, using `parent_id` traversal.

### 4. Hierarchical Events
Events support unlimited nesting depth via the `parent_id` field (adjacency list pattern):

```
Roman Empire  (root — no parent_id)
└── Punic Wars  (parent_id → Roman Empire's id)
    └── Battle of Zama  (parent_id → Punic Wars' id)
```

* A root event has an empty `parent_id`.
* Any event can be a parent. Depth is unlimited.
* The UI should allow a user to click a parent event and view a filtered timeline of just that event and all its descendants.
* `parent_id` is not validated for referential integrity at creation time (the referenced parent may not exist yet when importing in bulk).

### 5. People & Events Linking
* People are stored in a separate Google Sheet tab (or local state).
* Each person has a `handle` field (e.g. `julius_caesar`) used for `@mention` linking.
* Events reference people via the `people` field: a space-separated list of `@handles` (e.g. `@julius_caesar @augustus`).
* The UI should resolve `@handles` to people records and display linked person cards on the event detail panel.
* People can also reference events via the legacy `event_ids` field (comma-separated event ids).

### 6. Data Schema Specification

#### Events Sheet
Every row/record maintains these columns (in order). Columns marked `*` are required.

| Column | Required | Description |
|---|---|---|
| `id` | | Stable UUID. Auto-filled by the app on new rows. |
| `version` | | Integer, default 1. |
| `parent_id` | | `id` of the parent event. Empty = root event. Enables sub-events at unlimited depth. |
| `event_name` | * | Short title shown on the timeline. |
| `date_start` | * | `YYYY-MM-DD`. BCE dates use a leading minus: `-0264-01-01`. |
| `date_end` | | `YYYY-MM-DD` for events with duration. Leave blank for point-in-time events. |
| `description` | | What happened. Shown in the detail panel and popover. |
| `sources` | | URL or citation. Clicking the event title opens this. |
| `image_url` | | Direct image URL for the popover thumbnail. |
| `emoji` | | Single emoji marker. Default `📌`. |
| `category` | | War, Law, Empire, Revolution, etc. Controls marker colour. |
| `tags` | | Space-separated `#hashtags`. Shared tags draw connection lines between events. |
| `people` | | Space-separated `@handles` of people involved (e.g. `@julius_caesar`). |
| `location` | | Free-text place name (city, region, empire). |
| `importance` | | 1–10. Higher = larger emoji marker. Default 5. |

#### People Sheet
Every row/record maintains these columns. Columns marked `*` are required.

| Column | Required | Description |
|---|---|---|
| `id` | | Stable UUID. Auto-filled by the app. |
| `handle` | | Lowercase slug used for `@mention` linking from events (e.g. `julius_caesar`). Auto-derived from `name` if blank. |
| `name` | * | Full name as displayed in the UI. |
| `date_birth` | | `YYYY-MM-DD`. BCE uses a leading minus. |
| `date_death` | | `YYYY-MM-DD`. Blank if living or unknown. |
| `role` | | Monarch, general, philosopher, etc. |
| `event_ids` | | Comma-separated event `id` values (legacy; prefer `@handle` links on the event side). |
| `nationality` | | Country, empire, or civilisation (e.g. Roman, British). |
| `description` | | Why this person matters on the timeline. |
| `sources` | | URL or citation. |
| `image_url` | | Direct image URL. |
| `emoji` | | Optional marker. |
| `tags` | | Space-separated `#hashtags`. |
