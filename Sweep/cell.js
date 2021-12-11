let bombColors = Array();
let bombImgs = Array();
let blank;

function preload() {
  clearedCell = loadImage('../imgs/cleared.png');
  bombCell = loadImage('../imgs/bomb.png');
  fatalCell = loadImage('../imgs/fatal.png');
  falseCell = loadImage('../imgs/false.png');
  blankCell = loadImage('../imgs/empty.png');
  flagCell = loadImage('../imgs/flag.png');
  oneCell = loadImage('../imgs/1.png');
  twoCell = loadImage('../imgs/2.png');
  threeCell = loadImage('../imgs/3.png');
  fourCell = loadImage('../imgs/4.png');
  fiveCell = loadImage('../imgs/5.png');
  sixCell = loadImage('../imgs/6.png');
  sevenCell = loadImage('../imgs/7.png');
  eightCell = loadImage('../imgs/8.png');
  faceNormal = loadImage('../imgs/face1.png');
  facePeek = loadImage('../imgs/face2.png');
  faceWin = loadImage('../imgs/face3.png');
  faceDead = loadImage('../imgs/face4.png');

  // Imgur Album: https://imgur.com/a/mkgzVCo
  bombImgs.push(oneCell);
  bombImgs.push(twoCell);
  bombImgs.push(threeCell);
  bombImgs.push(fourCell);
  bombImgs.push(fiveCell);
  bombImgs.push(sixCell);
  bombImgs.push(sevenCell);
  bombImgs.push(eightCell);
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
    let cY = this.y * cellSize + headerSize;

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
