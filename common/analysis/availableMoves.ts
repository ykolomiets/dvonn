/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import { writeFileSync } from 'fs';
import { Game, GameStage } from '../core/dvonn';

const data: number[][] = [];

for (let i = 0; i < 100000; i += 1) {
  let step = 0;
  const availableMoves: number[] = [];
  const game = new Game();
  game.randomPositioning();
  while (game.state.stage !== GameStage.GameOver) {
    const allMoves = game.getAvailableMoves(game.state.turn);
    if (allMoves === null) {
      availableMoves[step] = 0;
    } else {
      let sum = 0;
      for (const pos in allMoves) {
        sum += allMoves[pos].length;
      }
      availableMoves[step] = sum;
    }
    game.randomMove();
    step += 1;
  }
  data.push(availableMoves);
}

writeFileSync('./availableMoves.json', JSON.stringify(data));
