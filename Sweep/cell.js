let bombColors = Array();
let bombImgs = Array();
let blank;

function preload() {
  clearedCell = loadImage('https://i.imgur.com/a8cVysZ.png');
  bombCell = loadImage('https://i.imgur.com/3m0TKv3.png');
  fatalCell = loadImage('https://i.imgur.com/VJq0d4l.png');
  falseCell = loadImage('https://i.imgur.com/kSLCGsi.png');
  blankCell = loadImage('https://i.imgur.com/rCom2pY.png');
  flagCell = loadImage('https://i.imgur.com/drReo3m.png');
  oneCell = loadImage('https://i.imgur.com/PaKE6DE.png');
  twoCell = loadImage('https://i.imgur.com/wH1tS9k.png');
  threeCell = loadImage('https://i.imgur.com/1cCp7kB.png');
  fourCell = loadImage('https://i.imgur.com/93MD2kz.png');
  fiveCell = loadImage('https://i.imgur.com/5CNPOpL.png');
  sixCell = loadImage('https://i.imgur.com/cyQbD0m.png');
  sevenCell = loadImage('https://i.imgur.com/WSx66zX.png');
  eightCell = loadImage('https://i.imgur.com/U0v7ufG.png');
  // Imgur Album: https://imgur.com/a/mkgzVCo
  bombImgs.push(oneCell);
  bombImgs.push(twoCell);
  bombImgs.push(threeCell);
  bombImgs.push(fourCell);
  bombImgs.push(fiveCell);
  bombImgs.push(sixCell);
  bombImgs.push(sevenCell);
  bombImgs.push(eightCell);

  blankCell.resizeNN(150,0);
}



class Cell {
  constructor(x, y, mine) {
    this.x = x;
    this.y = y;
    this.mine = mine;
    this.count = 0;
    this.reserved = false;
    this.revealed = false;
    this.flagged = false;

    if (this.mine) {
      this.count = -1;
    }
  }

  isMine() {
    return this.mine;
  }

  getCount() {
    return this.count;
  }

  draw() {
    let cX = this.x * cellSize;
    let cY = this.y * cellSize;

    if (this.revealed  && !this.flagged) {
      if (this.mine) {
        if (this.revealed == "fatal" && gameOver) {
          image(fatalCell, cX, cY, cellSize, cellSize);
        } else {
          image(bombCell, cX, cY, cellSize, cellSize);
        }
      } else {
        if (this.count > 0) {
          image(bombImgs[this.count - 1], cX, cY, cellSize, cellSize);
        } else {
          image(clearedCell, cX, cY, cellSize, cellSize);
        }
      }
    } else {
      if (this.flagged) {
        if (this.mine && gameOver) {
          image(flagCell, cX, cY, cellSize, cellSize);
        } else if (!this.mine && gameOver){
          image(falseCell, cX, cY, cellSize, cellSize);
        } else {
          image(flagCell, cX, cY, cellSize, cellSize);
        }
      } else {
        image(blankCell, cX, cY, cellSize, cellSize);
      }
    }

  }

  floodFill() {
    if (!this.flagged) {
      this.revealed = true;
    }
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        let gX = this.x + x;
        let gY = this.y + y;
        let gCell = game.grid[gX + (gY * (game.width))];


        if (gX < 0 || gX >= game.width ||
           gY < 0 || gY >= game.height || (x == 0 && y == 0)) {
          continue;
        }

        if (gCell.count == 0 && !gCell.revealed && !gCell.flagged) {
          gCell.floodFill();
        }

        if (!gCell.mine) {
          if (!gCell.flagged) {
            gCell.revealed = true;
          }
        }
      }
    }
  }

  calculateNearby() {
    if (this.count > 0) {
      this.count = 0;
    }

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        let gX = this.x + x;
        let gY = this.y + y;

        if (gX < 0 || gX >= game.width ||
           gY < 0 || gY >= game.height) {
          continue;
        } else {
          let gCell = game.grid[gX + (gY * (game.width))];
          if (gCell.isMine()) {
            this.count++;
          }
        }
      }
    }
  }
}
