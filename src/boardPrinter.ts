import { State, CellState, Cell, MoveDirection } from './cell';

function formatCellInfo(cell: CellState): string {
  if (cell.state === State.Empty) {
    return '   ';
  }

  let result = '';
  switch (cell.state) {
    case State.Black:
      result += '\x1b[32m';
      break;
    case State.White:
      result += '\x1b[37m';
      break;
    case State.Red:
      result += '\x1b[31m';
      break;
    default:
      break;
  }
  if (cell.stackSize.toString().length === 1) {
    result += ' ';
  }
  result += cell.stackSize;
  result += cell.hasDvonnPiece ? '*' : ' ';
  result += '\x1b[0m';
  return result;
}

function formatLine(lineCells: Cell[]): string {
  let result = '';
  lineCells.forEach((cell, index) => {
    result += formatCellInfo(cell.state);
    if (index === lineCells.length - 1) return;
    if (cell.state.state !== State.Empty && lineCells[index + 1].state.state !== State.Empty) {
      result += ' - ';
    } else {
      result += '   ';
    }
  });
  return result;
}

function formatDownConnections(cells: Cell[]): string {
  let result = '';
  cells.forEach(cell => {
    if (cell.state.state === State.Empty) {
      result += '      ';
    } else {
      const swNeighbor = cell.neighbors[MoveDirection.SouthWest];
      if (swNeighbor !== null && swNeighbor.state.state !== State.Empty) {
        result += '/';
      } else {
        result += ' ';
      }

      result += ' ';

      const seNeighbor = cell.neighbors[MoveDirection.SouthEast];
      if (seNeighbor !== null && seNeighbor.state.state !== State.Empty) {
        result += '\\';
      } else {
        result += ' ';
      }

      result += '   ';
    }
  });
  return result;
}

function formatUpConnections(cells: Cell[]): string {
  let result = '';
  cells.forEach(cell => {
    if (cell.state.state === State.Empty) {
      result += '      ';
    } else {
      const nwNeighbor = cell.neighbors[MoveDirection.NorthWest];
      if (nwNeighbor !== null && nwNeighbor.state.state !== State.Empty) {
        result += '\\';
      } else {
        result += ' ';
      }

      result += ' ';

      const neNeighbor = cell.neighbors[MoveDirection.NorthEast];
      if (neNeighbor !== null && neNeighbor.state.state !== State.Empty) {
        result += '/';
      } else {
        result += ' ';
      }

      result += '   ';
    }
  });
  return result;
}

function printBoard(board: Cell[]): void {
  let firstLine = '      ';
  firstLine += formatLine(board.slice(0, 9));
  console.log(firstLine);
  console.log(`      ${formatDownConnections(board.slice(0, 9))}`);

  let secondLine = '   ';
  secondLine += formatLine(board.slice(9, 19));
  console.log(secondLine);
  console.log(`   ${formatDownConnections(board.slice(9, 19))}`);

  let thirdLine = '';
  thirdLine += formatLine(board.slice(19, 30));
  console.log(thirdLine);

  let fourthLine = '   ';
  fourthLine += formatLine(board.slice(30, 40));
  console.log(`   ${formatUpConnections(board.slice(30, 40))}`);
  console.log(fourthLine);

  let fifthLine = '      ';
  fifthLine += formatLine(board.slice(40, 49));
  console.log(`      ${formatUpConnections(board.slice(40, 49))}`);
  console.log(fifthLine);
}

export default printBoard;
