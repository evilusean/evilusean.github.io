/**
 * engine.js — Physics Engine
 * Pure numerical integration module with no DOM dependencies.
 * Exports: computeTrajectory(params), eulerStep(state, params)
 */

/**
 * Advance simulation by one Euler step.
 * @param {{ t:number, x:number, y:number, vx:number, vy:number, speed:number }} state
 * @param {{ angle:number, speed:number, mass:number, diameter:number, cd:number,
 *            rho:number, gravity:number, dt:number }} params
 * @returns {{ t:number, x:number, y:number, vx:number, vy:number, speed:number }}
 */
export function eulerStep(state, params) {
  const { mass, diameter, cd, rho, gravity, dt } = params;
  const { vx, vy } = state;

  // Cross-sectional area from diameter
  const A = Math.PI * (diameter / 2) ** 2;

  const v = state.speed;

  // Drag deceleration components (guard speed > 0 to avoid division by zero)
  let ax_drag = 0;
  let ay_drag = 0;
  if (v > 0) {
    const Fd = 0.5 * rho * v * v * cd * A;
    ax_drag = -(Fd / mass) * (vx / v);
    ay_drag = -(Fd / mass) * (vy / v);
  }

  // Total acceleration
  const ax = ax_drag;
  const ay = ay_drag - gravity;

  // Euler integration
  const vx_new = vx + ax * dt;
  const vy_new = vy + ay * dt;
  const x_new = state.x + vx * dt;
  const y_new = state.y + vy * dt;

  return {
    t: state.t + dt,
    x: x_new,
    y: y_new,
    vx: vx_new,
    vy: vy_new,
    speed: Math.sqrt(vx_new * vx_new + vy_new * vy_new),
  };
}

/**
 * Compute the full trajectory from launch until ground impact.
 * @param {{ angle:number, speed:number, mass:number, diameter:number, cd:number,
 *            rho:number, gravity:number, dt?:number }} params
 * @returns {Array<{ t:number, x:number, y:number, vx:number, vy:number, speed:number }>}
 */
export function computeTrajectory(params) {
  const dt = params.dt ?? 0.001;
  const fullParams = { ...params, dt };

  // Guard: invalid initial speed
  if (params.speed <= 0) return [];

  const theta = params.angle * Math.PI / 180;
  const vx0 = params.speed * Math.cos(theta);
  const vy0 = params.speed * Math.sin(theta);

  // Guard: no upward velocity at ground level
  if (vy0 <= 0 && 0 <= 0) return [];

  let state = { t: 0, x: 0, y: 0, vx: vx0, vy: vy0, speed: params.speed };
  const trajectory = [state];
  const MAX_STATES = 1_000_000;

  while (trajectory.length < MAX_STATES) {
    const prev = trajectory[trajectory.length - 1];
    const next = eulerStep(prev, fullParams);

    if (next.y <= 0) {
      // Linear interpolation to land exactly at y = 0
      const f = prev.y / (prev.y - next.y);
      const terminal = {
        t: prev.t + f * (next.t - prev.t),
        x: prev.x + f * (next.x - prev.x),
        y: 0,
        vx: prev.vx + f * (next.vx - prev.vx),
        vy: prev.vy + f * (next.vy - prev.vy),
        speed: 0,
      };
      terminal.speed = Math.sqrt(terminal.vx ** 2 + terminal.vy ** 2);
      trajectory.push(terminal);
      break;
    }

    trajectory.push(next);
  }

  return trajectory;
}
