let screenWidth = 1000;
let screenHeight = 1000;
let screenConstraint = 0;
let p5Init = false;

let cellSize = 0;

let startReserved = 1;
let gameOver = false;


class MinesweeperRound {
  constructor(width, height, mines) {
    this.mines = mines;
    this.width = width;
    this.height = height;
    this.hasStart = false;
    gameOver = false;

    this.grid = Array();

    this.initGame();
  }

  initGame() {
    // if (screenConstraint == 0) {
    //   cellSize = screenWidth / this.width;
    // } else {
    //   cellSize = screenHeight / this.height;
    // }
    let trF = screenHeight / screenWidth;
    let trC = this.height / this.width;

    if (trF >= trC) {
      cellSize = screenWidth / this.width;
    } else {
      cellSize = screenHeight / this.height;
    }

    cellSize = Math.floor(cellSize);

    this.grid = Array();
    for(let i = 0; i < this.width * this.height; i++) {
      this.grid[i] = new Cell(i % this.width, Math.floor(i / this.width), false);
    }
    if (p5Init) {
      resizeCanvas(cellSize * this.width, cellSize*this.height);
    }
  }

  winCheck() {
    let incomplete = 0;
    for (let i = 0; i < this.grid.length; i++) {
      let gCell = this.grid[i];
      if (gCell.mine && !gCell.flagged) {
        incomplete++;
      } else if (!gCell.mine && !gCell.revealed) {
        incomplete++;
      }
    }

    if (incomplete == 0) {
      alert("victory!");
      gameOver = true;
    }
    return incomplete;
  }

  reserveStart(sX, sY) {
    for (let x = -startReserved; x <= startReserved; x++) {
      for (let y = -startReserved; y <= startReserved; y++) {
        let gX = sX + x;
        let gY = sY + y;
        if (gX < 0 || gX >= game.width ||
           gY < 0 || gY >= game.height) {
          continue;
        }
        this.grid[gX + gY * this.width].reserved = true;
      }
    }
    this.hasStart = true;
  }

  revealCell(x, y) {
    if (!this.hasStart) {
      this.reserveStart(x,y);
      this.seedGame();
    }
    let gCell = this.grid[x + y * this.width];
    if (!gCell.flagged) {
      gCell.revealed = true;
      if (gCell.mine) {
        gCell.revealed = "fatal";
      }
    } else {
      return;
    }
    if (gCell.count == 0) {
      gCell.floodFill();
    }
    if (gCell.mine) {
      for (let i = 0; i < this.grid.length; i++) {
        if (this.grid[i].revealed != "fatal" && this.grid[i].mine) {
          this.grid[i].revealed = true;
        }
        gameOver = true;
      }
    }
   }

  peekCell(x,y) {
    let gX = x * cellSize;
    let gY = y * cellSize;
    let gCell = this.grid[x + y * this.width];
    if (!gCell.revealed && !gCell.flagged) {
      image(clearedCell, gX, gY, cellSize, cellSize);
    }
  }

  flagCell(x, y) {
    let gCell = this.grid[x + y * this.width];
    if (!gCell.revealed) {
      gCell.flagged = !gCell.flagged;
    }
  }

  seedGame() {
    for (let i = 0; i < this.mines; 0) {
      let mI = Math.floor(Math.random() * this.grid.length);

      if (this.grid[mI].count >= 0 && !this.grid[mI].reserved) {
        this.grid[mI].mine = true;
        i++;
      } else {
        continue;
      }
    }

    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i].calculateNearby();
    }
  }

  drawGame() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        let cell = this.grid[x + y * this.width];
        cell.draw();
      }
    }
  }
}


p5.Image.prototype.resizeNN = function(width, height) {
  if (width === 0 && height === 0) {
    width = this.canvas.width;
    height = this.canvas.height;
  } else if (width === 0) {
    width = this.canvas.width * height / this.canvas.height;
  } else if (height === 0) {
    height = this.canvas.height * width / this.canvas.width;
  }

  width = Math.floor(width);
  height = Math.floor(height);

  var temp = createImage(width,height),
    xScale = width / this.width ,
    yScale = height / this.height

  this.loadPixels()
  temp.loadPixels()
  for(var x=0; x<temp.width; x++) {
    for(var y=0; y<temp.height; y++) {
      var sourceInd = 4*(Math.floor(y/yScale)*this.width + Math.floor(x/xScale))
      var targetInd = 4*(y*temp.width + x)
      var sourceP = this.pixels.slice(sourceInd,sourceInd+4)//this.get(x/wScale, y/hScale)
      temp.pixels[targetInd] = sourceP[0]
      temp.pixels[targetInd+1] = sourceP[1]
      temp.pixels[targetInd+2] = sourceP[2]
      temp.pixels[targetInd+3] = sourceP[3]
    }
  }
  temp.updatePixels()
  this.updatePixels()

  this.canvas.width = this.width = width;
  this.canvas.height = this.height = height;

  this.drawingContext.drawImage(temp.canvas,
    0, 0, width, height,
    0, 0, width, height
  )
};
