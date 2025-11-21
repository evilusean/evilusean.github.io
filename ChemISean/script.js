// Sample element data - expand this with all 118 elements
const elements = [
    { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', row: 1, col: 1 },
    { number: 2, symbol: 'He', name: 'Helium', mass: 4.003, category: 'noble-gas', row: 1, col: 18 },
    { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.941, category: 'alkali-metal', row: 2, col: 1 },
    { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.012, category: 'alkaline-earth', row: 2, col: 2 },
    { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', row: 2, col: 13 },
    { number: 6, symbol: 'C', name: 'Carbon', mass: 12.01, category: 'nonmetal', row: 2, col: 14 },
    { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.01, category: 'nonmetal', row: 2, col: 15 },
    { number: 8, symbol: 'O', name: 'Oxygen', mass: 16.00, category: 'nonmetal', row: 2, col: 16 },
    { number: 9, symbol: 'F', name: 'Fluorine', mass: 19.00, category: 'halogen', row: 2, col: 17 },
    { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.18, category: 'noble-gas', row: 2, col: 18 },
    // Add more elements here...
];

// Generate periodic table
function generatePeriodicTable() {
    const table = document.getElementById('periodic-table');
    
    elements.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.className = `element ${element.category}`;
        elementDiv.style.gridColumn = element.col;
        elementDiv.style.gridRow = element.row;
        
        elementDiv.innerHTML = `
            <div class="atomic-number">${element.number}</div>
            <div class="symbol">${element.symbol}</div>
            <div class="name">${element.name}</div>
            <div class="mass">${element.mass}</div>
        `;
        
        elementDiv.addEventListener('click', () => showElementInfo(element));
        
        table.appendChild(elementDiv);
    });
}

// Show element information
function showElementInfo(element) {
    const infoDiv = document.getElementById('element-info');
    const nameEl = document.getElementById('element-name');
    const detailsEl = document.getElementById('element-details');
    
    nameEl.textContent = `${element.name} (${element.symbol})`;
    detailsEl.innerHTML = `
        <strong>Atomic Number:</strong> ${element.number}<br>
        <strong>Atomic Mass:</strong> ${element.mass}<br>
        <strong>Category:</strong> ${element.category.replace('-', ' ')}
    `;
    
    infoDiv.classList.remove('hidden');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', generatePeriodicTable);
