// Prime Factorize A Sean - Main JavaScript

// ==================== Prime Number Functions ====================

/**
 * Check if a number is prime using modulo (%)
 * @param {number} n - Number to check
 * @returns {boolean} - True if prime, false otherwise
 */
function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    // Check divisibility using modulo
    for (let i = 3; i * i <= n; i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

/**
 * Find all prime factors of a number
 * @param {number} n - Number to factorize
 * @returns {Array} - Array of prime factors
 */
function getPrimeFactors(n) {
    const factors = [];
    let num = n;
    
    // Handle 2 separately
    while (num % 2 === 0) {
        factors.push(2);
        num /= 2;
    }
    
    // Check odd numbers
    for (let i = 3; i * i <= num; i += 2) {
        while (num % i === 0) {
            factors.push(i);
            num /= i;
        }
    }
    
    // If remaining number is prime
    if (num > 2) {
        factors.push(num);
    }
    
    return factors;
}

/**
 * Find factors of a number (not just prime)
 * @param {number} n - Number to factorize
 * @returns {Array} - Array of factor pairs
 */
function getFactors(n) {
    const factors = [];
    for (let i = 2; i * i <= n; i++) {
        if (n % i === 0) {
            factors.push([i, n / i]);
        }
    }
    return factors;
}

// ==================== Tree Structure ====================

/**
 * Node class for factorization tree
 */
class TreeNode {
    constructor(value, left = null, right = null) {
        this.value = value;
        this.left = left;
        this.right = right;
    }
}

/**
 * Build factorization tree
 * @param {number} n - Number to build tree for
 * @returns {TreeNode} - Root of the tree
 */
function buildFactorTree(n) {
    if (isPrime(n) || n < 2) {
        return new TreeNode(n);
    }
    
    const factors = getFactors(n);
    if (factors.length === 0) {
        return new TreeNode(n);
    }
    
    // Use first factor pair
    const [left, right] = factors[0];
    return new TreeNode(n, buildFactorTree(left), buildFactorTree(right));
}

/**
 * Render tree as text with branches
 * @param {TreeNode} node - Root node
 * @param {string} prefix - Prefix for current line
 * @param {boolean} isLast - Is this the last child
 * @returns {Array} - Array of strings representing tree lines
 */
function renderTree(node, prefix = '', isLast = true) {
    const lines = [];
    const connector = isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + node.value);
    
    const newPrefix = prefix + (isLast ? '    ' : '│   ');
    
    if (node.left && node.right) {
        // Both children
        const leftLines = renderTree(node.left, newPrefix, false);
        const rightLines = renderTree(node.right, newPrefix, true);
        lines.push(...leftLines, ...rightLines);
    } else if (node.left) {
        const leftLines = renderTree(node.left, newPrefix, true);
        lines.push(...leftLines);
    } else if (node.right) {
        const rightLines = renderTree(node.right, newPrefix, true);
        lines.push(...rightLines);
    }
    
    return lines;
}

/**
 * Render tree with ASCII branches using / and \
 * @param {TreeNode} node - Root node
 * @param {number} depth - Current depth
 * @returns {Array} - Array of strings for each level
 */
function renderTreeASCII(node, depth = 0) {
    const levels = [];
    
    function traverse(n, d, isLeft, parentPos) {
        if (!n) return;
        
        const value = n.value.toString();
        const pos = parentPos || 0;
        
        // Initialize level if needed
        while (levels.length <= d) {
            levels.push('');
        }
        
        // Add value at position
        const currentLine = levels[d];
        const padding = ' '.repeat(Math.max(0, pos - currentLine.length));
        levels[d] = currentLine + padding + value;
        
        if (n.left || n.right) {
            // Add branches
            const branchLine = d + 1;
            while (levels.length <= branchLine) {
                levels.push('');
            }
            
            const branchPos = pos + Math.floor(value.length / 2);
            const branchPadding = ' '.repeat(Math.max(0, branchPos - levels[branchLine].length));
            
            if (n.left && n.right) {
                // Both branches
                levels[branchLine] = levels[branchLine] + branchPadding + '/' + ' ' + '\\';
                traverse(n.left, d + 2, true, pos - 2);
                traverse(n.right, d + 2, false, pos + value.length + 2);
            } else if (n.left) {
                levels[branchLine] = levels[branchLine] + branchPadding + '/';
                traverse(n.left, d + 2, true, pos - 1);
            } else if (n.right) {
                levels[branchLine] = levels[branchLine] + branchPadding + '\\';
                traverse(n.right, d + 2, false, pos + value.length + 1);
            }
        }
    }
    
    traverse(node, 0, false, 0);
    return levels;
}

/**
 * Render tree with / and \ branches creating triangles
 * All nodes at the same level appear on the same line
 * Each node appears only once
 */
function renderFactorTree(node) {
    const result = [];
    const levels = [];
    const nodePos = new Map();
    
    // Collect all nodes by level
    function collect(n, level = 0) {
        if (!n) return;
        if (!levels[level]) levels[level] = [];
        levels[level].push(n);
        if (n.left) collect(n.left, level + 1);
        if (n.right) collect(n.right, level + 1);
    }
    collect(node);
    
    // Calculate positions bottom-up
    for (let level = levels.length - 1; level >= 0; level--) {
        const nodes = levels[level];
        let pos = 0;
        
        nodes.forEach((n, idx) => {
            const val = n.value.toString();
            const w = val.length;
            let p = pos;
            
            // Position based on children
            if (n.left && n.right) {
                const lp = nodePos.get(n.left);
                const rp = nodePos.get(n.right);
                const lw = n.left.value.toString().length;
                const rw = n.right.value.toString().length;
                const lc = lp + Math.floor(lw / 2);
                const rc = rp + Math.floor(rw / 2);
                p = Math.max(p, Math.floor((lc + rc) / 2) - Math.floor(w / 2));
            } else if (n.left) {
                const lp = nodePos.get(n.left);
                const lw = n.left.value.toString().length;
                p = Math.max(p, lp + Math.floor(lw / 2) - Math.floor(w / 2));
            } else if (n.right) {
                const rp = nodePos.get(n.right);
                const rw = n.right.value.toString().length;
                p = Math.max(p, rp + Math.floor(rw / 2) - Math.floor(w / 2));
            }
            
            // Spacing from previous node
            if (idx > 0) {
                const prev = nodes[idx - 1];
                const prevP = nodePos.get(prev);
                const prevW = prev.value.toString().length;
                p = Math.max(p, prevP + prevW + 3);
            }
            
            nodePos.set(n, p);
            pos = p + w + 3;
        });
    }
    
    // Render each level - DO NOT show children in branch lines, only show them in next level
    for (let level = 0; level < levels.length; level++) {
        const nodes = levels[level];
        const valLine = [];
        
        // Build value line - all nodes at this level (only show them once here)
        nodes.forEach((n) => {
            const val = n.value.toString();
            const p = nodePos.get(n);
            while (valLine.length < p) valLine.push(' ');
            for (let i = 0; i < val.length; i++) {
                if (p + i < valLine.length) {
                    valLine[p + i] = val[i];
                } else {
                    valLine.push(val[i]);
                }
            }
        });
        result.push(valLine.join(''));
        
        // Build branches if not last level (but don't show children here - they'll show in next level)
        if (level < levels.length - 1) {
            const branchLine = [];
            const nextLevelNodes = levels[level + 1];
            
            // Only draw branches for nodes that have children
            nodes.forEach((n) => {
                if (n.left || n.right) {
                    const pPos = nodePos.get(n);
                    const pW = n.value.toString().length;
                    const pCenter = pPos + Math.floor(pW / 2);
                    
                    if (n.left && n.right) {
                        const lPos = nodePos.get(n.left);
                        const rPos = nodePos.get(n.right);
                        const lW = n.left.value.toString().length;
                        const rW = n.right.value.toString().length;
                        const lCenter = lPos + Math.floor(lW / 2);
                        const rCenter = rPos + Math.floor(rW / 2);
                        
                        // Branch line only - don't show children here
                        while (branchLine.length <= lCenter) branchLine.push(' ');
                        branchLine[lCenter] = '/';
                        while (branchLine.length <= rCenter) branchLine.push(' ');
                        branchLine[rCenter] = '\\';
                    } else if (n.left) {
                        const lPos = nodePos.get(n.left);
                        const lW = n.left.value.toString().length;
                        const lCenter = lPos + Math.floor(lW / 2);
                        while (branchLine.length <= lCenter) branchLine.push(' ');
                        branchLine[lCenter] = '/';
                    } else if (n.right) {
                        const rPos = nodePos.get(n.right);
                        const rW = n.right.value.toString().length;
                        const rCenter = rPos + Math.floor(rW / 2);
                        while (branchLine.length <= rCenter) branchLine.push(' ');
                        branchLine[rCenter] = '\\';
                    }
                }
            });
            
            if (branchLine.some(c => c === '/' || c === '\\')) {
                result.push(branchLine.join(''));
            }
        }
    }
    
    return result;
}

// ==================== Find Nth Prime ====================

/**
 * Find the nth prime number
 * @param {number} n - Position (1-indexed)
 * @param {Function} progressCallback - Callback for progress updates
 * @returns {number} - The nth prime number
 */
function findNthPrime(n, progressCallback = null) {
    if (n === 1) return 2;
    if (n === 2) return 3;
    
    let count = 2; // We have 2 and 3
    let candidate = 3;
    
    while (count < n) {
        candidate += 2; // Check odd numbers only
        
        if (progressCallback && candidate % 1000 === 1) {
            progressCallback(`Checking ${candidate}... (Found ${count}/${n})`);
        }
        
        if (isPrime(candidate)) {
            count++;
            if (count === n) {
                return candidate;
            }
        }
    }
    
    return candidate;
}

// ==================== Screensaver ====================

let screensaverInterval = null;
let screensaverActive = true;
let screensaverSpeed = 5;
let maxMultiplier = 10;
let primeRange = { start: 2, end: 20 };
const screensaverContainer = document.getElementById('screensaver');
const activeElements = new Set();
let currentPrimeIndex = 0;
let scrollingPrimes = [];
let topbarPosition = 0;

/**
 * Create scrolling topbar with primes
 */
function createTopbar() {
    // Remove existing topbar if any
    const existing = document.getElementById('prime-topbar');
    if (existing) existing.remove();
    
    const topbar = document.createElement('div');
    topbar.id = 'prime-topbar';
    topbar.className = 'prime-topbar';
    screensaverContainer.appendChild(topbar);
    
    // Get primes in range
    scrollingPrimes = [];
    for (let i = primeRange.start; i <= primeRange.end; i++) {
        if (isPrime(i)) {
            scrollingPrimes.push(i);
        }
    }
    
    if (scrollingPrimes.length === 0) return;
    
    // Create prime elements in topbar
    scrollingPrimes.forEach((prime, idx) => {
        const primeEl = document.createElement('span');
        primeEl.className = 'topbar-prime';
        primeEl.textContent = prime.toString();
        primeEl.dataset.prime = prime;
        primeEl.dataset.index = idx;
        topbar.appendChild(primeEl);
    });
    
    // Start scrolling
    topbarPosition = 0;
    animateTopbar();
}

/**
 * Animate scrolling topbar
 */
function animateTopbar() {
    if (!screensaverActive) return;
    
    const topbar = document.getElementById('prime-topbar');
    if (!topbar) return;
    
    topbarPosition -= screensaverSpeed;
    topbar.style.transform = `translateX(${topbarPosition}px)`;
    
    // Check if a prime is visible and should drop
    const primeElements = topbar.querySelectorAll('.topbar-prime');
    primeElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const prime = parseInt(el.dataset.prime);
        
        // If prime is at left edge (x position around 0-50px), start dropping
        if (rect.left >= 0 && rect.left <= 50 && !el.dataset.dropping) {
            el.dataset.dropping = 'true';
            startDroppingMultiples(prime);
        }
    });
    
    // Reset position when scrolled past
    const topbarWidth = topbar.scrollWidth;
    if (Math.abs(topbarPosition) > topbarWidth + window.innerWidth) {
        topbarPosition = window.innerWidth;
    }
    
    if (screensaverActive) {
        requestAnimationFrame(animateTopbar);
    }
}

/**
 * Start dropping multiples for a prime number
 * @param {number} prime - Prime number
 */
function startDroppingMultiples(prime) {
    const fallSpeed = screensaverSpeed * 2;
    const multiples = [];
    let currentMultiplier = 1;
    
    function createMultiple(multiplier) {
        if (multiplier > maxMultiplier) return;
        
        const element = document.createElement('div');
        element.className = 'falling-element';
        const result = prime * multiplier;
        element.textContent = `${prime} × ${multiplier} = ${result}`;
        element.style.left = '20px';
        element.style.top = '-30px';
        element.dataset.prime = prime;
        element.dataset.multiplier = multiplier;
        element.style.opacity = Math.max(0.5, 1 - (multiplier - 1) * 0.1);
        
        screensaverContainer.appendChild(element);
        activeElements.add(element);
        
        const multiple = {
            element,
            multiplier,
            position: -30,
            prime
        };
        multiples.push(multiple);
        
        // Create next multiple after delay
        if (multiplier < maxMultiplier) {
            setTimeout(() => {
                createMultiple(multiplier + 1);
            }, 200);
        }
    }
    
    // Start with first multiple
    createMultiple(1);
    
    // Animate falling
    function animate() {
        if (!screensaverActive) {
            multiples.forEach(m => m.element.remove());
            return;
        }
        
        multiples.forEach((m, idx) => {
            m.position += fallSpeed;
            m.element.style.top = m.position + 'px';
            
            // Remove when reached max multiplier (they disappear at the 10th multiple)
            if (m.multiplier >= maxMultiplier) {
                m.element.remove();
                activeElements.delete(m.element);
                multiples.splice(idx, 1);
            } else if (m.position > window.innerHeight + 50) {
                // Also remove if off screen
                m.element.remove();
                activeElements.delete(m.element);
                multiples.splice(idx, 1);
            }
        });
        
        if (screensaverActive && multiples.length > 0) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

/**
 * Start screensaver animation
 */
function startScreensaver() {
    if (!screensaverActive) return;
    
    // Clear existing elements
    activeElements.forEach(el => el.remove());
    activeElements.clear();
    
    // Create topbar
    createTopbar();
}

/**
 * Stop screensaver animation
 */
function stopScreensaver() {
    if (screensaverInterval) {
        clearInterval(screensaverInterval);
        screensaverInterval = null;
    }
    // Clear all elements
    activeElements.forEach(el => el.remove());
    activeElements.clear();
    const topbar = document.getElementById('prime-topbar');
    if (topbar) topbar.remove();
}

// ==================== DOM Event Handlers ====================

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
    
    // Prime Factorization
    const factorizeBtn = document.getElementById('factorize-btn');
    const factorizeInput = document.getElementById('factorize-input');
    const factorTreeContainer = document.getElementById('factor-tree-container');
    
    factorizeBtn.addEventListener('click', () => {
        const num = parseInt(factorizeInput.value);
        if (isNaN(num) || num < 2) {
            factorTreeContainer.innerHTML = '<p class="error">Please enter a valid number greater than 1.</p>';
            return;
        }
        
        factorTreeContainer.innerHTML = '<div class="loading">Calculating...</div>';
        
        // Use setTimeout to allow UI to update
        setTimeout(() => {
            const tree = buildFactorTree(num);
            const treeLines = renderFactorTree(tree);
            const primeFactors = getPrimeFactors(num);
            
            let html = '<div class="tree-display">';
            treeLines.forEach(line => {
                html += `<div class="tree-line">${line.replace(/ /g, '&nbsp;')}</div>`;
            });
            html += '</div>';
            html += `<div class="prime-factors">Prime factors: ${primeFactors.join(' × ')}</div>`;
            html += `<div class="prime-factors">${num} = ${primeFactors.join(' × ')}</div>`;
            
            factorTreeContainer.innerHTML = html;
        }, 10);
    });
    
    factorizeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            factorizeBtn.click();
        }
    });
    
    // Find Nth Prime
    const findPrimeBtn = document.getElementById('find-prime-btn');
    const primePositionInput = document.getElementById('prime-position-input');
    const primeResult = document.getElementById('prime-result');
    const primeProgress = document.getElementById('prime-progress');
    
    findPrimeBtn.addEventListener('click', () => {
        const position = parseInt(primePositionInput.value);
        if (isNaN(position) || position < 1) {
            primeResult.innerHTML = '<p class="error">Please enter a valid position (1 or greater).</p>';
            return;
        }
        
        primeResult.innerHTML = '<div class="loading">Finding prime...</div>';
        primeProgress.textContent = 'Starting search...';
        
        // Use setTimeout to allow UI to update, then use requestAnimationFrame for progress
        setTimeout(() => {
            let progressText = '';
            const progressCallback = (msg) => {
                progressText = msg;
            };
            
            // For large numbers, we need to do this in chunks to avoid blocking
            const findPrimeAsync = () => {
                const result = findNthPrime(position, progressCallback);
                primeResult.innerHTML = `<div class="result-success">The ${position}${getOrdinalSuffix(position)} prime number is: <strong>${result}</strong></div>`;
                primeProgress.textContent = 'Complete!';
            };
            
            // Use setTimeout to allow UI updates during calculation
            setTimeout(findPrimeAsync, 50);
        }, 10);
    });
    
    primePositionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findPrimeBtn.click();
        }
    });
    
    // Screensaver Controls
    const updateScreensaverBtn = document.getElementById('update-screensaver-btn');
    const toggleScreensaverBtn = document.getElementById('toggle-screensaver-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const exitFullscreenBtn = document.getElementById('exit-fullscreen-btn');
    const fullscreenOverlay = document.getElementById('fullscreen-overlay');
    const screensaverFullscreen = document.getElementById('screensaver-fullscreen');
    const screensaverSpeedInput = document.getElementById('screensaver-speed');
    const speedValue = document.getElementById('speed-value');
    const maxMultiplierInput = document.getElementById('max-multiplier');
    const primeRangeStart = document.getElementById('prime-range-start');
    const primeRangeEnd = document.getElementById('prime-range-end');
    
    screensaverSpeedInput.addEventListener('input', (e) => {
        screensaverSpeed = parseInt(e.target.value);
        speedValue.textContent = screensaverSpeed;
        if (screensaverActive) {
            stopScreensaver();
            startScreensaver();
        }
    });
    
    maxMultiplierInput.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value);
        if (!isNaN(newMax) && newMax >= 1 && newMax <= 100) {
            maxMultiplier = newMax;
            if (screensaverActive) {
                stopScreensaver();
                startScreensaver();
            }
        }
    });
    
    updateScreensaverBtn.addEventListener('click', () => {
        const start = parseInt(primeRangeStart.value);
        const end = parseInt(primeRangeEnd.value);
        
        if (isNaN(start) || isNaN(end) || start < 2 || end < start) {
            alert('Please enter valid prime range (start >= 2, end >= start)');
            return;
        }
        
        primeRange = { start, end };
        if (screensaverActive) {
            stopScreensaver();
            startScreensaver();
        }
    });
    
    toggleScreensaverBtn.addEventListener('click', () => {
        screensaverActive = !screensaverActive;
        if (screensaverActive) {
            toggleScreensaverBtn.textContent = 'Stop Screensaver';
            startScreensaver();
        } else {
            toggleScreensaverBtn.textContent = 'Start Screensaver';
            stopScreensaver();
        }
    });
    
    // Fullscreen functionality
    let fullscreenScreensaverActive = false;
    let fullscreenInterval = null;
    
    function startFullscreenScreensaver() {
        if (fullscreenScreensaverActive) return;
        fullscreenScreensaverActive = true;
        
        // Use same topbar approach for fullscreen
        const topbar = document.createElement('div');
        topbar.id = 'prime-topbar-fullscreen';
        topbar.className = 'prime-topbar';
        screensaverFullscreen.appendChild(topbar);
        
        const primes = [];
        for (let i = primeRange.start; i <= primeRange.end; i++) {
            if (isPrime(i)) {
                primes.push(i);
            }
        }
        
        if (primes.length === 0) return;
        
        primes.forEach((prime, idx) => {
            const primeEl = document.createElement('span');
            primeEl.className = 'topbar-prime';
            primeEl.textContent = prime.toString();
            primeEl.dataset.prime = prime;
            primeEl.dataset.index = idx;
            topbar.appendChild(primeEl);
        });
        
        let fullscreenTopbarPos = 0;
        
        function animateFullscreenTopbar() {
            if (!fullscreenScreensaverActive) return;
            
            fullscreenTopbarPos -= screensaverSpeed;
            topbar.style.transform = `translateX(${fullscreenTopbarPos}px)`;
            
            const primeElements = topbar.querySelectorAll('.topbar-prime');
            primeElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                const prime = parseInt(el.dataset.prime);
                
                if (rect.left >= 0 && rect.left <= 50 && !el.dataset.dropping) {
                    el.dataset.dropping = 'true';
                    startDroppingMultiplesForContainer(prime, screensaverFullscreen);
                }
            });
            
            const topbarWidth = topbar.scrollWidth;
            if (Math.abs(fullscreenTopbarPos) > topbarWidth + window.innerWidth) {
                fullscreenTopbarPos = window.innerWidth;
            }
            
            if (fullscreenScreensaverActive) {
                requestAnimationFrame(animateFullscreenTopbar);
            }
        }
        
        animateFullscreenTopbar();
    }
    
    function stopFullscreenScreensaver() {
        fullscreenScreensaverActive = false;
        if (fullscreenInterval) {
            clearInterval(fullscreenInterval);
            screensaverInterval = null;
        }
        screensaverFullscreen.innerHTML = '';
    }
    
    function startDroppingMultiplesForContainer(prime, container) {
        const fallSpeed = screensaverSpeed * 2;
        const multiples = [];
        
        function createMultiple(multiplier) {
            if (multiplier > maxMultiplier) return;
            
            const element = document.createElement('div');
            element.className = 'falling-element';
            const result = prime * multiplier;
            element.textContent = `${prime} × ${multiplier} = ${result}`;
            element.style.left = '20px';
            element.style.top = '-30px';
            element.style.opacity = Math.max(0.5, 1 - (multiplier - 1) * 0.1);
            
            container.appendChild(element);
            
            const multiple = {
                element,
                multiplier,
                position: -30,
                prime
            };
            multiples.push(multiple);
            
            if (multiplier < maxMultiplier) {
                setTimeout(() => {
                    createMultiple(multiplier + 1);
                }, 200);
            }
        }
        
        createMultiple(1);
        
        function animate() {
            if (!fullscreenScreensaverActive) {
                multiples.forEach(m => m.element.remove());
                return;
            }
            
            multiples.forEach((m, idx) => {
                m.position += fallSpeed;
                m.element.style.top = m.position + 'px';
                
                if (m.multiplier >= maxMultiplier) {
                    m.element.remove();
                    multiples.splice(idx, 1);
                } else if (m.position > window.innerHeight + 50) {
                    m.element.remove();
                    multiples.splice(idx, 1);
                }
            });
            
            if (fullscreenScreensaverActive && multiples.length > 0) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    fullscreenBtn.addEventListener('click', () => {
        fullscreenOverlay.classList.remove('hidden');
        document.body.classList.add('fullscreen-mode');
        startFullscreenScreensaver();
    });
    
    exitFullscreenBtn.addEventListener('click', () => {
        stopFullscreenScreensaver();
        fullscreenOverlay.classList.add('hidden');
        document.body.classList.remove('fullscreen-mode');
    });
    
    // Helper function for ordinal suffixes
    function getOrdinalSuffix(n) {
        const j = n % 10;
        const k = n % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    }
    
    // Start screensaver on load
    startScreensaver();
});
