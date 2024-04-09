const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Symbol {
  constructor(x, y, fontSize, canvasHeight, text) {
    this.x = x;
    this.y = y;
    this.fontSize = fontSize;
    this.text = text;
    this.canvasHeight = canvasHeight;
  }
  draw(context) {
    context.fillText(this.text, this.x * this.fontSize, this.y * this.fontSize);
    if (this.y * this.fontSize > this.canvasHeight && Math.random() > 0.95) {
      this.y = 0;
    } else {
      this.y += 1;
    }
  }
}

class Effect {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 25;
    this.columns = this.canvasWidth / this.fontSize;
    this.symbols = [];
    this.text = " おねがい 私 を やとって ください ";
    this.textIndex = 0;
    this.#initialize();
  }
  #initialize() {
    for (let i = 0; i < this.columns; i++) {
      this.symbols[i] = new Symbol(i, 0, this.fontSize, this.canvasHeight, "");
    }
  }
  resize() {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.columns = this.canvasWidth / this.fontSize;
    this.symbols = [];
    this.#initialize();
  }
  updateText() {
    this.symbols.forEach((symbol, index) => {
      if (this.textIndex >= this.text.length) {
        this.textIndex = 0;
      }
      symbol.text = this.text[this.textIndex];
      this.textIndex++;
    });
  }
}

const effect = new Effect(canvas.width, canvas.height);
let lastTime = 0;
const fps = 5; //Change this to speed up or slow down
const nextFrame = 1000 / fps;
let timer = 0;

const toggleButton = document.getElementById("makeItRainButton");
let isAnimating = true;

toggleButton.addEventListener("click", function () {
  isAnimating = !isAnimating;
  if (isAnimating) {
    requestAnimationFrame(animate);
  }
});

function animate(timeStamp) {
  if (!isAnimating) {
    return; // Stop animation if the flag is set to false
  }

  const deltaTime = timeStamp - lastTime;
  lastTime = timeStamp;

  if (timer > nextFrame) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.textAlign = "center";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f6060b";
    ctx.font = effect.fontSize + "px monospace";
    effect.updateText();
    effect.symbols.forEach((symbol) => symbol.draw(ctx));
    timer = 0;
  } else {
    timer += deltaTime;
  }

  requestAnimationFrame(animate);
}

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
});

const clearCanvasButton = document.getElementById("clearCanvas");

clearCanvasButton.addEventListener("click", function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isAnimating = false; // Pause the animation when the button is clicked
});
