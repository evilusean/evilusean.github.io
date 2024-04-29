const giveDiv = document.querySelector(".give");
const takeDiv = document.querySelector(".take");

const urlParams = new URLSearchParams(window.location.search);
const giveValue = urlParams.get("Give");
const takeValue = urlParams.get("Take");

giveDiv.textContent = giveValue;
takeDiv.textContent = takeValue;
