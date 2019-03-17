export enum PieceColor {
  Red = 'r',
  White = 'w',
  Black = 'b',
}

export type CellState =
  | {
      isEmpty: true;
    }
  | {
      isEmpty: false;
      stackSize: number;
      upperColor: PieceColor;
      containsDvonnPiece: boolean;
    };

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
  state: CellState;
  neighbors: Neighbors | null;
}
