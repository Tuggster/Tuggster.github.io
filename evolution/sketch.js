var types = [];
var animals = [];
var food = [];

var popGraph = [];
var speedGraph = [];
var foodGraph = [];
var timer = 0;

var foodSlider;

function clampAndSeed(val, min, max, seed) {
  if (val) {
    return constrain(val + random(-seed, seed), min, max);
  } else {
    return random(0, 50);
  }
}

function makeFifty() {
  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < 50; j++) {
      let ani = types[i].makeAnimal();
      ani.type = i;
      animals.push(ani);
      updatePopGraph();
      updateSpeedGraph();
      updateFTMGraph();
    }
  }
}

function pieChart(diameter, data, x, y) {
  let lastAngle = 0;
  for (let i = 0; i < data.length; i++) {
    let gray = map(i, 0, data.length, 0, 255);
    fill(gray);
    arc(
      x,
      y,
      diameter,
      diameter,
      lastAngle,
      lastAngle + data[i]
    );
    lastAngle += data[i];
  }
}

function updatePopGraph() {
  popGraph.push(animals.length);

  if (popGraph.length >= 600) {
    popGraph.splice(0, 1);
  }
}

function updateSpeedGraph() {

  let avg = 0;
  for (let i = 0; i < animals.length; i++) {
    avg += animals[i].moveSpeed;
  }
  avg /= animals.length;

  speedGraph.push(floor(avg));

  if (speedGraph.length >= 600) {
    speedGraph.splice(0, 1);
  }
}

function updateFTMGraph() {

  let avg = 0;
  for (let i = 0; i < animals.length; i++) {
    avg += animals[i].foodToMate;
  }
  avg /= animals.length;

  foodGraph.push(floor(avg));

  if (foodGraph.length >= 600) {
    foodGraph.splice(0, 1);
  }
}

function drawPopGraph(data, x, y, height, good, bad, label) {

  if (!data) {
    return;
  }

  let m = 0;
  let mi = 0;

  let l = 99999999999;

  for (let i = 0; i < data.length; i++) {
    if (data[i] >= m) {
      m = data[i];
      mi = i;
    }

    if (data[i] <= l) {
      l = data[i];
    }
  }


  for (let i = 0; i < data.length; i++) {
    if (i == 0)
      continue;

    stroke(lerpColor(good, bad, map(data[i], l, m, 0, 1)));
    line(i-1 + x, map(data[i-1] * -2, 0, m*2, 0, 50) + min(50, m * 2) + y, i + x, map(data[i] * -2, 0, m*2, 0, 50) + min(50, m * 2) + y);
    stroke(0);
  }

  fill('black');
  text(data[data.length - 1], data.length - 15 + x,min(50, m * 2)+10+y);
  text(m, mi - 15 + x, min(50, m * 2) + 10 + y);
  fill('orange');
  line(mi, y + 25, mi, y);
  fill('black');
  text(label, data.length, y + 25);
}

let canvas;
function setup() {
  angleMode(DEGREES);
  rectMode(CENTER);
  ellipseMode(CENTER);
  canvas = createCanvas(1500, 1000);
  types.push(new AnimalType());
  types.push(new AnimalType());
  types.push(new AnimalType());

  foodSlider = createSlider(0, 100, 3);
  foodSlider.position(20, height + 20);

  makeFifty();
}

let deltaTime = 0;
function draw() {
  background(255);
  deltaTime = window.performance.now() - canvas._pInst._lastFrameTime;
  timer += deltaTime;

  if (timer >= 5) {
    timer = 0;
    updatePopGraph();
    updateSpeedGraph();
    updateFTMGraph();
  }

  if (floor(random(0, 100)) <= foodSlider.value()) {
    food.push(new Food(random(width), random(height)))
  }

  fill(color(0,0,100))
  for (let i = 0; i < food.length; i++) {
    let f = food[i];
    ellipse(f.x, f.y, f.radius);
  }


  for (let i = 0; i < animals.length; i++) {
    let animal = animals[i];


    if (animal.food <= 0) {
      animals.splice(i, 1);
    } else {
      if (!animal.wantsToMate) {
        fill(lerpColor(color(255,0,0), color(0,255,0), map(animal.food, 0, 100, 0, 1)));
      } else {
        fill(color(255,0,255));
      }
    }

    animal.show();
    animal.update();
  }

  drawPopGraph(popGraph, 0, 0, 600, color(255,0,0), color(0,255,0), "Population");
  drawPopGraph(speedGraph, 0, 75, 600, color(255,0,0), color(0,255,0), "Average movespeed");
  drawPopGraph(foodGraph, 0, 75*2, 600, color(0,255,0), color(255,0,0), "Average FTM");

  let gens = 0
  for (let i = 0; i < animals.length; i++) {
    if (animals[i].generation > gens)
      gens = animals[i].generation;
  }

  text(`Highest Generation: ${gens}`, 20, 75*3);

}


// BEGINS CLASSES & STUFF
class AnimalType {
  constructor() {
    this.baseradius = random(50);
    this.baseMoveSpeed = random(100);
    this.baseTurnSpeed = random(100);
    this.baseFoodToMate = random(150, 300);
    this.baseMoveMod = random(1, 3);
  }

  makeAnimal() {
    return new Animal(random(300), random(20, 300), random(100), random(150, 300), random(1, 3));
  }
}

class Animal {

  constructor(rad, spe, tur, ftm, mod) {
    this.radius = clampAndSeed(rad, 5, 50, 5);
    this.moveSpeed = clampAndSeed(spe, 20, 300, 5);
    this.turnSpeed =  clampAndSeed(tur, 5, 50, 5);
    this.foodToMate = clampAndSeed(ftm, 75, 300, 10);
    this.moveMod = clampAndSeed(mod, 1, 5, 1);
    this.wantsToMate = false;
    this.children = [];
    this.food = 100;

    this.generation = 0;
    this.type = 0;
    this.gender = floor(random(0,10)) >= 5 ? true : false; // false = male, true = female

    this.x = random(width);
    this.y = random(height);
    this.facing = 0;

    this.targetX = 0;
    this.targetY = 0;
    this.mode = 0; // 0 = wander, 1 = pursuit, 2 = flee
  }

  walk() {

    if (this.mode == 1) {
      this.moveMod = 5;
    } else {
      this.moveMod = 1
    }

    this.x += cos(this.facing) * (this.moveSpeed / 50) * this.moveMod;
    this.y += sin(this.facing) * (this.moveSpeed / 50)  * this.moveMod;
  }

  wrap() {
    if (this.x >=width) {
      this.x = 0;
    } else if (this.x <= 0) {
      this.x = width;
    }

    if (this.y >= height) {
      this.y = 0;
    } else if (this.y <= 0) {
      this.y = height;
    }
  }

  turn(angle) {
    this.facing += (angle * map(this.turnSpeed, 0, 50, 0.25, 1.1) * 0.25);
  }

  turnTowards(x, y) {
    // let m = (y - this.y) / (x - this.y);
    // let angle = atan(m);

    return atan2(y - this.y, x - this.x);
  }


  update() {
    let target = null;

    let best = null;
    let b = 999999999;

    if (food.length > 0) {
      for (let i = 0; i < food.length; i++){
        let t = food[i];
        let dist = p5.Vector.dist(createVector(this.x, this.y), createVector(t.x, t.y));

        if (dist < b) {
          best = t;
          b = dist;
        }
      }

      if (b <= this.radius + best.radius) {
        var index = food.indexOf(best);
        if (index !== -1) food.splice(index, 1);
        this.food += best.value;
      }
    }

    if (this.mode == 0) {
      if (food.length != 0 && best != null) {
        this.facing = this.turnTowards(best.x, best.y) * this.turnSpeed;
      }

      this.walk();

      if (this.food < 50) {
        this.mode = 1;
      }

      if (this.food >= this.foodToMate) {
        this.mode = 1;
        this.wantsToMate = true;
      }

    } else if (this.mode == 1 && !this.wantsToMate) {
      if (food.length != 0 && best != null) {
        this.facing = this.turnTowards(best.x, best.y) * this.turnSpeed;
      }

      this.walk();

      if (this.food >= 50)
        this.mode = 0;
    } else if (this.mode == 1 && this.wantsToMate) {
      this.mateTarget = null;
      for (let i = 0; i < animals.length; i++) {
        let t = animals[i];
        if (t.wantsToMate && t.gender != this.gender && t.type == this.type) {
          this.mateTarget = t;
          break;
        }
      }

      if (this.mateTarget == null) {
        this.mode = 0;
        this.wantsToMate = false;
        return;
      }

      if (this.mateTarget) {
        if (this.gender == false) {
          this.facing = this.turnTowards(this.mateTarget.x, this.mateTarget.y) * this.turnSpeed;
          this.walk();
        }
        let distanceToMate = p5.Vector.dist(createVector(this.x, this.y), createVector(this.mateTarget.x, this.mateTarget.y));
        if (distanceToMate <= this.radius + this.mateTarget.radius) {
          console.log(`Mode: ${this.mode}, food: ${this.food}, ftm: ${this.foodToMate}, gen: ${this.generation + 1}`);

          let newRadius = 0, newSpeed = 0, newTurn = 0, newFTM = 0;

          if (floor(random(0, 100)) == 50) {
            newRadius = random(0, 50);
          } else {
            newRadius = (this.radius + this.mateTarget.radius) / 2;
          }

          if (floor(random(0, 100)) == 50) {
            newSpeed = random(0, 100);
          } else {
            newSpeed = (this.moveSpeed + this.mateTarget.moveSpeed) / 2;
          }

          if (floor(random(0, 100)) == 50) {
            newTurn = random(0, 100);
          } else {
            newTurn = (this.turnSpeed + this.mateTarget.turnSpeed) / 2;
          }

          if (floor(random(0, 100)) == 50) {
            newFTM = random(100, 250);
          } else {
            newFTM = (this.foodToMate + this.mateTarget.foodToMate) / 2;
          }

          let baby = new Animal((
            newRadius,
             newSpeed,
              newTurn,
               newFTM));
          baby.x = this.x; baby.y = this.y;
          baby.type = this.type;

          baby.generation = this.generation + 1;
          this.children.push(baby);
          animals.push(baby);

          this.food -= 50;
          this.wantsToMate = false;
          this.mode = 0;
        }
      }
    }

    this.wrap();
    this.food -= 0.05 * map(this.moveSpeed, 0, 50, 1, 3);


  }

  show() {
    if (this.type == 0) {
      ellipse(this.x, this.y, this.radius);
    } else if (this.type == 1) {
      rect(this.x, this.y, this.radius, this.radius);
    } else if (this.type == 2) {
      ellipse(this.x, this.y, this.radius, this.radius * 2);
    }
  }

}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 25;
    this.value = random(75, 120);
  }
}
