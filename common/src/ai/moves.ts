import {
  ByteBoard,
  WHITE_PIECE_ON_TOP,
  BLACK_PIECE_ON_TOP,
  TOTAL_CELLS,
  TOP_PIECE_COLOR_MASK,
  SURROUNDED_MASK,
  STACK_SIZE_MASK,
  DVONN_PIECE_MASK,
} from './consts';
import { movesMap } from '../core/movesMap';
import { checkConnectivity } from './connectivity';

export type Move = [number, number];
export function findAvailableMoves(board: ByteBoard, playerIsWhite: boolean): Move[] {
  const playerMask = playerIsWhite ? WHITE_PIECE_ON_TOP : BLACK_PIECE_ON_TOP;
  const moves: Move[] = [];
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = board[i];
    if ((cell & TOP_PIECE_COLOR_MASK) !== playerMask || cell & SURROUNDED_MASK) {
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

export function movePiece(board: ByteBoard, move: Move): void {
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
