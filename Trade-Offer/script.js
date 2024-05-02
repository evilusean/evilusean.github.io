//selects divs
const giveDiv = document.querySelector(".giveDiv");
const takeDiv = document.querySelector(".takeDiv");

//gets url params
const urlParams = new URLSearchParams(window.location.search);
const giveURL = urlParams.get("Give"); //new function should work without these 2
const takeURL = urlParams.get("Take"); // maybe remove, test first

//const giveValue = decodeURLParameter(urlParams.get("Give"));
//const takeValue = decodeURLParameter(urlParams.get("Take"));

// Decode the URL parameters
const giveValue = decodeURI(giveURL);
const takeValue = decodeURI(takeURL);

//updates div values on index.html
giveDiv.textContent = giveValue;
takeDiv.textContent = takeValue;
