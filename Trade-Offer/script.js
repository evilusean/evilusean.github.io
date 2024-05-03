//gets url params
const urlParams = new URLSearchParams(window.location.search);
//selects URL Variables
const give1 = urlParams.get("G1") || "Give 1";
const give2 = urlParams.get("G2") || "Give 2";
const give3 = urlParams.get("G3") || "Give 3";
const give4 = urlParams.get("G4") || "Give 4";
const give5 = urlParams.get("G5") || "Give 5";
const take1 = urlParams.get("T1") || "Take 1";
const take2 = urlParams.get("T2") || "Take 2";
const take3 = urlParams.get("T3") || "Take 3";
const take4 = urlParams.get("T4") || "Take 4";
const take5 = urlParams.get("T5") || "Take 5";

//Updates our <h2> tags with URL variables
document.querySelector(".give-1").textContent = give1;
document.querySelector(".give-2").textContent = give2;
document.querySelector(".give-3").textContent = give3;
document.querySelector(".give-4").textContent = give4;
document.querySelector(".give-5").textContent = give5;
document.querySelector(".take-1").textContent = take1;
document.querySelector(".take-2").textContent = take2;
document.querySelector(".take-3").textContent = take3;
document.querySelector(".take-4").textContent = take4;
document.querySelector(".take-5").textContent = take5;

// Get the give and take inputs
const giveInputs = document.querySelectorAll(".give-input");
const takeInputs = document.querySelectorAll(".take-input");

// Get the URL output
const urlOutput = document.getElementById("url-output");

// Get the give and take h2 elements
const giveH2s = document.querySelectorAll(
  ".give-1, .give-2, .give-3, .give-4, .give-5"
);
const takeH2s = document.querySelectorAll(
  ".take-1, .take-2, .take-3, .take-4, .take-5"
);

// Add an event listener for the submit button
document.getElementById("submit-button").addEventListener("click", () => {
  // Get the values from the give and take inputs
  const giveValues = [];
  for (let i = 0; i < giveInputs.length; i++) {
    giveValues.push(giveInputs[i].value);
  }

  const takeValues = [];
  for (let i = 0; i < takeInputs.length; i++) {
    takeValues.push(takeInputs[i].value);
  }

  // Update the give and take h2 elements
  for (let i = 0; i < giveH2s.length; i++) {
    giveH2s[i].textContent = giveValues[i];
  }

  for (let i = 0; i < takeH2s.length; i++) {
    takeH2s[i].textContent = takeValues[i];
  }

  // Update the URL output
  const newURL = `https://evilusean.github.io/Trade-Offer/?G1=${giveValues[0]}&G2=${giveValues[1]}&G3=${giveValues[2]}&G4=${giveValues[3]}&G5=${giveValues[4]}&T1=${takeValues[0]}&T2=${takeValues[1]}&T3=${takeValues[2]}&T4=${takeValues[3]}&T5=${takeValues[4]}`;
  urlOutput.value = newURL;
});
