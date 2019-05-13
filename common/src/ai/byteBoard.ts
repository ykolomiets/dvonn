import { Cell, PieceColor } from '../core/cell';

import {
  ByteBoard,
  TOTAL_CELLS,
  DVONN_PIECE_MASK,
  BLACK_PIECE_ON_TOP,
  WHITE_PIECE_ON_TOP,
  DVONN_PIECE_ON_TOP,
  SURROUNDED_MASK,
} from './consts';

export function convertCellBooardToByteForm(cells: Cell[]): ByteBoard {
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

export function printByteBoard(board: ByteBoard): void {
  for (let i = 0; i < board.length; i++) {
    let str = Number(board[i]).toString(2);
    while (str.length < 16) {
      str = '0' + str;
    }
    console.log(i + ':\t' + str);
  }
}
