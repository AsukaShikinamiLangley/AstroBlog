var board = new Array();

function init() {
  for (var i = 0; i < 4; i++) {
    board[i] = new Array();
    for (var j = 0; j < 4; j++) {
      board[i][j] = 0;
    }
  }
};

var isFull = function () { //判断是否没有位置生成新数字
  for (i = 0; i < 4; i++) {
    for (j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        return false;
      }
    }
  }
  return true;
}

var randNum = function () { //随机生成数字
  var randrow = Math.floor(Math.random() * 4);
  var randcol = Math.floor(Math.random() * 4);
  if (board[randrow][randcol] !== 0) {
    if (!isFull()) {
      randNum();
    } else {
      console.log(randrow, randcol, isFull());
      alert("failed!")
      return;
    }
  } else {
    board[randrow][randcol] = 2;
  };
  console.log(randrow, randcol, isFull());
  return;
};

var noBlockHorizontal = function (row, col1, col2, board) { //水平(horizontal)方向中间没有障碍
  for (i = col1 + 1; i < col2; i++) {
    if (board[row][i] != 0) {
      return false;
    }
  };
  return true;
};

var noBlockVertical = function (row1, row2, col, board) { //垂直(vertical)方向中间没有障碍
  for (i = row1 + 1; i < row2; i++) {
    if (board[i][col] != 0) {
      return false;
    }
  };
  return true;
};

var moveLeft = function () { //左移
  // if (!canMoveLeft(board)) {
  //   return;
  // }
  for (i = 0; i < 4; i++) { //遍历数组
    for (j = 0; j < 4; j++) {
      if (board[i][j] != 0) { //若不为0
        for (k = 0; k < j; k++) { //从最左边找为0的位置
          //为0且与board[i][j]间无障碍
          if (board[i][k] === 0 && noBlockHorizontal(i, k, j, board)) {
            //move
            console.log(board[i][j]);
            board[i][k] = board[i][j];
            board[i][j] = 0;
            continue;
          }
          //i,k与i,j相等且中间无障碍
          else if (board[i][k] === board[i][j] && noBlockHorizontal(i, k, j, board)) {
            //merge
            board[i][k] = board[i][k] + board[i][j];
            board[i][j] = 0;
            continue;
          }
        }
      }
    }
  }
};

var moveRight = function () { //右移
  // if (!canMoveRight(board)) {
  //   return;
  // }
  for (i = 0; i < 4; i++) { //遍历数组
    for (j = 3; j > -1; j--) {
      if (board[i][j] != 0) {
        for (k = 3; k > j; k--) {
          //为0且与board[i][j]间无障碍
          if (board[i][k] === 0 && noBlockHorizontal(i, j, k, board)) {
            //move
            board[i][k] = board[i][j];
            board[i][j] = 0;
            continue;
          }
          //i,k与i,j相等且中间无障碍
          else if (board[i][k] === board[i][j] && noBlockHorizontal(i, j, k, board)) {
            //merge
            board[i][k] = board[i][k] + board[i][j];
            board[i][j] = 0;
            continue;
          }
        }
      }
    }
  }
};

var moveUp = function () { //上移
  // if (!canMoveUp(board)) {
  //   return;
  // }
  for (j = 0; j < 4; j++) { //遍历数组
    for (i = 0; i < 4; i++) {
      if (board[i][j] != 0) {
        for (k = 0; k < i; k++) {
          //为0且与board[i][j]间无障碍
          if (board[k][j] === 0 && noBlockVertical(k, i, j, board)) {
            //move
            board[k][j] = board[i][j];
            board[i][j] = 0;
            continue;
          }
          //i,k与i,j相等且中间无障碍
          else if (board[k][j] === board[i][j] && noBlockVertical(k, i, j, board)) {
            //merge
            board[k][j] = board[k][j] + board[i][j];
            board[i][j] = 0;
            continue;
          }
        }
      }
    }
  }
};

var moveDown = function () { //下移
  // if (!canMoveDown(board)) {
  //   return;
  // }
  for (j = 0; j < 4; j++) { //遍历数组
    for (i = 3; i > -1; i--) {
      if (board[i][j] != 0) {
        for (k = 3; k > i; k--) {
          //为0且与board[i][j]间无障碍

          if (board[k][j] === 0 && noBlockVertical(i, k, j, board)) {
            //move
            board[k][j] = board[i][j];
            board[i][j] = 0;
            continue;
          }
          //i,k与i,j相等且中间无障碍
          else if (board[k][j] === board[i][j] && noBlockVertical(i, k, j, board)) {
            //merge
            board[k][j] = board[k][j] + board[i][j];
            board[i][j] = 0;
            continue;
          }
        }
      }
    }
  }
};

var up = function () {
  moveUp();
  randNum();
  $("#main").html(board[0]+"<br>"+board[1]+"<br>"+board[2]+"<br>"+board[3]+"<br>");
};
var down = function () {
  moveDown();
  randNum();
  $("#main").html(board[0]+"<br>"+board[1]+"<br>"+board[2]+"<br>"+board[3]+"<br>");
};
var left = function () {
  moveLeft();
  randNum();
  $("#main").html(board[0]+"<br>"+board[1]+"<br>"+board[2]+"<br>"+board[3]+"<br>");
};
var right = function () {
  moveRight();
  randNum();
  $("#main").html(board[0]+"<br>"+board[1]+"<br>"+board[2]+"<br>"+board[3]+"<br>");
};

init();
randNum();
randNum();
// board[0][1]=2;
// board[0][2]=4;
// board[0][3]=2;
$("#main").html(board[0]+"<br>"+board[1]+"<br>"+board[2]+"<br>"+board[3]+"<br>");