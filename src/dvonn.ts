import adjacencyList from './adjacencyList';
import { Cell, PieceColor, Direction, Neighbors } from './cell';
import printBoard from './boardPrinter';
import { deserializeBoard, serializeBoard } from './serializer';
import { shuffleArray } from './utils';

export enum PlayerColor {
  White,
  Black,
}

function setNeighbores(board: Cell[]): void {
  for (let i = 0; i < 49; i += 1) {
    const neighborsIndexes = adjacencyList[i];
    const cellNeighbors: Neighbors = [null, null, null, null, null, null];
    for (let j = 0; j < neighborsIndexes.length; j += 1) {
      if (neighborsIndexes[j] !== -1) {
        cellNeighbors[j as Direction] = board[neighborsIndexes[j]];
      }
    }
    board[i].neighbors = cellNeighbors;
  }
}

enum GameStage {
  PlacingPieces,
  MovingPieces,
  GameOver,
}

type GameState =
  | {
      stage: GameStage.PlacingPieces;
      turn: PlayerColor;
      board: Cell[];
    }
  | {
      stage: GameStage.MovingPieces;
      turn: PlayerColor;
      board: Cell[];
    }
  | {
      stage: GameStage.GameOver;
      board: Cell[];
      winner: PlayerColor;
    };

type SerializedGameState =
  | {
      stage: GameStage.PlacingPieces;
      turn: PlayerColor;
      board: string;
    }
  | {
      stage: GameStage.MovingPieces;
      turn: PlayerColor;
      board: string;
    }
  | {
      stage: GameStage.GameOver;
      winner: PlayerColor;
      board: string;
    };

function serializeGameState(state: GameState): SerializedGameState {
  switch (state.stage) {
    case GameStage.PlacingPieces:
      return {
        stage: GameStage.PlacingPieces,
        turn: state.turn,
        board: serializeBoard(state.board),
      };
    case GameStage.MovingPieces:
      return {
        stage: GameStage.MovingPieces,
        turn: state.turn,
        board: serializeBoard(state.board),
      };
    case GameStage.GameOver:
      return {
        stage: GameStage.GameOver,
        winner: state.winner,
        board: serializeBoard(state.board),
      };
  }
}

function createEmptyBoard(): Cell[] {
  const board: Cell[] = [];
  for (let i = 0; i < 49; i++) {
    board.push({
      state: {
        isEmpty: true,
      },
      neighbors: [null, null, null, null, null, null],
    });
  }
  setNeighbores(board);
  return board;
}

export class Game {
  private history: SerializedGameState[] = [];
  private state: GameState;

  public constructor() {
    this.state = {
      stage: GameStage.PlacingPieces,
      turn: PlayerColor.White,
      board: createEmptyBoard(),
    };
  }

  public placePiece(player: PlayerColor, pos: number): void {
    if (this.state.stage !== GameStage.PlacingPieces) {
      throw new Error('PlacingPiece stage is over');
    }
    if (pos < 0 || pos >= 49) {
      throw new Error('Wrong position index');
    }
    if (this.state.turn !== player) {
      throw new Error('Another player turn');
    }
    if (!this.state.board[pos].state.isEmpty) {
      throw new Error('Cell already fulfilled');
    }

    this.history.push(serializeGameState(this.state));

    let alreadyPlacedCount = this.state.board.reduce((count, cell) => {
      if (!cell.state.isEmpty) {
        return count + 1;
      }
      return count;
    }, 0);

    if (alreadyPlacedCount < 3) {
      this.state.board[pos].state = {
        isEmpty: false,
        upperColor: PieceColor.Red,
        stackSize: 1,
        containsDvonnPiece: true,
      };
    } else {
      this.state.board[pos].state = {
        isEmpty: false,
        upperColor: player === PlayerColor.Black ? PieceColor.Black : PieceColor.White,
        stackSize: 1,
        containsDvonnPiece: false,
      };
    }
    alreadyPlacedCount += 1;

    if (alreadyPlacedCount < 49) {
      this.state.turn = this.state.turn === PlayerColor.Black ? PlayerColor.White : PlayerColor.Black;
    } else {
      this.state = {
        stage: GameStage.MovingPieces,
        turn: PlayerColor.White,
        board: this.state.board,
      };
    }
  }

  public randomPositioning(): void {
    const positions: number[] = [];
    for (let i = 0; i < 49; i++) {
      positions.push(i);
    }
    shuffleArray(positions);
    let turn: PlayerColor = PlayerColor.White;
    for (let i = 0; i < 49; i++) {
      this.placePiece(turn, positions[i]);
      turn = turn === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    }
  }

  public printBoard(): void {
    printBoard(this.state.board);
  }
}

const game = new Game();
game.randomPositioning();
game.printBoard();
