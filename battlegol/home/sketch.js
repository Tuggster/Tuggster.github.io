function create2DArray(y, x) {
  let array = new Array(x);
  for (let i = 0; i < array.length; i++) {
    array[i] = new Array(y);
  }
  return array;
}

function getCellLivingNeighbors(x, y, array) {
  let alive = 0;
  for (let i = -1; i <= 1; i++) {
    for (var j = -1; j <= 1; j++) {
      if (x + i >= 0 && x + i < array.length && y + j >= 0 && y + j < array[0].length) {
          if (!(i == 0 && j == 0))
            alive += array[i + x][j + y];
      }
    }
  }

  return alive;
}

let board;
let tileSize = 20;

function setup() {
  createCanvas(800, 800);
  background(51);

  board = create2DArray(height/tileSize, width/tileSize);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      board[i][j] = floor(random() * 2);
    }
  }
}


function draw() {
  background(51);
  let newBoard = create2DArray(height/tileSize, width/tileSize);

  show();

  for (let x = 0; x < newBoard.length; x++) {
    for (let y = 0; y < newBoard[x].length; y++) {
      let neighbors = getCellLivingNeighbors(x, y, board);
      let currentState = board[x][y];
      //console.log(neighbors, currentState);

      if (currentState == 0 && neighbors == 3) {
        newBoard[x][y] = 1;
      }  else if (currentState == 1 && (neighbors < 2 || neighbors > 3)) {
        newBoard[x][y] = 0;
      } else {
        newBoard[x][y] = currentState;
      }
    }
  }

  board = newBoard;
}

function show() {
  for (let x = 0; x < board.length; x++) { // Draw the board
    for (let y = 0; y < board[x].length; y++) {
      fill(board[x][y] * 255);
      rect(x * tileSize, y * tileSize, tileSize - 1, tileSize - 1);
    }
  }
}
