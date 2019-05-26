import { Cell, PieceColor, Direction, PieceStack } from './cell';

function formatCellInfo(stack: PieceStack | null): string {
  if (stack === null) {
    return ' o ';
  }

  let result = '';
  switch (stack.upperColor) {
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
  if (stack.stackSize.toString().length === 1) {
    result += ' ';
  }
  result += stack.stackSize;
  result += stack.containsDvonnPiece ? '*' : ' ';
  result += '\x1b[0m';
  return result;
}

function formatLine(lineCells: Cell[]): string {
  let result = '';
  lineCells.forEach((cell, index) => {
    result += formatCellInfo(cell.pieceStack);
    if (index === lineCells.length - 1) return;
    if (cell.pieceStack === null || lineCells[index + 1].pieceStack === null) {
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
    if (cell.pieceStack === null) {
      result += '      ';
    } else {
      if (cell.neighbors === null) {
        throw new Error('Cell neighbors are absent');
      }
      const swNeighbor = cell.neighbors[Direction.SouthWest];
      if (swNeighbor !== null && swNeighbor.pieceStack !== null) {
        result += '/';
      } else {
        result += ' ';
      }

      result += ' ';

      const seNeighbor = cell.neighbors[Direction.SouthEast];
      if (seNeighbor !== null && seNeighbor.pieceStack !== null) {
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
    if (cell.pieceStack === null) {
      result += '      ';
    } else {
      if (cell.neighbors === null) {
        throw new Error('Cell neighbors are absent');
      }
      const nwNeighbor = cell.neighbors[Direction.NorthWest];
      if (nwNeighbor !== null && nwNeighbor.pieceStack !== null) {
        result += '\\';
      } else {
        result += ' ';
      }

      result += ' ';

      const neNeighbor = cell.neighbors[Direction.NorthEast];
      if (neNeighbor !== null && neNeighbor.pieceStack !== null) {
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
