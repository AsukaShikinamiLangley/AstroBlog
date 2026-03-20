// 0: space, 1: \(左上-右下), 2: /(左下-右上), 3: v(左上-右上), 4: ^(左下-右下)
//
// 格子 (r, c) 四角对应节点：
//   左上 = node(r, c), 右上 = node(r, c+1)
//   左下 = node(r+1, c), 右下 = node(r+1, c+1)
//
// 类型 → 节点边：
//   1(\): (r,c)     ↔ (r+1,c+1)
//   2(/): (r+1,c)   ↔ (r,c+1)
//   3(v): (r,c)     ↔ (r,c+1)
//   4(^): (r+1,c)   ↔ (r+1,c+1)

function nodeKey(r, c) {
  return `${r},${c}`;
}

function getNeighborMoves(nr, nc, m, n) {
  const moves = [];
  // 向右走一列 (nc → nc+1)，行可以 -1, 0, +1
  if (nc + 1 <= n) {
    const nc2 = nc + 1;
    // 类型1(\): node(r,c)→node(r+1,c+1), 格子(r,c), 需 r < m
    if (nr < m) {
      moves.push({ nr: nr + 1, nc: nc2, cellR: nr, cellC: nc, type: 1 });
    }
    // 类型2(/): node(r+1,c)→node(r,c+1), 格子(r,c), 需 r > 0
    if (nr > 0) {
      moves.push({ nr: nr - 1, nc: nc2, cellR: nr - 1, cellC: nc, type: 2 });
    }
    // 类型3(v): node(r,c)→node(r,c+1), 格子(r,c), 需 r < m
    if (nr < m) {
      moves.push({ nr: nr, nc: nc2, cellR: nr, cellC: nc, type: 3 });
    }
    // 类型4(^): node(r+1,c)→node(r+1,c+1), 格子(r,c), 需 r > 0
    if (nr > 0) {
      moves.push({ nr: nr, nc: nc2, cellR: nr - 1, cellC: nc, type: 4 });
    }
  }
  // 向左走一列 (nc → nc-1)
  if (nc - 1 >= 0) {
    const nc2 = nc - 1;
    // 类型1(\): node(r+1,c+1)→node(r,c), 格子(r, nc-1)
    if (nr > 0) {
      moves.push({ nr: nr - 1, nc: nc2, cellR: nr - 1, cellC: nc2, type: 1 });
    }
    // 类型2(/): node(r,c+1)→node(r+1,c), 格子(r, nc-1)
    if (nr < m) {
      moves.push({ nr: nr + 1, nc: nc2, cellR: nr, cellC: nc2, type: 2 });
    }
    // 类型3(v): node(r,c+1)→node(r,c), 格子(r, nc-1)
    if (nr < m) {
      moves.push({ nr: nr, nc: nc2, cellR: nr, cellC: nc2, type: 3 });
    }
    // 类型4(^): node(r+1,c+1)→node(r+1,c), 格子(r, nc-1)
    if (nr > 0) {
      moves.push({ nr: nr, nc: nc2, cellR: nr - 1, cellC: nc2, type: 4 });
    }
  }
  return moves;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generatePath(startNodeRow, m, n, used) {
  // 从节点 (startNodeRow, 0) 走到列 n 的任意节点
  // 每步只向右走（列+1），确保路径从左到右贯通
  const path = [];

  function dfs(nr, nc) {
    if (nc === n) return true;

    const moves = getNeighborMoves(nr, nc, m, n)
      .filter(mv => mv.nc === nc + 1 && !used[mv.cellR][mv.cellC]);
    shuffle(moves);

    for (const mv of moves) {
      used[mv.cellR][mv.cellC] = true;
      path.push(mv);
      if (dfs(mv.nr, mv.nc)) return true;
      used[mv.cellR][mv.cellC] = false;
      path.pop();
    }
    return false;
  }

  if (dfs(startNodeRow, 0)) return path;
  return null;
}

function generateLoop(m, n, used, nodeSet) {
  // 从已有图的某个非边界节点出发，走到已有图的任意节点（包括自身）
  // 中间节点度数>=2即可，不要求偶数
  const nodeList = [...nodeSet]
    .map(k => k.split(',').map(Number))
    .filter(([, c]) => c > 0 && c < n);
  shuffle(nodeList);

  for (const [startR, startC] of nodeList) {
    const loopPath = [];
    const loopVisited = new Set();

    if (dfsLoop(startR, startC, m, n, used, nodeSet, loopPath, loopVisited, 0)) {
      for (const mv of loopPath) {
        used[mv.cellR][mv.cellC] = true;
      }
      return loopPath;
    }
  }
  return null;
}

function dfsLoop(nr, nc, m, n, used, nodeSet, path, visited, depth) {
  if (depth >= 2 && nodeSet.has(nodeKey(nr, nc))) return true;
  if (depth >= 12) return false;

  const moves = getNeighborMoves(nr, nc, m, n)
    .filter(mv => !used[mv.cellR][mv.cellC] && !visited.has(`${mv.cellR},${mv.cellC}`));
  shuffle(moves);

  for (const mv of moves) {
    const cellKey = `${mv.cellR},${mv.cellC}`;
    visited.add(cellKey);
    path.push(mv);
    if (dfsLoop(mv.nr, mv.nc, m, n, used, nodeSet, path, visited, depth + 1)) {
      return true;
    }
    path.pop();
    visited.delete(cellKey);
  }
  return false;
}

function collectNodes(pathMoves, startNodeRow) {
  const nodes = new Set();
  nodes.add(nodeKey(startNodeRow, 0));
  for (const mv of pathMoves) {
    nodes.add(nodeKey(mv.nr, mv.nc));
  }
  return nodes;
}

export function generateGunpey(m, n, options = {}) {
  const { paths: pathCount = 1, loops: loopCount = 0 } = options;
  const maxAttempts = 50;

  for (let globalAttempt = 0; globalAttempt < maxAttempts; globalAttempt++) {
    const used = Array.from({ length: m }, () => Array(n).fill(false));
    const grid = Array.from({ length: m }, () => Array(n).fill(0));
    const allNodes = new Set();
    const allMoves = [];
    let success = true;

    // 生成路径
    const availableStarts = Array.from({ length: m + 1 }, (_, i) => i);
    shuffle(availableStarts);

    for (let p = 0; p < pathCount; p++) {
      let pathGenerated = false;
      for (let startIdx = 0; startIdx < availableStarts.length && !pathGenerated; startIdx++) {
        const startRow = availableStarts[startIdx];
        const savedUsed = used.map(row => [...row]);

        const pathMoves = generatePath(startRow, m, n, used);
        if (pathMoves) {
          const nodes = collectNodes(pathMoves, startRow);
          for (const nk of nodes) allNodes.add(nk);
          allMoves.push(...pathMoves);
          availableStarts.splice(startIdx, 1);
          pathGenerated = true;
        } else {
          for (let r = 0; r < m; r++) used[r] = savedUsed[r];
        }
      }
      if (!pathGenerated) {
        success = false;
        break;
      }
    }

    if (!success) continue;

    // 生成环
    for (let l = 0; l < loopCount; l++) {
      const loopMoves = generateLoop(m, n, used, allNodes);
      if (loopMoves) {
        for (const mv of loopMoves) {
          allNodes.add(nodeKey(mv.nr, mv.nc));
        }
        allMoves.push(...loopMoves);
      }
    }

    // 填充 grid
    for (const mv of allMoves) {
      grid[mv.cellR][mv.cellC] = mv.type;
    }

    // 验证连通性和中间列节点无悬空
    if (allMoves.length > 0 && isConnected(grid, m, n) && !hasDanglingNode(grid, m, n)) {
      return grid;
    }
  }

  // fallback: 至少生成一条简单路径
  return generateFallback(m, n);
}

function isConnected(grid, m, n) {
  const nonZeroCells = [];
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] !== 0) nonZeroCells.push([r, c]);
    }
  }
  if (nonZeroCells.length <= 1) return true;

  // BFS: 两个非0格子连通，当它们在节点图上共享至少一个端点
  const adj = new Map();
  for (const [r, c] of nonZeroCells) {
    const key = `${r},${c}`;
    if (!adj.has(key)) adj.set(key, []);
    const endpoints = getCellEndpoints(r, c, grid[r][c]);
    for (const [r2, c2] of nonZeroCells) {
      if (r === r2 && c === c2) continue;
      const endpoints2 = getCellEndpoints(r2, c2, grid[r2][c2]);
      for (const ep of endpoints) {
        for (const ep2 of endpoints2) {
          if (ep[0] === ep2[0] && ep[1] === ep2[1]) {
            adj.get(key).push(`${r2},${c2}`);
          }
        }
      }
    }
  }

  const visited = new Set();
  const queue = [`${nonZeroCells[0][0]},${nonZeroCells[0][1]}`];
  visited.add(queue[0]);
  while (queue.length > 0) {
    const curr = queue.shift();
    for (const neighbor of (adj.get(curr) || [])) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return visited.size === nonZeroCells.length;
}

function getCellEndpoints(r, c, type) {
  switch (type) {
    case 1: return [[r, c], [r + 1, c + 1]];
    case 2: return [[r + 1, c], [r, c + 1]];
    case 3: return [[r, c], [r, c + 1]];
    case 4: return [[r + 1, c], [r + 1, c + 1]];
    default: return [];
  }
}

function hasDanglingNode(grid, m, n) {
  const nodeDeg = {};
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 0) continue;
      for (const [nr, nc] of getCellEndpoints(r, c, grid[r][c])) {
        const key = `${nr},${nc}`;
        nodeDeg[key] = (nodeDeg[key] || 0) + 1;
      }
    }
  }
  for (const [key, deg] of Object.entries(nodeDeg)) {
    const nc = parseInt(key.split(',')[1]);
    if (nc > 0 && nc < n && deg === 1) return true;
  }
  return false;
}

function generateFallback(m, n) {
  const grid = Array.from({ length: m }, () => Array(n).fill(0));
  let nr = Math.floor(Math.random() * (m + 1));
  for (let c = 0; c < n; c++) {
    const candidates = [];
    if (nr < m) candidates.push({ nextNr: nr + 1, cellR: nr, type: 1 });
    if (nr > 0) candidates.push({ nextNr: nr - 1, cellR: nr - 1, type: 2 });
    if (nr < m) candidates.push({ nextNr: nr, cellR: nr, type: 3 });
    if (nr > 0) candidates.push({ nextNr: nr, cellR: nr - 1, type: 4 });
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    grid[choice.cellR][c] = choice.type;
    nr = choice.nextNr;
  }
  return grid;
}
