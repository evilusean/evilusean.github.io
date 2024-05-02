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
const giveValue =
  decodeURI(giveURL) ||
  "Certificate of Eligibility (COE) <br> $ for Flight <br> $ for Rent <br> Salary";
const takeValue =
  decodeURI(takeURL) ||
  "Jr. Web Developer <br> Jr. Data Analyst <br> Jr. Software Engineer <br> IT Specialist <br> Native English Speaker ";

//updates div values on index.html
giveDiv.textContent = giveValue;
takeDiv.textContent = takeValue;
