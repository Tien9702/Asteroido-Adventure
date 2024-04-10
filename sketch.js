// sprite objects
let ship;
let fire;
let lasers;
let canon;
let asteroids;
let powerUp;

// image objects
let shipImg;
let asteroidImg, gameBg;
let titleImg;
let overImg;
let winImg;

// sound effects
let laserSfx;
let crashSfx;
let hitSfx;

// game state
let gameState = intro;

////////////////////////////////////////////////////////////
function preload() {
  shipImg = loadImage("space-ship-1.png");
  asteroidImg = loadImage("asteroid.png");
  titleImg = loadImage("start-screen-4.jpeg");
  gameBg = loadImage("game-bg-2.jpeg");
  overImg = loadImage("game-over-bg-1.jpeg");
  winImg = loadImage("victory-bg 2.jpeg");

  laserSfx = loadSound("laser.wav");
  crashSfx = loadSound("crash.wav");
  hitSfx = loadSound("hit.wav");
}

////////////////////////////////////////////////////////////
function setup() {
  new Canvas(2000, 1800, "pixelated");

  outputVolume(0.5);

  allSprites.debug = false;

  ship = new Sprite();
  ship.image = shipImg;
  ship.friction = 1;
  ship.offset.x = 80;
  ship.drag = 1; /// applies resistance to the ship's movement
  ship.rotationDrag = 1;
  ship.health = 10;
  ship.w = 200;
  ship.h = 100;

  fire = new Group();
  fire.diameter = 8;
  fire.life = () => random(25, 50);
  fire.x = () => ship.x;
  fire.y = () => ship.y;
  fire.rotation = () => ship.rotation + random(-20, 20);
  fire.speed = () => random(-5, -10);
  fire.overlaps(ship);
  fire.color = () => random(["red", "orange", "yellow", "white"]);

  lasers = new Group();
  lasers.life = () => 1000;
  lasers.x = () => canon.x;
  lasers.y = () => canon.y;
  lasers.rotation = () => ship.rotation;
  lasers.speed = () => 15;
  lasers.overlaps(ship);
  lasers.collider = "kinematic";
  lasers.color = () => random(["magenta"]);
  //lasers.stroke = "white";
  lasers.h = 10;
  lasers.w = 20;
  lasers.rotationLock = true;

  //for offset of canons
  canon = new Sprite();
  canon.diameter = 1;
  canon.collider = "None";

  asteroids = new Group();
  asteroids.image = asteroidImg;
  asteroids.x = () => random(-width);
  asteroids.y = () => random(-height);
  asteroids.diameter = asteroidImg.width + 0.8;
  asteroids.direction = () => random(360);
  asteroids.speed = () => random(1, 4);
  asteroids.health = 3;
  asteroids.amount = 9;

  asteroids.collides(lasers, asteroidHit);
  asteroids.collides(ship, shipHit);

  allSprites.autoDraw = false;
  allSprites.autoUpdate = false;
  world.autoStep = false;
}

////////////////////////////////////////////////////////////
function draw() {
  gameState(); // runs whatever we made gameState equal to

  let canonOffset = p5.Vector.fromAngle(radians(ship.rotation));
  canonOffset.setMag(ship.w);
  canon.x = ship.x + canonOffset.x;
  canon.y = ship.y + canonOffset.y;
}

////////////////////////////////////////////////////////////
function wrapAround(sprite) {
  if (sprite.x > width + sprite.h / 2) sprite.x = -sprite.h / 2;
  if (sprite.x < -sprite.h / 2) sprite.x = width + sprite.h / 2;

  if (sprite.y > height + sprite.w / 2) sprite.y = -sprite.w / 2;
  if (sprite.y < -sprite.w / 2) sprite.y = height + sprite.w / 2;
}

////////////////////////////////////////////////////////////
function asteroidHit(asteroid, laser) {
  hitSfx.play();
  asteroid.health--; // take off one health

  let h = map(asteroid.health, 0, 3, 0.5, 1);
  asteroid.scale = h;

  if (asteroid.health <= 0) asteroid.remove();

  // if that was the last asteroid, we win!
  if (asteroids.length == 0) gameState = victory;

  laser.remove();
}

////////////////////////////////////////////////////////////
function shipHit(asteroid, ship) {
  crashSfx.play();
  if (ship.health > 0) ship.health--;
  else gameState = gameOver;
}

////////////////////////////////////////////////////////////
function runGame() {
  image(gameBg, 0, 0, width, height);

  if (keyIsDown(LEFT_ARROW)) {
    ship.rotation -= 4;
  } else if (keyIsDown(RIGHT_ARROW)) {
    ship.rotation += 4;
  } else if (keyIsDown(UP_ARROW)) {
    ship.applyForce(1500);
    ship.bearing = ship.rotation;
    fire.amount++;
  }

  // using presses instead pressing to avoid continously firing
  if (kb.presses("space")) {
    lasers.amount++;
    laserSfx.play();
  }

  // wrap around the edges of the screen
  wrapAround(ship);

  // apply asteroid behaviours
  for (let asteroid of asteroids) {
    wrapAround(asteroid);
  }

  // show the p5play Sprites and animate them
  allSprites.draw();
  allSprites.update();
  world.step();

  // draw the ship's health bar
  let healthWidth = map(ship.health, 0, 10, 0, 200);
  fill("green");
  rect(20, 20, healthWidth, 20);
  stroke("white");
  noFill();
  rect(20, 20, 200, 20);
  noStroke();
}

////////////////////////////////////////////////////////////
function intro() {
  image(titleImg, 0, 0, width, height);
  if (mouse.presses()) {
    gameState = runGame;
  }
}

////////////////////////////////////////////////////////////
function gameOver() {
  image(overImg, 0, 0, width, height);
  allSprites.draw();

  // textAlign(CENTER);
  // textSize(80);
  // stroke("black");
  // fill("white");
  // text("GAME OVER!!", width / 2, height / 2 - 50);
  // text("Press 'r' to try again!", width / 2, height / 2 + 50);
  if (kb.presses("r")) {
    gameState = runGame;
    ship.x = width / 2;
    ship.y = height / 2;
    ship.health = 10;
    asteroids.removeAll();
    asteroids.amount = 10;
  }
}

////////////////////////////////////////////////////////////
function victory() {
  image(winImg, 0, 0, width, height);
  allSprites.draw();

  textAlign(CENTER);
  textSize(100);
  stroke("black");
  fill("white");
  text("CONGRATULATIONS!", width / 2, height / 2 - 690);
  text("Press 'R' to try again!", width / 2, height / 2 + 720);
  if (kb.presses("R")) {
    gameState = runGame;
    ship.x = width / 2;
    ship.y = height / 2;
    ship.health = 10;
    asteroids.amount = 10;
  }
}
