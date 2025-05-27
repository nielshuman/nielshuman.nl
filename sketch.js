let WIDTH;
let HEIGHT;
let SCALE; // Each logical pixel is SCALE×SCALE real pixels
let lemonMilkMedium;
let startFrame = Infinity;
let SPEED = 150;
let ants = [];

const BLACK = [0, 0, 0, 255];
const WHITE = [255, 255, 255, 255];

class Ant {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  currentPixelIs(color) {
    // Sample the upper-left pixel of the scaled block
    const realX = this.x * SCALE;
    const realY = this.y * SCALE;
    const i = (realY * (width * pixelDensity()) + realX) * 4;
    
    return (
      pixels[i] === color[0] &&
      pixels[i + 1] === color[1] &&
      pixels[i + 2] === color[2] &&
      pixels[i + 3] === color[3]
    );
  }

  setCurrentPixel(color) {
    // Set all pixels in the SCALE×SCALE block
    const startX = this.x * SCALE;
    const startY = this.y * SCALE;
    
    for (let dy = 0; dy < SCALE; dy++) {
      for (let dx = 0; dx < SCALE; dx++) {
        const realX = startX + dx;
        const realY = startY + dy;
        
        if (realX < width * pixelDensity() && realY < height * pixelDensity()) {
          const i = (realY * (width * pixelDensity()) + realX) * 4;
          pixels[i] = color[0];
          pixels[i + 1] = color[1];
          pixels[i + 2] = color[2];
          pixels[i + 3] = color[3];
        }
      }
    }
  }

  move() {
    // Flip and turn
    if (this.currentPixelIs(BLACK)) {
      this.setCurrentPixel(WHITE);
      [this.dx, this.dy] = [this.dy, -this.dx];

    } else /* if (this.currentPixelIs(WHITE)) */ {
      this.setCurrentPixel(BLACK);
      [this.dx, this.dy] = [-this.dy, this.dx];
    }
    
    // Move
    this.x += this.dx;
    this.y += this.dy;

    // Wrap around
    this.x = (this.x + WIDTH) % WIDTH;
    this.y = (this.y + HEIGHT) % HEIGHT;
  }
}

function preload() {
  lemonMilkMedium = loadFont('lemon_milk/LEMONMILK-Regular.otf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  SCALE = Math.max(2, pixelDensity() * 2); // Ensure SCALE is at least 2 for visibility

  textFont(lemonMilkMedium);
  // Calculate logical dimensions
  WIDTH = Math.floor((width * pixelDensity()) / SCALE);
  HEIGHT = Math.floor((height * pixelDensity()) / SCALE);
  
  setTimeout(() => {
    ants.push(new Ant(
      Math.floor(WIDTH / 2),
      Math.floor(HEIGHT / 2),
      1,
      0
    ));
    startFrame = frameCount;
  }, 3000);
}

function draw() {
  background(0);
  fill(255, 255, 255, min(255, (0.2*frameCount) ** 2));
  textAlign(CENTER, CENTER);
  textSize(windowWidth / 10);
  text('HUMAN', windowWidth / 2, windowHeight / 2);
  
  // Load pixels once at the beginning
  loadPixels();
  
  // Run multiple iterations per frame for better performance
  for (let i = 0; i < SPEED; i++) {
    for (let ant of ants) {
      ant.move();
    }
  }
  
  // Update pixels once at the end
  updatePixels();
  
  // Display ant's position for debugging
  fill(255, 0, 0);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Iterations: ${max(0, (frameCount - startFrame) * SPEED)}`, 10, 10);
  text(`Ants: ${ants.length}`, 10, 30);
  text(`Scale: ${SCALE}`, 10, 50);
  text(`Logical Size: ${WIDTH}×${HEIGHT}`, 10, 70);
}

function mousePressed() {
  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  const xory = Math.random() < 0.5? 0 : 1;
  // Add a new ant at the mouse position
  ants.push(new Ant(
    Math.floor((mouseX * pixelDensity()) / SCALE),
    Math.floor((mouseY * pixelDensity()) / SCALE),
    randomDirection * xory,
    randomDirection * (1 - xory)
  ));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Recalculate logical dimensions
  WIDTH = Math.floor((width * pixelDensity()) / SCALE);
  HEIGHT = Math.floor((height * pixelDensity()) / SCALE);
  
  // Note: When resizing, the existing pixel data will be lost
  // If you need to preserve it, you'd need to copy the relevant pixels
  // before the resize and restore them after
}