//selects divs
const giveDiv = document.querySelector(".give");
const takeDiv = document.querySelector(".take");

//gets url params
const urlParams = new URLSearchParams(window.location.search);
const giveValue = urlParams.get("Give");
const takeValue = urlParams.get("Take");

//updates div values on index.html
giveDiv.textContent = giveValue;
takeDiv.textContent = takeValue;
