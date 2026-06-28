export interface Tile {
  id: number;
  level: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';
export type Board = (Tile | null)[][];

export const BOARD_SIZE = 4;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((tile) => (tile ? { ...tile } : null)));
}

export function getEmptyCells(board: Board): { row: number; col: number }[] {
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c]) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
}

export function addRandomTile(
  board: Board,
  nextId: { current: number },
  maxLevel: number = 2
): Board | null {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;

  const { row, col } = empty[Math.floor(Math.random() * empty.length)];
  const level = Math.random() < 0.9 ? 1 : Math.min(2, maxLevel);
  board[row][col] = {
    id: nextId.current++,
    level,
    row,
    col,
    isNew: true,
  };
  return board;
}

function clearAnimationFlags(board: Board): void {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const t = board[r][c];
      if (t) {
        t.isNew = false;
        t.isMerged = false;
      }
    }
  }
}

export interface MoveResult {
  newBoard: Board;
  scoreGained: number;
  moved: boolean;
  maxLevelReached: number;
}

export function move(
  inputBoard: Board,
  direction: Direction,
  nextId: { current: number }
): MoveResult {
  const board = cloneBoard(inputBoard);
  clearAnimationFlags(board);

  let scoreGained = 0;
  let moved = false;
  let maxLevelReached = 0;

  const processLine = (line: (Tile | null)[]): { line: (Tile | null)[]; score: number; changed: boolean } => {
    const filtered = line.filter((t): t is Tile => t !== null);
    const result: (Tile | null)[] = [];
    let score = 0;
    let changed = filtered.length !== line.filter((x) => x !== null).length;

    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i].level === filtered[i + 1].level) {
        const newLevel = filtered[i].level + 1;
        const mergedTile: Tile = {
          id: nextId.current++,
          level: newLevel,
          row: 0,
          col: 0,
          isMerged: true,
        };
        result.push(mergedTile);
        score += getScoreForLevel(newLevel);
        maxLevelReached = Math.max(maxLevelReached, newLevel);
        changed = true;
        i += 2;
      } else {
        result.push(filtered[i]);
        i++;
      }
    }

    while (result.length < BOARD_SIZE) {
      result.push(null);
    }

    for (let j = 0; j < BOARD_SIZE; j++) {
      const orig = line[j];
      const res = result[j];
      if ((orig === null) !== (res === null)) changed = true;
      if (orig && res && orig.id !== res.id) changed = true;
    }

    return { line: result, score, changed };
  };

  if (direction === 'left') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const { line, score, changed } = processLine(board[r]);
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = line[c];
        if (board[r][c]) {
          board[r][c]!.row = r;
          board[r][c]!.col = c;
        }
      }
      scoreGained += score;
      if (changed) moved = true;
    }
  } else if (direction === 'right') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const reversed = [...board[r]].reverse();
      const { line, score, changed } = processLine(reversed);
      const final = line.reverse();
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = final[c];
        if (board[r][c]) {
          board[r][c]!.row = r;
          board[r][c]!.col = c;
        }
      }
      scoreGained += score;
      if (changed) moved = true;
    }
  } else if (direction === 'up') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col: (Tile | null)[] = [];
      for (let r = 0; r < BOARD_SIZE; r++) col.push(board[r][c]);
      const { line, score, changed } = processLine(col);
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][c] = line[r];
        if (board[r][c]) {
          board[r][c]!.row = r;
          board[r][c]!.col = c;
        }
      }
      scoreGained += score;
      if (changed) moved = true;
    }
  } else if (direction === 'down') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col: (Tile | null)[] = [];
      for (let r = 0; r < BOARD_SIZE; r++) col.push(board[r][c]);
      const reversed = col.reverse();
      const { line, score, changed } = processLine(reversed);
      const final = line.reverse();
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][c] = final[r];
        if (board[r][c]) {
          board[r][c]!.row = r;
          board[r][c]!.col = c;
        }
      }
      scoreGained += score;
      if (changed) moved = true;
    }
  }

  return { newBoard: board, scoreGained, moved, maxLevelReached };
}

function getScoreForLevel(level: number): number {
  return Math.pow(2, level);
}

export function canMove(board: Board): boolean {
  if (getEmptyCells(board).length > 0) return true;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const current = board[r][c];
      if (!current) continue;
      if (c + 1 < BOARD_SIZE && board[r][c + 1]?.level === current.level) return true;
      if (r + 1 < BOARD_SIZE && board[r + 1][c]?.level === current.level) return true;
    }
  }
  return false;
}
