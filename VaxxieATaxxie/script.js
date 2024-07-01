//First attempt, tried to run, didn't work, will work on it in bits, still need assets? Axxets? Ackets?
//got all the main functionality here, just need to piece it together so it works, then make it pretty

// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Move the camera back
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a circle geometry and material
const circleGeometry = new THREE.CircleGeometry(0.1, 32);
const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const circle = new THREE.Mesh(circleGeometry, circleMaterial);
scene.add(circle);


// Function to update the circle's position based on mouse coordinates
function updateCirclePosition(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    circle.position.copy(vector);
}

// Add event listener for mouse movement
window.addEventListener('mousemove', updateCirclePosition);

// Create a square geometry and material
const squareGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const squareMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

// Array to store square objects
const squares = [];

// Function to spawn a new square
function spawnSquare() {
    // Randomly choose a corner
    const corners = [
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(1, -1, 0),
        new THREE.Vector3(-1, 1, 0),
        new THREE.Vector3(1, 1, 0)
    ];
    const randomCorner = corners[Math.floor(Math.random() * corners.length)];

    // Create a new square
    const square = new THREE.Mesh(squareGeometry, squareMaterial);
    square.position.copy(randomCorner);
    square.position.z = 0.5;
    squares.push(square);
    scene.add(square);
}

// Call spawnSquare every few seconds
setInterval(spawnSquare, 2000); // Spawns every 2 seconds

// Function to update the position of squares
function updateSquares() {
    for (let i = 0; i < squares.length; i++) {
        const square = squares[i];

        // Calculate direction towards the circle
        const direction = new THREE.Vector3();
        direction.subVectors(circle.position, square.position).normalize();

        // Move the square towards the circle
        square.position.addScaledVector(direction, 0.01); // Adjust speed as needed
    }
}

// Function to check if the player has won
function checkWinCondition() {
    if (squares.length <= 25) {
        console.log("You Win!");
        // Add your win logic here (e.g., display a message, stop the game)
    }
}

// Game loop
function animate() {
    requestAnimationFrame(animate);
 
    // Update square positions
    updateSquares();
 
    // Check win condition
    checkWinCondition();
 
    // Render the scene
    renderer.render(scene, camera);
 }
 
 animate();