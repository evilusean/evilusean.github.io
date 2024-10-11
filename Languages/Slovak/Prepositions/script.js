const randomizeButton = document.getElementById('randomize-button');
const showAnswerButton = document.getElementById('show-answer-button');
const ball = document.getElementById('ball');
const slovakAnswer = document.getElementById('slovak-answer');

const randomDirectionButton = document.getElementById('random-direction-button');
const showDirectionAnswerButton = document.getElementById('show-direction-answer-button');
const directionAnswer = document.getElementById('direction-answer');

const showCompassAnswerButton = document.getElementById('show-compass-answer-button');
const compassAnswer = document.getElementById('compass-answer');

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

// Function to set the ball's position
function setBallPosition(position) {
    switch (position) {
        case 'top':
            ball.style.top = '20px'; // Move ball to the top
            ball.style.left = '115px'; // Centered above the cube
            break;
        case 'middle':
            ball.style.top = '115px'; // Move ball to the middle
            ball.style.left = '115px'; // Centered in the middle
            break;
        case 'left':
            ball.style.top = '115px'; // Move ball to the left
            ball.style.left = '20px'; // Centered to the left of the cube
            break;
        case 'right':
            ball.style.top = '115px'; // Move ball to the right
            ball.style.left = '180px'; // Centered to the right of the cube
            break;
        case 'in':
            ball.style.top = '100px'; // Move ball inside the cube
            ball.style.left = '100px'; // Centered inside the cube
            break;
        case 'below':
            ball.style.top = '220px'; // Move ball below the cube
            ball.style.left = '115px'; // Centered below the cube
            break;
    }
    currentPosition = position; // Update current position
}

// Click event listener for the quiz area
const quizArea = document.getElementById('quiz-area');
quizArea.addEventListener('click', (event) => {
    const rect = quizArea.getBoundingClientRect();
    const x = event.clientX - rect.left; // Get x position relative to the quiz area
    const y = event.clientY - rect.top; // Get y position relative to the quiz area

    const cube = document.getElementById('cube');
    const cubeRect = cube.getBoundingClientRect();

    // Determine the position based on where the click occurred
    if (y < cubeRect.top - rect.top) {
        setBallPosition('top'); // Clicked above the cube
    } else if (y > cubeRect.bottom - rect.top) {
        setBallPosition('below'); // Clicked below the cube
    } else if (x < cubeRect.left - rect.left) {
        setBallPosition('left'); // Clicked to the left of the cube
    } else if (x > cubeRect.right - rect.left) {
        setBallPosition('right'); // Clicked to the right of the cube
    } else {
        setBallPosition('in'); // Clicked inside the cube
    }
});

// Show Slovak answer based on the current position of the ball
showAnswerButton.addEventListener('click', () => {
    const answer = positions.find(pos => pos.position === currentPosition)?.answer;
    if (answer) {
        slovakAnswer.textContent = answer; // Update the answer text
        slovakAnswer.style.display = 'block'; // Show the Slovak answer
    } else {
        slovakAnswer.style.display = 'none'; // Hide if no position is set
    }
});

// Randomize button functionality
randomizeButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * positions.length);
    const randomPosition = positions[randomIndex].position;
    setBallPosition(randomPosition); // Set the ball to a random position
});

// Direction functionality for arrows (straight, behind, left, right)
const directions = [
    { direction: 'straight', answer: 'Smer je rovno.' }, // Changed from 'up' to 'straight'
    { direction: 'behind', answer: 'Smer je za.' }, // Changed from 'down' to 'behind'
    { direction: 'left', answer: 'Smer je vľavo.' },
    { direction: 'right', answer: 'Smer je vpravo.' }
];

let currentArrowDirection = null; // To keep track of the current arrow direction

// Add click event listeners to arrows
document.querySelectorAll('.arrow').forEach(arrow => {
    arrow.addEventListener('click', () => {
        currentArrowDirection = arrow.id.replace('arrow-', ''); // Get the direction from the arrow ID
        document.querySelectorAll('.arrow').forEach(a => {
            a.classList.remove('active'); // Reset all arrows
            a.style.fontWeight = 'normal'; // Reset font weight
            a.style.color = ''; // Reset color
        });
        arrow.classList.add('active'); // Highlight the selected arrow
        arrow.style.fontWeight = 'bold'; // Make it bold
        arrow.style.color = 'red'; // Change color to red
    });
});

// Random direction button functionality
randomDirectionButton.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * directions.length);
    currentArrowDirection = directions[randomIndex].direction;

    // Highlight the selected arrow
    document.querySelectorAll('.arrow').forEach(arrow => {
        arrow.classList.remove('active'); // Reset all arrows
        arrow.style.fontWeight = 'normal'; // Reset font weight
        arrow.style.color = ''; // Reset color
    });
    const selectedArrow = document.getElementById(`arrow-${currentArrowDirection}`);
    if (selectedArrow) {
        selectedArrow.classList.add('active'); // Add active class to change color
        selectedArrow.style.fontWeight = 'bold'; // Make it bold
        selectedArrow.style.color = 'red'; // Change color to red
    }
});

// Show direction answer based on the current arrow direction
showDirectionAnswerButton.addEventListener('click', () => {
    const answer = directions.find(dir => dir.direction === currentArrowDirection)?.answer;
    if (answer) {
        directionAnswer.textContent = answer; // Update the answer text
        directionAnswer.style.display = 'block'; // Show the Slovak answer
    } else {
        directionAnswer.style.display = 'none'; // Hide if no direction is set
    }
});

// Compass functionality for compass directions (N, NE, E, SE, S, SW, W, NW)
const compassDirections = [
    { direction: 'N', answer: 'Smer je na sever.' },
    { direction: 'NE', answer: 'Smer je na severovýchod.' },
    { direction: 'E', answer: 'Smer je na východ.' },
    { direction: 'SE', answer: 'Smer je na juhovýchod.' },
    { direction: 'S', answer: 'Smer je na juh.' },
    { direction: 'SW', answer: 'Smer je na juhozápad.' },
    { direction: 'W', answer: 'Smer je na západ.' },
    { direction: 'NW', answer: 'Smer je na severozápad.' }
];

let currentCompassDirection = null; // To keep track of the current compass direction

// Add click event listeners to compass directions
document.querySelectorAll('.compass-direction').forEach(compass => {
    compass.addEventListener('click', () => {
        currentCompassDirection = compass.id; // Get the direction from the compass ID
        document.querySelectorAll('.compass-direction').forEach(c => {
            c.classList.remove('active'); // Reset all compass directions
            c.style.fontWeight = 'normal'; // Reset font weight
            c.style.color = ''; // Reset color
        });
        compass.classList.add('active'); // Highlight the selected compass direction
        compass.style.fontWeight = 'bold'; // Make it bold
        compass.style.color = 'red'; // Set the color to red for the selected direction
    });
});

// Random compass direction functionality
document.getElementById('random-compass-direction-button').addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * compassDirections.length);
    currentCompassDirection = compassDirections[randomIndex].direction;

    // Highlight the selected compass direction
    document.querySelectorAll('.compass-direction').forEach(c => {
        c.classList.remove('active'); // Reset all compass directions
        c.style.fontWeight = 'normal'; // Reset font weight
        c.style.color = ''; // Reset color
    });
    const selectedCompass = document.getElementById(currentCompassDirection);
    selectedCompass.classList.add('active'); // Highlight the selected compass direction
    selectedCompass.style.fontWeight = 'bold'; // Make it bold
    selectedCompass.style.color = 'red'; // Set the color to red for the selected direction
});

// Show compass answer based on the current compass direction
showCompassAnswerButton.addEventListener('click', () => {
    const answer = compassDirections.find(dir => dir.direction === currentCompassDirection)?.answer;
    if (answer) {
        compassAnswer.textContent = answer; // Update the answer text
        compassAnswer.style.display = 'block'; // Show the Slovak answer
    } else {
        compassAnswer.style.display = 'none'; // Hide if no direction is set
    }
});