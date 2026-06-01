# Solar Analysis App Specification

## Overview
A client-side static web application designed to compute solar positioning and project passive solar heat gain/sunlight duration for property planning, based on permaculture design principles [00:08:21].

## Technical Stack
* **Core:** Vanilla JavaScript (ES6+).
* **UI/Styling:** Tailwind CSS (via CDN).
* **Computation:** [SunCalc](https://github.com/mourner/suncalc) logic for seasonal sun altitude and azimuth.
* **Hosting:** GitHub Pages.

## Core Features
1.  **Passive Solar Engine:** Calculate the solar gain potential of a structure based on its elongation axis (East-West is optimal for Northern Hemisphere heating) 
2.  **Overhang/Tree Simulation:** Calculate the necessary overhang size to block high-angle summer sun while allowing low-angle winter sun [00:03:00].
3.  **Site Planning Module:** * Simulate "Sun Arcs" for the Summer and Winter Solstices 
    * Provide recommendations for deciduous vs. evergreen tree placement to regulate building temperature 
    
## Directory Structure
* `/index.html` - Passive Solar Calculator dashboard.
* `/assets/js/solar-engine.js` - Logic for seasonal sun pathing [00:01:10].
* `/assets/css/style.css` - UI layout.
* `/docs/` - GitHub Pages deployment files.

## Passive Solar Mathematical Basis
* **Winter Gain:** $\text{Heat Gain} \propto \text{Window Area} \times \cos(\theta_{winter})$ where $\theta$ is the low sun angle.
* **Summer Cooling:** Utilize overhangs calculated to intercept sun angles at $\phi + 23.5^\circ$ where $\phi$ is site latitude 