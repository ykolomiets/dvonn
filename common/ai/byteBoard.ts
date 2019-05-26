/* eslint-disable no-bitwise */
import { Cell, PieceColor } from '../core/cell';

import {
  TOTAL_CELLS,
  DVONN_PIECE_MASK,
  BLACK_PIECE_ON_TOP,
  WHITE_PIECE_ON_TOP,
  DVONN_PIECE_ON_TOP,
  SURROUNDED_MASK,
} from './consts';
import { ByteBoard } from './types';

export function convertCellBooardToByteForm(cells: Cell[]): ByteBoard {
  const byteBoard = new Uint16Array(TOTAL_CELLS);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (cell.pieceStack === null) {
      byteBoard[i] = 0;
      continue;
    }
    byteBoard[i] = cell.pieceStack.stackSize;
    if (cell.pieceStack.containsDvonnPiece) {
      byteBoard[i] |= DVONN_PIECE_MASK;
    }
    if (cell.pieceStack.upperColor === PieceColor.Black) {
      byteBoard[i] |= BLACK_PIECE_ON_TOP;
    } else if (cell.pieceStack.upperColor === PieceColor.White) {
      byteBoard[i] |= WHITE_PIECE_ON_TOP;
    } else if (cell.pieceStack.upperColor === PieceColor.Red) {
      byteBoard[i] |= DVONN_PIECE_ON_TOP;
    }
    byteBoard[i] |= SURROUNDED_MASK;
    for (let j = 0; j < 6; j++) {
      const neighbor = cell.neighbors[j];
      if (!neighbor || neighbor.pieceStack === null) {
        byteBoard[i] &= ~SURROUNDED_MASK;
        break;
      }
    }
  }
  return byteBoard;
}

export function printByteBoard(board: ByteBoard): void {
  for (let i = 0; i < board.length; i++) {
    let str = Number(board[i]).toString(2);
    while (str.length < 16) {
      str = `0${str}`;
    }
    console.log(`${i}:\t${str}`);
  }
}
