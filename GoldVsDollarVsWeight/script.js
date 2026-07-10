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
  elements.yearSelect = document.getElementById('yearSelect');
  elements.monthSelect = document.getElementById('monthSelect');
  elements.goldAmount = document.getElementById('goldAmount');
  elements.manualGoldPrice = document.getElementById('manualGoldPrice');
  elements.manualSilverPrice = document.getElementById('manualSilverPrice');
  elements.manualCalcAmount = document.getElementById('manualCalcAmount');
  elements.priceStartYear = document.getElementById('priceStartYear');
  elements.priceStartMonth = document.getElementById('priceStartMonth');
  elements.priceEndYear = document.getElementById('priceEndYear');
  elements.priceEndMonth = document.getElementById('priceEndMonth');
  elements.visualizer = document.getElementById('visualizer');
  elements.stats = document.getElementById('stats');
  elements.contractVisual = document.getElementById('contractVisual');
  elements.historyChart = document.getElementById('historyChart');
  elements.historyChartTooltip = document.getElementById('historyChartTooltip');
  elements.priceChart = document.getElementById('priceChart');
  elements.priceChartTooltip = document.getElementById('priceChartTooltip');
  elements.calculatorResults = document.getElementById('calculatorResults');
  elements.animateButton = document.getElementById('animateButton');

  elements.yearSelect.addEventListener('change', handleDateChange);
  elements.monthSelect.addEventListener('change', handleDateChange);
  elements.goldAmount.addEventListener('input', handleGoldAmountChange);
  elements.manualGoldPrice.addEventListener('input', handleCalculatorInputChange);
  elements.manualSilverPrice.addEventListener('input', handleCalculatorInputChange);
  elements.manualCalcAmount.addEventListener('input', handleCalculatorInputChange);
  elements.priceStartYear.addEventListener('change', handlePriceRangeChange);
  elements.priceStartMonth.addEventListener('change', handlePriceRangeChange);
  elements.priceEndYear.addEventListener('change', handlePriceRangeChange);
  elements.priceEndMonth.addEventListener('change', handlePriceRangeChange);
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
    populateDateControls();
    populatePriceChartControls();
    state.selectedSnapshot = state.snapshots[state.snapshots.length - 1];
    syncDateControlsFromSnapshot(state.selectedSnapshot);
    populateCalculatorInputs();
    renderDashboard();
  } catch (error) {
    console.error(error);
    elements.stats.innerHTML = '<p class="error">Unable to load the historical dashboard data.</p>';
  }
}

function populateDateControls() {
  const years = [...new Set(state.snapshots.map((snapshot) => snapshot.yearMonth.split('-')[0]))];
  elements.yearSelect.innerHTML = years
    .map((year) => `<option value="${year}">${year}</option>`)
    .join('');

  const selectedYear = elements.yearSelect.value || years[years.length - 1];
  populateMonthSelect(selectedYear, elements.monthSelect);
}

function populateMonthSelect(year, targetSelect) {
  const matchingSnapshots = state.snapshots.filter((snapshot) => snapshot.yearMonth.startsWith(`${year}-`));
  targetSelect.innerHTML = matchingSnapshots
    .map((snapshot) => {
      const [, month] = snapshot.yearMonth.split('-');
      return `<option value="${month}">${new Date(Number(year), Number(month) - 1).toLocaleDateString('en', { month: 'long' })}</option>`;
    })
    .join('');
}

function syncDateControlsFromSnapshot(snapshot) {
  const [year, month] = snapshot.yearMonth.split('-');
  if (!elements.yearSelect.querySelector(`option[value="${year}"]`)) {
    populateDateControls();
  }
  elements.yearSelect.value = year;
  populateMonthSelect(year, elements.monthSelect);
  elements.monthSelect.value = month;
}

function populatePriceChartControls() {
  const years = [...new Set(state.snapshots.map((snapshot) => snapshot.yearMonth.split('-')[0]))];
  elements.priceStartYear.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join('');
  elements.priceEndYear.innerHTML = years.map((year) => `<option value="${year}">${year}</option>`).join('');

  const startYear = years[0];
  const endYear = years[years.length - 1];
  elements.priceStartYear.value = startYear;
  elements.priceEndYear.value = endYear;
  populateMonthSelect(startYear, elements.priceStartMonth);
  populateMonthSelect(endYear, elements.priceEndMonth);
  elements.priceStartMonth.value = state.snapshots[0].yearMonth.split('-')[1];
  elements.priceEndMonth.value = state.snapshots[state.snapshots.length - 1].yearMonth.split('-')[1];
}

function handlePriceRangeChange(event) {
  const startYear = elements.priceStartYear.value;
  const endYear = elements.priceEndYear.value;

  if (event && event.target === elements.priceStartYear) {
    populateMonthSelect(startYear, elements.priceStartMonth);
    if (!elements.priceStartMonth.querySelector(`option[value="${elements.priceStartMonth.value}"]`)) {
      elements.priceStartMonth.value = elements.priceStartMonth.querySelector('option')?.value;
    }
  }
  if (event && event.target === elements.priceEndYear) {
    populateMonthSelect(endYear, elements.priceEndMonth);
    if (!elements.priceEndMonth.querySelector(`option[value="${elements.priceEndMonth.value}"]`)) {
      elements.priceEndMonth.value = elements.priceEndMonth.querySelector('option')?.value;
    }
  }

  renderPriceChart();
}

function handleDateChange() {
  const year = elements.yearSelect.value;
  const month = elements.monthSelect.value;
  const snapshot = state.snapshots.find((entry) => entry.yearMonth === `${year}-${month}`) || state.snapshots[state.snapshots.length - 1];
  state.selectedSnapshot = snapshot;
  syncDateControlsFromSnapshot(snapshot);
  renderDashboard();
}

function handleCalculatorInputChange() {
  updateCalculatorResults();
}

function populateCalculatorInputs() {
  const defaultSnapshot = state.selectedSnapshot || state.snapshots[state.snapshots.length - 1];
  const goldPrice = Number(defaultSnapshot.goldPrice);
  const silverPrice = Number(defaultSnapshot.silverPrice);

  elements.manualGoldPrice.value = goldPrice.toFixed(2);
  elements.manualSilverPrice.value = silverPrice.toFixed(2);
  elements.manualCalcAmount.value = '1';
  updateCalculatorResults();
}

function updateCalculatorResults() {
  const goldPrice = Number(elements.manualGoldPrice.value) || 0;
  const silverPrice = Number(elements.manualSilverPrice.value) || 0;
  const amount = Number(elements.manualCalcAmount.value) || 1;

  if (goldPrice <= 0 || silverPrice <= 0) {
    elements.calculatorResults.innerHTML = '<p class="error">Enter both gold and silver prices to see the weight/cost ratio.</p>';
    return;
  }

  const goldValue = amount * goldPrice;
  const billsForGold = goldValue / 20;
  const goldWeightGrams = amount * 31.1034768;
  const paperWeightKg = billsForGold / 1000;
  const goldWeightKg = goldWeightGrams / 1000;
  const goldSilverRatio = goldPrice / silverPrice;
  const gramsPerDollarGold = 31.1034768 / goldPrice;
  const gramsPerDollarSilver = 31.1034768 / silverPrice;

  elements.calculatorResults.innerHTML = `
    <p><strong>${amount.toFixed(2)} oz gold</strong> costs <strong>$${goldValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.</p>
    <p>At $${goldPrice.toFixed(2)}/oz and $${silverPrice.toFixed(2)}/oz, gold is <strong>${goldSilverRatio.toFixed(1)}×</strong> more expensive than silver.</p>
    <p>Each dollar buys <strong>${gramsPerDollarGold.toFixed(3)} g</strong> of gold or <strong>${gramsPerDollarSilver.toFixed(3)} g</strong> of silver.</p>
    <p>The same value requires <strong>${Math.round(billsForGold).toLocaleString()} $20 bills</strong> weighing <strong>${paperWeightKg.toFixed(2)} kg</strong>, while the gold weighs <strong>${goldWeightKg.toFixed(2)} kg</strong>.</p>
  `;
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
  state.animationIndex = 0;
  state.selectedSnapshot = state.snapshots[0];
  syncDateControlsFromSnapshot(state.selectedSnapshot);
  renderDashboard();

  state.animationTimer = window.setInterval(() => {
    state.animationIndex += 1;
    if (state.animationIndex >= state.snapshots.length) {
      clearInterval(state.animationTimer);
      state.isAnimating = false;
      state.animationTimer = null;
      state.selectedSnapshot = state.snapshots[state.snapshots.length - 1];
      syncDateControlsFromSnapshot(state.selectedSnapshot);
      renderDashboard();
      elements.animateButton.textContent = 'Animate History';
      return;
    }

    const nextSnapshot = state.snapshots[state.animationIndex];
    state.selectedSnapshot = nextSnapshot;
    syncDateControlsFromSnapshot(nextSnapshot);
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
  renderPriceChart();

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
      label: 'Silver price',
      value: `$${Number(metrics.snapshot.silverPrice).toFixed(2)} / oz`,
      detail: `Silver is priced at $${Number(metrics.snapshot.silverPrice).toFixed(2)} per ounce in this snapshot.`,
    },
    {
      label: 'Gold / silver ratio',
      value: `${metrics.goldToSilverRatio.toFixed(1)}:1`,
      detail: `One ounce of gold buys ${metrics.goldToSilverRatio.toFixed(1)} ounces of silver at this snapshot.`,
    },
    {
      label: 'Weight burden',
      value: `${metrics.paperWeightKg.toFixed(2)} kg vs ${metrics.goldWeightKg.toFixed(2)} kg`,
      detail: `${state.denomination === 20 ? '$20' : '$100'} bills weigh ${metrics.weightBurden.toFixed(1)}x more than the same dollar value of gold.`,
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
  const leverageText = metrics.paperPerPhysical >= 100
    ? 'At this scale, the paper market can easily exceed a hundred paper claims for each ounce of deliverable metal once futures, ETFs, and rehypothecated collateral are counted together.'
    : 'The gap between paper claims and physical metal is already meaningful, and it can become much larger once futures, ETFs, and rehypothecated collateral are layered on top of the same ounces.';

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
    <div class="contract-note">
      <p>${leverageText}</p>
      <p>In other words, many more paper contracts can be tied to each ounce of physical metal than the visible inventory alone would suggest.</p>
      <p><a class="contract-link" href="https://www.usdebtclock.org/" target="_blank" rel="noreferrer">Explore more context at usdebtclock.org</a></p>
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

  const lastYear = state.snapshots[state.snapshots.length - 1].yearMonth.split('-')[0];
  elements.historyChart.innerHTML = `
    <div id="historyChartTooltip" class="chart-tooltip" hidden></div>
    <h2>Historical bill-equivalent trend</h2>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Historical bill-equivalent trend chart">
      <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="#08131e"></rect>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <polyline fill="none" stroke="#f59e0b" stroke-width="3" points="${points}"></polyline>
      <circle cx="${selectedX}" cy="${selectedY}" r="8" fill="#ef4444" stroke="#fee2e2" stroke-width="2"></circle>
      <circle cx="${selectedX}" cy="${selectedY}" r="3" fill="#fff1f2"></circle>
      <text x="${padding}" y="20" fill="#f7c948" font-size="13">${state.denomination === 20 ? '$20 bill equivalent' : '$100 bill equivalent'}</text>
      <text x="${width - padding}" y="${height - 10}" fill="#94a3b8" font-size="12" text-anchor="end">1900 → ${lastYear}</text>
    </svg>
  `;

  elements.historyChartTooltip = elements.historyChart.querySelector('#historyChartTooltip');
  const historySvg = elements.historyChart.querySelector('svg');
  if (historySvg && elements.historyChartTooltip) {
    const historyPoints = state.snapshots.map((snapshot, index) => {
      const value = calculateBillEquivalent(snapshot, state.denomination);
      const x = padding + (index / Math.max(1, series.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - minValue) / span) * (height - padding * 2);
      return { x, y, label: formatLabel(snapshot.yearMonth), value };
    });
    attachChartHover(historySvg, elements.historyChartTooltip, historyPoints, (point) => `<strong>${point.label}</strong><br/>${state.denomination === 20 ? '$20 bill equivalent' : '$100 bill equivalent'}: ${formatCurrency(point.value)}`);
  }
}

function renderPriceChart() {
  const startYear = elements.priceStartYear.value;
  const startMonth = elements.priceStartMonth.value;
  const endYear = elements.priceEndYear.value;
  const endMonth = elements.priceEndMonth.value;
  const startSnapshotIndex = Math.max(0, state.snapshots.findIndex((snapshot) => snapshot.yearMonth === `${startYear}-${startMonth}`));
  const endSnapshotIndex = Math.max(0, state.snapshots.findIndex((snapshot) => snapshot.yearMonth === `${endYear}-${endMonth}`));
  const fromIndex = Math.min(startSnapshotIndex, endSnapshotIndex);
  const toIndex = Math.max(startSnapshotIndex, endSnapshotIndex, state.snapshots.length - 1);
  const rangeSnapshots = state.snapshots.slice(fromIndex, toIndex + 1);

  const width = 860;
  const height = 260;
  const padding = 44;
  const goldSeries = rangeSnapshots.map((snapshot) => Number(snapshot.goldPrice));
  const silverSeries = rangeSnapshots.map((snapshot) => Number(snapshot.silverPrice));
  const goldMax = Math.max(...goldSeries);
  const goldMin = Math.min(...goldSeries);
  const silverMax = Math.max(...silverSeries);
  const silverMin = Math.min(...silverSeries);
  const goldSpan = goldMax - goldMin || 1;
  const silverSpan = silverMax - silverMin || 1;

  const pointsGold = goldSeries
    .map((value, index) => {
      const x = padding + (index / Math.max(1, rangeSnapshots.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - goldMin) / goldSpan) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');
  const pointsSilver = silverSeries
    .map((value, index) => {
      const x = padding + (index / Math.max(1, rangeSnapshots.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - silverMin) / silverSpan) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const title = `${formatLabel(rangeSnapshots[0].yearMonth)} → ${formatLabel(rangeSnapshots[rangeSnapshots.length - 1].yearMonth)}`;

  elements.priceChart.innerHTML = `
    <div id="priceChartTooltip" class="chart-tooltip" hidden></div>
    <h2>Gold & silver price chart</h2>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Gold and silver price chart">
      <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="#08131e"></rect>
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#334155" stroke-width="1"></line>
      <polyline fill="none" stroke="#f59e0b" stroke-width="3" points="${pointsGold}"></polyline>
      <polyline fill="none" stroke="#38bdf8" stroke-width="3" points="${pointsSilver}"></polyline>
      <text x="${padding}" y="24" fill="#f7c948" font-size="13">${title}</text>
      <text x="${width - padding}" y="24" fill="#94a3b8" font-size="12" text-anchor="end">Gold = yellow, Silver = blue</text>
      <text x="${padding}" y="${height - 24}" fill="#f7c948" font-size="11">Gold range ${goldMin.toFixed(2)}–${goldMax.toFixed(2)} /oz</text>
      <text x="${padding}" y="${height - 12}" fill="#38bdf8" font-size="11">Silver range ${silverMin.toFixed(2)}–${silverMax.toFixed(2)} /oz</text>
      <text x="${width - padding}" y="${height - 18}" fill="#94a3b8" font-size="12" text-anchor="end">${rangeSnapshots.length} monthly points</text>
    </svg>
  `;

  elements.priceChartTooltip = elements.priceChart.querySelector('#priceChartTooltip');
  const priceSvg = elements.priceChart.querySelector('svg');
  if (priceSvg && elements.priceChartTooltip) {
    const pricePoints = rangeSnapshots.map((snapshot, index) => {
      const goldValue = Number(snapshot.goldPrice);
      const silverValue = Number(snapshot.silverPrice);
      const x = padding + (index / Math.max(1, rangeSnapshots.length - 1)) * (width - padding * 2);
      const y = height - padding - ((goldValue - goldMin) / goldSpan) * (height - padding * 2);
      return { x, y, label: formatLabel(snapshot.yearMonth), gold: goldValue, silver: silverValue };
    });
    attachChartHover(priceSvg, elements.priceChartTooltip, pricePoints, (point) => `<strong>${point.label}</strong><br/>Gold: ${formatCurrency(point.gold)} / oz<br/>Silver: ${formatCurrency(point.silver)} / oz`);
  }
}

function calculateBillEquivalent(snapshot, denomination) {
  const goldPrice = Number(snapshot.goldPrice);
  const goldValueUsd = 1 * goldPrice;
  return goldValueUsd / denomination;
}

function attachChartHover(svg, tooltipElement, points, buildTooltipHtml) {
  if (!svg || !tooltipElement) {
    return;
  }

  points.forEach((point) => {
    const circle = createSvgElement('circle', {
      cx: point.x,
      cy: point.y,
      r: 5,
      class: 'chart-point',
      fill: '#f59e0b',
      stroke: '#fff8e1',
      'stroke-width': 1.5,
    });

    circle.addEventListener('mouseenter', (event) => showChartTooltip(event, tooltipElement, buildTooltipHtml(point)));
    circle.addEventListener('mousemove', (event) => showChartTooltip(event, tooltipElement, buildTooltipHtml(point)));
    circle.addEventListener('mouseleave', () => hideChartTooltip(tooltipElement));

    svg.appendChild(circle);
  });
}

function showChartTooltip(event, tooltipElement, html) {
  tooltipElement.innerHTML = html;
  tooltipElement.hidden = false;

  const chartRect = tooltipElement.parentElement.getBoundingClientRect();
  const x = event.clientX - chartRect.left;
  const y = event.clientY - chartRect.top;
  const tooltipWidth = 220;
  const tooltipHeight = 70;
  const left = Math.min(Math.max(16, x + 14), chartRect.width - tooltipWidth - 16);
  const top = Math.min(Math.max(16, y - 12), chartRect.height - tooltipHeight - 16);

  tooltipElement.style.left = `${left}px`;
  tooltipElement.style.top = `${top}px`;
}

function hideChartTooltip(tooltipElement) {
  tooltipElement.hidden = true;
  tooltipElement.innerHTML = '';
}

function formatCurrency(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
