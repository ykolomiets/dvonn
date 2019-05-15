import { Game, GameStage } from '../core/dvonn';
import { writeFileSync } from 'fs';

const data: number[][] = [];

for (let i = 0; i < 100000; i++) {
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
      for (let pos in allMoves) {
        sum += allMoves[pos].length;
      }
      availableMoves[step] = sum;
    }
    game.randomMove();
    step++;
  }
  data.push(availableMoves);
}

writeFileSync('./availableMoves.json', JSON.stringify(data));
