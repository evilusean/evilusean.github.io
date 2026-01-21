// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('clickMe');

    button.addEventListener('click', () => {
        alert('JavaScript is connected!');
        console.log('The button was clicked.');
    });
});