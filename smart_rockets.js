var lifespan = 250;
var count = 0;
var population;
var target;
var lifeP;

var rx = 185;
var ry = 150;
var rw = 200;
var rh = 10;

var rx1 = 410;
var ry1 = 100;
var rw1 = 10;
var rh1 = 150;

var rx2 = 150;
var ry2 = 100;
var rw2 = 10;
var rh2 = 150;


function setup() {
  var canvas = createCanvas(550,400);
  canvas.parent('canvas');
  rocket = new Rocket();
  population = new Population();
  lifeP = createP();
  target = createVector(width/2, 50);
}


function draw() {
  background(25,25,25);
  population.run();
  count++;
  if (count == lifespan) {
    population.evaluate();
    population.selection();
    count = 0;
  }
  document.getElementById('popsize').innerHTML = population.popsize;
  fill(255,0,87)

  rect(rx, ry, rw, rh)
  rect(rx1, ry1, rw1, rh1)
  rect(rx2, ry2, rw2, rh2)
  ellipse(target.x, target.y, 16, 16);
}


function Population() {
  this.rockets = [];
  this.popsize = 1000;
  this.matingpool = [];
  
  for (var i = 0; i < this.popsize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.selection = function() {
    var newRockets = [];
    for (var i = 0; i < this.rockets.length; i++) {
      var parentA = random(this.matingpool).dna;
      var parentB = random(this.matingpool).dna;
      var child = parentA.crossover(parentB);
      child.mutate();
      newRockets[i] = new Rocket(child);
    }

    this.rockets = newRockets;
  };
  
  this.run = function() {
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
    }
  };

  this.evaluate = function() {
    var maxfit = 0;
    for (var i = 0; i < this.popsize; i++) {
      this.rockets[i].calcFitness();
      if (maxfit < this.rockets[i].fitness) {
        maxfit = this.rockets[i].fitness;
      }
      document.getElementById('fitness').innerHTML = maxfit;
    }

    for (var x = 0; x < this.popsize; x++) {
      this.rockets[x].fitness /= maxfit;
    }

    this.matingpool = [];
    for (var y = 0; y < this.popsize; y++) {
      var n = this.rockets[y].fitness * 100;
      for (var j = 0; j < n; j++) {
        this.matingpool.push(this.rockets[y]);
      }
    }
  };
}


function DNA(genes) {
  if (genes) {
    this.genes = genes;
  }
  else {
    this.genes = [];
    for  (var i = 0; i < lifespan; i++) {
      this.genes[i] = p5.Vector.random2D();
      this.genes[i].setMag(0.2);
    }
  }

  this.crossover = function(partner){
    var newgenes = [];
    var mid = floor(random(this.genes.length));
    for (var i = 0; i < this.genes.length; i++) {
      if (i > mid) {
        newgenes[i] = this.genes[i];
      }
      else {
        newgenes[i] = partner.genes[i];
      }
    }
    return new DNA(newgenes);
  };

  this.mutate = function () {
    for (var i = 0; i < this.genes.length; i++) {
      if (random(1) < 0.01) {
        this.genes[i] = p5.Vector.random2D();
        this.genes[i].setMag(0.2);
      }
    }
  };
}


function Rocket(dna) {
  this.pos = createVector(width/2, height-20);
  this.vel = createVector();
  this.acc = createVector();
  this.vel.limit(4);
  this.completed = false;
  this.crashed = false;
  if (dna) {
    this.dna = dna;
  }
  else {
    this.dna = new DNA();
  }
  this.fitness = 0;
  
  this.applyForce = function(force) {
    this.acc.add(force);
  };

  this.calcFitness = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    this.fitness = map(d,0,width,width,0);
    if (this.completed) {
      this.fitness *= 10;
    }
    if (this.crashed) {
      this.fitness /= 10;
    }
  };
  
  this.update = function() {
    var d = dist(this.pos.x, this.pos.y, target.x, target.y);
    if (d < 10) {
      this.completed = true;
      this.pos = target.copy()
    }

    if (this.pos.x > rx && this.pos.x < rx + rw && this.pos.y > ry && this.pos.y < ry + rh) {
      this.crashed = true;
    }

    if (this.pos.x > rx2 && this.pos.x < rx2 + rw2 && this.pos.y > ry2 && this.pos.y < ry2 + rh2) {
      this.crashed = true;
    }

    if (this.pos.x > rx1 && this.pos.x < rx1 + rw1 && this.pos.y > ry1 && this.pos.y < ry1 + rh1) {
      this.crashed = true;
    }

    if (this.pos.x > width || this.pos.x < 0) {
      this.crashed = true;
    }

    if (this.pos.y > height || this.pos.y < 0) {
      this.crashed = true;
    }

    this.applyForce(this.dna.genes[count]);
    if (!this.completed && !this.crashed) {
      this.vel.add(this.acc);
      this.pos.add(this.vel);
      this.acc.mult(0);
  
    }
  };
  
  this.show = function() {
    push();
    noStroke();
    fill(255,150);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 25, 5);
    pop();
  };
  
}

