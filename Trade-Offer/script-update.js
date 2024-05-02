const giveInput = document.querySelector(".give-input");
const takeInput = document.querySelector(".take-input");
const giveDiv = document.querySelector(".give");
const takeDiv = document.querySelector(".take");

giveInput.addEventListener("input", () => {
  giveDiv.textContent = giveInput.value;
  giveDiv.style.fontSize = `${100 - giveInput.value.length / 2}%`;
});

takeInput.addEventListener("input", () => {
  takeDiv.textContent = takeInput.value;
  takeDiv.style.fontSize = `${100 - takeInput.value.length / 2}%`;
});

const submitButton = document.querySelector("button");
submitButton.addEventListener("click", () => {
  const giveValue = giveInput.value;
  const takeValue = takeInput.value;
  const url = `evilusean.github.io/Trade-Offer/?Give=${giveValue}&Take=${takeValue}`;
  window.location.href = url;
});

/* NEW ENCODER FOR URL, WILL TAKE 5 INPUTS AND UPDATE THE URL WITH NEW LINES, STILL NEED TO ENCODE SPACES
// Get the values from the 5 inputs
const giveInput1 = document.getElementById("give-input-1").value;
const giveInput2 = document.getElementById("give-input-2").value;
const giveInput3 = document.getElementById("give-input-3").value;
const giveInput4 = document.getElementById("give-input-4").value;
const giveInput5 = document.getElementById("give-input-5").value;

// Update the URL with the new values
const newURL = `https://evilusean.github.io/Trade-Offer/?Give=${giveInput1}%0A${giveInput2}%0A${giveInput3}%0A${giveInput4}%0A${giveInput5}&Take=${takeValue}`;
window.location.href = newURL;
*/
