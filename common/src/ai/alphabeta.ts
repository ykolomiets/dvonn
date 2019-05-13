import { ByteBoard } from './consts';
import { Move, findAvailableMoves, movePiece } from './moves';

export function alphabeta(
  evaluateBoard: (board: ByteBoard) => number,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  stats: { observedNodes: number },
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  if (maximizingPlayer) {
    const moves = findAvailableMoves(board, isWhiteTurn);
    if (moves.length === 0) {
      const [value] = alphabeta(evaluateBoard, board, !isWhiteTurn, alpha, beta, depth - 1, false, stats);
      return [value, null];
    } else {
      let value = -Infinity;
      let move: Move = moves[0];
      for (let i = 0; i < moves.length; i++) {
        stats.observedNodes += 1;
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = alphabeta(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, alpha, beta, false, stats);
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
      const [value] = alphabeta(evaluateBoard, board, !isWhiteTurn, alpha, beta, depth - 1, true, stats);
      return [value, null];
    } else {
      let value = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        stats.observedNodes += 1;
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = alphabeta(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, alpha, beta, true, stats);
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
