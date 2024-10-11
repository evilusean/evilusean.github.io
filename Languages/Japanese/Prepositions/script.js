const randomizeButton = document.getElementById('randomize-button');
const showAnswerButton = document.getElementById('show-answer-button');
const ball = document.getElementById('ball');
const japaneseAnswer = document.getElementById('japanese-answer');
const romajiAnswer = document.getElementById('romaji-answer');

const randomDirectionButton = document.getElementById('random-direction-button');
const showDirectionAnswerButton = document.getElementById('show-direction-answer-button');
const directionAnswer = document.getElementById('direction-answer');
const directionRomaji = document.getElementById('direction-romaji');

const showCompassAnswerButton = document.getElementById('show-compass-answer-button');
const compassAnswer = document.getElementById('compass-answer');
const compassRomaji = document.getElementById('compass-romaji');

// Define specific positions and their corresponding Japanese answers
const positions = [
    { position: 'top', answer: 'ボールは上にあります。', romaji: 'Bōru wa ue ni arimasu.' },
    { position: 'middle', answer: 'ボールは真ん中にあります。', romaji: 'Bōru wa mannaka ni arimasu.' },
    { position: 'left', answer: 'ボールは左にあります。', romaji: 'Bōru wa hidari ni arimasu.' },
    { position: 'right', answer: 'ボールは右にあります。', romaji: 'Bōru wa migi ni arimasu.' },
    { position: 'in', answer: 'ボールは中にあります。', romaji: 'Bōru wa naka ni arimasu.' },
    { position: 'below', answer: 'ボールは下にあります。', romaji: 'Bōru wa shita ni arimasu.' }
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

// Show Japanese answer based on the current position of the ball
showAnswerButton.addEventListener('click', () => {
    const answerObj = positions.find(pos => pos.position === currentPosition);
    if (answerObj) {
        japaneseAnswer.textContent = answerObj.answer; // Update the answer text
        romajiAnswer.textContent = answerObj.romaji; // Update the Romaji text
        japaneseAnswer.style.display = 'block'; // Show the Japanese answer
        romajiAnswer.style.display = 'block'; // Show the Romaji answer
    } else {
        japaneseAnswer.style.display = 'none'; // Hide if no position is set
        romajiAnswer.style.display = 'none'; // Hide if no position is set
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
    { direction: 'straight', answer: '方向はまっすぐです (上)。', romaji: 'Hōkō wa massugu desu (ue).' }, // Added (上) for up
    { direction: 'behind', answer: '方向は後ろです (下)。', romaji: 'Hōkō wa ushiro desu (shita).' }, // Added (下) for down
    { direction: 'left', answer: '方向は左です。', romaji: 'Hōkō wa hidari desu.' },
    { direction: 'right', answer: '方向は右です。', romaji: 'Hōkō wa migi desu.' }
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
    const answerObj = directions.find(dir => dir.direction === currentArrowDirection);
    if (answerObj) {
        directionAnswer.textContent = answerObj.answer; // Update the answer text
        directionRomaji.textContent = answerObj.romaji; // Update the Romaji text
        directionAnswer.style.display = 'block'; // Show the Japanese answer
        directionRomaji.style.display = 'block'; // Show the Romaji answer
    } else {
        directionAnswer.style.display = 'none'; // Hide if no direction is set
        directionRomaji.style.display = 'none'; // Hide if no direction is set
    }
});

// Compass functionality for compass directions (N, NE, E, SE, S, SW, W, NW)
const compassDirections = [
    { direction: 'N', answer: '方向は北です。', romaji: 'Hōkō wa kita desu.' },
    { direction: 'NE', answer: '方向は北東です。', romaji: 'Hōkō wa hokutō desu.' },
    { direction: 'E', answer: '方向は東です。', romaji: 'Hōkō wa higashi desu.' },
    { direction: 'SE', answer: '方向は南東です。', romaji: 'Hōkō wa nantō desu.' },
    { direction: 'S', answer: '方向は南です。', romaji: 'Hōkō wa minami desu.' },
    { direction: 'SW', answer: '方向は南西です。', romaji: 'Hōkō wa nansei desu.' },
    { direction: 'W', answer: '方向は西です。', romaji: 'Hōkō wa nishi desu.' },
    { direction: 'NW', answer: '方向は北西です。', romaji: 'Hōkō wa hokusei desu.' }
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
    const answerObj = compassDirections.find(dir => dir.direction === currentCompassDirection);
    if (answerObj) {
        compassAnswer.textContent = answerObj.answer; // Update the answer text
        compassRomaji.textContent = answerObj.romaji; // Update the Romaji text
        compassAnswer.style.display = 'block'; // Show the Japanese answer
        compassRomaji.style.display = 'block'; // Show the Romaji answer
    } else {
        compassAnswer.style.display = 'none'; // Hide if no direction is set
        compassRomaji.style.display = 'none'; // Hide if no direction is set
    }
});