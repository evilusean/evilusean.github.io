const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const stepInput = document.getElementById('step');
const generateButton = document.getElementById('generateNumber');
const numberInput = document.getElementById('numberInput');
const revealButton = document.getElementById('revealAnswer');
const answerDisplay = document.getElementById('answerDisplay');

let currentNumber = null;

function getSlovakNumber(number) {
    if (number === 0) return "nula";
  
    const units = ["", "jeden", "dva", "tri", "štyri", "päť", "šesť", "sedem", "osem", "deväť"];
    const teens = ["desať", "jedenásť", "dvanásť", "trinásť", "štrnásť", "pätnásť", "šestnásť", "sedemnásť", "osemnásť", "devätnásť"];
    const tens = ["", "", "dvadsať", "tridsať", "štyridsať", "päťdesiat", "šesťdesiat", "sedemdesiat", "osemdesiat", "deväťdesiat"];
    const hundreds = ["", "sto", "dvesto", "tristo", "štyristo", "päťsto", "šesťsto", "sedemsto", "osemsto", "deväťsto"];
  
    if (number < 10) return units[number];
    if (number < 20) return teens[number - 10];
  
    let slovak = "";
  
    if (number < 100) {
      slovak += tens[Math.floor(number / 10)];
      if (number % 10 !== 0) {
        slovak += " " + units[number % 10];
      }
    } else if (number < 1000) {
      slovak += hundreds[Math.floor(number / 100)];
      if (number % 100 !== 0) {
        slovak += " " + getSlovakNumber(number % 100);
      }
    } else if (number < 1000000) {
      // Recursively call for thousands place and beyond
      slovak += getSlovakNumber(Math.floor(number / 1000)) + " tisíc"; 
      if (number % 1000 !== 0) {
        slovak += " " + getSlovakNumber(number % 1000);
      }
    } else if (number < 1000000000) { 
      // Recursively call for millions place and beyond
      slovak += getSlovakNumber(Math.floor(number / 1000000)) + " miliónov"; 
      if (number % 1000000 !== 0) {
        slovak += " " + getSlovakNumber(number % 1000000);
      }
    } else {
      return "Number too large"; 
    }
  
    return slovak.trim();
  }

  function generateRandomNumber() {
    const min = parseInt(minNumberInput.value);
    const max = parseInt(maxNumberInput.value);
    const step = parseInt(stepInput.value);
  
    const adjustedMax = max - (max % step);
    const adjustedMin = min + ((step - (min % step)) % step);
    const randomNumber = Math.floor(Math.random() * ((adjustedMax - adjustedMin) / step + 1)) * step + adjustedMin;
  
    numberInput.value = randomNumber; // Display the random number in the input field
  }
  
  function displayAnswer() {
    const number = parseInt(numberInput.value);
    if (!isNaN(number)) {
      answerDisplay.textContent = getSlovakNumber(number);
    } else {
      answerDisplay.textContent = "Invalid input";
    }
  }
  
  generateButton.addEventListener('click', generateRandomNumber);
  revealButton.addEventListener('click', displayAnswer);