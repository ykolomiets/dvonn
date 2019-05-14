import { Cell } from '../core/cell';
import {
  ByteBoard,
  TOTAL_CELLS,
  BLACK_PIECE_ON_TOP,
  WHITE_PIECE_ON_TOP,
  TOP_PIECE_COLOR_MASK,
  STACK_SIZE_MASK,
} from './consts';
import { findAvailableMoves, Move } from './moves';
import { convertCellBooardToByteForm } from './byteBoard';
import { alphabeta } from './alphabeta';

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

export function getBestMove(board: Cell[], isWhite: boolean): Move | null {
  const byteBoard = convertCellBooardToByteForm(board);
  const stats = { observedNodes: 0 };
  const evalFunc = isWhite ? evaluateBoard : (board: ByteBoard) => -evaluateBoard(board);
  const [, move] = alphabeta(evalFunc, byteBoard, isWhite, 4, -Infinity, +Infinity, true, stats);
  console.log('Nodes explored: ', stats.observedNodes);
  return move;
}
