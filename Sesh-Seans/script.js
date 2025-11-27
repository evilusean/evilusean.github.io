// Get a reference to the button and the output paragraph
const button = document.getElementById('actionButton');
const output = document.getElementById('outputMessage');

// Counter to track the number of clicks
let clickCount = 0;

// Add an event listener to the button
button.addEventListener('click', () => {
    clickCount++;
    // Update the text in the output paragraph
    output.textContent = `Button clicked ${clickCount} time(s)! The site is working.`;
    
    // Optional: Log to the browser console
    console.log('Button was clicked.');
});

// Initial message display
window.onload = () => {
    console.log('Page loaded successfully.');
    output.textContent = 'Click the button above to see the JavaScript in action!';
};