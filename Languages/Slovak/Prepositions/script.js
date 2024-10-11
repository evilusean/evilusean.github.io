const randomizeButton = document.getElementById('randomize-button');
const showAnswerButton = document.getElementById('show-answer-button');
const ball = document.getElementById('ball');
const slovakAnswer = document.getElementById('slovak-answer');

// Define specific positions and their corresponding Slovak answers
const positions = [
    { position: 'top', answer: 'Lopta je na vrchu.' },
    { position: 'middle', answer: 'Lopta je v strede.' },
    { position: 'left', answer: 'Lopta je na ľavej strane.' },
    { position: 'right', answer: 'Lopta je na pravej strane.' },
    { position: 'in', answer: 'Lopta je vo vnútri.' },
    { position: 'below', answer: 'Lopta je pod kockou.' } // Added below position
];

let currentPosition = null; // To keep track of the current position

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