import { Cell, PieceColor } from "../../common/src/cell";
import { movesMap } from "../../common/src/movesMap";
import {
  Game,
  GameStage,
  PlayerColor,
  setNeighbores
} from "../../common/src/dvonn";
import { serializeBoard, deserializeBoard } from "../../common/src/serializer";

const DVONN_PIECE_MASK = 0b1000000000000000;
const TOP_PIECE_COLOR_MASK = 0b0110000000000000;
const STACK_SIZE_MASK = 0b0000000011111111;
const SURROUNDED_MASK = 0b0001000000000000;

const BLACK_PIECE_ON_TOP = 0b0010000000000000;
const WHITE_PIECE_ON_TOP = 0b0100000000000000;
const DVONN_PIECE_ON_TOP = 0b0110000000000000;

const TOTAL_CELLS = 49;

type ByteBoard = Uint16Array;

function convertCellBooardToByteForm(cells: Cell[]): ByteBoard {
  const byteBoard = new Uint16Array(TOTAL_CELLS);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.state.isEmpty === true) {
      byteBoard[i] = 0;
      continue;
    }
    byteBoard[i] = cell.state.stackSize;
    if (cell.state.containsDvonnPiece) {
      byteBoard[i] |= DVONN_PIECE_MASK;
    }
    if (cell.state.upperColor === PieceColor.Black) {
      byteBoard[i] |= BLACK_PIECE_ON_TOP;
    } else if (cell.state.upperColor === PieceColor.White) {
      byteBoard[i] |= WHITE_PIECE_ON_TOP;
    } else if (cell.state.upperColor === PieceColor.Red) {
      byteBoard[i] |= DVONN_PIECE_ON_TOP;
    }
    byteBoard[i] |= SURROUNDED_MASK;
    for (let neighbor of cell.neighbors) {
      if (!neighbor || neighbor.state.isEmpty) {
        byteBoard[i] &= ~SURROUNDED_MASK;
        break;
      }
    }
  }
  return byteBoard;
}

type Move = [number, number];
function findAvailableMoves(board: ByteBoard, playerIsWhite: boolean): Move[] {
  const playerMask = playerIsWhite ? WHITE_PIECE_ON_TOP : BLACK_PIECE_ON_TOP;
  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = board[i];
    if (
      (cell & TOP_PIECE_COLOR_MASK) !== playerMask ||
      cell & SURROUNDED_MASK
    ) {
      continue;
    }

    const stackSize = cell & STACK_SIZE_MASK;
    const movesFromMap = movesMap[i][stackSize - 1];
    if (movesFromMap) {
      for (let direction = 0; direction < 6; direction++) {
        const targetCellIndex = movesFromMap[direction];
        if (targetCellIndex !== -1) {
          const targetCell = board[targetCellIndex];
          if (targetCell !== 0) {
            moves.push([i, targetCellIndex]);
          }
        }
      }
    }
  }
  return moves;
}

function dfs(
  index: number,
  board: ByteBoard,
  checked: boolean[],
  component: number[]
): boolean {
  checked[index] = true;
  const cell = board[index];
  component.push(index);
  const neighbors = movesMap[index][0];
  let subcomponentContainsDvonnPiece = false;
  for (let i = 0; i < 6; i++) {
    const neighborIndex = neighbors[i];
    if (neighborIndex !== -1 && checked[neighborIndex] === false) {
      const res = dfs(neighborIndex, board, checked, component);
      if (res === true) {
        subcomponentContainsDvonnPiece = res;
      }
    }
  }
  const cellContainsDvonnPiece = (cell & DVONN_PIECE_MASK) !== 0;
  return cellContainsDvonnPiece || subcomponentContainsDvonnPiece;
}

function checkConnectivity(board: ByteBoard): void {
  const checked = new Array(TOTAL_CELLS);
  for (let i = 0; i < TOTAL_CELLS; i++) {
    checked[i] = board[i] === 0;
  }
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (checked[i] === false) {
      const component: number[] = [];
      const containsDvonnPiece = dfs(i, board, checked, component);
      if (!containsDvonnPiece) {
        for (let j = 0; j < component.length; j++) {
          board[component[j]] = 0;
        }
      }
    }
  }
}

function movePiece(board: ByteBoard, move: Move): void {
  const startCellIndex = move[0];
  const targetCellIndex = move[1];

  const startCell = board[startCellIndex];
  let targetCell = board[targetCellIndex];

  //Clear targetCell's top color
  targetCell &= ~TOP_PIECE_COLOR_MASK;
  //Set targetCell's top color equals to startCell's top color
  targetCell |= startCell & TOP_PIECE_COLOR_MASK;

  //Set targetCell's stack size
  const oldStackSize = targetCell & STACK_SIZE_MASK;
  targetCell &= ~STACK_SIZE_MASK;
  targetCell |= oldStackSize + (startCell & STACK_SIZE_MASK);

  //Set dvonnPiece bit
  targetCell |= startCell & DVONN_PIECE_MASK;

  board[startCellIndex] = 0;
  board[targetCellIndex] = targetCell;

  //Clear surrounded bit of neighbors
  const neighbors = movesMap[startCellIndex][0];
  for (let i = 0; i < 6; i++) {
    const neighborIndex = neighbors[i];
    if (neighborIndex !== -1) {
      board[neighborIndex] &= ~SURROUNDED_MASK;
    }
  }

  checkConnectivity(board);
}

function calculateScore(board: ByteBoard): [number, number] {
  const score: [number, number] = [0, 0];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    let cell = board[i];
    if (cell === 0) {
      continue;
    }
    const stackSize = cell & STACK_SIZE_MASK;
    const topPiece = cell & TOP_PIECE_COLOR_MASK;
    if (topPiece === BLACK_PIECE_ON_TOP) {
      score[1] += stackSize;
    } else if (topPiece === WHITE_PIECE_ON_TOP) {
      score[0] += stackSize;
    }
  }
  return score;
}

interface MinimaxStatistics {
  totalNodes: number;
}

function minimax(
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  maximizingPlayer: boolean,
  stats: MinimaxStatistics
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  if (maximizingPlayer) {
    const moves = findAvailableMoves(board, isWhiteTurn);
    stats.totalNodes += moves.length;
    if (moves.length === 0) {
      const [value] = minimax(board, !isWhiteTurn, depth - 1, false, stats);
      return [value, null];
    } else {
      let value = -Infinity;
      let move: Move = moves[0];
      for (let i = 0; i < moves.length; i++) {
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = minimax(
          boardCopy,
          !isWhiteTurn,
          depth - 1,
          false,
          stats
        );
        if (newValue > value) {
          value = newValue;
          move = moves[i];
        }
      }
      return [value, move];
    }
  } else {
    const moves = findAvailableMoves(board, isWhiteTurn);
    stats.totalNodes += moves.length;
    if (moves.length === 0) {
      const [value] = minimax(board, !isWhiteTurn, depth - 1, true, stats);
      return [value, null];
    } else {
      let value = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = minimax(
          boardCopy,
          !isWhiteTurn,
          depth - 1,
          true,
          stats
        );
        if (newValue < value) {
          value = newValue;
        }
      }
      return [value, null];
    }
  }
}

function alphabeta(
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  stats: MinimaxStatistics
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  if (maximizingPlayer) {
    const moves = findAvailableMoves(board, isWhiteTurn);
    if (moves.length === 0) {
      const [value] = alphabeta(
        board,
        !isWhiteTurn,
        alpha,
        beta,
        depth - 1,
        false,
        stats
      );
      return [value, null];
    } else {
      let value = -Infinity;
      let move: Move = moves[0];
      for (let i = 0; i < moves.length; i++) {
        stats.totalNodes += 1;
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = alphabeta(
          boardCopy,
          !isWhiteTurn,
          depth - 1,
          alpha,
          beta,
          false,
          stats
        );
        if (newValue > value) {
          value = newValue;
          move = moves[i];
        }
        if (newValue > alpha) {
          alpha = newValue;
        }
        if (alpha >= beta) {
          break;
        }
      }
      return [value, move];
    }
  } else {
    const moves = findAvailableMoves(board, isWhiteTurn);
    if (moves.length === 0) {
      const [value] = alphabeta(
        board,
        !isWhiteTurn,
        alpha,
        beta,
        depth - 1,
        true,
        stats
      );
      return [value, null];
    } else {
      let value = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        stats.totalNodes += 1;
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = alphabeta(
          boardCopy,
          !isWhiteTurn,
          depth - 1,
          alpha,
          beta,
          true,
          stats
        );
        if (newValue < value) {
          value = newValue;
        }
        if (newValue < beta) {
          beta = newValue;
        }
        if (alpha >= beta) {
          break;
        }
      }
      return [value, null];
    }
  }
}

function evaluateBoard(board: ByteBoard): number {
  const whiteAvailableMoves = findAvailableMoves(board, true);
  const blackAvailableMoves = findAvailableMoves(board, false);

  const score = calculateScore(board);
  if (score[0] === 0) {
    return -Infinity;
  } else if (score[1] === 0) {
    return Infinity;
  }
  if (whiteAvailableMoves.length === 0 && blackAvailableMoves.length === 0) {
    if (score[0] > score[1]) {
      return Infinity;
    } else if (score[1] > score[0]) {
      return -Infinity;
    } else {
      return 0;
    }
  }
  return score[0] - score[1];
}

function printByteBoard(board: ByteBoard): void {
  for (let i = 0; i < board.length; i++) {
    let str = Number(board[i]).toString(2);
    while (str.length < 16) {
      str = "0" + str;
    }
    console.log(i + ":\t" + str);
  }
}

const game = new Game();
game.randomPositioning();
game.state.board = deserializeBoard(
  "w1,b1,b1,b1,b1,b1,b1,b1,b1,w1,b1,w1,w1,w1,w1,b1,w1,b1,r1*,w1,w1,w1,w1,b1,w1,b1,b1,w1,b1,w1,w1,r1*,w1,w1,w1,b1,w1,b1,b1,b1,w1,w1,b1,w1,w1,b1,r1*,b1,b1,"
);
setNeighbores(game.state.board);

let totalCountOfNodes = 0;
while (game.state.stage === GameStage.MovingPieces) {
  game.printBoard();
  if (game.state.turn === PlayerColor.Black) {
    game.randomMove();
  } else {
    const byteBoard = convertCellBooardToByteForm(game.state.board);
    console.time("alphabeta");
    const statistics: MinimaxStatistics = { totalNodes: 0 };
    const [value, move] = alphabeta(
      byteBoard,
      true,
      6,
      -Infinity,
      +Infinity,
      true,
      statistics
    );
    console.timeEnd("alphabeta");
    console.log("Move: ", move, " with value: ", value);
    console.log("Nodes reiewed: ", statistics.totalNodes);
    totalCountOfNodes += statistics.totalNodes;
    if (move !== null) {
      game.movePiece(PlayerColor.White, move[0], move[1]);
    }
  }
}

if (game.state.stage !== GameStage.GameOver) {
  throw Error();
}

console.log("Final position: ");
game.printBoard();

console.log("Winner: ", game.state.winner);
console.log("Nodes observed: ", totalCountOfNodes);
