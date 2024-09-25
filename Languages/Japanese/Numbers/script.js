const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const stepInput = document.getElementById('step');
const generateButton = document.getElementById('generateNumber');
const numberInput = document.getElementById('numberInput');
const revealButton = document.getElementById('revealAnswer');
const answerDisplay = document.getElementById('answerDisplay');

let japaneseOutput = "";
let romajiOutput = "";

function getJapaneseNumber(number) {
  japaneseOutput = "";
  romajiOutput = "";

  if (number === 0) {
    japaneseOutput = "零";
    romajiOutput = "rei";
  }

  const units = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const placeValues = ["", "十", "百", "千"];
  const myriadValues = ["", "万", "億", "兆"]; // Add more for larger numbers if needed

  if (number < 10) {
    japaneseOutput = units[number];
    romajiOutput = toRomaji(units[number]);
    return;
  }

  // Handle Myriad groups (10,000 and above)
  for (let i = myriadValues.length - 1; i >= 0; i--) {
    const myriadValue = Math.pow(10000, i);
    if (number >= myriadValue) {
      const myriadPart = Math.floor(number / myriadValue);
      getJapaneseNumber(myriadPart);
      japaneseOutput += myriadValues[i];
      romajiOutput += toRomaji(myriadValues[i]) + " ";
      number %= myriadValue;
    }
  }

  // Handle numbers less than 10,000
  for (let i = placeValues.length - 1; i >= 0; i--) {
    if (number >= Math.pow(10, i)) {
      japaneseOutput += units[Math.floor(number / Math.pow(10, i))] + placeValues[i];
      romajiOutput += toRomaji(units[Math.floor(number / Math.pow(10, i))]) + " " + toRomaji(placeValues[i]) + " ";
      number %= Math.pow(10, i);
    }
  }
}

function toRomaji(japaneseChar) {
  switch (japaneseChar) {
    case "一": return "ichi";
    case "二": return "ni";
    case "三": return "san";
    case "四": return "yon";
    case "五": return "go";
    case "六": return "roku";
    case "七": return "nana";
    case "八": return "hachi";
    case "九": return "kyū";
    case "十": return "jū";
    case "百": return "hyaku";
    case "千": return "sen";
    case "万": return "man";
    case "億": return "oku";
    case "兆": return "chō";
    case "零": return "rei";
    default: return "";
  }
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
    getJapaneseNumber(number);
    answerDisplay.textContent = japaneseOutput.trim() + " (" + romajiOutput.trim() + ")";
  } else {
    answerDisplay.textContent = "Invalid input";
  }
}

generateButton.addEventListener("click", generateRandomNumber);
revealButton.addEventListener("click", displayAnswer);