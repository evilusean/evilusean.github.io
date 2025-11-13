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

/**
 * Calculate Greatest Common Factor (GCF) of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} - GCF of a and b
 */
function getGCF(a, b) {
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

// ==================== Polynomial Functions ====================

/**
 * Parse polynomial string into terms (supports multi-variable)
 * @param {string} poly - Polynomial string (e.g., "x^2 + 5x + 6" or "18a^2b^3 + 27ab^4")
 * @returns {Object} - Parsed polynomial info
 */
function parsePolynomial(poly) {
    // Remove MathJax delimiters
    poly = poly.replace(/\$/g, '');
    poly = poly.replace(/\\/g, '');
    
    // Normalize the input - handle superscript characters and various formats
    poly = poly.replace(/\s+/g, ''); // Remove spaces
    poly = poly.toLowerCase();
    
    // Convert superscript numbers to ^notation
    poly = poly.replace(/²/g, '^2');
    poly = poly.replace(/³/g, '^3');
    poly = poly.replace(/⁴/g, '^4');
    poly = poly.replace(/⁵/g, '^5');
    poly = poly.replace(/⁶/g, '^6');
    poly = poly.replace(/⁷/g, '^7');
    poly = poly.replace(/⁸/g, '^8');
    poly = poly.replace(/⁹/g, '^9');
    
    // Handle ** as exponent (some systems use this)
    poly = poly.replace(/\*\*/g, '^');
    
    const terms = [];
    
    // Split by + and - while keeping the sign
    const parts = poly.split(/(?=[+-])/);
    
    for (let part of parts) {
        if (!part || part.trim() === '') continue;
        
        part = part.trim();
        
        // Parse term: coefficient and variables with powers
        let coef = 1;
        let variables = {}; // e.g., {a: 2, b: 3} for a^2b^3
        
        // Extract coefficient (number at the beginning)
        const coefMatch = part.match(/^([+-]?\d*\.?\d+)/);
        if (coefMatch) {
            coef = parseFloat(coefMatch[1]);
            part = part.substring(coefMatch[0].length);
        } else if (part.startsWith('-')) {
            coef = -1;
            part = part.substring(1);
        } else if (part.startsWith('+')) {
            coef = 1;
            part = part.substring(1);
        }
        
        // Parse variables and their powers
        const varRegex = /([a-z])(\^(\d+))?/g;
        let varMatch;
        while ((varMatch = varRegex.exec(part)) !== null) {
            const varName = varMatch[1];
            const power = varMatch[3] ? parseInt(varMatch[3]) : 1;
            variables[varName] = (variables[varName] || 0) + power;
        }
        
        if (!isNaN(coef) && coef !== 0) {
            terms.push({ coef, variables });
        }
    }
    
    return { terms, original: poly };
}

/**
 * Calculate GCF of polynomial terms
 * @param {Array} terms - Array of term objects
 * @returns {Object} - GCF coefficient and variables
 */
function findPolynomialGCF(terms) {
    if (terms.length === 0) return { coef: 1, variables: {} };
    
    // Find GCF of coefficients
    let gcfCoef = Math.abs(terms[0].coef);
    for (let i = 1; i < terms.length; i++) {
        gcfCoef = getGCF(gcfCoef, Math.abs(terms[i].coef));
    }
    
    // Find minimum power for each variable
    const allVars = new Set();
    terms.forEach(term => {
        Object.keys(term.variables).forEach(v => allVars.add(v));
    });
    
    const gcfVars = {};
    allVars.forEach(varName => {
        let minPower = Infinity;
        terms.forEach(term => {
            const power = term.variables[varName] || 0;
            minPower = Math.min(minPower, power);
        });
        if (minPower > 0) {
            gcfVars[varName] = minPower;
        }
    });
    
    return { coef: gcfCoef, variables: gcfVars };
}

/**
 * Format polynomial term
 * @param {Object} gcf - GCF object with coef and variables
 * @returns {string} - Formatted string
 */
function formatPolynomialGCF(gcf) {
    let result = gcf.coef === 1 ? '' : gcf.coef.toString();
    
    const sortedVars = Object.keys(gcf.variables).sort();
    sortedVars.forEach(varName => {
        const power = gcf.variables[varName];
        result += varName;
        if (power > 1) {
            result += `^${power}`;
        }
    });
    
    return result || '1';
}

/**
 * Factor quadratic polynomial (ax^2 + bx + c)
 * @param {string} poly - Polynomial string
 * @returns {Object} - Factored form and steps
 */
function factorQuadratic(poly) {
    const parsed = parsePolynomial(poly);
    const terms = parsed.terms;
    
    if (terms.length === 0) return { success: false, message: "Invalid polynomial" };
    
    // Check if it's a multi-variable polynomial
    const hasMultipleVars = terms.some(term => Object.keys(term.variables).length > 1 || 
                                               Object.keys(term.variables).some(v => v !== 'x'));
    
    if (hasMultipleVars) {
        // Factor out GCF for multi-variable polynomials
        const gcf = findPolynomialGCF(terms);
        const gcfStr = formatPolynomialGCF(gcf);
        return { 
            success: true, 
            factored: `GCF = ${gcfStr}`,
            original: poly 
        };
    }
    
    let a = 0, b = 0, c = 0;
    terms.forEach(term => {
        const xPower = term.variables['x'] || 0;
        if (xPower === 2) a = term.coef;
        else if (xPower === 1) b = term.coef;
        else if (xPower === 0) c = term.coef;
    });
    
    if (a === 0) {
        // Linear or constant
        if (b === 0) return { success: true, factored: `${c}`, original: poly };
        const bStr = b === 1 ? '' : (b === -1 ? '-' : b);
        const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
        return { success: true, factored: `${bStr}x ${cStr}`, original: poly };
    }
    
    // Try to factor quadratic
    const discriminant = b * b - 4 * a * c;
    
    if (discriminant < 0) {
        return { success: true, factored: "Cannot factor over real numbers", original: poly };
    }
    
    // Check for perfect square
    if (discriminant === 0) {
        const root = -b / (2 * a);
        const aStr = a === 1 ? '' : a;
        if (Number.isInteger(root)) {
            const sign = root >= 0 ? '-' : '+';
            return { 
                success: true, 
                factored: `${aStr}(x ${sign} ${Math.abs(root)})^2`,
                original: poly 
            };
        }
    }
    
    // Calculate roots
    const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    
    // Check if roots are integers
    const isInt1 = Number.isInteger(r1);
    const isInt2 = Number.isInteger(r2);
    
    let factored = '';
    
    if (a !== 1 && a !== -1) {
        factored = `${a}`;
    } else if (a === -1) {
        factored = '-';
    }
    
    // Format factors
    const formatFactor = (root) => {
        if (Number.isInteger(root)) {
            if (root === 0) return '(x)';
            const sign = root > 0 ? '-' : '+';
            return `(x ${sign} ${Math.abs(root)})`;
        } else {
            const sign = root > 0 ? '-' : '+';
            return `(x ${sign} ${Math.abs(root).toFixed(2)})`;
        }
    };
    
    factored += formatFactor(r1) + formatFactor(r2);
    
    return { success: true, factored, original: poly };
}

/**
 * Convert polynomial to LaTeX format
 * @param {string} poly - Polynomial string
 * @returns {string} - LaTeX formatted string
 */
function toLatex(poly) {
    return poly.replace(/\^(\d+)/g, '^{$1}').replace(/\*/g, '\\cdot ');
}

/**
 * Find GCF of two polynomials
 * @param {string} poly1 - First polynomial
 * @param {string} poly2 - Second polynomial
 * @returns {Object} - GCF result
 */
function polynomialGCF(poly1, poly2) {
    const parsed1 = parsePolynomial(poly1);
    const parsed2 = parsePolynomial(poly2);
    const terms1 = parsed1.terms;
    const terms2 = parsed2.terms;
    
    if (terms1.length === 0 || terms2.length === 0) {
        return { success: false, message: "Invalid polynomials" };
    }
    
    // Combine all terms to find common GCF
    const allTerms = [...terms1, ...terms2];
    const gcf = findPolynomialGCF(allTerms);
    const gcfStr = formatPolynomialGCF(gcf);
    
    return {
        success: true,
        gcf: gcfStr,
        poly1: poly1,
        poly2: poly2
    };
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
    const parentMap = new Map();
    
    // Collect all nodes by level and build parent map
    function collect(n, level = 0, parent = null) {
        if (!n) return;
        if (!levels[level]) levels[level] = [];
        levels[level].push(n);
        parentMap.set(n, parent);
        if (n.left) collect(n.left, level + 1, n);
        if (n.right) collect(n.right, level + 1, n);
    }
    collect(node);
    
    // Pass 1: Bottom-up - position parents above their children
    for (let level = levels.length - 1; level >= 0; level--) {
        const nodes = levels[level];
        nodes.forEach((n) => {
            // Only position if node has children (parents)
            if (n.left || n.right) {
                const val = n.value.toString();
                const w = val.length;
                let pos = 0;
                
                if (n.left && n.right) {
                    const lp = nodePos.get(n.left);
                    const rp = nodePos.get(n.right);
                    if (lp !== undefined && rp !== undefined) {
                        const lw = n.left.value.toString().length;
                        const rw = n.right.value.toString().length;
                        const lc = lp + Math.floor(lw / 2);
                        const rc = rp + Math.floor(rw / 2);
                        pos = Math.floor((lc + rc) / 2) - Math.floor(w / 2);
                        nodePos.set(n, Math.max(0, pos));
                    }
                } else if (n.left) {
                    const lp = nodePos.get(n.left);
                    if (lp !== undefined) {
                        const lw = n.left.value.toString().length;
                        pos = lp + Math.floor(lw / 2) - Math.floor(w / 2);
                        nodePos.set(n, Math.max(0, pos));
                    }
                } else if (n.right) {
                    const rp = nodePos.get(n.right);
                    if (rp !== undefined) {
                        const rw = n.right.value.toString().length;
                        pos = rp + Math.floor(rw / 2) - Math.floor(w / 2);
                        nodePos.set(n, Math.max(0, pos));
                    }
                }
            }
        });
    }
    
    // Pass 2: Top-down - position children relative to their parent
    for (let level = 0; level < levels.length; level++) {
        const nodes = levels[level];
        
        // Group by parent
        const groups = new Map();
        nodes.forEach(n => {
            const parent = parentMap.get(n);
            const key = parent || 'root';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(n);
        });
        
        // Process each group
        groups.forEach((siblings, parent) => {
            // Skip if already positioned (has children and was positioned in pass 1)
            siblings.forEach(n => {
                if (nodePos.has(n)) return; // Already positioned
                
                const val = n.value.toString();
                const w = val.length;
                let pos = 0;
                
                if (parent && parent !== 'root') {
                    const parentPos = nodePos.get(parent);
                    if (parentPos !== undefined) {
                        const parentW = parent.value.toString().length;
                        const parentCenter = parentPos + Math.floor(parentW / 2);
                        
                        if (siblings.length > 1) {
                            // Calculate total width
                            let totalW = siblings.reduce((sum, s) => {
                                return sum + s.value.toString().length;
                            }, 0);
                            totalW += (siblings.length - 1) * 3;
                            
                            // Center under parent
                            const groupStart = parentCenter - Math.floor(totalW / 2);
                            const nodeIdx = siblings.indexOf(n);
                            let x = groupStart;
                            for (let i = 0; i < nodeIdx; i++) {
                                x += siblings[i].value.toString().length + 3;
                            }
                            pos = x;
                        } else {
                            pos = parentCenter - Math.floor(w / 2);
                        }
                    }
                }
                
                nodePos.set(n, Math.max(0, pos));
            });
        });
        
        // Prevent overlap between different parent groups
        const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
            const aMin = Math.min(...a[1].map(n => nodePos.get(n) || 0));
            const bMin = Math.min(...b[1].map(n => nodePos.get(n) || 0));
            return aMin - bMin;
        });
        
        let rightmost = 0;
        sortedGroups.forEach(([parentKey, siblings]) => {
            const groupLeft = Math.min(...siblings.map(n => nodePos.get(n) || 0));
            
            if (groupLeft < rightmost) {
                const shift = rightmost - groupLeft;
                siblings.forEach(n => {
                    nodePos.set(n, (nodePos.get(n) || 0) + shift);
                });
            }
            
            siblings.forEach(n => {
                const pos = nodePos.get(n) || 0;
                const w = n.value.toString().length;
                rightmost = Math.max(rightmost, pos + w + 3);
            });
        });
    }
    
    // Render each level
    for (let level = 0; level < levels.length; level++) {
        const nodes = levels[level];
        const valLine = [];
        
        // Sort nodes by position
        const sortedNodes = [...nodes].sort((a, b) => {
            return (nodePos.get(a) || 0) - (nodePos.get(b) || 0);
        });
        
        // Build value line
        sortedNodes.forEach((n) => {
            const val = n.value.toString();
            const p = nodePos.get(n);
            while (valLine.length < p + val.length) {
                valLine.push(' ');
            }
            for (let i = 0; i < val.length; i++) {
                valLine[p + i] = val[i];
            }
        });
        result.push(valLine.join(''));
        
        // Build branch line if not last level
        if (level < levels.length - 1) {
            const branchLine = [];
            
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
let minMultiplier = 1;
let maxMultiplier = 10;
let randomOrder = false;
let primeRange = { start: 10, end: 200 };
const screensaverContainer = document.getElementById('screensaver');
const activeElements = new Set();
let currentPrimeIndex = 0;
let scrollingPrimes = [];
let topbarPosition = 0;
let isProcessingPrime = false;
let afterimages = [];
let primeDropCount = 0;
let currentColumn = 0; // Track which column we're on (0-3)
let columnAfterimages = [[], [], [], []]; // Separate afterimages for each column

/**
 * Create stationary prime display at top
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
    
    // Create single prime display element (stationary)
    const primeEl = document.createElement('span');
    primeEl.id = 'current-prime-display';
    primeEl.className = 'topbar-prime';
    primeEl.textContent = scrollingPrimes[0].toString();
    topbar.appendChild(primeEl);
}

/**
 * Update the prime display at top
 */
function updatePrimeDisplay(prime) {
    const display = document.getElementById('current-prime-display');
    if (display) {
        display.textContent = prime.toString();
    }
}

/**
 * Get column position based on column index
 */
function getColumnPosition(columnIndex) {
    const positions = [
        '0px',       // Left column 1 (touching left edge)
        '200px',     // Left column 2
        'calc(100% - 400px)', // Right column 1
        'calc(100% - 200px)'  // Right column 2
    ];
    return positions[columnIndex];
}

/**
 * Start dropping multiples for a prime number sequentially
 * @param {number} prime - Prime number
 */
function startDroppingMultiples(prime) {
    if (isProcessingPrime) return;
    isProcessingPrime = true;
    
    // Update the prime display at top
    updatePrimeDisplay(prime);
    
    const fallSpeed = screensaverSpeed * 0.5;
    let currentMultiplierIndex = 0;
    const elementSpacing = 50;
    const columnLeft = getColumnPosition(currentColumn);
    
    // Create array of multipliers in range
    const multipliers = [];
    for (let i = minMultiplier; i <= maxMultiplier; i++) {
        multipliers.push(i);
    }
    
    // Shuffle if random order is enabled
    if (randomOrder) {
        for (let i = multipliers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [multipliers[i], multipliers[j]] = [multipliers[j], multipliers[i]];
        }
    }
    
    function createAndDropNextMultiple() {
        if (currentMultiplierIndex >= multipliers.length) {
            // All multiples done - move to next column and prime
            isProcessingPrime = false;
            currentColumn = (currentColumn + 1) % 4; // Cycle through 4 columns
            
            // Clear the NEXT column before we start dropping into it
            const nextColumn = currentColumn;
            columnAfterimages[nextColumn].forEach(el => el.remove());
            columnAfterimages[nextColumn] = [];
            
            setTimeout(() => {
                processNextPrime();
            }, 2000);
            return;
        }
        
        const multiplier = multipliers[currentMultiplierIndex];
        currentMultiplierIndex++;
        
        const element = document.createElement('div');
        element.className = 'falling-element';
        const result = prime * multiplier;
        element.textContent = `${multiplier} × ${prime} = ${result}`;
        element.style.left = columnLeft;
        element.style.top = '60px';
        element.style.opacity = '1';
        element.dataset.prime = prime;
        element.dataset.multiplier = multiplier;
        
        screensaverContainer.appendChild(element);
        activeElements.add(element);
        
        // Calculate target position with proper spacing
        const targetPosition = 100 + (currentMultiplierIndex * elementSpacing);
        
        let position = 60;
        
        function animate() {
            if (!screensaverActive) {
                element.remove();
                isProcessingPrime = false;
                return;
            }
            
            if (position < targetPosition) {
                position += fallSpeed;
                element.style.top = position + 'px';
                requestAnimationFrame(animate);
            } else {
                // Reached target - convert to afterimage and stay there
                position = targetPosition;
                element.style.top = position + 'px';
                element.classList.add('afterimage');
                columnAfterimages[currentColumn].push(element);
                
                // Start next multiple after delay
                setTimeout(() => {
                    createAndDropNextMultiple();
                }, 600);
            }
        }
        
        animate();
    }
    
    // Start with first multiple
    createAndDropNextMultiple();
}

/**
 * Process the next prime in sequence
 */
function processNextPrime() {
    if (!screensaverActive || isProcessingPrime) return;
    
    if (scrollingPrimes.length === 0) return;
    
    currentPrimeIndex = (currentPrimeIndex + 1) % scrollingPrimes.length;
    const nextPrime = scrollingPrimes[currentPrimeIndex];
    
    startDroppingMultiples(nextPrime);
}

/**
 * Start screensaver animation
 */
function startScreensaver() {
    if (!screensaverActive) return;
    
    // Clear existing elements
    activeElements.forEach(el => el.remove());
    activeElements.clear();
    afterimages.forEach(el => el.remove());
    afterimages = [];
    columnAfterimages = [[], [], [], []];
    currentPrimeIndex = 0;
    currentColumn = 0;
    isProcessingPrime = false;
    
    // Create topbar
    createTopbar();
    
    // Start dropping the first prime after a short delay
    setTimeout(() => {
        if (scrollingPrimes.length > 0) {
            startDroppingMultiples(scrollingPrimes[0]);
        }
    }, 1000);
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
    afterimages.forEach(el => el.remove());
    afterimages = [];
    columnAfterimages.forEach(col => col.forEach(el => el.remove()));
    columnAfterimages = [[], [], [], []];
    const topbar = document.getElementById('prime-topbar');
    if (topbar) topbar.remove();
    isProcessingPrime = false;
    currentPrimeIndex = 0;
    currentColumn = 0;
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
    
    // Compare Two Numbers (GCF)
    const compareBtn = document.getElementById('compare-btn');
    const compareInput1 = document.getElementById('compare-input-1');
    const compareInput2 = document.getElementById('compare-input-2');
    const compareResult = document.getElementById('compare-result');
    const compareTreesContainer = document.getElementById('compare-trees-container');
    
    compareBtn.addEventListener('click', () => {
        const num1 = parseInt(compareInput1.value);
        const num2 = parseInt(compareInput2.value);
        
        if (isNaN(num1) || isNaN(num2) || num1 < 2 || num2 < 2) {
            compareResult.innerHTML = '<p class="error">Please enter two valid numbers greater than 1.</p>';
            compareTreesContainer.innerHTML = '';
            return;
        }
        
        compareResult.innerHTML = '<div class="loading">Calculating...</div>';
        compareTreesContainer.innerHTML = '';
        
        setTimeout(() => {
            const gcf = getGCF(num1, num2);
            const tree1 = buildFactorTree(num1);
            const tree2 = buildFactorTree(num2);
            const treeLines1 = renderFactorTree(tree1);
            const treeLines2 = renderFactorTree(tree2);
            const primeFactors1 = getPrimeFactors(num1);
            const primeFactors2 = getPrimeFactors(num2);
            
            // Display GCF result
            compareResult.innerHTML = `<div class="result-success">Greatest Common Factor (GCF) of ${num1} and ${num2} is: <strong>${gcf}</strong></div>`;
            
            // Display both trees side by side
            let html = '';
            
            // First tree
            html += '<div class="compare-tree">';
            html += `<h4>Number: ${num1}</h4>`;
            html += '<div class="tree-display">';
            treeLines1.forEach(line => {
                html += `<div class="tree-line">${line.replace(/ /g, '&nbsp;')}</div>`;
            });
            html += '</div>';
            html += `<div class="prime-factors">Prime factors: ${primeFactors1.join(' × ')}</div>`;
            html += `<div class="prime-factors">${num1} = ${primeFactors1.join(' × ')}</div>`;
            html += '</div>';
            
            // Second tree
            html += '<div class="compare-tree">';
            html += `<h4>Number: ${num2}</h4>`;
            html += '<div class="tree-display">';
            treeLines2.forEach(line => {
                html += `<div class="tree-line">${line.replace(/ /g, '&nbsp;')}</div>`;
            });
            html += '</div>';
            html += `<div class="prime-factors">Prime factors: ${primeFactors2.join(' × ')}</div>`;
            html += `<div class="prime-factors">${num2} = ${primeFactors2.join(' × ')}</div>`;
            html += '</div>';
            
            compareTreesContainer.innerHTML = html;
        }, 10);
    });
    
    compareInput1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            compareBtn.click();
        }
    });
    
    compareInput2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            compareBtn.click();
        }
    });
    
    // Polynomial Factoring
    const factorPolynomialBtn = document.getElementById('factor-polynomial-btn');
    const polynomialInput = document.getElementById('polynomial-input');
    const polynomialResult = document.getElementById('polynomial-result');
    
    factorPolynomialBtn.addEventListener('click', () => {
        const poly = polynomialInput.value.trim();
        
        if (!poly) {
            polynomialResult.innerHTML = '<p class="error">Please enter a polynomial.</p>';
            return;
        }
        
        polynomialResult.innerHTML = '<div class="loading">Factoring...</div>';
        
        setTimeout(() => {
            const result = factorQuadratic(poly);
            
            if (!result.success) {
                polynomialResult.innerHTML = `<p class="error">${result.message}</p>`;
                return;
            }
            
            let html = '<div class="result-success">';
            html += `<p><strong>Original:</strong> \\(${toLatex(result.original)}\\)</p>`;
            html += `<p><strong>Factored:</strong> \\(${toLatex(result.factored)}\\)</p>`;
            html += '</div>';
            
            polynomialResult.innerHTML = html;
            
            // Render MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([polynomialResult]).catch((err) => console.log(err));
            }
        }, 10);
    });
    
    polynomialInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            factorPolynomialBtn.click();
        }
    });
    
    // Compare Polynomials
    const comparePolyBtn = document.getElementById('compare-poly-btn');
    const polyCompare1 = document.getElementById('poly-compare-1');
    const polyCompare2 = document.getElementById('poly-compare-2');
    const polyCompareResult = document.getElementById('poly-compare-result');
    
    comparePolyBtn.addEventListener('click', () => {
        const poly1 = polyCompare1.value.trim();
        const poly2 = polyCompare2.value.trim();
        
        if (!poly1 || !poly2) {
            polyCompareResult.innerHTML = '<p class="error">Please enter two polynomials.</p>';
            return;
        }
        
        polyCompareResult.innerHTML = '<div class="loading">Calculating...</div>';
        
        setTimeout(() => {
            const result = polynomialGCF(poly1, poly2);
            
            if (!result.success) {
                polyCompareResult.innerHTML = `<p class="error">${result.message}</p>`;
                return;
            }
            
            const factor1 = factorQuadratic(poly1);
            const factor2 = factorQuadratic(poly2);
            
            let html = '<div class="result-success">';
            html += `<p><strong>Polynomial 1:</strong> \\(${toLatex(poly1)}\\)</p>`;
            if (factor1.success) {
                html += `<p style="margin-left: 2rem;"><strong>Factored:</strong> \\(${toLatex(factor1.factored)}\\)</p>`;
            }
            html += `<p><strong>Polynomial 2:</strong> \\(${toLatex(poly2)}\\)</p>`;
            if (factor2.success) {
                html += `<p style="margin-left: 2rem;"><strong>Factored:</strong> \\(${toLatex(factor2.factored)}\\)</p>`;
            }
            html += `<p><strong>GCF:</strong> \\(${toLatex(result.gcf)}\\)</p>`;
            html += '</div>';
            
            polyCompareResult.innerHTML = html;
            
            // Render MathJax
            if (window.MathJax) {
                MathJax.typesetPromise([polyCompareResult]).catch((err) => console.log(err));
            }
        }, 10);
    });
    
    polyCompare1.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            comparePolyBtn.click();
        }
    });
    
    polyCompare2.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            comparePolyBtn.click();
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
    const minMultiplierInput = document.getElementById('min-multiplier');
    const maxMultiplierInput = document.getElementById('max-multiplier');
    const randomOrderCheckbox = document.getElementById('random-order');
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
    
    minMultiplierInput.addEventListener('change', (e) => {
        const newMin = parseInt(e.target.value);
        if (!isNaN(newMin) && newMin >= 1 && newMin <= maxMultiplier) {
            minMultiplier = newMin;
            if (screensaverActive) {
                stopScreensaver();
                startScreensaver();
            }
        }
    });
    
    maxMultiplierInput.addEventListener('change', (e) => {
        const newMax = parseInt(e.target.value);
        if (!isNaN(newMax) && newMax >= minMultiplier && newMax <= 1000) {
            maxMultiplier = newMax;
            if (screensaverActive) {
                stopScreensaver();
                startScreensaver();
            }
        }
    });
    
    randomOrderCheckbox.addEventListener('change', (e) => {
        randomOrder = e.target.checked;
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
    
    // Fullscreen functionality
    let fullscreenScreensaverActive = false;
    let fullscreenInterval = null;
    
    let fullscreenPrimeIndex = 0;
    let fullscreenIsProcessing = false;
    let fullscreenAfterimages = [];
    let fullscreenPrimes = [];
    let fullscreenPrimeDropCount = 0;
    let fullscreenCurrentColumn = 0;
    let fullscreenColumnAfterimages = [[], [], [], [], [], [], [], []]; // 8 columns for fullscreen
    
    function updateFullscreenPrimeDisplay(prime) {
        const display = document.getElementById('fullscreen-prime-display');
        if (display) {
            display.textContent = prime.toString();
        }
    }
    
    function getFullscreenColumnPosition(columnIndex) {
        const columnWidth = window.innerWidth / 8;
        return (columnIndex * columnWidth + 20) + 'px';
    }
    
    function startFullscreenScreensaver() {
        if (fullscreenScreensaverActive) return;
        fullscreenScreensaverActive = true;
        fullscreenPrimeIndex = 0;
        fullscreenIsProcessing = false;
        fullscreenAfterimages = [];
        fullscreenCurrentColumn = 0;
        fullscreenColumnAfterimages = [[], [], [], [], [], [], [], []];
        
        // Create stationary prime display
        const topbar = document.createElement('div');
        topbar.id = 'prime-topbar-fullscreen';
        topbar.className = 'prime-topbar';
        screensaverFullscreen.appendChild(topbar);
        
        fullscreenPrimes = [];
        for (let i = primeRange.start; i <= primeRange.end; i++) {
            if (isPrime(i)) {
                fullscreenPrimes.push(i);
            }
        }
        
        if (fullscreenPrimes.length === 0) return;
        
        const primeEl = document.createElement('span');
        primeEl.id = 'fullscreen-prime-display';
        primeEl.className = 'topbar-prime';
        primeEl.textContent = fullscreenPrimes[0].toString();
        topbar.appendChild(primeEl);
        
        // Start dropping first prime
        setTimeout(() => {
            if (fullscreenPrimes.length > 0) {
                startDroppingMultiplesForContainer(fullscreenPrimes[0], screensaverFullscreen);
            }
        }, 1000);
    }
    
    function stopFullscreenScreensaver() {
        fullscreenScreensaverActive = false;
        if (fullscreenInterval) {
            clearInterval(fullscreenInterval);
            fullscreenInterval = null;
        }
        fullscreenIsProcessing = false;
        fullscreenPrimeIndex = 0;
        fullscreenAfterimages = [];
        fullscreenPrimeDropCount = 0;
        fullscreenCurrentColumn = 0;
        fullscreenColumnAfterimages = [[], [], [], [], [], [], [], []];
        screensaverFullscreen.innerHTML = '';
    }
    
    function processNextFullscreenPrime() {
        if (!fullscreenScreensaverActive || fullscreenIsProcessing) return;
        
        if (fullscreenPrimes.length === 0) return;
        
        fullscreenPrimeIndex = (fullscreenPrimeIndex + 1) % fullscreenPrimes.length;
        const nextPrime = fullscreenPrimes[fullscreenPrimeIndex];
        
        startDroppingMultiplesForContainer(nextPrime, screensaverFullscreen);
    }
    
    function startDroppingMultiplesForContainer(prime, container) {
        if (fullscreenIsProcessing) return;
        fullscreenIsProcessing = true;
        
        // Update prime display
        updateFullscreenPrimeDisplay(prime);
        
        const fallSpeed = screensaverSpeed * 0.5;
        let currentMultiplierIndex = 0;
        const elementSpacing = 50;
        const columnLeft = getFullscreenColumnPosition(fullscreenCurrentColumn);
        
        // Create array of multipliers in range
        const multipliers = [];
        for (let i = minMultiplier; i <= maxMultiplier; i++) {
            multipliers.push(i);
        }
        
        // Shuffle if random order is enabled
        if (randomOrder) {
            for (let i = multipliers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [multipliers[i], multipliers[j]] = [multipliers[j], multipliers[i]];
            }
        }
        
        function createAndDropNextMultiple() {
            if (currentMultiplierIndex >= multipliers.length) {
                // All multiples done - move to next column and prime
                fullscreenIsProcessing = false;
                fullscreenCurrentColumn = (fullscreenCurrentColumn + 1) % 8; // Cycle through 8 columns
                
                // Clear the NEXT column before we start dropping into it
                const nextColumn = fullscreenCurrentColumn;
                fullscreenColumnAfterimages[nextColumn].forEach(el => el.remove());
                fullscreenColumnAfterimages[nextColumn] = [];
                
                setTimeout(() => {
                    processNextFullscreenPrime();
                }, 2000);
                return;
            }
            
            const multiplier = multipliers[currentMultiplierIndex];
            currentMultiplierIndex++;
            
            const element = document.createElement('div');
            element.className = 'falling-element';
            const result = prime * multiplier;
            element.textContent = `${multiplier} × ${prime} = ${result}`;
            element.style.left = columnLeft;
            element.style.top = '60px';
            element.style.opacity = '1';
            element.dataset.prime = prime;
            element.dataset.multiplier = multiplier;
            
            container.appendChild(element);
            
            // Calculate target position with proper spacing
            const targetPosition = 100 + (currentMultiplierIndex * elementSpacing);
            
            let position = 60;
            
            function animate() {
                if (!fullscreenScreensaverActive) {
                    element.remove();
                    fullscreenIsProcessing = false;
                    return;
                }
                
                if (position < targetPosition) {
                    position += fallSpeed;
                    element.style.top = position + 'px';
                    requestAnimationFrame(animate);
                } else {
                    // Reached target
                    position = targetPosition;
                    element.style.top = position + 'px';
                    element.classList.add('afterimage');
                    fullscreenColumnAfterimages[fullscreenCurrentColumn].push(element);
                    
                    // Start next multiple after delay
                    setTimeout(() => {
                        createAndDropNextMultiple();
                    }, 600);
                }
            }
            
            animate();
        }
        
        createAndDropNextMultiple();
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
