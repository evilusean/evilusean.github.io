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
  const url = `evilusean.github.io/Trade-Offer/Give=${giveValue}&Take=${takeValue}`;
  window.location.href = url;
});
