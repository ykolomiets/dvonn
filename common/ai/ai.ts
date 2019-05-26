/* eslint-disable no-bitwise */
/* eslint-disable no-else-return */
import { writeFileSync } from 'fs';
import { Cell } from '../core/cell';
import { TOTAL_CELLS, BLACK_PIECE_ON_TOP, WHITE_PIECE_ON_TOP, TOP_PIECE_COLOR_MASK, STACK_SIZE_MASK } from './consts';
import { convertCellBooardToByteForm } from './byteBoard';
import { Game, PlayerColor, GameStage, GameResult } from '../core/dvonn';
import search from './iterativeAlphabeta';
import { EvaluationFunction, ByteBoard, Move } from './types';

function calculateScore(board: ByteBoard): [number, number] {
  const score: [number, number] = [0, 0];
  for (let i = 0; i < TOTAL_CELLS; i += 1) {
    const cell = board[i];
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

function evaluateBoardFirst(board: ByteBoard, whiteMoves: Move[], blackMoves: Move[]): number {
  const score = calculateScore(board);
  if (score[0] === 0) {
    return -Infinity;
  }
  if (score[1] === 0) {
    return Infinity;
  }
  if (whiteMoves.length === 0 && blackMoves.length === 0) {
    if (score[0] > score[1]) {
      return Infinity;
    } else if (score[1] > score[0]) {
      return -Infinity;
    } else {
      return 0;
    }
  } else {
    return score[0] - score[1];
  }
}

function evaluateBoardSecond(board: ByteBoard, whiteMoves: Move[], blackMoves: Move[]): number {
  const score = calculateScore(board);
  if (score[0] === 0) {
    return -Infinity;
  }
  if (score[1] === 0) {
    return Infinity;
  }
  if (whiteMoves.length === 0 && blackMoves.length === 0) {
    if (score[0] > score[1]) {
      return Infinity;
    } else if (score[1] > score[0]) {
      return -Infinity;
    } else {
      return 0;
    }
  } else {
    score[0] = score[0] * 3 + whiteMoves.length;
    score[1] = score[1] * 3 + blackMoves.length;
    return score[0] - score[1];
  }
}

export default function getBestMove(board: Cell[], isWhite: boolean, time: number): Move | null {
  const byteBoard = convertCellBooardToByteForm(board);
  const stats = { observedNodes: 0, maxDepth: 0 };
  const evalFunc: EvaluationFunction = isWhite ? evaluateBoardFirst : (b, m1, m2) => -evaluateBoardFirst(b, m1, m2);
  console.time('alphabeta');
  const move = search(evalFunc, byteBoard, isWhite, time, stats);
  console.timeEnd('alphabeta');
  console.log('Nodes observed: ', stats.observedNodes);
  return move;
}

// interface SearchStats {
//   observedNodes: number;
//   maxDepth: number;
// }
// interface GameStats {
//   search: SearchStats[];
//   win: boolean;
// }

// const allStats: {
//   withPV: GameStats[];
//   withoutPV: GameStats[];
// } = {
//   withPV: [],
//   withoutPV: [],
// };

// const winners = [0, 0];

// for (let i = 0; i < 20; i++) {
//   const game = new Game();
//   game.randomPositioning();
//   const whiteEval: EvaluationFunction = evaluateBoardFirst;
//   const blackEval: EvaluationFunction = (b, m1, m2): number => -evaluateBoardFirst(b, m1, m2);
//   const whitePlayerStats: { observedNodes: number; maxDepth: number }[] = [];
//   const blackPlayerStats: { observedNodes: number; maxDepth: number }[] = [];

//   while (game.state.stage === GameStage.MovingPieces) {
//     const byteBoard = convertCellBooardToByteForm(game.state.board);
//     if (game.state.turn === PlayerColor.White) {
//       const stats = { observedNodes: 0, maxDepth: 0 };
//       const move = search(whiteEval, byteBoard, true, 2000, stats);
//       whitePlayerStats.push(stats);
//       game.movePiece(PlayerColor.White, move[0], move[1]);
//     } else {
//       const stats = { observedNodes: 0, maxDepth: 0 };
//       const move = search(blackEval, byteBoard, false, 2000, stats);
//       blackPlayerStats.push(stats);
//       game.movePiece(PlayerColor.Black, move[0], move[1]);
//     }
//   }

//   if (game.state.stage === GameStage.GameOver) {
//     switch (game.state.result) {
//       case GameResult.Draw:
//         console.log('Draw');
//         break;
//       case GameResult.WhiteWin:
//         console.log('White won');
//         winners[0] += 1;
//         break;
//       case GameResult.BlackWin:
//         console.log('Black won');
//         winners[1] += 1;
//         break;
//       default:
//     }
//     console.log(winners);
//   }
// }

// writeFileSync('allStats.json', JSON.stringify(allStats, null, ' '));

// console.log(winners);
