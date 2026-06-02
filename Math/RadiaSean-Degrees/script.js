function convert() {
    const val = parseFloat(document.getElementById('inputVal').value);
    const type = document.getElementById('inputType').value;
    const results = document.getElementById('results');
    
    let degrees = type === 'deg' ? val : val * (180 / Math.PI);
    let radians = type === 'rad' ? val : val * (Math.PI / 180);

    results.innerHTML = `
        <p>Degrees: ${degrees.toFixed(2)}°</p>
        <p>Radians: ${radians.toFixed(4)} rad</p>
    `;
    drawProtractor(degrees);
}

function drawProtractor(deg) {
    const canvas = document.getElementById('protractor');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 300, 300);
    ctx.beginPath();
    ctx.arc(150, 150, 100, 0, (deg * Math.PI) / 180);
    ctx.stroke();
}