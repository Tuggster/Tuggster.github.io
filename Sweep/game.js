let screenWidth = 100;
let screenHeight = 100;
let screenConstraint = 0;
let p5Init = false;

let cellSize = 0;

let startReserved = 1;
let gameOver = false;
let won = false;


class MinesweeperRound {
  constructor(width, height, mines) {
    this.mines = mines;
    this.width = width;
    this.height = height;
    this.hasStart = false;
    gameOver = false;
    won = false;

    this.grid = Array();
    this.initGame();
    console.log(screenWidth, screenHeight)
  }

  initGame() {
    let trF = screenHeight / screenWidth;
    let trC = this.height / this.width;

    if (trF >= trC) {
      cellSize = screenWidth / this.width;
      screenConstraint = 0;
    } else {
      cellSize = screenHeight / this.height;
      screenConstraint = 1;
    }

    cellSize = Math.floor(cellSize);

    this.grid = Array();
    for(let i = 0; i < this.width * this.height; i++) {
      this.grid[i] = new Cell(i % this.width, Math.floor(i / this.width), false);
    }
    headerSize = cellSize * 3;
    border = cellSize * (5/8);
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
      gameOver = true;
      won = true;
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

   drawHUD() {
     fill(189, 189, 189, 255);
     noStroke();
     rect(0, headerSize - border, screenWidth, border);

     let faceImg;
     if (!gameOver) {
       if (mouseIsPressed) {
         faceImg = facePeek;
       } else {
         faceImg = faceNormal
       }
     } else {
       if (won) {
         faceImg = faceWin;
       } else {
         faceImg = faceDead;
       }
     }
     let faceSize = cellSize * 2;
     image(faceImg, (cellSize * game.width) / 2 - cellSize, (headerSize - border) / 2 - cellSize, faceSize, faceSize);
   }

   peekCell(x,y) {
     let gX = x * cellSize;
     let gY = y * cellSize + headerSize;
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


function isMobile() {
  try{ document.createEvent("TouchEvent"); return true; }
  catch(e){ return false; }
}
