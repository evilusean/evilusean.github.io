//gets url params
const urlParams = new URLSearchParams(window.location.search);
//selects URL Variables
const give1 = urlParams.get("G1");
const give2 = urlParams.get("G2");
const give3 = urlParams.get("G3");
const give4 = urlParams.get("G4");
const give5 = urlParams.get("G5");
const take1 = urlParams.get("T1");
const take2 = urlParams.get("T2");
const take3 = urlParams.get("T3");
const take4 = urlParams.get("T4");
const take5 = urlParams.get("T5");

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
