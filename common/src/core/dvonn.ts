import adjacencyList from './adjacencyList';
import { Cell, PieceColor, Direction, Neighbors } from './cell';
import printBoard from './boardPrinter';
import { serializeBoard, deserializeBoard } from './serializer';
import { shuffleArray } from './utils';
import { movesMap } from './movesMap';
import { findComponents } from './findComponents';
import { getBestMove } from '../ai/ai';

export enum PlayerColor {
  White,
  Black,
}

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

export enum GameStage {
  PlacingPieces,
  MovingPieces,
  GameOver,
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
      index: i,
      state: {
        isEmpty: true,
      },
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
  for (let i = 0; i < 49; i++) {
    const cell = board[i];
    const playerPieceColor = player === PlayerColor.White ? PieceColor.White : PieceColor.Black;
    if (!cell.state.isEmpty && cell.state.upperColor === playerPieceColor && cell.state.stackSize <= 10) {
      const neighbors = movesMap[i][0];
      let surrounded = true;
      for (let direction = 0; direction < 6; direction++) {
        const index = neighbors[direction];
        if (index === -1 || board[index].state.isEmpty) {
          surrounded = false;
          break;
        }
      }
      if (surrounded) {
        continue;
      }

      const movesFromMap = movesMap[i][cell.state.stackSize - 1];
      if (movesFromMap) {
        const movesForCell: number[] = [];
        for (let direction = 0; direction < 6; direction++) {
          const cellIndex = movesFromMap[direction];
          if (cellIndex !== -1) {
            const targetCell = board[cellIndex];
            if (!targetCell.state.isEmpty) {
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
  return movesExists ? moves : null;
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

  public getAvailableMoves(player: PlayerColor): AvailableMoves | null {
    if (this.state.stage !== GameStage.MovingPieces) {
      throw new Error('Not moving pieces stage');
    }
    return getAvailableMoves(this.state.board, player);
  }

  public movePiece(player: PlayerColor, startPos: number, targetPos: number): void {
    if (this.state.stage !== GameStage.MovingPieces) {
      throw new Error('Not moving pieces stage');
    }
    if (this.state.turn !== player) {
      throw new Error('Another player turn');
    }
    if (startPos < 0 || startPos >= 49 || (targetPos < 0 || targetPos >= 49)) {
      throw new Error('Positions is not in range [0, 48]');
    }

    const availableMoves = getAvailableMoves(this.state.board, player);
    if (!availableMoves || !availableMoves[startPos] || !availableMoves[startPos].includes(targetPos)) {
      throw new Error('Invalid move');
    }
    this.history.push(serializeGameState(this.state));

    const startCell = this.state.board[startPos];
    const targetCell = this.state.board[targetPos];
    if (!startCell.state.isEmpty && !targetCell.state.isEmpty) {
      targetCell.state.stackSize += startCell.state.stackSize;
      targetCell.state.upperColor = player === PlayerColor.White ? PieceColor.White : PieceColor.Black;
      if (!targetCell.state.containsDvonnPiece) {
        targetCell.state.containsDvonnPiece = startCell.state.containsDvonnPiece;
      }
      startCell.state = { isEmpty: true };
    }
    this.checkConnectivity();

    const opponent: PlayerColor = player === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    if (getAvailableMoves(this.state.board, opponent)) {
      this.state.turn = opponent;
      return;
    }
    if (!getAvailableMoves(this.state.board, player)) {
      this.gameOver();
    }
  }

  private checkConnectivity(): void {
    const components = findComponents(this.state.board);
    components.forEach(component => {
      let containsDvonnPiece = false;
      for (let i = 0; i < component.length; i++) {
        const cell = component[i];
        if (!cell.state.isEmpty && cell.state.containsDvonnPiece) {
          containsDvonnPiece = true;
          break;
        }
      }
      if (!containsDvonnPiece) {
        component.forEach(cell => {
          cell.state = { isEmpty: true };
        });
      }
    });
  }

  private gameOver(): void {
    const score = {
      [PlayerColor.White]: 0,
      [PlayerColor.Black]: 0,
    };
    for (let i = 0; i < 49; i++) {
      const cell = this.state.board[i];
      if (!cell.state.isEmpty) {
        if (cell.state.upperColor === PieceColor.White) {
          score[PlayerColor.White] += cell.state.stackSize;
        } else if (cell.state.upperColor === PieceColor.Black) {
          score[PlayerColor.Black] += cell.state.stackSize;
        }
      }
    }
    const winner = score[PlayerColor.White] > score[PlayerColor.Black] ? PlayerColor.White : PlayerColor.Black;
    this.state = {
      stage: GameStage.GameOver,
      winner,
      board: this.state.board,
    };
  }

  public printBoard(): void {
    printBoard(this.state.board);
  }

  public randomMove(): void {
    if (this.state.stage === GameStage.MovingPieces) {
      const turn = this.state.turn;
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

  public aiMove(): void {
    if (this.state.stage === GameStage.MovingPieces) {
      const turn = this.state.turn;
      const move = getBestMove(this.state.board, turn === PlayerColor.White);
      if (move) {
        this.movePiece(turn, move[0], move[1]);
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
      }
    }
  }
}
