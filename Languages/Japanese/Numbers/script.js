const minNumberInput = document.getElementById('minNumber');
const maxNumberInput = document.getElementById('maxNumber');
const stepInput = document.getElementById('step');
const generateButton = document.getElementById('generateNumber');
const numberInput = document.getElementById('numberInput');
const revealButton = document.getElementById('revealAnswer');
const answerDisplay = document.getElementById('answerDisplay'); // For Japanese characters
const answerDisplay2 = document.getElementById('answerDisplay2'); // For romaji

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
  console.log("Number from input:", number); // Log the input number

  if (!isNaN(number)) {
    const japaneseNumerals = toJapaneseNumerals(number);
    console.log("Japanese Numerals:", japaneseNumerals); // Log the Japanese numerals

    answerDisplay.textContent = japaneseNumerals;

    const romaji = toRomaji(number); // Directly convert the number to romaji
    console.log("Romaji:", romaji); // Log the romaji

    answerDisplay2.textContent = romaji;
  } else {
    console.log("Invalid input");
    answerDisplay.textContent = "Invalid input";
    answerDisplay2.textContent = "Invalid input";
  }
}

function toJapaneseNumerals(number) {
  if (number === 0) return "零";

  const units = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const placeValues = ["", "十", "百", "千"];
  const myriadValues = {
    "万": 4,
    "億": 8,
    "兆": 12
  };

  if (number < 10) {
    return units[number];
  }

  let japanese = "";
  let i = 12;

  while (i >= 0) {
    const myriadValue = Math.pow(10, i);
    if (number >= myriadValue) {
      const myriadPart = Math.floor(number / myriadValue);

      // Add the unit only if it's not 1 or if it's the ones place
      if (myriadPart !== 1 || i === 0) {
        japanese += units[myriadPart];
      }

      // Add the place value or myriad character
      if (i >= 4 && i % 4 === 0) {
        japanese += Object.keys(myriadValues).find(key => myriadValues[key] === i);
      } else if (i < 4) {
        japanese += placeValues[i];
      }

      number %= myriadValue;
    }
    i--;
  }

  return japanese;
}

function toRomaji(number) {
  if (number === 0) return "rei";

  const units = ["", "ichi", "ni", "san", "yon", "go", "roku", "nana", "hachi", "kyū"];
  const placeValues = ["", "jū", "hyaku", "sen"];
  const myriadValues = {
    "man": 4,
    "oku": 8,
    "chō": 12
  };

  if (number < 10) {
    return units[number];
  }

  let romaji = "";
  let i = 12;

  while (i >= 0) {
    const myriadValue = Math.pow(10, i);
    if (number >= myriadValue) {
      const myriadPart = Math.floor(number / myriadValue);

      // Handle exceptions for hundreds
      if (i === 2) {
        if (myriadPart === 3) {
          romaji += "sanbyaku ";
        } else if (myriadPart === 6) {
          romaji += "roppyaku ";
        } else if (myriadPart === 8) {
          romaji += "happyaku ";
        } else {
          // Add the unit only if it's not 1 or if it's the ones place
          if (myriadPart !== 1 || i === 0) {
            romaji += units[myriadPart] + " ";
          }
          romaji += placeValues[i] + " ";
        }
      }
      // Handle exceptions for thousands
      else if (i === 3) {
        if (myriadPart === 3) {
          romaji += "sanzen ";
        } else if (myriadPart === 8) {
          romaji += "hassen ";
        } else {
          // Add the unit only if it's not 1 or if it's the ones place
          if (myriadPart !== 1 || i === 0) {
            romaji += units[myriadPart] + " ";
          }
          romaji += placeValues[i] + " ";
        }
      }
      // Handle other cases
      else {
        // Add the unit only if it's not 1 or if it's the ones place
        if (myriadPart !== 1 || i === 0) {
          romaji += units[myriadPart] + " ";
        }

        // Add the place value or myriad character
        if (i >= 4 && i % 4 === 0) {
          romaji += Object.keys(myriadValues).find(key => myriadValues[key] === i) + " ";
        } else if (i < 4) {
          romaji += placeValues[i] + " ";
        }
      }

      number %= myriadValue;
    }
    i--;
  }

  return romaji.trim();
}

  
  generateButton.addEventListener('click', generateRandomNumber);
  revealButton.addEventListener('click', displayAnswer);

