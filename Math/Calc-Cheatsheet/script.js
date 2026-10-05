const formulaGroups = [
    {
        id: 'basics',
        title: 'Basic rules',
        description: 'The building blocks for differentiating expressions.',
        formulas: [
            { id: 'constant', name: 'Constant rule', formula: '\\frac{d}{dx}[c] = 0', description: 'A constant does not change as x changes, so its rate of change is zero.', when: 'Use when a term is a fixed number with no x in it.', example: '$\\frac{d}{dx}[7] = 0$' },
            { id: 'power', name: 'Power rule', formula: '\\frac{d}{dx}[x^n] = nx^{n-1}', description: 'Bring the exponent down as a coefficient, then reduce the exponent by one.', when: 'Use for a power of x. The exponent n may be an integer or a real number wherever the function is defined.', example: '$\\frac{d}{dx}[x^5] = 5x^4$' },
            { id: 'constant-multiple', name: 'Constant multiple rule', formula: '\\frac{d}{dx}[c\\,f(x)] = c\\,f\'(x)', description: 'A constant factor carries through the derivative unchanged.', when: 'Use when a function is multiplied by a constant.', example: '$\\frac{d}{dx}[4x^3] = 4\\cdot 3x^2 = 12x^2$' },
            { id: 'sum-difference', name: 'Sum & difference rule', formula: '\\frac{d}{dx}[f(x) \\pm g(x)] = f\'(x) \\pm g\'(x)', description: 'Differentiate each term separately, keeping the plus or minus sign.', when: 'Use for a sum or difference of differentiable functions.', example: '$\\frac{d}{dx}[x^3 - 2x] = 3x^2 - 2$' }
        ]
    },
    {
        id: 'operations',
        title: 'Operations & combinations',
        description: 'Rules for products, quotients, and compositions of functions.',
        formulas: [
            { id: 'product', name: 'Product rule', formula: '\\frac{d}{dx}[f(x)g(x)] = f\'(x)g(x) + f(x)g\'(x)', description: 'Differentiate the first factor and keep the second, then keep the first and differentiate the second; add the results.', when: 'Use when two x-dependent functions are multiplied. Do not differentiate both factors at once.', example: 'For $x^2\\sin x$, let $f=x^2$ and $g=\\sin x$: $2x\\sin x + x^2\\cos x$.' },
            { id: 'quotient', name: 'Quotient rule', formula: '\\frac{d}{dx}\\!\\left[\\frac{f(x)}{g(x)}\\right] = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}', description: 'The derivative of the top times the bottom, minus the top times the derivative of the bottom, all over the bottom squared.', when: 'Use when one differentiable function is divided by another, with $g(x)\\ne0$.', example: 'For $\\frac{x}{x+1}$: $\\frac{(1)(x+1)-x(1)}{(x+1)^2}=\\frac{1}{(x+1)^2}$. ' },
            { id: 'chain', name: 'Chain rule', formula: '\\frac{d}{dx}[f(g(x))] = f\'(g(x))\\,g\'(x)', description: 'Differentiate the outer function while keeping the inner expression, then multiply by the derivative of the inner function.', when: 'Use for a function composed inside another function; work from the outside in.', example: '$\\frac{d}{dx}[(3x+1)^4] = 4(3x+1)^3\\cdot3 = 12(3x+1)^3$' }
        ]
    },
    {
        id: 'exponential',
        title: 'Exponential & logarithmic functions',
        description: 'Derivatives of exponential and logarithmic functions.',
        formulas: [
            { id: 'exp-e', name: 'Natural exponential', formula: '\\frac{d}{dx}[e^x] = e^x', description: 'The natural exponential function is its own derivative.', when: 'Use for $e^x$. With an inner function, apply the chain rule as well.', example: '$\\frac{d}{dx}[e^{2x}] = 2e^{2x}$' },
            { id: 'exp-a', name: 'General exponential', formula: '\\frac{d}{dx}[a^x] = a^x\\ln(a)', description: 'An exponential with base a differentiates to itself times the natural logarithm of its base.', when: 'Use for a positive constant base $a$; for a variable exponent, combine with logarithmic differentiation.', example: '$\\frac{d}{dx}[3^x] = 3^x\\ln 3$' },
            { id: 'ln', name: 'Natural logarithm', formula: '\\frac{d}{dx}[\\ln x] = \\frac{1}{x}', description: 'The derivative of the natural logarithm is the reciprocal of its input.', when: 'Use for $\\ln x$ on its domain $x>0$. For $\\ln|u(x)|$, apply the chain rule.', example: '$\\frac{d}{dx}[\\ln(5x)] = \\frac{1}{x}$' },
            { id: 'log-base', name: 'General logarithm', formula: '\\frac{d}{dx}[\\log_a x] = \\frac{1}{x\\ln(a)}', description: 'Convert to a natural logarithm or use the constant factor $1/\\ln(a)$.', when: 'Use for a positive base $a\\ne1$ and $x>0$.', example: '$\\frac{d}{dx}[\\log_2 x] = \\frac{1}{x\\ln 2}$' }
        ]
    },
    {
        id: 'trigonometric',
        title: 'Trigonometric functions',
        description: 'The six standard trigonometric derivatives (angles in radians).',
        formulas: [
            { id: 'sin', name: 'Sine', formula: '\\frac{d}{dx}[\\sin x] = \\cos x', description: 'Sine differentiates to cosine.', when: 'Use for $\\sin x$. For $\\sin(u)$, multiply by $u\'$ using the chain rule.', example: '$\\frac{d}{dx}[\\sin(3x)] = 3\\cos(3x)$' },
            { id: 'cos', name: 'Cosine', formula: '\\frac{d}{dx}[\\cos x] = -\\sin x', description: 'Cosine differentiates to negative sine.', when: 'Use for $\\cos x$. For $\\cos(u)$, multiply by $u\'$ using the chain rule.', example: '$\\frac{d}{dx}[\\cos(x^2)] = -2x\\sin(x^2)$' },
            { id: 'tan', name: 'Tangent', formula: '\\frac{d}{dx}[\\tan x] = \\sec^2 x', description: 'The derivative of tangent is secant squared.', when: 'Use for $\\tan x$. For $\\tan(u)$, apply the chain rule.', example: '$\\frac{d}{dx}[\\tan(4x)] = 4\\sec^2(4x)$' },
            { id: 'csc', name: 'Cosecant', formula: '\\frac{d}{dx}[\\csc x] = -\\csc x\\cot x', description: 'Cosecant differentiates to negative cosecant times cotangent.', when: 'Use for $\\csc x$. For $\\csc(u)$, multiply by $u\'$ as well.', example: '$\\frac{d}{dx}[\\csc(2x)] = -2\\csc(2x)\\cot(2x)$' },
            { id: 'sec', name: 'Secant', formula: '\\frac{d}{dx}[\\sec x] = \\sec x\\tan x', description: 'Secant differentiates to secant times tangent.', when: 'Use for $\\sec x$. For $\\sec(u)$, apply the chain rule.', example: '$\\frac{d}{dx}[\\sec(x^2)] = 2x\\sec(x^2)\\tan(x^2)$' },
            { id: 'cot', name: 'Cotangent', formula: '\\frac{d}{dx}[\\cot x] = -\\csc^2 x', description: 'Cotangent differentiates to negative cosecant squared.', when: 'Use for $\\cot x$. For $\\cot(u)$, multiply by $u\'$ using the chain rule.', example: '$\\frac{d}{dx}[\\cot(5x)] = -5\\csc^2(5x)$' }
        ]
    },
    {
        id: 'inverse',
        title: 'Inverse trigonometric functions',
        description: 'Derivatives of the inverse trig functions.',
        formulas: [
            { id: 'arcsin', name: 'Inverse sine', formula: '\\frac{d}{dx}[\\arcsin x] = \\frac{1}{\\sqrt{1-x^2}}', description: 'The inverse sine derivative has a square-root denominator.', when: 'Use for $\\arcsin x$ when $|x|<1$. For $\\arcsin(u)$, multiply by $u\'.$', example: '$\\frac{d}{dx}[\\arcsin(2x)] = \\frac{2}{\\sqrt{1-4x^2}}$' },
            { id: 'arccos', name: 'Inverse cosine', formula: '\\frac{d}{dx}[\\arccos x] = -\\frac{1}{\\sqrt{1-x^2}}', description: 'The inverse cosine derivative is the negative of the inverse sine derivative.', when: 'Use for $\\arccos x$ when $|x|<1$. Apply the chain rule for an inner function.', example: '$\\frac{d}{dx}[\\arccos(2x)] = -\\frac{2}{\\sqrt{1-4x^2}}$' },
            { id: 'arctan', name: 'Inverse tangent', formula: '\\frac{d}{dx}[\\arctan x] = \\frac{1}{1+x^2}', description: 'The inverse tangent derivative has a quadratic denominator.', when: 'Use for $\\arctan x$. Apply the chain rule when the input is a function.', example: '$\\frac{d}{dx}[\\arctan(3x)] = \\frac{3}{1+9x^2}$' },
            { id: 'arcsec', name: 'Inverse secant', formula: '\\frac{d}{dx}[\\arcsec x] = \\frac{1}{|x|\\sqrt{x^2-1}}', description: 'The inverse secant derivative includes an absolute value and a square root.', when: 'Use for $|x|>1$. Keep the absolute value in the denominator.', example: '$\\frac{d}{dx}[\\arcsec(2x)] = \\frac{2}{|2x|\\sqrt{4x^2-1}}$' },
            { id: 'arccsc', name: 'Inverse cosecant', formula: '\\frac{d}{dx}[\\arccsc x] = -\\frac{1}{|x|\\sqrt{x^2-1}}', description: 'The inverse cosecant derivative is negative and includes an absolute value.', when: 'Use for $|x|>1$. Remember the negative sign and absolute value.', example: '$\\frac{d}{dx}[\\arccsc(2x)] = -\\frac{2}{|2x|\\sqrt{4x^2-1}}$' },
            { id: 'arccot', name: 'Inverse cotangent', formula: '\\frac{d}{dx}[\\arccot x] = -\\frac{1}{1+x^2}', description: 'The inverse cotangent derivative is the negative of the inverse tangent derivative.', when: 'Use for $\\arccot x$. Apply the chain rule when the input is a function.', example: '$\\frac{d}{dx}[\\arccot(3x)] = -\\frac{3}{1+9x^2}$' }
        ]
    }
];

const formulas = formulaGroups.flatMap(group => group.formulas.map(formula => ({ ...formula, groupId: group.id, groupTitle: group.title })));
const STORAGE_KEYS = { selected: 'calcCheatsheetSelected', saved: 'calcCheatsheetSaved' };
const readStorage = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
let selected = new Set(readStorage(STORAGE_KEYS.selected, formulas.map(item => item.id)));
let saved = readStorage(STORAGE_KEYS.saved, []).filter(item => item && item.id && item.name && item.formula);
let expanded = new Set();
let practiceMode = false;
let revealed = new Set();
let activeView = 'cheatsheet';
let studyMode = 'screensaver';
let studyList = [];
let studyIndex = 0;
let isRevealed = false;
let isPaused = false;
let timer = null;
let notificationTimer = null;
let searchTerm = '';

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function coloredFormula(formula) {
    const colors = { sin: '#e06666', csc: '#ea9999', cos: '#74c0ff', sec: '#8fc9ff', tan: '#c792ff', cot: '#d4adff', arcsin: '#e06666', arccsc: '#ea9999', arccos: '#74c0ff', arcsec: '#8fc9ff', arctan: '#c792ff', arccot: '#d4adff' };
    return formula.replace(/\\(arcsin|arccos|arctan|arccsc|arcsec|arccot|sin|cos|tan|csc|sec|cot)\b/g, (command, name) => `\\color{${colors[name]}}{${command}}`);
}

function typeset() {
    if (window.MathJax?.typesetPromise) window.MathJax.typesetPromise().catch(error => console.warn('MathJax typesetting failed:', error));
}

function persistSelection() {
    localStorage.setItem(STORAGE_KEYS.selected, JSON.stringify([...selected]));
}

function renderList() {
    const container = document.getElementById('formula-list');
    const query = searchTerm.trim().toLowerCase();
    const matches = formulas.filter(item => !query || `${item.name} ${item.groupTitle} ${item.formula} ${item.description}`.toLowerCase().includes(query));
    container.innerHTML = formulaGroups.map(group => {
        const groupItems = matches.filter(item => item.groupId === group.id);
        if (!groupItems.length) return '';
        return `<section class="formula-group" aria-labelledby="group-${group.id}">
            <div class="group-heading"><div><p class="eyebrow">${groupItems.length} ${groupItems.length === 1 ? 'RULE' : 'RULES'}</p><h3 id="group-${group.id}">${group.title}</h3><p>${group.description}</p></div><span class="group-count">${groupItems.length.toString().padStart(2, '0')}</span></div>
            <div class="group-cards">${groupItems.map(item => {
                const checked = selected.has(item.id);
                const isExpanded = expanded.has(item.id);
                const quizHidden = practiceMode && !revealed.has(item.id);
                return `<article class="formula-card ${checked ? 'is-selected' : ''}" data-id="${item.id}">
                    <div class="formula-card-heading">
                        <label class="selection-control" aria-label="Add ${escapeHTML(item.name)} to study set"><input type="checkbox" data-select="${item.id}" ${checked ? 'checked' : ''}><span class="checkmark"></span></label>
                        <button class="formula-title" type="button" data-expand="${item.id}" aria-expanded="${isExpanded}"><span>${escapeHTML(item.name)}</span><span class="expand-icon">${isExpanded ? '−' : '+'}</span></button>
                        <button type="button" class="icon-button card-save ${saved.some(entry => entry.id === item.id) ? 'is-saved' : ''}" data-save="${item.id}" aria-label="Save ${escapeHTML(item.name)}" title="Save for later">${saved.some(entry => entry.id === item.id) ? '✓' : '＋'}</button>
                    </div>
                    <button type="button" class="formula-display ${quizHidden ? 'is-hidden' : ''}" data-formula="${item.id}" aria-label="${quizHidden ? 'Reveal formula for ' + escapeHTML(item.name) : 'Copy formula for ' + escapeHTML(item.name)}">${quizHidden ? '<span>Tap to reveal formula</span>' : `\\[${coloredFormula(item.formula)}\\]`}</button>
                    <div class="formula-details ${isExpanded ? 'is-open' : ''}" data-details="${item.id}">
                        <p class="formula-description">${escapeHTML(item.description)}</p>
                        <div class="card-detail-grid"><div><h4>When to use it</h4><p>${item.when}</p></div><div><h4>Example</h4><p>${item.example}</p></div></div>
                        ${practiceMode && revealed.has(item.id) ? `<button type="button" class="save-inline" data-save="${item.id}">＋ Save for later</button>` : ''}
                    </div>
                </article>`;
            }).join('')}</div>
        </section>`;
    }).join('');
    document.getElementById('empty-state').hidden = matches.length > 0;
    document.getElementById('formula-count').textContent = formulas.length;
    container.querySelectorAll('[data-select]').forEach(input => input.addEventListener('change', () => {
        input.checked ? selected.add(input.dataset.select) : selected.delete(input.dataset.select);
        persistSelection();
        renderList();
    }));
    container.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
        const id = button.dataset.expand;
        expanded.has(id) ? expanded.delete(id) : expanded.add(id);
        renderList();
    }));
    container.querySelectorAll('[data-formula]').forEach(button => button.addEventListener('click', () => {
        const item = formulas.find(formula => formula.id === button.dataset.formula);
        if (practiceMode && !revealed.has(item.id)) {
            revealed.add(item.id);
            renderList();
        } else {
            copyText(item.formula, 'Formula copied');
        }
    }));
    container.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => saveFormula(button.dataset.save)));
    typeset();
}

function notify(message, kind = '') {
    const element = document.getElementById('notification');
    element.textContent = message;
    element.className = `notification ${kind} is-visible`;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => element.classList.remove('is-visible'), 2300);
}

async function copyText(text, successMessage) {
    try {
        await navigator.clipboard.writeText(text);
        notify(`✓ ${successMessage}`, 'success');
    } catch {
        const field = document.createElement('textarea');
        field.value = text;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
        notify(`✓ ${successMessage}`, 'success');
    }
}

function setPracticeMode(enabled) {
    practiceMode = enabled;
    revealed.clear();
    document.getElementById('toggle-practice').textContent = enabled ? 'Exit practice mode' : 'Practice: hide formulas';
    document.getElementById('practice-status').textContent = enabled ? 'Practice mode · tap a formula to reveal it' : 'Study mode · formulas are visible';
    document.querySelector('.practice-strip').classList.toggle('is-practicing', enabled);
    renderList();
}

function switchView(view) {
    stopTimer();
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    document.body.classList.remove('fullscreen-mode');
    document.getElementById('study-view').classList.remove('fullscreen');
    activeView = view;
    document.querySelectorAll('.view').forEach(element => element.classList.toggle('active', element.id === (view === 'screensaver' || view === 'flashcards' ? 'study-view' : `${view}-view`)));
    document.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.view === view));
    if (view === 'screensaver' || view === 'flashcards') startStudy(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startStudy(mode) {
    studyMode = mode;
    studyList = formulas.filter(item => selected.has(item.id));
    if (!studyList.length) {
        notify('Select at least one formula first', 'warning');
        switchView('cheatsheet');
        return;
    }
    studyList = shuffle(studyList);
    studyIndex = 0;
    isRevealed = mode === 'screensaver';
    isPaused = false;
    document.getElementById('study-mode-label').textContent = mode === 'screensaver' ? 'SCREENSAVER' : 'FLASHCARDS';
    document.getElementById('study-settings').classList.toggle('is-screensaver', mode === 'screensaver');
    document.getElementById('study-pause').hidden = mode !== 'screensaver';
    renderStudyCard();
}

function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index--) {
        const other = Math.floor(Math.random() * (index + 1));
        [result[index], result[other]] = [result[other], result[index]];
    }
    return result;
}

function renderStudyCard() {
    stopTimer();
    const item = studyList[studyIndex];
    if (!item) return;
    document.getElementById('study-category').textContent = item.groupTitle;
    document.getElementById('study-position').textContent = `${String(studyIndex + 1).padStart(2, '0')} / ${String(studyList.length).padStart(2, '0')}`;
    document.getElementById('study-name').textContent = item.name;
    const formula = document.getElementById('study-formula');
    formula.innerHTML = isRevealed ? `\\[${coloredFormula(item.formula)}\\]` : '';
    formula.classList.toggle('is-concealed', !isRevealed);
    document.getElementById('study-prompt').hidden = isRevealed;
    document.getElementById('study-description').textContent = item.description;
    document.getElementById('study-when').innerHTML = item.when;
    document.getElementById('study-example').innerHTML = item.example;
    document.getElementById('study-details').classList.toggle('is-visible', isRevealed && document.getElementById('show-details').checked);
    const saveButton = document.getElementById('study-save');
    const alreadySaved = saved.some(entry => entry.id === item.id);
    saveButton.disabled = alreadySaved || !isRevealed;
    saveButton.textContent = alreadySaved ? '✓ Saved for later' : '＋ Save for later';
    document.getElementById('study-card').classList.toggle('is-question', !isRevealed);
    document.getElementById('study-pause').textContent = isPaused ? '▶ Resume' : 'Ⅱ Pause';
    typeset();
    if (studyMode === 'screensaver' && !isPaused) {
        const seconds = Number(document.getElementById('speed-slider').value);
        timer = setTimeout(nextStudyCard, seconds * 1000);
    }
}

function stopTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
}

function nextStudyCard() {
    if (!studyList.length) return;
    studyIndex = (studyIndex + 1) % studyList.length;
    if (studyIndex === 0) studyList = shuffle(studyList);
    isRevealed = studyMode === 'screensaver';
    renderStudyCard();
}

function moveStudyCard(direction) {
    if (!studyList.length) return;
    studyIndex = (studyIndex + direction + studyList.length) % studyList.length;
    isRevealed = studyMode === 'screensaver';
    renderStudyCard();
}

function saveFormula(id) {
    const item = formulas.find(formula => formula.id === id);
    if (!item || saved.some(entry => entry.id === item.id)) {
        notify('Already saved for later');
        return;
    }
    saved.push({ id: item.id, name: item.name, formula: item.formula, groupTitle: item.groupTitle });
    localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
    updateSavedCount();
    renderList();
    if (activeView === 'screensaver' || activeView === 'flashcards') renderStudyCard();
    if (document.getElementById('saved-modal').classList.contains('is-open')) renderSaved();
    notify('Saved to your review list', 'success');
}

function updateSavedCount() {
    document.getElementById('saved-count').textContent = saved.length;
}

function openSaved() {
    renderSaved();
    const modal = document.getElementById('saved-modal');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('saved-close').focus();
}

function closeSaved() {
    const modal = document.getElementById('saved-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function renderSaved() {
    const list = document.getElementById('saved-list');
    if (!saved.length) {
        list.innerHTML = '<div class="saved-empty"><span>∅</span><p>No formulas saved yet.</p><small>Save a rule from the cheatsheet or a flashcard to review it here.</small></div>';
        return;
    }
    list.innerHTML = saved.map((item, index) => `<article class="saved-item"><div><p class="eyebrow">${escapeHTML(item.groupTitle || 'CALCULUS I')}</p><h3>${escapeHTML(item.name)}</h3><div class="saved-formula">\\[${coloredFormula(item.formula)}\\]</div></div><button type="button" class="remove-saved" data-remove="${index}" aria-label="Remove ${escapeHTML(item.name)}">×</button></article>`).join('');
    list.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => {
        saved.splice(Number(button.dataset.remove), 1);
        localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
        updateSavedCount();
        renderSaved();
        renderList();
    }));
    typeset();
}

function downloadFile(content, filename, type) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function exportSaved(format) {
    if (!saved.length) {
        notify('Your saved list is empty', 'warning');
        return;
    }
    if (format === 'txt') {
        const content = ['CALC CHEATSHEET — SAVED FORMULAS', '='.repeat(42), '', ...saved.flatMap((item, index) => [`${index + 1}. ${item.name}`, `   ${item.formula}`, ''])].join('\n');
        downloadFile(content, 'calc-saved-formulas.txt', 'text/plain;charset=utf-8');
    } else {
        const quote = value => `"${String(value).replace(/"/g, '""')}"`;
        const content = ['Name,Category,Formula', ...saved.map(item => [item.name, item.groupTitle || '', item.formula].map(quote).join(','))].join('\n');
        downloadFile(content, 'calc-saved-formulas.csv', 'text/csv;charset=utf-8');
    }
    notify(`Downloaded ${format.toUpperCase()} review list`, 'success');
}

function shareSelection() {
    const indices = formulas.map((item, index) => selected.has(item.id) ? index : null).filter(index => index !== null);
    const encoded = btoa(indices.join(','));
    const url = new URL(window.location.href);
    url.search = `?s=${encodeURIComponent(encoded)}`;
    copyText(url.toString(), 'Study set link copied');
}

function loadSelectionFromURL() {
    const encoded = new URLSearchParams(window.location.search).get('s');
    if (!encoded) return;
    try {
        const indices = atob(encoded).split(',').filter(Boolean).map(Number);
        selected = new Set(indices.map(index => formulas[index]?.id).filter(Boolean));
        persistSelection();
    } catch { notify('Could not load that shared study set', 'warning'); }
}

function toggleFullscreen() {
    const view = document.getElementById('study-view');
    const enabled = !view.classList.contains('fullscreen');
    view.classList.toggle('fullscreen', enabled);
    document.body.classList.toggle('fullscreen-mode', enabled);
    document.getElementById('study-fullscreen').textContent = enabled ? '⛶ Exit fullscreen' : '⛶ Fullscreen';
    if (enabled && view.requestFullscreen) view.requestFullscreen().catch(() => {});
    else if (!enabled && document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function initialize() {
    loadSelectionFromURL();
    document.querySelectorAll('.nav-button').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
    document.getElementById('toggle-practice').addEventListener('click', () => setPracticeMode(!practiceMode));
    document.getElementById('search-input').addEventListener('input', event => { searchTerm = event.target.value; renderList(); });
    document.getElementById('preset-select').addEventListener('change', event => {
        if (!event.target.value) return;
        const groupId = event.target.value;
        selected = new Set(groupId === 'all' ? formulas.map(item => item.id) : (formulaGroups.find(group => group.id === groupId)?.formulas || []).map(item => item.id));
        persistSelection();
        renderList();
        event.target.value = '';
    });
    document.getElementById('select-all').addEventListener('click', () => { selected = new Set(formulas.map(item => item.id)); persistSelection(); renderList(); });
    document.getElementById('deselect-all').addEventListener('click', () => { selected.clear(); persistSelection(); renderList(); });
    document.getElementById('share-selection').addEventListener('click', shareSelection);
    document.getElementById('saved-open').addEventListener('click', openSaved);
    document.getElementById('saved-close').addEventListener('click', closeSaved);
    document.getElementById('saved-modal').addEventListener('click', event => { if (event.target.id === 'saved-modal') closeSaved(); });
    document.getElementById('download-txt').addEventListener('click', () => exportSaved('txt'));
    document.getElementById('download-csv').addEventListener('click', () => exportSaved('csv'));
    document.getElementById('clear-saved').addEventListener('click', () => {
        if (!saved.length || !confirm('Clear all saved formulas?')) return;
        saved = [];
        localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(saved));
        updateSavedCount(); renderSaved(); renderList();
        notify('Saved formulas cleared');
    });
    document.getElementById('exit-study').addEventListener('click', () => switchView('cheatsheet'));
    document.getElementById('study-prev').addEventListener('click', () => moveStudyCard(-1));
    document.getElementById('study-next').addEventListener('click', nextStudyCard);
    document.getElementById('study-pause').addEventListener('click', () => {
        isPaused = !isPaused;
        if (isPaused) stopTimer();
        renderStudyCard();
    });
    document.getElementById('study-fullscreen').addEventListener('click', toggleFullscreen);
    document.getElementById('study-save').addEventListener('click', () => { if (isRevealed) saveFormula(studyList[studyIndex]?.id); });
    document.getElementById('study-card').addEventListener('click', event => {
        if (studyMode === 'flashcards' && !event.target.closest('button')) {
            isRevealed = !isRevealed;
            renderStudyCard();
        }
    });
    document.getElementById('study-formula').addEventListener('click', event => {
        if (studyMode === 'flashcards' && !isRevealed) {
            event.stopPropagation();
            isRevealed = true;
            renderStudyCard();
            return;
        }
        if (isRevealed && studyList[studyIndex]) {
            event.stopPropagation();
            copyText(studyList[studyIndex].formula, 'Formula copied');
        }
    });
    document.getElementById('show-details').addEventListener('change', () => renderStudyCard());
    document.getElementById('speed-slider').addEventListener('input', event => {
        document.getElementById('speed-value').textContent = `${event.target.value} sec`;
        if (studyMode === 'screensaver' && activeView === 'screensaver') renderStudyCard();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && document.getElementById('saved-modal').classList.contains('is-open')) { closeSaved(); return; }
        if (activeView !== 'screensaver' && activeView !== 'flashcards') return;
        if (event.key === 'ArrowLeft') { event.preventDefault(); moveStudyCard(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); nextStudyCard(); }
        if (event.key === ' ' && !['INPUT', 'BUTTON'].includes(document.activeElement.tagName)) {
            event.preventDefault();
            if (studyMode === 'screensaver') { isPaused = !isPaused; renderStudyCard(); }
            else { isRevealed = !isRevealed; renderStudyCard(); }
        }
        if (event.key.toLowerCase() === 'f') toggleFullscreen();
        if (event.key === 'Escape') switchView('cheatsheet');
    });
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            document.getElementById('study-view').classList.remove('fullscreen');
            document.body.classList.remove('fullscreen-mode');
            document.getElementById('study-fullscreen').textContent = '⛶ Fullscreen';
        }
    });
    updateSavedCount();
    renderList();
}

document.addEventListener('DOMContentLoaded', initialize);