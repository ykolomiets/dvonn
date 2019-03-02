enum Color {
  Black,
  White,
  Red,
}

enum State {
  Empty,
  Black,
  White,
  Red,
}

export interface CellState {
  state: State;
  stackSize: number;
  hasDvonnPiece: boolean;
}

function getEmptyCellState(): CellState {
  return {
    state: State.Empty,
    stackSize: 0,
    hasDvonnPiece: false,
  };
}

enum MoveDirection {
  NorthEast,
  East,
  SouthEast,
  SouthWest,
  West,
  NorthWest,
}

interface Neighbors {
  [MoveDirection.NorthEast]: Cell | null;
  [MoveDirection.East]: Cell | null;
  [MoveDirection.SouthEast]: Cell | null;
  [MoveDirection.SouthWest]: Cell | null;
  [MoveDirection.West]: Cell | null;
  [MoveDirection.NorthWest]: Cell | null;
}

export interface Cell {
  state: CellState;
  neighbors: Neighbors;
}

function getEmptyCell(): Cell {
  return {
    state: getEmptyCellState(),
    neighbors: {
      [MoveDirection.NorthEast]: null,
      [MoveDirection.East]: null,
      [MoveDirection.SouthEast]: null,
      [MoveDirection.SouthWest]: null,
      [MoveDirection.West]: null,
      [MoveDirection.NorthWest]: null,
    },
  };
}

export { Color, State, MoveDirection, getEmptyCell };
