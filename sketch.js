let langton_pixels;
let WIDTH;
let HEIGHT;
let SCALE; // Each logical pixel is 2×2 real pixels (4 real pixels total)
let lemonMilkMedium;
let startFrame = Infinity;
let SPEED = 150;
let ants = [];

const BLACK = [0, 0, 0, 0];
const WHITE = [255, 255, 255, 255];

class Ant {
  constructor(x, y, dx, dy) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  currentPixelIs(color) {
    const i = (this.y * WIDTH + this.x) * 4;
    return (
      langton_pixels[i] === color[0] &&
      langton_pixels[i + 1] === color[1] &&
      langton_pixels[i + 2] === color[2] &&
      langton_pixels[i + 3] === color[3]
    );
  }

  setCurrentPixel(color) {
    const i = (this.y * WIDTH + this.x) * 4;
    langton_pixels[i] = color[0];
    langton_pixels[i + 1] = color[1];
    langton_pixels[i + 2] = color[2];
    langton_pixels[i + 3] = color[3];
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
  // pixelDensity(1);
  SCALE = Math.max(1, pixelDensity()); // Ensure SCALE is at least 1

  textFont(lemonMilkMedium);
  // Adjust dimensions to account for scaling and pixel density
  WIDTH = Math.floor((width * pixelDensity()) / SCALE);
  HEIGHT = Math.floor((height * pixelDensity()) / SCALE);
  
  langton_pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  langton_pixels.fill(0); // Initialize all pixels to black transparent
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
  // background(0);
  // circle(windowWidth / 2, windowHeight / 2, 100);
  // Run multiple iterations per frame for better performance
  for (let i = 0; i < SPEED; i++) {
    for (let ant of ants) {
      ant.move();
    }
  }
  
  loadPixels();
  
  // Draw each logical pixel as a SCALE×SCALE square of real pixels
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const srcIdx = (y * WIDTH + x) * 4;
      
      if (langton_pixels[srcIdx + 3] === 0) {
        // If the pixel is transparent, skip it
        continue;
      }
      
      // Map each logical pixel to a square of real pixels
      for (let dy = 0; dy < SCALE; dy++) {
        for (let dx = 0; dx < SCALE; dx++) {
          const destX = x * SCALE + dx;
          const destY = y * SCALE + dy;
          if (destX < width * pixelDensity() && destY < height * pixelDensity()) {
            const destIdx = (destY * (width * pixelDensity()) + destX) * 4;
            pixels[destIdx] = langton_pixels[srcIdx];
            pixels[destIdx + 1] = langton_pixels[srcIdx + 1];
            pixels[destIdx + 2] = langton_pixels[srcIdx + 2];
            pixels[destIdx + 3] = langton_pixels[srcIdx + 3];
          }
        }
      }
    }
  }
  
  updatePixels();
  
  // Display ant's position for debugging
  fill(255, 0, 0);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`Iterations: ${max(0, (frameCount - startFrame) * SPEED)}`, 10, 10);
  text(`Ants: ${ants.length}`, 10, 30);
}

function mousePressed() {
  const randomDirection = Math.random() < 0.5 ? -1 : 1;
  const xory = Math.random() < 0.5? 0 : 1;
  // Add a new ant at the mouse position, accounting for pixel density
  ants.push(new Ant(
    Math.floor((mouseX * pixelDensity()) / SCALE),
    Math.floor((mouseY * pixelDensity()) / SCALE),
    randomDirection * xory,
    randomDirection * (1 - xory)
  ));
}

  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    
    // Save old dimensions and pixels
    const oldWidth = WIDTH;
    const oldHeight = HEIGHT;
    const oldPixels = langton_pixels;
    
    // Calculate new dimensions accounting for pixel density properly
    WIDTH = Math.floor((width * pixelDensity()) / SCALE);
    HEIGHT = Math.floor((height * pixelDensity()) / SCALE);
    
    // Create new pixel array (initialized to 0 by default)
    langton_pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    
    // Copy the old pixels to the new array where they overlap
    for (let y = 0; y < Math.min(oldHeight, HEIGHT); y++) {
      for (let x = 0; x < Math.min(oldWidth, WIDTH); x++) {
        const oldIdx = (y * oldWidth + x) * 4;
        const newIdx = (y * WIDTH + x) * 4;
        
        langton_pixels[newIdx] = oldPixels[oldIdx];
        langton_pixels[newIdx + 1] = oldPixels[oldIdx + 1];
        langton_pixels[newIdx + 2] = oldPixels[oldIdx + 2];
        langton_pixels[newIdx + 3] = oldPixels[oldIdx + 3];
      }
    }
  }
