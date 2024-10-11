const randomizeButton = document.getElementById('randomize-button');
const showAnswerButton = document.getElementById('show-answer-button');
const ball = document.getElementById('ball');
const slovakAnswer = document.getElementById('slovak-answer');

const randomDirectionButton = document.getElementById('random-direction-button');
const showDirectionAnswerButton = document.getElementById('show-direction-answer-button');
const directionAnswer = document.getElementById('direction-answer');

// Define specific positions and their corresponding Slovak answers
const positions = [
    { position: 'top', answer: 'Lopta je na vrchu.' },
    { position: 'middle', answer: 'Lopta je v strede.' },
    { position: 'left', answer: 'Lopta je na ľavej strane.' },
    { position: 'right', answer: 'Lopta je na pravej strane.' },
    { position: 'in', answer: 'Lopta je vo vnútri.' },
    { position: 'below', answer: 'Lopta je pod kockou.' }
];

let currentPosition = null; // To keep track of the current position

// Clickable area for setting the ball's position
const clickableArea = document.createElement('div');
clickableArea.id = 'clickable-area';
document.getElementById('quiz-area').appendChild(clickableArea);

clickableArea.addEventListener('click', (event) => {
    const rect = clickableArea.getBoundingClientRect();
    const x = event.clientX - rect.left; // Get x position relative to the cube
    const y = event.clientY - rect.top; // Get y position relative to the cube

    // Set the ball's position based on the click location
    if (y < 100) {
        ball.style.top = '20px'; // Top
        ball.style.left = `${x - 15}px`; // Centered horizontally
        currentPosition = 'top';
    } else if (y > 200) {
        ball.style.top = '220px'; // Below
        ball.style.left = `${x - 15}px`; // Centered horizontally
        currentPosition = 'below';
    } else if (x < 100) {
        ball.style.top = '115px'; // Left
        ball.style.left = '20px'; // Centered to the left of the cube
        currentPosition = 'left';
    } else if (x > 200) {
        ball.style.top = '115px'; // Right
        ball.style.left = '180px'; // Centered to the right of the cube
        currentPosition = 'right';
    } else {
        ball.style.top = '115px'; // Middle
        ball.style.left = '115px'; // Centered in the middle
        currentPosition = 'middle';
    }
});

randomizeButton.addEventListener('click', () => {
    // Randomly select a position from the defined positions
    const randomIndex = Math.floor(Math.random() * positions.length);
    currentPosition = positions[randomIndex].position;

    // Set the ball's position based on the selected position
    switch (currentPosition) {
        case 'top':
            ball.style.top = '20px';
            ball.style.left = '115px'; // Centered above the cube
            break;
        case 'middle':
            ball.style.top = '115px';
            ball.style.left = '115px'; // Centered in the middle
            break;
        case 'left':
            ball.style.top = '115px';
            ball.style.left = '20px'; // Centered to the left of the cube
            break;
        case 'right':
            ball.style.top = '115px';
            ball.style.left = '180px'; // Centered to the right of the cube
            break;
        case 'in':
            ball.style.top = '100px';
            ball.style.left = '100px'; // Centered inside the cube
            break;
        case 'below':
            ball.style.top = '220px';
            ball.style.left = '115px'; // Centered below the cube
            break;
    }
});

showAnswerButton.addEventListener('click', () => {
    // Find the answer based on the current position
    const answer = positions.find(pos => pos.position === currentPosition)?.answer;
    if (answer) {
        slovakAnswer.textContent = answer; // Update the answer text
        slovakAnswer.style.display = 'block'; // Show the Slovak answer
    } else {
        slovakAnswer.style.display = 'none'; // Hide if no position is set
    }
});

// Direction functionality
const directions = [
    { direction: 'up', answer: 'Smer je hore.' },
    { direction: 'left', answer: 'Smer je vľavo.' },
    { direction: 'right', answer: 'Smer je vpravo.' },
    { direction: 'down', answer: 'Smer je dole.' }
];

let currentDirection = null; // To keep track of the current direction

randomDirectionButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * directions.length);
    currentDirection = directions[randomIndex].direction;

    // Highlight the selected arrow
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.style.fontWeight = 'normal'; // Reset all arrows
        arrow.classList.remove('active'); // Remove active class
    });
    const selectedArrow = document.getElementById(`arrow-${currentDirection}`);
    selectedArrow.style.fontWeight = 'bold'; // Highlight the selected arrow
    selectedArrow.classList.add('active'); // Add active class to change color
});

showDirectionAnswerButton.addEventListener('click', () => {
    const answer = directions.find(dir => dir.direction === currentDirection)?.answer;
    if (answer) {
        directionAnswer.textContent = answer; // Update the answer text
        directionAnswer.style.display = 'block'; // Show the Slovak answer
    } else {
        directionAnswer.style.display = 'none'; // Hide if no direction is set
    }
});