//       0  -  1  -  2  -  3  -  4  -  5  -  6  -  7  -  8
//      / \   / \   / \   / \   / \   / \   / \   / \   / \
//    9  - 10  -  11 -  12 -  13 -  14 -  15 -  16 -  17 -  18
//   / \   / \   / \   / \   / \   / \   / \   / \   / \   / \
// 19 -  20 -  21 -  22 -  23 -  24 -  25 -  26 -  27 -  28 -  29
//   \ /   \ /   \ /   \ /   \ /   \ /   \ /   \ /   \ /   \ /
//    30 -  31 -  32 -  33 -  34 -  35 -  36 -  37 -  38 -  39
//      \ /   \ /   \ /   \ /   \ /   \ /   \ /   \ /   \ /
//       40 -  41 -  42 -  43 -  44 -  45 -  46 -  47 -  48

interface AdjacencyList {
  [key: number]: [number, number, number, number, number, number];
}

function generateAdjacencyList(): AdjacencyList {
  const list: AdjacencyList = {};
  list[0] = [-1, 1, 10, 9, -1, -1];
  list[8] = [-1, -1, 18, 17, 7, -1];
  list[9] = [0, 10, 20, 19, -1, -1];
  list[18] = [-1, -1, 29, 28, 17, 8];
  list[19] = [9, 20, 30, -1, -1, -1];
  list[29] = [-1, -1, -1, 39, 28, 18];
  list[30] = [20, 31, 40, -1, -1, 19];
  list[39] = [29, -1, -1, 48, 38, 28];
  list[40] = [31, 41, -1, -1, -1, 30];
  list[48] = [39, -1, -1, -1, 47, 38];
  for (let i = 1; i <= 7; i += 1) {
    list[i] = [-1, i + 1, i + 10, i + 9, i - 1, -1];
  }
  for (let i = 10; i <= 17; i += 1) {
    list[i] = [i - 9, i + 1, i + 11, i + 10, i - 1, i - 10];
  }
  for (let i = 20; i <= 28; i += 1) {
    list[i] = [i - 10, i + 1, i + 11, i + 10, i - 1, i - 11];
  }
  for (let i = 31; i <= 38; i += 1) {
    list[i] = [i - 10, i + 1, i + 10, i + 9, i - 1, i - 11];
  }
  for (let i = 41; i <= 47; i += 1) {
    list[i] = [i - 9, i + 1, -1, -1, i - 1, i - 10];
  }
  return list;
}

const list: AdjacencyList = generateAdjacencyList();

export default list;
