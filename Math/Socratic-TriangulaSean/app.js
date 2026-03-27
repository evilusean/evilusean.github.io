// Basic Boilerplate for Socratic TriangulaSean
const state = {
    currentCase: null,
    isScreensaver: false,
    step: 0
};

const dialogue = document.getElementById('message');
const genBtn = document.getElementById('generate');

function init() {
    console.log("Socratic TriangulaSean initialized.");
    
    genBtn.addEventListener('click', () => {
        state.currentCase = 'SAS'; // Placeholder logic
        renderDialogue("I've generated a triangle with two sides and an included angle. What's our first move?");
    });
}

function renderDialogue(text) {
    dialogue.innerText = text;
}

// Start the app
init();