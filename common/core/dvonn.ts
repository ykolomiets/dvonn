import adjacencyList from './adjacencyList';
import { Cell, PieceColor, Direction, Neighbors } from './cell';
import printBoard from './boardPrinter';
import { serializeBoard, deserializeBoard } from './serializer';
import { shuffleArray } from './utils';
import { movesMap } from './movesMap';
import findComponents from './findComponents';

export enum PlayerColor {
  White,
  Black,
}

export enum GameStage {
  PlacingPieces,
  MovingPieces,
  GameOver,
}

export enum GameResult {
  WhiteWin,
  BlackWin,
  Draw,
}

export type GameState =
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
      result: GameResult;
    };

export type SerializedGameState =
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
      winner: GameResult;
      board: string;
    };

export function setNeighbores(board: Cell[]): void {
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
        winner: state.result,
        board: serializeBoard(state.board),
      };
    default:
      throw Error();
  }
}

function deserializeGameState(state: SerializedGameState): GameState {
  switch (state.stage) {
    case GameStage.PlacingPieces:
      return {
        stage: GameStage.PlacingPieces,
        turn: state.turn,
        board: deserializeBoard(state.board),
      };
    case GameStage.MovingPieces:
      return {
        stage: GameStage.MovingPieces,
        turn: state.turn,
        board: deserializeBoard(state.board),
      };
    case GameStage.GameOver:
      return {
        stage: GameStage.GameOver,
        result: state.winner,
        board: deserializeBoard(state.board),
      };
    default:
      throw Error();
  }
}

function createEmptyBoard(): Cell[] {
  const board: Cell[] = [];
  for (let i = 0; i < 49; i += 1) {
    board.push({
      index: i,
      pieceStack: null,
      neighbors: [null, null, null, null, null, null],
    });
  }
  setNeighbores(board);
  return board;
}

export interface AvailableMoves {
  [pos: number]: number[];
}

function getAvailableMoves(board: Cell[], player: PlayerColor): AvailableMoves | null {
  let movesExists = false;
  const moves: AvailableMoves = {};
  for (let i = 0; i < 49; i += 1) {
    const cell = board[i];
    const playerPieceColor = player === PlayerColor.White ? PieceColor.White : PieceColor.Black;
    if (cell.pieceStack && cell.pieceStack.upperColor === playerPieceColor && cell.pieceStack.stackSize <= 10) {
      const neighbors = movesMap[i][0];
      let surrounded = true;
      for (let direction = 0; direction < 6; direction += 1) {
        const index = neighbors[direction];
        if (index === -1 || board[index].pieceStack === null) {
          surrounded = false;
          break;
        }
      }
      if (!surrounded) {
        const movesFromMap = movesMap[i][cell.pieceStack.stackSize - 1];
        if (movesFromMap) {
          const movesForCell: number[] = [];
          for (let direction = 0; direction < 6; direction += 1) {
            const cellIndex = movesFromMap[direction];
            if (cellIndex !== -1) {
              const targetCell = board[cellIndex];
              if (targetCell.pieceStack !== null) {
                movesForCell.push(cellIndex);
              }
            }
          }
          if (movesForCell.length > 0) {
            movesExists = true;
            moves[i] = movesForCell;
          }
        }
      }
    }
  }
  return movesExists ? moves : null;
}

export interface Score {
  [PlayerColor.Black]: number;
  [PlayerColor.White]: number;
}

export class Game {
  private history: SerializedGameState[] = [];

  public state: GameState; // TODO: make private and expose only getters;

  public constructor() {
    this.state = {
      stage: GameStage.PlacingPieces,
      turn: PlayerColor.White,
      board: createEmptyBoard(),
    };
  }

  public setSerializedState(state: SerializedGameState): void {
    this.state = deserializeGameState(state);
  }

  public getSerializedState(): SerializedGameState {
    return serializeGameState(this.state);
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
    if (this.state.board[pos].pieceStack) {
      throw new Error('Cell already fulfilled');
    }

    this.history.push(serializeGameState(this.state));

    let alreadyPlacedCount = this.state.board.reduce((count, cell) => {
      if (cell.pieceStack) {
        return count + 1;
      }
      return count;
    }, 0);

    if (alreadyPlacedCount < 3) {
      this.state.board[pos].pieceStack = {
        upperColor: PieceColor.Red,
        stackSize: 1,
        containsDvonnPiece: true,
      };
    } else {
      this.state.board[pos].pieceStack = {
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
    for (let i = 0; i < 49; i += 1) {
      positions.push(i);
    }
    shuffleArray(positions);
    let turn: PlayerColor = PlayerColor.White;
    for (let i = 0; i < 49; i += 1) {
      this.placePiece(turn, positions[i]);
      turn = turn === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    }
  }

  public getAvailableMoves(player: PlayerColor): AvailableMoves | null {
    if (this.state.stage !== GameStage.MovingPieces) {
      throw new Error('Not moving pieces stage');
    }
    return getAvailableMoves(this.state.board, player);
  }

  public movePiece(player: PlayerColor, startPos: number, targetPos: number): boolean {
    if (this.state.stage !== GameStage.MovingPieces) {
      console.log('Not moving pieces stage');
      return false;
    }
    if (this.state.turn !== player) {
      console.log('Another player turn');
      return false;
    }
    if (startPos < 0 || startPos >= 49 || (targetPos < 0 || targetPos >= 49)) {
      console.log('Positions is not in range [0, 48]');
      return false;
    }

    const availableMoves = getAvailableMoves(this.state.board, player);
    if (!availableMoves || !availableMoves[startPos] || !availableMoves[startPos].includes(targetPos)) {
      console.log('Invalid move');
      return false;
    }
    this.history.push(serializeGameState(this.state));

    const startCell = this.state.board[startPos];
    const targetCell = this.state.board[targetPos];
    if (startCell.pieceStack && targetCell.pieceStack) {
      targetCell.pieceStack.stackSize += startCell.pieceStack.stackSize;
      targetCell.pieceStack.upperColor = player === PlayerColor.White ? PieceColor.White : PieceColor.Black;
      if (!targetCell.pieceStack.containsDvonnPiece) {
        targetCell.pieceStack.containsDvonnPiece = startCell.pieceStack.containsDvonnPiece;
      }
      startCell.pieceStack = null;
    }
    this.checkConnectivity();

    const opponent: PlayerColor = player === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    if (getAvailableMoves(this.state.board, opponent)) {
      this.state.turn = opponent;
    } else if (!getAvailableMoves(this.state.board, player)) {
      this.gameOver();
    }
    this.printBoard();
    return true;
  }

  public getPreviousBoard(): Cell[] {
    if (this.history.length === 0) {
      throw new Error();
    }
    return deserializeBoard(this.history[this.history.length - 1].board);
  }

  private checkConnectivity(): void {
    const components = findComponents(this.state.board);
    components.forEach(component => {
      let containsDvonnPiece = false;
      for (let i = 0; i < component.length; i += 1) {
        const cell = component[i];
        if (cell.pieceStack && cell.pieceStack.containsDvonnPiece) {
          containsDvonnPiece = true;
          break;
        }
      }
      if (!containsDvonnPiece) {
        component.forEach(cell => {
          cell.pieceStack = null;
        });
      }
    });
  }

  private gameOver(): void {
    const score = this.getScore();
    let winner = GameResult.Draw;
    if (score[PlayerColor.White] > score[PlayerColor.Black]) {
      winner = GameResult.WhiteWin;
    } else if (score[PlayerColor.White] < score[PlayerColor.Black]) {
      winner = GameResult.BlackWin;
    }
    this.state = {
      stage: GameStage.GameOver,
      result: winner,
      board: this.state.board,
    };
  }

  public printBoard(): void {
    printBoard(this.state.board);
  }

  public randomMove(): void {
    if (this.state.stage === GameStage.MovingPieces) {
      const { turn } = this.state;
      const availableMoves = this.getAvailableMoves(turn);
      if (availableMoves) {
        const startPositions = Object.keys(availableMoves);
        const startPos = (startPositions[Math.floor(Math.random() * startPositions.length)] as unknown) as number;
        const targetPositions = availableMoves[startPos];
        const targetPos = targetPositions[Math.floor(Math.random() * targetPositions.length)];
        this.movePiece(turn, startPos, targetPos);
      }
    }
  }

  public moveBack(): void {
    const previousState = this.history.pop();
    if (previousState) {
      switch (previousState.stage) {
        case GameStage.MovingPieces:
          this.state = {
            stage: previousState.stage,
            turn: previousState.turn,
            board: deserializeBoard(previousState.board),
          };
          setNeighbores(this.state.board);
          break;
        default:
          throw Error();
      }
    }
  }

  public getScore(): Score {
    const score = {
      [PlayerColor.White]: 0,
      [PlayerColor.Black]: 0,
    };
    for (let i = 0; i < 49; i += 1) {
      const cell = this.state.board[i];
      if (cell.pieceStack) {
        if (cell.pieceStack.upperColor === PieceColor.White) {
          score[PlayerColor.White] += cell.pieceStack.stackSize;
        } else if (cell.pieceStack.upperColor === PieceColor.Black) {
          score[PlayerColor.Black] += cell.pieceStack.stackSize;
        }
      }
    }
    return score;
  }
}
