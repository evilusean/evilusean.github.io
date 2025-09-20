const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get control elements
const colorPicker = document.getElementById("colorPicker");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const decaySlider = document.getElementById("decaySlider");
const decayValue = document.getElementById("decayValue");
const charactersInput = document.getElementById("charactersInput");
const saveToUrlButton = document.getElementById("saveToUrl");
const resetCharactersButton = document.getElementById("resetCharacters");
const controls = document.querySelector(".controls");

// Default Japanese characters only
const defaultCharacters = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";

// Initialize with default values
let matrixColor = "#0aff0a";
let fps = 30;
let decayRate = 0.05; // Controls how fast the trail fades
let currentCharacters = defaultCharacters;
let controlsVisible = true;

// Update displays
speedValue.textContent = fps;
decayValue.textContent = decayRate.toFixed(2);
charactersInput.value = currentCharacters;

// Load URL parameters
function loadUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('characters')) {
    currentCharacters = urlParams.get('characters');
    charactersInput.value = currentCharacters;
    effect.updateCharacters(currentCharacters);
  }
  
  if (urlParams.has('color')) {
    matrixColor = urlParams.get('color');
    colorPicker.value = matrixColor;
  }
  
  if (urlParams.has('speed')) {
    fps = parseInt(urlParams.get('speed'));
    speedSlider.value = fps;
    speedValue.textContent = fps;
  }
  
  if (urlParams.has('decay')) {
    decayRate = parseFloat(urlParams.get('decay'));
    decaySlider.value = decayRate;
    decayValue.textContent = decayRate.toFixed(2);
  }
}

// Load URL parameters on page load
loadUrlParams();

// Event listeners for controls
colorPicker.addEventListener("input", (e) => {
  matrixColor = e.target.value;
});

speedSlider.addEventListener("input", (e) => {
  fps = parseInt(e.target.value);
  speedValue.textContent = fps;
});

decaySlider.addEventListener("input", (e) => {
  decayRate = parseFloat(e.target.value);
  decayValue.textContent = decayRate.toFixed(2);
});

charactersInput.addEventListener("input", (e) => {
  currentCharacters = e.target.value || defaultCharacters;
  effect.updateCharacters(currentCharacters);
});

saveToUrlButton.addEventListener("click", () => {
  const params = new URLSearchParams();
  params.set('characters', currentCharacters);
  params.set('color', matrixColor);
  params.set('speed', fps);
  params.set('decay', decayRate);
  
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
  
  // Show feedback
  const originalText = saveToUrlButton.textContent;
  saveToUrlButton.textContent = 'Saved!';
  setTimeout(() => {
    saveToUrlButton.textContent = originalText;
  }, 1000);
});

resetCharactersButton.addEventListener("click", () => {
  currentCharacters = defaultCharacters;
  charactersInput.value = currentCharacters;
  effect.updateCharacters(currentCharacters);
});

// ESC key listener to hide/show controls
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    controlsVisible = !controlsVisible;
    if (controlsVisible) {
      controls.classList.remove("hidden");
    } else {
      controls.classList.add("hidden");
    }
  }
  
  // Arrow key controls
  if (e.key === "ArrowLeft") {
    // Decrease speed (slower)
    fps = Math.max(1, fps - 1);
    speedSlider.value = fps;
    speedValue.textContent = fps;
  } else if (e.key === "ArrowRight") {
    // Increase speed (faster)
    fps = Math.min(100, fps + 1);
    speedSlider.value = fps;
    speedValue.textContent = fps;
  } else if (e.key === "ArrowDown") {
    // Decrease decay rate (longer trails)
    decayRate = Math.max(0.01, decayRate - 0.01);
  } else if (e.key === "ArrowUp") {
    // Increase decay rate (shorter trails)
    decayRate = Math.min(0.2, decayRate + 0.01);
  }
});

let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
//CIRCLE GRADIENT, CHANGE THE '100' or '200' TO CHANGE CIRCLE DIAMETER
//let gradient = ctx.createLinearGradient(canvas.width/2, canvas.height/2, 100, canvas.width/2, canvas.height/2,200);

//COMMENT BELOW CODE AND FILL STYLE LINE # 77 , AND UNCOMMENT LINE # 76 TO REMOVE COLOR GRADIENT
//gradient.addColorStop(0, "red");
//gradient.addColorStop(0.2, "yellow");
//gradient.addColorStop(0.4, "orange");
//gradient.addColorStop(0.6, "green");
//gradient.addColorStop(0.8, "blue");
//gradient.addColorStop(1, "magenta");

class Symbol {
  constructor(x, y, fontSize, canvasHeight, characters) {
    this.characters = characters;
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.text = this.characters.charAt(
      Math.floor(Math.random() * this.characters.length)
    ); // Set character once when created
    this.canvasHeight = canvasHeight;
    this.alpha = 1; // Add alpha for fading effect
  }
  draw(context) {
    // Don't change the character, just draw it with current alpha
    context.globalAlpha = this.alpha;
    context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
    context.globalAlpha = 1; // Reset alpha for other elements
    
    if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.95) {
      this.y = 0;
      this.text = this.characters.charAt(
        Math.floor(Math.random() * this.characters.length)
      ); // Only change character when resetting
      this.alpha = 1; // Reset alpha when character resets
    } else {
      this.y += 1;
      // Gradually fade the character as it falls (use decayRate for consistency)
      this.alpha = Math.max(0, this.alpha - (decayRate * 0.1));
    }
  }
}

class Effect {
  constructor(canvasWidth, canvasHeight, characters) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 25;
    this.columns = this.canvasWidth / this.fontSize;
    this.symbols = [];
    this.characters = characters;
    this.#initialize();
  }
  #initialize() {
    for (let i = 0; i < this.columns; i++) {
      this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight, this.characters);
    }
  }
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.columns = this.canvasWidth / this.fontSize;
    this.symbols = [];
    this.#initialize();
  }
  updateCharacters(newCharacters) {
    this.characters = newCharacters;
    // Update existing symbols with new character set
    this.symbols.forEach(symbol => {
      symbol.characters = newCharacters;
      symbol.text = newCharacters.charAt(
        Math.floor(Math.random() * newCharacters.length)
      );
    });
  }
}

const effect = new Effect(canvas.width, canvas.height, currentCharacters);
let lastTime = 0;
let timer = 0;

function animate(timeStamp) {
  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;
  const nextFrame = 1000 / fps; // Use dynamic fps value
  if (timer > nextFrame) {
    // Use a very subtle background fade to create the trail effect
    ctx.fillStyle = `rgba(0, 0, 0, ${decayRate})`;
    ctx.textAlign = "center";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor; // Use dynamic color value
    //ctx.fillStyle = gradient;
    ctx.font = effect.fontSize + "px monospace";
    effect.symbols.forEach((symbol) => symbol.draw(ctx));
    timer = 0;
  } else {
    timer += deltaTime;
  }
  requestAnimationFrame(animate);
}
animate(0);

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
});
