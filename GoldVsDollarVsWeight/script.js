const state = {
  snapshots: [],
  selectedSnapshot: null,
  denomination: 20,
  goldOunces: 1,
  isAnimating: false,
  animationTimer: null,
  animationIndex: 0,
};

const elements = {};

window.addEventListener('DOMContentLoaded', init);

function init() {
  elements.snapshotSelect = document.getElementById('snapshotSelect');
  elements.goldAmount = document.getElementById('goldAmount');
  elements.visualizer = document.getElementById('visualizer');
  elements.stats = document.getElementById('stats');
  elements.contractVisual = document.getElementById('contractVisual');
  elements.historyChart = document.getElementById('historyChart');
  elements.animateButton = document.getElementById('animateButton');

  elements.snapshotSelect.addEventListener('change', handleSnapshotChange);
  elements.goldAmount.addEventListener('input', handleGoldAmountChange);
  document.querySelectorAll('.toggle').forEach((button) => {
    button.addEventListener('click', () => {
      state.denomination = Number(button.dataset.denomination);
      document.querySelectorAll('.toggle').forEach((item) => item.classList.toggle('active', item === button));
      renderDashboard();
    });
  });
  elements.animateButton.addEventListener('click', toggleAnimation);

  fetchData();
}

async function fetchData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Unable to fetch data.json (${response.status})`);
    }

    const snapshots = await response.json();
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
      throw new Error('data.json does not contain any snapshots.');
    }

    state.snapshots = snapshots;
    populateSnapshotSelect();
    state.selectedSnapshot = state.snapshots[0];
    elements.snapshotSelect.value = state.selectedSnapshot.yearMonth;
    renderDashboard();
  } catch (error) {
    console.error(error);
    elements.stats.innerHTML = '<p class="error">Unable to load the historical dashboard data.</p>';
  }
}

function populateSnapshotSelect() {
  elements.snapshotSelect.innerHTML = state.snapshots
    .map((snapshot) => `<option value="${snapshot.yearMonth}">${formatLabel(snapshot.yearMonth)}</option>`)
    .join('');
}

function handleSnapshotChange() {
  state.selectedSnapshot = state.snapshots.find((snapshot) => snapshot.yearMonth === elements.snapshotSelect.value) || state.snapshots[0];
  renderDashboard();
}

function handleGoldAmountChange() {
  const parsed = Number(elements.goldAmount.value);
  state.goldOunces = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  elements.goldAmount.value = state.goldOunces.toString();
  renderDashboard();
}

function toggleAnimation() {
  if (state.isAnimating) {
    clearInterval(state.animationTimer);
    state.isAnimating = false;
    state.animationTimer = null;
    elements.animateButton.textContent = 'Animate History';
    return;
  }

  state.isAnimating = true;
  elements.animateButton.textContent = 'Pause History';
  state.animationIndex = state.snapshots.findIndex((snapshot) => snapshot.yearMonth === elements.snapshotSelect.value);
  if (state.animationIndex < 0) {
    state.animationIndex = 0;
  }

  state.animationTimer = window.setInterval(() => {
    state.animationIndex = (state.animationIndex + 1) % state.snapshots.length;
    const nextSnapshot = state.snapshots[state.animationIndex];
    state.selectedSnapshot = nextSnapshot;
    elements.snapshotSelect.value = nextSnapshot.yearMonth;
    renderDashboard();
  }, 1400);
}

function renderDashboard() {
  if (!state.selectedSnapshot) {
    return;
  }

  const metrics = calculateMetrics(state.selectedSnapshot);
  renderStats(metrics);
  renderComparison(metrics);
  renderContract(metrics);
  renderHistoryChart(metrics);

  elements.animateButton.textContent = state.isAnimating ? 'Pause History' : 'Animate History';
}

function calculateMetrics(snapshot) {
  const goldPrice = Number(snapshot.goldPrice);
  const silverPrice = Number(snapshot.silverPrice);
  const coverageRatio = Number(snapshot.comexCoverageRatio);
  const goldOunces = state.goldOunces;

  const goldValueUsd = goldOunces * goldPrice;
  const billsNeeded = goldValueUsd / state.denomination;
  const goldWeightGrams = goldOunces * 31.1034768;
  const goldWeightKg = goldWeightGrams / 1000;
  const paperWeightKg = billsNeeded / 1000;
  const weightBurden = paperWeightKg / goldWeightKg;
  const goldToSilverRatio = goldPrice / silverPrice;
  const paperPerPhysical = coverageRatio > 0 ? 1 / coverageRatio : 0;
  const goldScale = clamp(90, 320, 80 + goldOunces * 18);
  const billScale = clamp(90, 320, 72 + billsNeeded * 0.65);

  return {
    snapshot,
    goldValueUsd,
    billsNeeded,
    goldWeightKg,
    paperWeightKg,
    weightBurden,
    goldToSilverRatio,
    paperPerPhysical,
    goldScale,
    billScale,
    denomination: state.denomination,
  };
}

function renderStats(metrics) {
  const cards = [
    {
      label: 'Weight burden',
      value: `${metrics.paperWeightKg.toFixed(2)} kg vs ${metrics.goldWeightKg.toFixed(2)} kg`,
      detail: `${state.denomination === 20 ? '$20' : '$100'} bills weigh ${metrics.weightBurden.toFixed(1)}x more than the same dollar value of gold.`,
    },
    {
      label: 'Gold / silver ratio',
      value: `${metrics.goldToSilverRatio.toFixed(1)}:1`,
      detail: `One ounce of gold buys ${metrics.goldToSilverRatio.toFixed(1)} ounces of silver at this snapshot.`,
    },
    {
      label: 'Paper / physical gap',
      value: `${metrics.paperPerPhysical.toFixed(1)}:1`,
      detail: `Each physical ounce is paired with roughly ${metrics.paperPerPhysical.toFixed(1)} paper ounces under the current coverage ratio.`,
    },
  ];

  elements.stats.innerHTML = `
    <div class="stats-grid">
      ${cards
        .map(
          (card) => `
            <article class="stat-card">
              <div class="label">${card.label}</div>
              <div class="value">${card.value}</div>
              <div class="detail">${card.detail}</div>
            </article>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderComparison(metrics) {
  const svg = elements.visualizer;
  svg.innerHTML = '';

  const width = 900;
  const height = 460;
  const centerLine = 450;

  const layer = createSvgElement('svg', { viewBox: `0 0 ${width} ${height}`, width, height });
  layer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const background = createSvgElement('rect', {
    x: 0,
    y: 0,
    width,
    height,
    rx: 22,
    fill: '#08131e',
  });
  layer.appendChild(background);

  const title = createSvgElement('text', {
    x: 40,
    y: 40,
    fill: '#f7c948',
    'font-size': 20,
    'font-weight': 700,
  });
  title.textContent = `${formatLabel(metrics.snapshot.yearMonth)} · $${Number(metrics.snapshot.goldPrice).toLocaleString()} / oz gold`;
  layer.appendChild(title);

  const goldX = 90;
  const goldY = 120;
  const goldW = 180;
  const goldH = metrics.goldScale;
  const goldRect = createSvgElement('rect', {
    x: goldX,
    y: goldY + (320 - goldH),
    width: goldW,
    height: goldH,
    rx: 18,
    fill: 'url(#goldFill)',
    stroke: '#f7c948',
    'stroke-width': 4,
  });
  layer.appendChild(goldRect);

  const goldGradient = createSvgElement('linearGradient', { id: 'goldFill', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
  goldGradient.innerHTML = '<stop offset="0%" stop-color="#ffe28f" /><stop offset="100%" stop-color="#8b5a00" />';
  layer.appendChild(goldGradient);

  const goldLabel = createSvgElement('text', {
    x: goldX + goldW / 2,
    y: 420,
    fill: '#f7c948',
    'font-size': 16,
    'font-weight': 600,
    'text-anchor': 'middle',
  });
  goldLabel.textContent = `${state.goldOunces} oz gold = ${metrics.goldWeightKg.toFixed(2)} kg`;
  layer.appendChild(goldLabel);

  const billX = 590;
  const billY = 120;
  const billW = 180;
  const billH = metrics.billScale;
  const billStack = createSvgElement('rect', {
    x: billX,
    y: 440 - billH,
    width: billW,
    height: billH,
    rx: 16,
    fill: '#cbd5e1',
    stroke: '#f8fafc',
    'stroke-width': 3,
  });
  layer.appendChild(billStack);

  const billRows = 10;
  for (let i = 0; i < billRows; i += 1) {
    const rowHeight = (billH - 12) / billRows;
    const rowY = 440 - billH + 6 + i * rowHeight;
    const row = createSvgElement('rect', {
      x: billX + 10,
      y: rowY,
      width: billW - 20,
      height: Math.max(8, rowHeight - 4),
      rx: 6,
      fill: i % 2 === 0 ? '#f8fafc' : '#94a3b8',
    });
    layer.appendChild(row);
  }

  const billLabel = createSvgElement('text', {
    x: billX + billW / 2,
    y: 420,
    fill: '#e2e8f0',
    'font-size': 16,
    'font-weight': 600,
    'text-anchor': 'middle',
  });
  billLabel.textContent = `${Math.round(metrics.billsNeeded).toLocaleString()} ${state.denomination === 20 ? '$20' : '$100'} bills`;
  layer.appendChild(billLabel);

  const note = createSvgElement('text', {
    x: centerLine,
    y: 440,
    fill: '#94a3b8',
    'font-size': 14,
    'text-anchor': 'middle',
  });
  note.textContent = 'The paper stack grows as the same gold ounce buys more fiat than it once did.';
  layer.appendChild(note);

  svg.appendChild(layer);
}

function renderContract(metrics) {
  const iconCount = Math.max(1, Math.min(120, Math.round(metrics.paperPerPhysical)));
  const ratioLabel = `${metrics.paperPerPhysical.toFixed(1)}:1`;

  elements.contractVisual.innerHTML = `
    <div class="contract-meter">
      <div class="contract-pill">${ratioLabel} paper-to-physical</div>
      <div class="contract-row">
        <div class="contract-gold">
          <span class="contract-gold-bar"></span>
          <div>1 gold bar</div>
        </div>
        <div class="contract-list" aria-label="Paper contract icons">
          ${Array.from({ length: iconCount })
            .map(() => '<span class="contract-icon">📜</span>')
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderHistoryChart(metrics) {
  const width = 860;
  const height = 220;
  const padding = 36;
  const series = state.snapshots.map((snapshot) => calculateBillEquivalent(snapshot, state.denomination));
  const maxValue = Math.max(...series);
  const minValue = Math.min(...series);
  const span = maxValue - minValue || 1;
  const points = series
    .map((value, index) => {
      const x = padding + (index / Math.max(1, series.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - minValue) / span) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const selectedIndex = state.snapshots.findIndex((snapshot) => snapshot.yearMonth === metrics.snapshot.yearMonth);
  const selectedX = padding + (selectedIndex / Math.max(1, series.length - 1)) * (width - padding * 2);
  const selectedY = height - padding - ((series[selectedIndex] - minValue) / span) * (height - padding * 2);

  elements.historyChart.innerHTML = `
    <h2>Historical bill-equivalent trend</h2>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Historical bill-equivalent trend chart">
      <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="#08131e"></rect>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <polyline fill="none" stroke="#f59e0b" stroke-width="3" points="${points}"></polyline>
      <circle cx="${selectedX}" cy="${selectedY}" r="6" fill="#f7c948"></circle>
      <text x="${padding}" y="20" fill="#f7c948" font-size="13">${state.denomination === 20 ? '$20 bill equivalent' : '$100 bill equivalent'}</text>
      <text x="${width - padding}" y="${height - 10}" fill="#94a3b8" font-size="12" text-anchor="end">1900 → 2025</text>
    </svg>
  `;
}

function calculateBillEquivalent(snapshot, denomination) {
  const goldPrice = Number(snapshot.goldPrice);
  const goldValueUsd = 1 * goldPrice;
  return goldValueUsd / denomination;
}

function createSvgElement(tag, attrs) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value));
}

function formatLabel(yearMonth) {
  const [year, month] = yearMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en', {
    month: 'short',
    year: 'numeric',
  });
}
