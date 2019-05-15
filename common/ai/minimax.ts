import { ByteBoard } from './consts';
import { Move, findAvailableMoves, movePiece } from './moves';

export function minimax(
  evaluateBoard: (board: ByteBoard) => number,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  maximizingPlayer: boolean,
  stats: { observedNodes: number },
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  if (maximizingPlayer) {
    const moves = findAvailableMoves(board, isWhiteTurn);
    stats.observedNodes += moves.length;
    if (moves.length === 0) {
      const [value] = minimax(evaluateBoard, board, !isWhiteTurn, depth - 1, false, stats);
      return [value, null];
    } else {
      let value = -Infinity;
      let move: Move = moves[0];
      for (let i = 0; i < moves.length; i++) {
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = minimax(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, false, stats);
        if (newValue > value) {
          value = newValue;
          move = moves[i];
        }
      }
      return [value, move];
    }
  } else {
    const moves = findAvailableMoves(board, isWhiteTurn);
    stats.observedNodes += moves.length;
    if (moves.length === 0) {
      const [value] = minimax(evaluateBoard, board, !isWhiteTurn, depth - 1, true, stats);
      return [value, null];
    } else {
      let value = +Infinity;
      for (let i = 0; i < moves.length; i++) {
        const boardCopy = new Uint16Array(board);
        movePiece(boardCopy, moves[i]);
        const [newValue] = minimax(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, true, stats);
        if (newValue < value) {
          value = newValue;
        }
      }
      return [value, null];
    }
  }
}
