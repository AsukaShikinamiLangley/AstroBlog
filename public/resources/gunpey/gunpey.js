// 0: space, 1: \, 2: /, 3: V, 4: ^
const items = [0, 1, 2, 3, 4];
const rules = {
  1: [
    [[1, 4], [2, 4], []],
    [[2, 3], [1], [2, 4]],
    [[], [2, 3], [1, 3]],
  ],
  2: [
    [[], [1, 4], [2, 4]],
    [[1, 4], [2], [1, 3]],
    [[2, 3], [1, 3], []],
  ],
  3: [
    [
      [1, 4],
      [1, 2, 4],
      [2, 4],
    ],
    [[2, 3], [3], [1, 3]],
    [[], [], []],
  ],
  4: [
    [[], [], []],
    [[1, 4], [4], [2, 4]],
    [
      [2, 3],
      [1, 2, 3],
      [1, 3],
    ],
  ],
};
// 生成二维数组
function generate2DArray(m, n, value) {
  return Array.from({ length: n }, () => Array.from({ length: m }, () => value));
}
// 生成m*n的二维数组, 数组中元素为节点(x, y), 0表示空, 1表示节点有连线经过
function generatePointsGrid(m, n) {
  const grid = generate2DArray(m, n, 0);
  let x = Math.floor(Math.random() * n);
  let y = 0;
  let path = [];
  while (y <= m - 1) {
    grid[x][y] = 1;
    path.push([x, y]);
    const dir = [-1, 0, 1][Math.floor(Math.random() * 3)];
    let nextX = x + dir;
    if (nextX < 0) nextX = 0;
    if (nextX >= n) nextX = n - 1;
    x = nextX;
    y++;
  }
  console.log(grid.map((r) => r.join(' ')).join('\n'));
  return { grid, path };
}

function generateGunpeyGrid(m, n) {
  // m*n的棋盘, 节点为m+1*n+1
  const { path } = generatePointsGrid(m + 1, n + 1);
  console.log('path: ', path);
  let grid = generate2DArray(m, n, 0);
  for (let i = 0; i <= path.length - 2; i++) {
    console.log('-> ', path[i], path[i + 1]);
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    if (x1 > x2) {
      grid[x1 - 1][y1] = 2;
    } else if (x1 < x2) {
      grid[x1][y1] = 1;
    } else {
      Math.random() < 0.5 ? (grid[x1 - 1][y1] = 4) : (grid[x1][y1] = 3);
    }
  }
  console.log(grid.map((r) => r.join(' ')).join('\n'));
  console.log('0: space, 1: \\, 2: /, 3: V, 4: ^');
  return grid;
}
generateGunpeyGrid(5, 5);
