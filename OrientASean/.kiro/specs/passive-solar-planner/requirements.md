# Requirements Document

## Introduction

The Passive Solar Planner is a client-side static web application that computes solar positioning and projects passive solar heat gain, sunlight duration, and shading for residential and agricultural property planning. It is grounded in permaculture design principles and uses the SunCalc library for solar geometry calculations. The application expands an existing scaffold (latitude/longitude input with basic SunCalc output) into a full passive solar analysis tool covering structural orientation, overhang sizing, sun arc visualization, and tree placement recommendations.

## Glossary

- **Solar_Engine**: The JavaScript module (`solar-engine.js`) responsible for all solar geometry and heat-gain computations.
- **Site_Planner**: The module responsible for sun arc visualization, shadow projection, and tree placement recommendations.
- **UI**: The browser-based user interface rendered in `index.html` and styled via Tailwind CSS.
- **SunCalc**: The third-party JavaScript library (`suncalc@1.9.0`) used to calculate sun position (altitude and azimuth) for a given date, time, and geographic coordinate.
- **Latitude**: The geographic north–south coordinate of the site, expressed in decimal degrees (−90 to +90).
- **Longitude**: The geographic east–west coordinate of the site, expressed in decimal degrees (−180 to +180).
- **Solar_Altitude**: The angle of the sun above the horizon, expressed in degrees.
- **Solar_Azimuth**: The compass bearing of the sun measured clockwise from north, expressed in degrees (0–360).
- **Summer_Solstice**: The date of maximum solar declination (+23.5°), approximately June 21 in the Northern Hemisphere.
- **Winter_Solstice**: The date of minimum solar declination (−23.5°), approximately December 21 in the Northern Hemisphere.
- **Passive_Solar_Gain**: The heat energy admitted through south-facing glazing, proportional to Window Area × cos(θ_winter), where θ_winter is the winter solar altitude angle at solar noon.
- **Overhang**: A horizontal projection above a south-facing window that intercepts high summer sun angles while allowing lower winter sun angles to enter.
- **Overhang_Depth**: The horizontal distance from the wall face to the outer edge of the overhang, in user-selected units (metres or feet).
- **Sun_Arc**: The path traced by the sun across the sky over the course of a day, rendered as a polyline on a top-down site canvas.
- **Deciduous_Tree**: A tree that sheds its leaves in autumn, providing summer shade and allowing winter sun transmission.
- **Evergreen_Tree**: A tree that retains its foliage year-round, providing persistent wind blocking and shade.
- **Northern_Hemisphere**: The half of Earth north of the equator, where south-facing orientations maximise solar gain and the Summer_Solstice sun elevation equals φ + 23.5°.
- **Southern_Hemisphere**: The half of Earth south of the equator, where north-facing orientations maximise solar gain and adjustments to azimuth recommendations are required.
- **Elongation_Axis**: The long axis of a building footprint; an East–West Elongation_Axis maximises south-facing wall area for passive solar heating in the Northern_Hemisphere.

---

## Requirements

### Requirement 1: Site Input and Coordinate Validation

**User Story:** As a property planner, I want to enter or detect the geographic coordinates of my site, so that all solar calculations are specific to my location.

#### Acceptance Criteria

1. THE UI SHALL provide numeric input fields for Latitude (−90 to +90) and Longitude (−180 to +180).
2. WHEN the user submits coordinates outside the range [−90, +90] for Latitude or [−180, +180] for Longitude, THE UI SHALL display a descriptive validation error and prevent calculation.
3. WHEN the user activates geolocation, THE UI SHALL request the browser Geolocation API and populate the Latitude and Longitude fields with the returned values.
4. IF the browser Geolocation API returns an error, THEN THE UI SHALL display the error reason and allow the user to enter coordinates manually.
5. THE UI SHALL allow the user to select metric (metres) or imperial (feet) units, and THE Solar_Engine SHALL use the selected unit for all distance outputs.

---

### Requirement 2: Passive Solar Gain Calculator

**User Story:** As a building designer, I want to calculate the passive solar heat gain potential for a structure, so that I can optimise window area and building orientation for winter heating.

#### Acceptance Criteria

1. WHEN the user provides a Latitude, window area, and building orientation angle, THE Solar_Engine SHALL compute the Winter_Solstice solar noon Solar_Altitude using SunCalc.
2. THE Solar_Engine SHALL calculate Passive_Solar_Gain as: `Gain = Window_Area × cos(θ_winter)`, where θ_winter is the Solar_Altitude at solar noon on the Winter_Solstice.
3. THE Solar_Engine SHALL calculate a Relative_Gain_Ratio as the ratio of the computed Passive_Solar_Gain to the theoretical maximum gain (orientation = 0° deviation from optimal), expressed as a percentage.
4. WHEN the building orientation deviates from the optimal axis by more than 30°, THE UI SHALL display a warning indicating reduced solar gain.
5. WHERE the site is in the Southern_Hemisphere (Latitude < 0), THE Solar_Engine SHALL treat north-facing orientation as optimal and adjust azimuth calculations accordingly.
6. THE UI SHALL display the computed Passive_Solar_Gain value, Relative_Gain_Ratio, and optimal orientation recommendation.

---

### Requirement 3: Overhang and Shading Calculator

**User Story:** As a building designer, I want to calculate the required overhang depth for a south-facing window, so that summer sun is blocked while winter sun is admitted.

#### Acceptance Criteria

1. WHEN the user provides a Latitude and window height, THE Solar_Engine SHALL compute the Summer_Solstice solar noon Solar_Altitude as `φ + 23.5°` (capped at 90°), where φ is the site Latitude in degrees.
2. WHEN the user provides a Latitude and window height, THE Solar_Engine SHALL compute the Winter_Solstice solar noon Solar_Altitude as `φ − 23.5°` (floored at 0°).
3. THE Solar_Engine SHALL calculate the minimum Overhang_Depth required to fully shade the window at the Summer_Solstice solar altitude using the formula: `Depth = Window_Height / tan(Solar_Altitude_Summer)`.
4. THE Solar_Engine SHALL calculate the maximum Overhang_Depth that still permits full Winter_Solstice sun penetration to the window sill: `Depth_max = Window_Height / tan(Solar_Altitude_Winter)`.
5. IF the computed Summer_Solstice Solar_Altitude is 0° or below (polar regions), THEN THE Solar_Engine SHALL return an error indicating that overhang calculation is not applicable.
6. THE UI SHALL display the recommended Overhang_Depth range (minimum to maximum) in the user-selected units.

---

### Requirement 4: Sun Arc Visualisation

**User Story:** As a site planner, I want to see the sun's path across my property on Summer and Winter Solstice days, so that I can identify shaded and sunlit zones throughout the day.

#### Acceptance Criteria

1. WHEN the user triggers sun arc generation, THE Site_Planner SHALL compute Solar_Altitude and Solar_Azimuth for every 30-minute interval from sunrise to sunset on the Summer_Solstice and Winter_Solstice using SunCalc.
2. THE Site_Planner SHALL render both Sun_Arcs as polylines on a top-down 2D canvas element within the UI, with the Summer_Solstice arc visually distinct from the Winter_Solstice arc (e.g. different colours).
3. THE Site_Planner SHALL label sunrise, solar noon, and sunset positions on each Sun_Arc.
4. WHEN the user hovers over a point on a Sun_Arc, THE UI SHALL display the time, Solar_Altitude, and Solar_Azimuth for that point.
5. THE Site_Planner SHALL orient the canvas so that north is at the top and the property centre is at the canvas centre.
6. THE UI SHALL include a scale indicator on the canvas showing the relationship between canvas pixels and real-world distance in the user-selected units.

---

### Requirement 5: Tree Placement Recommendations

**User Story:** As a permaculture designer, I want recommendations on where to place deciduous and evergreen trees relative to my building, so that I can regulate indoor temperature naturally across seasons.

#### Acceptance Criteria

1. WHEN the user triggers tree placement analysis, THE Site_Planner SHALL compute the summer and winter shadow zones for a default tree height (user-configurable, default 6 m / 20 ft).
2. THE Site_Planner SHALL recommend planting Deciduous_Trees within the computed summer shadow zone on the south and west sides of the building (Northern_Hemisphere) or north and west sides (Southern_Hemisphere).
3. THE Site_Planner SHALL recommend planting Evergreen_Trees within the computed winter wind-buffering zone on the north and northwest sides of the building (Northern_Hemisphere) or south and southwest sides (Southern_Hemisphere).
4. THE UI SHALL render the recommended planting zones as coloured overlay regions on the site canvas produced in Requirement 4.
5. THE UI SHALL provide a legend explaining the colour coding for Deciduous_Tree zones, Evergreen_Tree zones, and Sun_Arcs.
6. WHERE the user configures a custom tree height, THE Site_Planner SHALL recompute and re-render the recommended planting zones using the new height.

---

### Requirement 6: Seasonal Sunlight Duration Summary

**User Story:** As a property planner, I want to know how many hours of direct sunlight my site receives on solstice days, so that I can plan planting zones and energy usage accordingly.

#### Acceptance Criteria

1. WHEN the user provides site coordinates, THE Solar_Engine SHALL compute sunrise and sunset times for the Summer_Solstice and Winter_Solstice using SunCalc.
2. THE Solar_Engine SHALL calculate sunlight duration as the elapsed time between sunrise and sunset for each solstice, expressed in hours and minutes.
3. THE UI SHALL display the Summer_Solstice and Winter_Solstice sunlight durations alongside the sun arc visualisation.
4. IF the site Latitude is above 66.5° or below −66.5° (polar circles), THEN THE Solar_Engine SHALL detect polar day or polar night conditions and THE UI SHALL display an appropriate message instead of a duration.

---

### Requirement 7: Results Export

**User Story:** As a planner, I want to save or share my site analysis results, so that I can refer to them offline or include them in a design document.

#### Acceptance Criteria

1. WHEN the user activates the export function, THE UI SHALL generate a PNG image of the site canvas including Sun_Arcs, planting zones, and labels.
2. WHEN the user activates the export function, THE UI SHALL generate a plain-text summary of all computed values (Passive_Solar_Gain, Overhang_Depth range, sunlight durations, and tree placement recommendations).
3. THE UI SHALL provide a button to download the PNG and a button to download the plain-text summary as a `.txt` file.
4. IF the canvas has not been rendered (no analysis has been run), THEN THE UI SHALL disable the export buttons and display an instructional message.

---

### Requirement 8: Application Layout and Responsiveness

**User Story:** As a user on any device, I want the application to be usable on desktop and mobile screens, so that I can perform site analysis in the field.

#### Acceptance Criteria

1. THE UI SHALL be styled using Tailwind CSS loaded via CDN and SHALL NOT require a build step.
2. THE UI SHALL render correctly and remain fully functional at viewport widths from 320 px to 2560 px.
3. THE UI SHALL load and become interactive within 5 seconds on a broadband connection (≥ 1 Mbps download) without a service worker or build pipeline.
4. THE UI SHALL load all JavaScript and CSS dependencies from CDN URLs and SHALL NOT require any server-side processing.
5. WHEN JavaScript is disabled in the browser, THE UI SHALL display a message stating that JavaScript is required for the application to function.
