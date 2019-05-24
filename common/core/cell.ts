export enum PieceColor {
  Red = 'r',
  White = 'w',
  Black = 'b',
}

export interface CellEmptyState {
  isEmpty: true;
}

export interface CellNotEmptyState {
  isEmpty: false;
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
}

export type CellState = CellEmptyState | CellNotEmptyState;

export enum Direction {
  NorthEast = 0,
  East,
  SouthEast,
  SouthWest,
  West,
  NorthWest,
}

export type Neighbors = [Cell | null, Cell | null, Cell | null, Cell | null, Cell | null, Cell | null];

export interface Cell {
  index: number;
  state: CellState;
  neighbors: Neighbors;
}
