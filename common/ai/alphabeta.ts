/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-use-before-define */
/* eslint-disable no-else-return */
import { findAvailableMoves, movePiece } from './moves';
import { ByteBoard, Move, EvaluationFunction } from './types';

function alphabetaMax(
  evaluateBoard: EvaluationFunction,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  stats: { observedNodes: number }
): [number, Move | null] {
  const whiteMoves = findAvailableMoves(board, true);
  const blackMoves = findAvailableMoves(board, false);
  if ((whiteMoves.length === 0 && blackMoves.length === 0) || depth === 0) {
    return [evaluateBoard(board, whiteMoves, blackMoves), null];
  }
  const moves = isWhiteTurn ? whiteMoves : blackMoves;
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
  evaluateBoard: EvaluationFunction,
  board: ByteBoard,
  isWhiteTurn: boolean,
  depth: number,
  alpha: number,
  beta: number,
  stats: { observedNodes: number }
): [number, Move | null] {
  const whiteMoves = findAvailableMoves(board, true);
  const blackMoves = findAvailableMoves(board, false);
  if ((whiteMoves.length === 0 && blackMoves.length === 0) || depth === 0) {
    return [evaluateBoard(board, whiteMoves, blackMoves), null];
  }
  const moves = isWhiteTurn ? whiteMoves : blackMoves;
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
  evaluateBoard: EvaluationFunction,
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
