const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const stepInput = document.getElementById('step');
const generateButton = document.getElementById('generateNumber');
const numberInput = document.getElementById('numberInput');
const revealButton = document.getElementById('revealAnswer');
const answerDisplay = document.getElementById('answerDisplay');

let currentNumber = null;

function getJapaneseNumber(number) {
  if (number === 0) return "零 (rei)"; // Include romaji for 0

  const units = ["", "一 (ichi)", "二 (ni)", "三 (san)", "四 (yon)", "五 (go)", "六 (roku)", "七 (nana)", "八 (hachi)", "九 (kyū)"];
  const placeValues = ["", "十 (jū)", "百 (hyaku)", "千 (sen)", "万 (man)", "億 (oku)", "兆 (chō)"]; 

  if (number < 10) return units[number];

  let japanese = "";
  let placeValueIndex = 0;

  while (number > 0) {
    const currentDigit = number % 10;
    if (currentDigit !== 0) {
      japanese = units[currentDigit] + placeValues[placeValueIndex] + japanese;
    }
    number = Math.floor(number / 10);
    placeValueIndex = (placeValueIndex + 1) % placeValues.length; 
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
