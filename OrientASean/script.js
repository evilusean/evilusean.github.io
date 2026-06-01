function calculateSolar() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    
    if (isNaN(lat) || isNaN(lng)) {
        alert("Please enter valid coordinates.");
        return;
    }

    const now = new Date();
    const sunPos = SunCalc.getPosition(now, lat, lng);
    
    // Convert radians to degrees for readability
    const azimuth = (sunPos.azimuth * 180 / Math.PI) + 180;
    const altitude = (sunPos.altitude * 180 / Math.PI);

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p><strong>Current Sun Analysis:</strong></p>
        <p>Azimuth: ${azimuth.toFixed(2)}°</p>
        <p>Altitude: ${altitude.toFixed(2)}°</p>
        <p><em>Note: For optimal heating, aim to elongate structures along the East-West axis.</em></p>
    `;
}