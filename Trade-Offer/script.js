//selects divs
const giveDiv = document.querySelector(".giveDiv");
const takeDiv = document.querySelector(".takeDiv");

//gets url params
const urlParams = new URLSearchParams(window.location.search);
const giveURL = urlParams.get("Give"); //new function should work without these 2
const takeURL = urlParams.get("Take"); // maybe remove, test first

const giveValue = decodeURLParameter(urlParams.get("Give"));
const takeValue = decodeURLParameter(urlParams.get("Take"));

//updates div values on index.html
giveDiv.textContent = giveValue;
takeDiv.textContent = takeValue;

function decodeURLParameter(param) {
  // Decode the URL parameter
  const decodedParam = decodeURIComponent(param);

  // Replace all %20 with spaces
  const withSpaces = decodedParam.replace(/%20/g, " ");

  // Replace all %0A with newlines
  const withNewlines = withSpaces.replace(/%0A/g, "\n");

  // Return the decoded and formatted parameter
  return withNewlines;
}
