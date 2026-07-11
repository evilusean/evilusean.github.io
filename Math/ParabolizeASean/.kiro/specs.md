project_name: BallisticsSim
version: 1.0.0
type: StaticWeb
hosting: GitHubPages
libraries:
  - TailwindCSS (Styling)
  - Chart.js (Trajectory Plotting)
  - KaTeX (Equation Rendering)
data_schema:
  projectile:
    mass: float (kg)
    diameter: float (m)
    cd: float (drag coefficient)
presets_included:
  - sports: [Golf, Basketball, Baseball, PingPong]
  - firearms: [.22LR, 5.56NATO, .45ACP]
  - ordnance: [Mortar60mm, Cannonball, RocketMissile]
features:
  - numerical_integration_engine
  - environment_config (air_density, gravity)
  - dynamic_charting
  - physics_formula_breakdown