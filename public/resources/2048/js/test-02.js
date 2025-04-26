var board = new Array(),
  trigger = false, //判断是否进行了移动
  score = 0;

function init() {
  for (i = 0; i < 4; i++) { //初始化二维数组board
    board[i] = new Array();
    for (j = 0; j < 4; j++) {
      board[i][j] = 0;
    }
  };
  randNum(); //最开始随机的两个位置
  randNum();
  score = 0;
  $("#score").text(score);
  isFailed();
  showInHTML();
  keyMonitor();
};

//-----------------------showInHTML--------------------

var showInHTML = function () {
  $(".tile").remove();
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] != 0) {
        $(".tile-container").append("<div class='tile tile-position-" + i + "-" + j + "'><div class='inner-val val-" + board[i][j] + "'><span>" + board[i][j] + "</span></div></div>");
      }
    }
  }
};

//----------------------isFailed----------------------

var isFailed = function () {
  // setInterval(function () {
  //   if (isFull()) {
  //     for (var i = 1; i < 3; i++) {
  //       for (var j = 1; j < 3; j++) {
  //         if (board[i][j] === board[i + 1][j] || board[i][j] === board[i - 1][j] || board[i][j] === board[i][j + 1] || board[i][j] === board[i][j - 1]) {
  //           alert("failed!");
  //           return;
  //         }
  //       }
  //     }
  //   }
  // }, 500);
}

//----------------------isFull------------------------

var isFull = function () {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] === 0) {
        return false;
      }
    }
  }
  return true;
}

//----------------------randomNum---------------------

var randNum = function () {
  var ranRow = Math.floor(Math.random() * 4);
  var ranCol = Math.floor(Math.random() * 4);
  if (board[ranRow][ranCol] != 0) {
    if (isFull()) {
      // alert("failed!");
      return;
    } else {
      randNum();
    }
  } else {
    board[ranRow][ranCol] = 2;
    $(".tile-container").append("<div class='tile tile-new tile-position-" + ranRow + "-" + ranCol + "'><div class='inner-val val-2'><span>2</span></div></div>");
  }
  return;
}

// ---------------------noBlock-----------------------

var noBlockHorizontal = function (row, col1, col2) {
  for (var i = col1 + 1; i < col2; i++) {
    if (board[row][i] != 0) {
      return false;
    }
  }
  return true;
};

var noBlockVertical = function (row1, row2, col) {
  for (var i = row1 + 1; i < row2; i++) {
    if (board[i][col] != 0) {
      return false;
    }
  }
  return true;
};

//---------------------animate------------------------

var animateMerge = function (val1, val2) {
  if (board[val1][val2] != 0)
    $(".tile-container").append("<div class='tile tile-merged tile-position-" + val1 + "-" + val2 + "'><div class='inner-val val-" + board[val1][val2] + "'>" + board[val1][val2] + "</div></div>");
  $(".tile-position-" + val1 + "-" + val2).not(".tile-merged").remove();
}

var animateHorizontal = function (i, j, k, merge) {
  $(".tile-position-" + i + "-" + j).removeClass("tile-position-" + i + "-" + j).addClass("tile-position-" + i + "-" + k);
  if (merge === 1) {
    setTimeout(function () {
      // showInHTML();
      animateMerge(i, k);
    }, 100);
  }
};
var animateVertical = function (i, j, k, merge) {
  setTimeout(function () {}, 100);
  $(".tile-position-" + i + "-" + j).removeClass("tile-position-" + i + "-" + j).addClass("tile-position-" + k + "-" + j);
  setTimeout(function () {
    if (merge === 1) {
      // showInHTML();
      animateMerge(k, j);
    }
  }, 200);
};

// ---------------------Move&Merge-------------------- && noBlockHorizontal(i, k, j)

var moveLeft = function () {

  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] != 0) {
        for (var k = j - 1; k > -1; k--) {
          //ik与ij之间无障碍
          if (board[i][k] === 0 && noBlockHorizontal(i, k, j)) {
            //move
            board[i][k] = board[i][j];
            board[i][j] = 0;
            animateHorizontal(i, j, k, 0);
            trigger = true;
            continue;
          } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, k, j)) {
            //merge
            board[i][k] = board[i][k] + board[i][j];
            board[i][j] = 0;
            score = score + 4;
            animateHorizontal(i, j, k, 1);
            trigger = true;
            continue;
          }
        }
      }
    }
  }
  if (trigger) {
    setTimeout(function () {
      showInHTML();
      randNum();
    }, 300);
    $("#score").text(score);
    trigger = false;
  }
};

var moveRight = function () {
  for (var i = 0; i < 4; i++) {
    for (var j = 3; j > -1; j--) {
      if (board[i][j] != 0) {
        for (var k = 3; k > j; k--) {
          if (board[i][k] === 0 && noBlockHorizontal(i, j, k)) { // && noBlock
            //move
            board[i][k] = board[i][j];
            board[i][j] = 0;
            animateHorizontal(i, j, k, 0);
            trigger = true;
            continue;
          } else if (board[i][k] === board[i][j] && noBlockHorizontal(i, j, k)) { // && noBlock
            //merge
            board[i][k] = board[i][k] + board[i][j];
            board[i][j] = 0;
            score = score + 4;
            animateHorizontal(i, j, k, 1);
            trigger = true;
            continue;
          }
        }
      }
    }
  }
  if (trigger) {
    setTimeout(function () {
      showInHTML();
      randNum();
    }, 300);
    $("#score").text(score);
    trigger = false;
  }
};

var moveUp = function () {
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] != 0) {
        for (var k = 0; k < i; k++) {
          if (board[k][j] === 0 && noBlockVertical(k, i, j)) { // && noBlock
            //move
            board[k][j] = board[i][j];
            board[i][j] = 0;
            animateVertical(i, j, k, 0);
            trigger = true;
            continue;
          } else if (board[k][j] === board[i][j] && noBlockVertical(k, i, j)) { // && noBlock
            //merge
            board[k][j] = board[k][j] + board[i][j];
            board[i][j] = 0;
            score = score + 4;
            animateVertical(i, j, k, 1);
            trigger = true;
            continue;
          }
        }
      }
    }
  }
  if (trigger) {
    setTimeout(function () {
      showInHTML();
      randNum();
    }, 300);
    $("#score").text(score);
    trigger = false;
  }
};

var moveDown = function () {
  for (var i = 3; i > -1; i--) {
    for (var j = 0; j < 4; j++) {
      if (board[i][j] != 0) {
        for (var k = 3; k > i; k--) {
          if (board[k][j] === 0 && noBlockVertical(i, k, j)) { // && noBlock
            //move
            board[k][j] = board[i][j];
            board[i][j] = 0;
            animateVertical(i, j, k, 0);
            trigger = true;
            continue;
          } else if (board[k][j] === board[i][j] && noBlockVertical(i, k, j)) { // && noBlock
            //merge
            board[k][j] = board[k][j] + board[i][j];
            board[i][j] = 0;
            score = score + 4;
            animateVertical(i, j, k, 1);
            trigger = true;
            continue;
          }
        }
      }
    }
  }
  if (trigger) {
    setTimeout(function () {
      showInHTML();
      randNum();
    }, 300);
    $("#score").text(score);
    trigger = false;
  }
};

init();