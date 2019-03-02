import adjacencyList from './adjacencyList';
import { Color, State, Cell, getEmptyCell, MoveDirection } from './cell';
import printBoard from './boardPrinter';

function getRandom(start: number, end: number): number {
  return Math.floor(start + Math.random() * (end - start));
}

class Game {
  private readonly board = new Array<Cell>(49);

  public constructor() {
    this.setupBoard();
    this.randomInitialArrangement();
  }

  private setupBoard(): void {
    for (let i = 0; i < this.board.length; i += 1) {
      this.board[i] = getEmptyCell();
    }
    for (let i = 0; i < this.board.length; i += 1) {
      const neighborsIndexes = adjacencyList[i];
      for (let j = 0; j < neighborsIndexes.length; j += 1) {
        if (neighborsIndexes[j] !== -1) {
          this.board[i].neighbors[j as MoveDirection] = this.board[neighborsIndexes[j]];
        }
      }
    }
  }

  private randomInitialArrangement(): void {
    const emptyCells: number[] = [];
    for (let i = 0; i < 49; i += 1) {
      emptyCells.push(i);
    }
    for (let i = 0; i < 3; i += 1) {
      const rand = getRandom(0, emptyCells.length);
      const pos = emptyCells[rand];
      this.placePiece(pos, Color.Red);
      emptyCells.splice(rand, 1);
    }
    for (let i = 0; i < 23; i += 1) {
      const rand = getRandom(0, emptyCells.length);
      const pos = emptyCells[rand];
      this.placePiece(pos, Color.White);
      emptyCells.splice(rand, 1);
    }
    emptyCells.forEach(pos => {
      this.placePiece(pos, Color.Black);
    });
  }

  private placePiece(pos: number, color: Color): void {
    const cellState = this.board[pos].state;
    cellState.stackSize = 1;
    if (color === Color.Red) {
      cellState.hasDvonnPiece = true;
      cellState.state = State.Red;
    } else {
      cellState.hasDvonnPiece = false;
      cellState.state = color === Color.Black ? State.Black : State.White;
    }
  }

  public printBoard(): void {
    printBoard(this.board);
  }
}
