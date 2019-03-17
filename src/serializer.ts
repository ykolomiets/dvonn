import { Cell, PieceColor } from './cell';

export function serializeBoard(board: Cell[]): string {
  let res = '';
  for (let i = 0; i < 49; i++) {
    let cellStr = '';
    const cell = board[i];
    if (cell.state.isEmpty === false) {
      switch (cell.state.upperColor) {
        case PieceColor.Black:
          cellStr += 'b';
          break;
        case PieceColor.White:
          cellStr += 'w';
          break;
        case PieceColor.Red:
          cellStr += 'r';
          break;
      }
      cellStr += cell.state.stackSize;
      cellStr += cell.state.containsDvonnPiece ? '*' : '';
    }
    res += cellStr + ',';
  }
  return res;
}

export function deserializeBoard(boardStr: string): Cell[] {
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
        state: { isEmpty: true },
        neighbors: [null, null, null, null, null, null],
      };
    } else {
      cell = {
        index: i,
        state: {
          isEmpty: false,
          upperColor: parseColor(cellStr[0]),
          containsDvonnPiece: cellStr[cellStr.length - 1] === '*',
          stackSize: parseInt(cellStr.substr(1)),
        },
        neighbors: [null, null, null, null, null, null],
      };
    }
    res.push(cell);
  }
  return res;
}
