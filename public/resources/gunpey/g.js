// Gunpey board generator and solver.
//
// Encoding:
//   0: empty
//   1: \  connects top-left to bottom-right
//   2: /  connects bottom-left to top-right
//   3: V  connects top-left to top-right
//   4: ^  connects bottom-left to bottom-right

export const TILE = Object.freeze({
  EMPTY: 0,
  BACKSLASH: 1,
  SLASH: 2,
  V: 3,
  CARET: 4,
});

const TILE_NAMES = Object.freeze([' ', '\\', '/', 'V', '^']);

function key(row, col) {
  return `${row},${col}`;
}

function parseKey(value) {
  return value.split(',').map(Number);
}

function assertBoardSize(rows, cols) {
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows <= 0 || cols <= 0) {
    throw new Error('rows and cols must be positive integers');
  }
}

function assertLoopCount(loops) {
  if (!Number.isInteger(loops) || loops < 0) {
    throw new Error('loops must be a non-negative integer');
  }
}

function emptyBoard(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(TILE.EMPTY));
}

function makeRng(seed) {
  if (seed === undefined || seed === null) return Math.random;

  let state = Number(seed) >>> 0;
  return function rng() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rng) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function endpointsFor(row, col, tile) {
  switch (tile) {
    case TILE.BACKSLASH:
      return [
        [row, col],
        [row + 1, col + 1],
      ];
    case TILE.SLASH:
      return [
        [row + 1, col],
        [row, col + 1],
      ];
    case TILE.V:
      return [
        [row, col],
        [row, col + 1],
      ];
    case TILE.CARET:
      return [
        [row + 1, col],
        [row + 1, col + 1],
      ];
    default:
      return [];
  }
}

function movesFromNode(row, col, rows, cols) {
  const moves = [];

  if (col < cols) {
    if (row < rows) {
      moves.push({ nextRow: row + 1, nextCol: col + 1, cellRow: row, cellCol: col, tile: TILE.BACKSLASH });
      moves.push({ nextRow: row, nextCol: col + 1, cellRow: row, cellCol: col, tile: TILE.V });
    }
    if (row > 0) {
      moves.push({ nextRow: row - 1, nextCol: col + 1, cellRow: row - 1, cellCol: col, tile: TILE.SLASH });
      moves.push({ nextRow: row, nextCol: col + 1, cellRow: row - 1, cellCol: col, tile: TILE.CARET });
    }
  }

  if (col > 0) {
    if (row > 0) {
      moves.push({ nextRow: row - 1, nextCol: col - 1, cellRow: row - 1, cellCol: col - 1, tile: TILE.BACKSLASH });
      moves.push({ nextRow: row, nextCol: col - 1, cellRow: row - 1, cellCol: col - 1, tile: TILE.CARET });
    }
    if (row < rows) {
      moves.push({ nextRow: row + 1, nextCol: col - 1, cellRow: row, cellCol: col - 1, tile: TILE.SLASH });
      moves.push({ nextRow: row, nextCol: col - 1, cellRow: row, cellCol: col - 1, tile: TILE.V });
    }
  }

  return moves;
}

function cellIsEmpty(board, move) {
  return board[move.cellRow][move.cellCol] === TILE.EMPTY;
}

function placeMove(board, move) {
  board[move.cellRow][move.cellCol] = move.tile;
}

function randomPrimaryPath(board, rng, usedStartRows) {
  const rows = board.length;
  const cols = board[0].length;
  const startRows = shuffle(Array.from({ length: rows + 1 }, (_, index) => index), rng);

  for (const startRow of startRows) {
    if (usedStartRows.has(startRow)) continue;

    const moves = [];
    let row = startRow;
    let col = 0;
    let completed = true;

    for (let step = 0; step < cols; step++) {
      const candidates = movesFromNode(row, col, rows, cols).filter((move) => {
        return move.nextCol === col + 1 && cellIsEmpty(board, move);
      });

      if (candidates.length === 0) {
        completed = false;
        break;
      }

      const move = candidates[Math.floor(rng() * candidates.length)];
      moves.push(move);
      row = move.nextRow;
      col = move.nextCol;
    }

    if (completed) {
      for (const move of moves) placeMove(board, move);
      usedStartRows.add(startRow);
      return true;
    }
  }

  return false;
}

function randomPrimaryPaths(board, pathCount, rng) {
  const usedStartRows = new Set();

  for (let index = 0; index < pathCount; index++) {
    if (!randomPrimaryPath(board, rng, usedStartRows)) return false;
  }

  return true;
}

function normalizeGenerateOptions(options) {
  const normalized = options ?? {};
  const paths = normalized.paths ?? 1;
  const loops = normalized.loops ?? 0;

  if (typeof normalized !== 'object' || Array.isArray(normalized)) {
    throw new Error('options must be an object');
  }
  if (!Number.isInteger(paths) || paths <= 0) {
    throw new Error('paths must be a positive integer');
  }
  assertLoopCount(loops);

  return { ...normalized, paths, loops };
}

function buildGraph(board) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const nodes = new Set();
  const adjacency = new Map();
  let edges = 0;

  function addNode(node) {
    nodes.add(node);
    if (!adjacency.has(node)) adjacency.set(node, new Set());
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = board[row][col];
      if (tile === TILE.EMPTY) continue;

      const endpoints = endpointsFor(row, col, tile);
      if (endpoints.length !== 2) continue;

      const a = key(endpoints[0][0], endpoints[0][1]);
      const b = key(endpoints[1][0], endpoints[1][1]);
      addNode(a);
      addNode(b);
      adjacency.get(a).add(b);
      adjacency.get(b).add(a);
      edges++;
    }
  }

  return { rows, cols, nodes, adjacency, edges };
}

function graphComponents(graph) {
  const visited = new Set();
  let components = 0;

  for (const start of graph.nodes) {
    if (visited.has(start)) continue;

    components++;
    const queue = [start];
    visited.add(start);

    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      for (const next of graph.adjacency.get(current) ?? []) {
        if (visited.has(next)) continue;
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return components;
}

function graphHasLeftRightPath(graph) {
  const starts = [...graph.nodes].filter((node) => parseKey(node)[1] === 0);
  const visited = new Set(starts);
  const queue = [...starts];

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    const [, col] = parseKey(current);
    if (col === graph.cols) return true;

    for (const next of graph.adjacency.get(current) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push(next);
    }
  }

  return false;
}

function graphNodeSet(board) {
  return buildGraph(board).nodes;
}

function buildPathGraph(board) {
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const adjacency = new Map();

  function addEdge(from, to, tileCoord) {
    if (!adjacency.has(from)) adjacency.set(from, []);
    adjacency.get(from).push({ to, tileCoord });
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = board[row][col];
      if (tile === TILE.EMPTY) continue;

      const endpoints = endpointsFor(row, col, tile);
      if (endpoints.length !== 2) continue;

      const from = key(endpoints[0][0], endpoints[0][1]);
      const to = key(endpoints[1][0], endpoints[1][1]);
      const tileCoord = [row, col];
      addEdge(from, to, tileCoord);
      addEdge(to, from, tileCoord);
    }
  }

  return { cols, adjacency };
}

function findRouteThroughEmptyCells(board, start, end, occupiedNodes, rng, minCells) {
  const rows = board.length;
  const cols = board[0].length;
  const startKey = key(start[0], start[1]);
  const endKey = key(end[0], end[1]);
  const queue = [startKey];
  const seen = new Set([startKey]);
  const previous = new Map();

  for (let index = 0; index < queue.length; index++) {
    const currentKey = queue[index];
    const [row, col] = parseKey(currentKey);
    const moves = shuffle(movesFromNode(row, col, rows, cols), rng).filter((move) => {
      if (!cellIsEmpty(board, move)) return false;

      const nextKey = key(move.nextRow, move.nextCol);
      if (nextKey === endKey) return true;
      return !occupiedNodes.has(nextKey);
    });

    for (const move of moves) {
      const nextKey = key(move.nextRow, move.nextCol);
      if (seen.has(nextKey)) continue;

      seen.add(nextKey);
      previous.set(nextKey, { from: currentKey, move });

      if (nextKey === endKey) {
        const route = [];
        let cursor = endKey;
        while (cursor !== startKey) {
          const item = previous.get(cursor);
          route.push(item.move);
          cursor = item.from;
        }
        route.reverse();
        return route.length >= minCells ? route : null;
      }

      queue.push(nextKey);
    }
  }

  return null;
}

function addOneLoop(board, rng, minCells) {
  const nodes = [...graphNodeSet(board)]
    .map(parseKey)
    .filter(([, col]) => col > 0 && col < board[0].length);

  const occupiedNodes = graphNodeSet(board);
  const pairs = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      pairs.push([nodes[i], nodes[j]]);
    }
  }

  shuffle(pairs, rng);

  for (const [start, end] of pairs) {
    const route = findRouteThroughEmptyCells(board, start, end, occupiedNodes, rng, minCells);
    if (!route) continue;

    for (const move of route) placeMove(board, move);
    return true;
  }

  return false;
}

export function countLoops(board) {
  validateBoard(board);
  const graph = buildGraph(board);
  if (graph.nodes.size === 0) return 0;
  return graph.edges - graph.nodes.size + graphComponents(graph);
}

export function isSolved(board) {
  validateBoard(board);
  return graphHasLeftRightPath(buildGraph(board));
}

export function findSolvedPaths(board) {
  validateBoard(board);

  const pathGraph = buildPathGraph(board);
  const starts = [...pathGraph.adjacency.keys()].filter((node) => parseKey(node)[1] === 0);
  const paths = [];
  const pathKeys = new Set();

  function addPath(path) {
    const pathKey = path.map(([row, col]) => `${row},${col}`).join('|');
    if (pathKeys.has(pathKey)) return;

    pathKeys.add(pathKey);
    paths.push(path.map(([row, col]) => [row, col]));
  }

  function dfs(node, visitedNodes, path) {
    const [, col] = parseKey(node);
    if (col === pathGraph.cols) {
      addPath(path);
      return;
    }

    for (const edge of pathGraph.adjacency.get(node) ?? []) {
      if (visitedNodes.has(edge.to)) continue;

      visitedNodes.add(edge.to);
      path.push(edge.tileCoord);
      dfs(edge.to, visitedNodes, path);
      path.pop();
      visitedNodes.delete(edge.to);
    }
  }

  for (const start of starts) {
    dfs(start, new Set([start]), []);
  }

  return paths;
}

export function findSolvedPath(board) {
  return findSolvedPaths(board)[0] ?? null;
}

export function validateBoard(board) {
  if (!Array.isArray(board) || board.length === 0 || !Array.isArray(board[0]) || board[0].length === 0) {
    throw new Error('board must be a non-empty 2D array');
  }

  const cols = board[0].length;
  for (const row of board) {
    if (!Array.isArray(row) || row.length !== cols) {
      throw new Error('board rows must have the same length');
    }
    for (const value of row) {
      if (!Number.isInteger(value) || value < TILE.EMPTY || value > TILE.CARET) {
        throw new Error('board values must be integers from 0 to 4');
      }
    }
  }
}

export function generateBoard(rows, cols, options = {}) {
  assertBoardSize(rows, cols);

  const normalized = normalizeGenerateOptions(options);
  const rng = makeRng(normalized.seed);
  const maxAttempts = normalized.maxAttempts ?? 500;
  const minLoopCells = normalized.minLoopCells ?? 2;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board = emptyBoard(rows, cols);
    if (!randomPrimaryPaths(board, normalized.paths, rng)) continue;

    let completed = countLoops(board) === 0;
    for (let loopIndex = 0; completed && loopIndex < normalized.loops; loopIndex++) {
      if (!addOneLoop(board, rng, minLoopCells)) {
        completed = false;
        break;
      }

      if (countLoops(board) !== loopIndex + 1) {
        completed = false;
        break;
      }
    }

    if (completed && isSolved(board) && countLoops(board) === normalized.loops) {
      return board;
    }
  }

  throw new Error(
    `failed to generate a ${rows}x${cols} board with ${normalized.paths} path(s) and ${normalized.loops} loop(s)`,
  );
}

export function boardToText(board) {
  validateBoard(board);
  return board.map((row) => row.map((value) => TILE_NAMES[value]).join(' ')).join('\n');
}

export const Gunpey = Object.freeze({
  TILE,
  generateBoard,
  isSolved,
  findSolvedPath,
  findSolvedPaths,
  countLoops,
  validateBoard,
  boardToText,
});

if (typeof globalThis !== 'undefined') {
  globalThis.Gunpey = Gunpey;
}
