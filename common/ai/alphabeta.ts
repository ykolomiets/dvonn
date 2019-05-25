/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-use-before-define */
/* eslint-disable no-else-return */
import { ByteBoard } from './consts';
import { Move, findAvailableMoves, movePiece } from './moves';

function alphabetaMax(
  evaluateBoard: (board: ByteBoard) => number,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  stats: { observedNodes: number }
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  const moves = findAvailableMoves(board, isWhiteTurn);
  if (moves.length === 0) {
    const [value] = alphabetaMax(evaluateBoard, board, !isWhiteTurn, depth - 1, alpha, beta, stats);
    return [value, null];
  } else {
    let value = -Infinity;
    let move: Move = moves[0];
    const boardCopy = new Uint16Array(49);
    for (let i = 0; i < moves.length; i += 1) {
      stats.observedNodes += 1;
      boardCopy.set(board);
      movePiece(boardCopy, moves[i]);
      const [newValue] = alphabetaMin(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, alpha, beta, stats);
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
}

function alphabetaMin(
  evaluateBoard: (board: ByteBoard) => number,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  stats: { observedNodes: number }
): [number, Move | null] {
  if (depth === 0) {
    return [evaluateBoard(board), null];
  }
  const moves = findAvailableMoves(board, isWhiteTurn);
  if (moves.length === 0) {
    const [value] = alphabetaMax(evaluateBoard, board, !isWhiteTurn, depth - 1, alpha, beta, stats);
    return [value, null];
  } else {
    let value = +Infinity;
    const boardCopy = new Uint16Array(49);
    for (let i = 0; i < moves.length; i += 1) {
      stats.observedNodes += 1;
      boardCopy.set(board);
      movePiece(boardCopy, moves[i]);
      const [newValue] = alphabetaMax(evaluateBoard, boardCopy, !isWhiteTurn, depth - 1, alpha, beta, stats);
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

export default function alphabeta(
  evaluateBoard: (board: ByteBoard) => number,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  stats: { observedNodes: number }
): Move {
  const [, move] = alphabetaMax(evaluateBoard, board, isWhiteTurn, depth, -Infinity, +Infinity, stats);
  if (!move) {
    throw new Error();
  }
  return move;
}
