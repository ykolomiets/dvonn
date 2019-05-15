import { Cell } from './cell';

function dfs(index: number, board: Cell[], checked: boolean[], component: Cell[]): void {
  checked[index] = true;
  const cell = board[index];
  component.push(cell);
  for (let i = 0; i < 6; i++) {
    const neighbor = cell.neighbors[i];
    if (neighbor && !checked[neighbor.index]) {
      dfs(neighbor.index, board, checked, component);
    }
  }
}

export function findComponents(board: Cell[]): Cell[][] {
  const result: Cell[][] = [];
  const checkedCells = board.map(c => c.state.isEmpty);
  for (let i = 0; i < 49; i++) {
    if (!checkedCells[i]) {
      const component: Cell[] = [];
      dfs(i, board, checkedCells, component);
      result.push(component);
    }
  }
  return result;
}
