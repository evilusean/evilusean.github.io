const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const stepInput = document.getElementById('step');
const generateButton = document.getElementById('generateNumber');
const numberInput = document.getElementById('numberInput');
const revealButton = document.getElementById('revealAnswer');
const answerDisplay = document.getElementById('answerDisplay');

let currentNumber = null;

function getJapaneseNumber(number) {
  if (number === 0) return "零";

  const units = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const placeValues = ["", "十", "百", "千", "万", "億", "兆"]; // Add more for larger numbers

  if (number < 10) return units[number];

  let japanese = "";
  let placeValueIndex = 0;

  while (number > 0) {
    const currentDigit = number % 10;
    if (currentDigit !== 0) {
      japanese = units[currentDigit] + placeValues[placeValueIndex] + japanese;
    }
    number = Math.floor(number / 10);
    placeValueIndex = (placeValueIndex + 1) % placeValues.length; // Cycle through place values
  }

  return japanese;
}

function generateRandomNumber() {
  const min = parseInt(minNumberInput.value);
  const max = parseInt(maxNumberInput.value);
  const step = parseInt(stepInput.value);

  const adjustedMax = max - (max % step);
  const adjustedMin = min + ((step - (min % step)) % step);
  const randomNumber = Math.floor(Math.random() * ((adjustedMax - adjustedMin) / step + 1)) * step + adjustedMin;

  numberInput.value = randomNumber; 
}

function displayAnswer() {
  const number = parseInt(numberInput.value);
  if (!isNaN(number)) {
    answerDisplay.textContent = getJapaneseNumber(number);
  } else {
    answerDisplay.textContent = "Invalid input";
  }
}

generateButton.addEventListener('click', generateRandomNumber);
revealButton.addEventListener('click', displayAnswer);
