# Three.js Projects

This directory contains interactive 3D experiences and WebGL experiments built with Three.js.

## Projects

- **2DaMoon** - Interactive 3D moon scene with realistic lighting and space environment
- **RapierPhysicSean** - Physics simulation with gravity orbs using Rapier physics engine  
- **TransISean** - Smooth scene transitions and visual effects showcase
- **Wormhole** - Journey through a dynamic wormhole with camera movement along spline curves

## Auto-Update System

This directory has its own auto-updating index.html that:

- Automatically scans for new Three.js projects
- Updates project descriptions and icons
- Maintains the same red/black/white theme as the main portfolio
- Includes a back navigation to the main portfolio

### Manual Update
```bash
cd 3ThreeJS
./update-threejs-index.sh
```

### Automatic Updates
The index is automatically updated when:
1. The main portfolio update script runs
2. Changes are pushed to the repository (via GitHub Action)

## Adding New Projects

When adding new Three.js projects:
1. Create a new directory in `3ThreeJS/`
2. Add an `index.html` file to make it discoverable
3. Update the descriptions array in `update-threejs-index.sh` if you want custom descriptions
4. The index will automatically update on the next script run