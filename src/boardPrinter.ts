import { Cell, CellState, PieceColor, Direction } from './cell';

function formatCellInfo(state: CellState): string {
  if (state.isEmpty) {
    return ' o ';
  }

  let result = '';
  switch (state.upperColor) {
    case PieceColor.Black:
      result += '\x1b[32m';
      break;
    case PieceColor.White:
      result += '\x1b[37m';
      break;
    case PieceColor.Red:
      result += '\x1b[31m';
      break;
    default:
      break;
  }
  if (state.stackSize.toString().length === 1) {
    result += ' ';
  }
  result += state.stackSize;
  result += state.containsDvonnPiece ? '*' : ' ';
  result += '\x1b[0m';
  return result;
}

function formatLine(lineCells: Cell[]): string {
  let result = '';
  lineCells.forEach((cell, index) => {
    result += formatCellInfo(cell.state);
    if (index === lineCells.length - 1) return;
    if (cell.state.isEmpty || lineCells[index + 1].state.isEmpty) {
      result += '   ';
    } else {
      result += ' - ';
    }
  });
  return result;
}

function formatDownConnections(cells: Cell[]): string {
  let result = '';
  cells.forEach(cell => {
    if (cell.state.isEmpty) {
      result += '      ';
    } else {
      if (cell.neighbors === null) {
        throw new Error('Cell neighbors are absent');
      }
      const swNeighbor = cell.neighbors[Direction.SouthWest];
      if (swNeighbor !== null && !swNeighbor.state.isEmpty) {
        result += '/';
      } else {
        result += ' ';
      }

      result += ' ';

      const seNeighbor = cell.neighbors[Direction.SouthEast];
      if (seNeighbor !== null && !seNeighbor.state.isEmpty) {
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
    if (cell.state.isEmpty) {
      result += '      ';
    } else {
      if (cell.neighbors === null) {
        throw new Error('Cell neighbors are absent');
      }
      const nwNeighbor = cell.neighbors[Direction.NorthWest];
      if (nwNeighbor !== null && !nwNeighbor.state.isEmpty) {
        result += '\\';
      } else {
        result += ' ';
      }

      result += ' ';

      const neNeighbor = cell.neighbors[Direction.NorthEast];
      if (neNeighbor !== null && !neNeighbor.state.isEmpty) {
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
  console.log('\n---------------------------------------------------------------');
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
  console.log('---------------------------------------------------------------\n');
}

export default printBoard;
