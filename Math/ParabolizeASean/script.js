// app.js
document.getElementById('calc').addEventListener('click', () => {
    const f = document.getElementById('force').value;
    const a = document.getElementById('angle').value;
    console.log(`Calculating trajectory for Force: ${f}, Angle: ${a}`);
    
    const canvas = document.getElementById('simCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Placeholder animation logic
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(50, 300, 10, 0, Math.PI * 2);
    ctx.fill();
    
    document.getElementById('equation').innerText = "y = x*tan(θ) - (g*x^2)/(2*v^2*cos^2(θ))";
});