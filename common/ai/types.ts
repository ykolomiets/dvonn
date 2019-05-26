export type ByteBoard = Uint16Array;
export type Move = [number, number];

export interface EvaluationFunction {
  (board: ByteBoard, whiteMoves: Move[], blackMoves: Move[]);
}
