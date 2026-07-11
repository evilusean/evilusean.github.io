/**
 * renderer.js — Canvas Animation & Chart.js Trajectory Plot
 * Pure rendering module with no physics calculations.
 * Exports: computeScaleInfo, drawFrame, updatePlot
 */

/**
 * Compute coordinate-transform info from a trajectory and canvas dimensions.
 * @param {Array} trajectory
 * @param {number} canvasW
 * @param {number} canvasH
 * @returns {{ scaleX, scaleY, offsetX, offsetY, maxX, maxY }}
 */
export function computeScaleInfo(trajectory, canvasW, canvasH) {
  if (!trajectory || trajectory.length === 0) {
    return { scaleX: 1, scaleY: 1, offsetX: canvasW * 0.05, offsetY: canvasH * 0.95, maxX: 1, maxY: 1 };
  }

  let maxX = 0;
  let maxY = 0;
  for (const s of trajectory) {
    if (s.x > maxX) maxX = s.x;
    if (s.y > maxY) maxY = s.y;
  }

  // Safety guard for degenerate trajectories
  if (maxX <= 0) maxX = 1;
  if (maxY <= 0) maxY = 1;

  const scaleX = (canvasW * 0.90) / maxX;
  const scaleY = (canvasH * 0.85) / maxY;
  const offsetX = canvasW * 0.05;
  const offsetY = canvasH * 0.95;

  return { scaleX, scaleY, offsetX, offsetY, maxX, maxY };
}

/**
 * Draw one animation frame on the canvas.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x:number, y:number }} point         Current projectile position
 * @param {Array} trail                           Last ≤200 positions (oldest first)
 * @param {{ scaleX, scaleY, offsetX, offsetY, maxX }} scaleInfo
 * @param {string|null} category                 'sports'|'firearms'|'ordnance'|null
 * @param {boolean} showLanding                  Whether to render landing overlay
 * @param {number} range                         Total range in metres (for overlay)
 */
export function drawFrame(ctx, point, trail, scaleInfo, category, showLanding, range) {
  const { scaleX, scaleY, offsetX, offsetY, maxX } = scaleInfo;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // Coordinate helpers
  const cx = (physX) => offsetX + physX * scaleX;
  const cy = (physY) => offsetY - physY * scaleY;

  // Clear
  ctx.clearRect(0, 0, W, H);

  // Ground line
  ctx.save();
  ctx.strokeStyle = '#6b7280'; // gray-500
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, cy(0));
  ctx.lineTo(W, cy(0));
  ctx.stroke();
  ctx.restore();

  // X-axis distance markers (5 evenly spaced)
  ctx.save();
  ctx.fillStyle = '#9ca3af'; // gray-400
  ctx.font = `${Math.max(10, W * 0.018)}px sans-serif`;
  ctx.textAlign = 'center';
  for (let i = 0; i <= 4; i++) {
    const physX = (maxX * i) / 4;
    const px = cx(physX);
    const py = cy(0);
    ctx.beginPath();
    ctx.moveTo(px, py - 4);
    ctx.lineTo(px, py + 4);
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText(`${physX.toFixed(0)}m`, px, py + 16);
  }
  ctx.restore();

  // Fading trail
  if (trail.length > 0) {
    const k = trail.length;
    for (let i = 0; i < k; i++) {
      const alpha = k === 1 ? 1.0 : i / (k - 1);
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.fillStyle = '#60a5fa'; // blue-400
      ctx.beginPath();
      ctx.arc(cx(trail[i].x), cy(trail[i].y), 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Projectile shape
  const px = cx(point.x);
  const py = cy(point.y);
  const r = Math.max(5, W * 0.012);

  ctx.save();
  ctx.fillStyle = '#f97316'; // orange-500

  if (category === 'firearms') {
    // Elongated capsule (3:1 length-to-width ratio)
    const capW = r * 0.7;
    const capH = r * 2.1;
    ctx.beginPath();
    ctx.ellipse(px, py, capW, capH, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (category === 'ordnance') {
    // Triangle
    ctx.beginPath();
    ctx.moveTo(px, py - r * 1.2);
    ctx.lineTo(px + r, py + r * 0.8);
    ctx.lineTo(px - r, py + r * 0.8);
    ctx.closePath();
    ctx.fill();
  } else {
    // Circle (sports or default)
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Landing overlay
  if (showLanding) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    const overlayH = H * 0.12;
    ctx.fillRect(0, H * 0.44, W, overlayH);
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.font = `bold ${Math.max(12, W * 0.028)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `Landed at x = ${point.x.toFixed(1)} m  |  Range: ${range.toFixed(1)} m`,
      W / 2,
      H * 0.44 + overlayH / 2 + 6
    );
    ctx.restore();
  }
}

/**
 * Refresh Chart.js dataset(s) with new trajectory data.
 * @param {Chart} chart
 * @param {Array} trajectoryData
 * @param {'vacuum'|'realistic'} mode
 * @param {boolean} compareMode   True when both datasets should be shown
 */
export function updatePlot(chart, trajectoryData, mode, compareMode) {
  if (!chart) return;

  const vacuumColor = 'rgba(59,130,246,1)';   // blue-500
  const realisticColor = 'rgba(249,115,22,1)'; // orange-500

  const toPoints = (traj) => traj.map((s) => ({ x: s.x, y: s.y }));

  if (!trajectoryData || trajectoryData.length === 0) {
    chart.data.datasets = [];
    chart.options.plugins.annotation = { annotations: {} };
    chart.update('none');
    return;
  }

  const points = toPoints(trajectoryData);
  const peak = trajectoryData.reduce((m, s) => (s.y > m.y ? s : m), trajectoryData[0]);
  const landing = trajectoryData[trajectoryData.length - 1];

  const annotations = {
    peak: {
      type: 'point',
      xValue: peak.x,
      yValue: peak.y,
      backgroundColor: 'rgba(250,204,21,0.8)',
      radius: 5,
      label: {
        display: true,
        content: `(${peak.x.toFixed(1)}m, ${peak.y.toFixed(1)}m)`,
        position: 'top',
        color: '#fde68a',
        font: { size: 11 },
      },
    },
    landing: {
      type: 'point',
      xValue: landing.x,
      yValue: 0,
      backgroundColor: 'rgba(74,222,128,0.8)',
      radius: 5,
      label: {
        display: true,
        content: `(${landing.x.toFixed(1)}m, 0m)`,
        position: 'top',
        color: '#86efac',
        font: { size: 11 },
      },
    },
  };

  const maxX = Math.max(...trajectoryData.map((s) => s.x)) * 1.05;
  const maxY = Math.max(...trajectoryData.map((s) => s.y)) * 1.1;

  if (compareMode && chart.data.datasets.length === 2) {
    // Update the dataset for the current mode only
    const idx = mode === 'vacuum' ? 0 : 1;
    chart.data.datasets[idx].data = points;
  } else {
    const color = mode === 'vacuum' ? vacuumColor : realisticColor;
    const label = mode === 'vacuum' ? 'Vacuum' : 'Realistic';
    chart.data.datasets = [
      {
        label,
        data: points,
        borderColor: color,
        backgroundColor: color.replace(',1)', ',0.15)'),
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: true,
      },
    ];
  }

  chart.options.scales.x.max = maxX;
  chart.options.scales.y.max = maxY;

  if (chart.options.plugins.annotation) {
    chart.options.plugins.annotation.annotations = annotations;
  }

  chart.update('none');
}

/**
 * Create and return a new Chart.js instance bound to the given canvas.
 * @param {HTMLCanvasElement} canvas
 * @returns {Chart}
 */
export function createChart(canvas) {
  return new Chart(canvas, {
    type: 'scatter',
    data: { datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      parsing: false,
      scales: {
        x: {
          type: 'linear',
          min: 0,
          title: { display: true, text: 'Distance (m)', color: '#9ca3af' },
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(255,255,255,0.07)' },
        },
        y: {
          type: 'linear',
          min: 0,
          title: { display: true, text: 'Altitude (m)', color: '#9ca3af' },
          ticks: { color: '#9ca3af' },
          grid: { color: 'rgba(255,255,255,0.07)' },
        },
      },
      plugins: {
        legend: { labels: { color: '#d1d5db' } },
        annotation: { annotations: {} },
        tooltip: { mode: 'nearest', intersect: false },
      },
      elements: { point: { radius: 0 } },
    },
  });
}
