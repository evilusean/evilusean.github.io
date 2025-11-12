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
 * Format: number on one line, branches on next, children on following lines
 */
function renderFactorTree(node) {
    const result = [];
    
    function buildTree(n, level = 0, isLeftChild = false) {
        if (!n) return;
        
        const value = n.value.toString();
        const indent = '  '.repeat(level);
        
        // Add the number itself
        result.push(indent + value);
        
        // If it has children, add branches and children
        if (n.left || n.right) {
            if (n.left && n.right) {
                // Both children: / and \
                const leftValue = n.left.value.toString();
                const rightValue = n.right.value.toString();
                
                // Create branch line with / and \
                let branchLine = indent;
                const centerPos = Math.floor(value.length / 2);
                branchLine += ' '.repeat(centerPos) + '/' + ' '.repeat(leftValue.length) + '\\';
                result.push(branchLine);
                
                // Add children on next line
                const childrenLine = indent + leftValue + '   ' + rightValue;
                result.push(childrenLine);
                
                // Recursively build children trees with proper indentation
                buildTree(n.left, level + 2, true);
                buildTree(n.right, level + 2 + leftValue.length + 3, false);
            } else if (n.left) {
                // Only left child: /
                let branchLine = indent + '/';
                result.push(branchLine);
                const childLine = indent + n.left.value.toString();
                result.push(childLine);
                buildTree(n.left, level + 1, true);
            } else if (n.right) {
                // Only right child: \
                let branchLine = indent + ' '.repeat(value.length - 1) + '\\';
                result.push(branchLine);
                const childLine = indent + ' '.repeat(value.length) + n.right.value.toString();
                result.push(childLine);
                buildTree(n.right, level + value.length + 1, false);
            }
        }
    }
    
    buildTree(node);
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
let primeRange = { start: 2, end: 20 };
const screensaverContainer = document.getElementById('screensaver');
const activeElements = new Set();

/**
 * Generate multiples for a prime number
 * @param {number} prime - Prime number
 * @returns {Array} - Array of multiples (prime * 1 to prime * 10)
 */
function getPrimeMultiples(prime) {
    const multiples = [];
    for (let i = 1; i <= 10; i++) {
        multiples.push(prime * i);
    }
    return multiples;
}

/**
 * Create a falling element for screensaver
 * @param {number} prime - Prime number
 * @param {number} multiple - Multiple value
 * @param {number} x - X position
 */
function createFallingElement(prime, multiple, x) {
    const element = document.createElement('div');
    element.className = 'falling-element';
    element.textContent = `${prime} × ${multiple / prime} = ${multiple}`;
    element.style.left = x + 'px';
    element.style.top = '-50px';
    element.dataset.prime = prime;
    element.dataset.multiple = multiple;
    
    screensaverContainer.appendChild(element);
    activeElements.add(element);
    
    // Animate falling
    const fallSpeed = screensaverSpeed * 2;
    let position = -50;
    
    const animate = () => {
        position += fallSpeed;
        element.style.top = position + 'px';
        
        if (position > window.innerHeight + 50) {
            element.remove();
            activeElements.delete(element);
        } else {
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

/**
 * Start screensaver animation
 */
function startScreensaver() {
    if (!screensaverActive) return;
    
    const primes = [];
    for (let i = primeRange.start; i <= primeRange.end; i++) {
        if (isPrime(i)) {
            primes.push(i);
        }
    }
    
    if (primes.length === 0) return;
    
    // Create falling elements periodically
    screensaverInterval = setInterval(() => {
        if (!screensaverActive) return;
        
        const randomPrime = primes[Math.floor(Math.random() * primes.length)];
        const multiples = getPrimeMultiples(randomPrime);
        const randomMultiple = multiples[Math.floor(Math.random() * multiples.length)];
        const randomX = Math.random() * (window.innerWidth - 200);
        
        createFallingElement(randomPrime, randomMultiple, randomX);
    }, 1000 / screensaverSpeed);
}

/**
 * Stop screensaver animation
 */
function stopScreensaver() {
    if (screensaverInterval) {
        clearInterval(screensaverInterval);
        screensaverInterval = null;
    }
    // Clear all falling elements
    activeElements.forEach(el => el.remove());
    activeElements.clear();
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
    const screensaverSpeedInput = document.getElementById('screensaver-speed');
    const speedValue = document.getElementById('speed-value');
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
