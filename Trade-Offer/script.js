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

/* REMOVING THIS FOR NOW, SEEING IF IT WORKS WITHOUT AN ENCODER, IF %20 IS AUTO OR IF FUNCTION IS DOING IT, 
    BUILDING AN ENTIRELY NEW SET OF <h2> AND WILL ATTACH 'G1=X' 'G2=Y' ETC TO EACH HEADER INSTEAD OF TRYING TO MAKE IT WORK IN 1 GO
function decodeURLParameter(param) {
  // Decode the URL parameter
  const decodedParam = decodeURIComponent(param);

  // Replace all %20 with spaces
  const withSpaces = decodedParam.replace(/%20/g, " ");

  // Replace all %0A with newlines
  const withNewlines = withSpaces.replace(/%0A/g, <br />);

  // Return the decoded and formatted parameter
  return withNewlines;
}
*/
