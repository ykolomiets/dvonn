export enum PieceColor {
  Red = 'r',
  White = 'w',
  Black = 'b',
}

export enum Direction {
  NorthEast = 0,
  East,
  SouthEast,
  SouthWest,
  West,
  NorthWest,
}

export interface PieceStack {
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
}

export type Neighbors = [Cell | null, Cell | null, Cell | null, Cell | null, Cell | null, Cell | null];

export interface Cell {
  index: number;
  pieceStack: PieceStack | null;
  neighbors: Neighbors;
}
