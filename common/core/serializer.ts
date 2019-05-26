import { Cell, PieceColor } from './cell';
import { setNeighbores } from './dvonn';

export function serializeBoard(board: Cell[]): string {
  let res = '';
  for (let i = 0; i < 49; i++) {
    let cellStr = '';
    const cell = board[i];
    if (cell.pieceStack) {
      switch (cell.pieceStack.upperColor) {
        case PieceColor.Black:
          cellStr += 'b';
          break;
        case PieceColor.White:
          cellStr += 'w';
          break;
        case PieceColor.Red:
          cellStr += 'r';
          break;
        default:
      }
      cellStr += cell.pieceStack.stackSize;
      cellStr += cell.pieceStack.containsDvonnPiece ? '*' : '';
    }
    res += `${cellStr},`;
  }
  return res;
}

function parseColor(colorStr: string): PieceColor {
  if (colorStr === 'b') {
    return PieceColor.Black;
  }
  if (colorStr === 'w') {
    return PieceColor.White;
  }
  if (colorStr === 'r') {
    return PieceColor.Red;
  }
  throw new Error('Wrong color');
}

export function deserializeBoard(boardStr: string): Cell[] {
  const cells = boardStr.split(',');
  if (cells.length !== 50) {
    throw new Error('Broken string');
  }
  const res: Cell[] = [];
  for (let i = 0; i < 49; i++) {
    const cellStr = cells[i];
    let cell: Cell;
    if (cellStr === '') {
      cell = {
        index: i,
        pieceStack: null,
        neighbors: [null, null, null, null, null, null],
      };
    } else {
      cell = {
        index: i,
        pieceStack: {
          upperColor: parseColor(cellStr[0]),
          containsDvonnPiece: cellStr[cellStr.length - 1] === '*',
          stackSize: parseInt(cellStr.substr(1), 10),
        },
        neighbors: [null, null, null, null, null, null],
      };
    }
    res.push(cell);
  }
  setNeighbores(res);
  return res;
}
