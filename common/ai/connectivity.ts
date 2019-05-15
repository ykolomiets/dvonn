import { DVONN_PIECE_MASK, TOTAL_CELLS, ByteBoard } from './consts';
import { movesMap } from '../core/movesMap';

function dfs(index: number, board: ByteBoard, checked: boolean[], component: number[]): boolean {
  checked[index] = true;
  const cell = board[index];
  component.push(index);
  const neighbors = movesMap[index][0];
  let subcomponentContainsDvonnPiece = false;
  for (let i = 0; i < 6; i++) {
    const neighborIndex = neighbors[i];
    if (neighborIndex !== -1 && checked[neighborIndex] === false) {
      const res = dfs(neighborIndex, board, checked, component);
      if (res === true) {
        subcomponentContainsDvonnPiece = res;
      }
    }
  }
  const cellContainsDvonnPiece = (cell & DVONN_PIECE_MASK) !== 0;
  return cellContainsDvonnPiece || subcomponentContainsDvonnPiece;
}

export function checkConnectivity(board: ByteBoard): void {
  const checked = new Array(TOTAL_CELLS);
  for (let i = 0; i < TOTAL_CELLS; i++) {
    checked[i] = board[i] === 0;
  }
  for (let i = 0; i < TOTAL_CELLS; i++) {
    if (checked[i] === false) {
      const component: number[] = [];
      const containsDvonnPiece = dfs(i, board, checked, component);
      if (!containsDvonnPiece) {
        for (let j = 0; j < component.length; j++) {
          board[component[j]] = 0;
        }
      }
    }
  }
}
