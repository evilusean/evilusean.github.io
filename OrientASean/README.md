# OrientASean — Passive Solar Planner

A client-side passive solar analysis tool for residential and permaculture site planning. No server, no build step — open `index.html` in a browser and go.

## What it does

Enter your site's coordinates (or use the geolocation button) along with a few building measurements, hit **Analyze Site**, and the app computes:

- **Passive solar gain** — how much winter sun energy your windows admit, and how close your building orientation is to the theoretical maximum
- **Overhang sizing** — the min/max depth for a south-facing overhang that blocks summer sun while letting winter sun in
- **Sun arc visualisation** — a top-down canvas showing the sun's path across your site on both the summer and winter solstice, with compass rose and scale bar
- **Seasonal sunlight duration** — hours and minutes of daylight on each solstice (polar day/night detected automatically)
- **Tree placement zones** — where to put deciduous trees (summer shade) and evergreen trees (winter wind buffering), colour-coded on the canvas

Results are hemisphere-aware — Southern Hemisphere sites get mirrored orientation and planting recommendations automatically.

## Inputs

| Field | Description | Default |
|---|---|---|
| Latitude | −90 to +90 decimal degrees | required |
| Longitude | −180 to +180 decimal degrees | required |
| Window Area | Total south-facing glazing area | 6 m² / 20 ft² |
| Window Height | Height of the window opening | 1.2 m / 4 ft |
| Building Orientation | Compass bearing of the main wall (0 = north) | 180° |
| Tree Height | Reference tree height for shadow calculations | 6 m / 20 ft |
| Units | Metric (metres) or Imperial (feet) | Metric |

## Exports

After running an analysis, two export buttons unlock:

- **Download PNG** — saves the canvas visualisation as an image
- **Download .txt** — saves a plain-text report with all computed values

## Technical notes

- Pure client-side — no server, no build pipeline, no npm install required
- Dependencies loaded from CDN: [SunCalc 1.9.0](https://unpkg.com/suncalc@1.9.0/suncalc.js) for solar geometry, [Tailwind CSS Play CDN](https://cdn.tailwindcss.com) for styling
- Four ES modules: `solar-engine.js` (pure math), `site-planner.js` (arc + shadow geometry), `canvas-renderer.js` (drawing), `app.js` (DOM wiring)
- Responsive from 320 px to 2560 px — sidebar stacks below canvas on mobile

## Running locally

Just open `index.html` directly in a browser. If you want a local dev server to avoid CORS quirks with ES modules:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.


## Future Sean / ToDo's : 
- Burned through all my tokens 
- It's hard to read, works, burned all my tokens writing tests and doing tests, so next time explicitly say 'ignore the tests'
- Add a marker showing the front of the house (where the main bay window is)
- show a marker for base place to plant a garden for maximum sunlight and what direction
- add indicators for summer sun and winter sun
- add defaults for window area/height and maybe an optimized 
- use my location doesn't work
- make it more obvious where the house should be placed with windows and garden
- add a feature that shows the degree offset from north and placement of house (if the house was facing north with the main bay window facing that direction, how much would you turn in degrees and what direction)