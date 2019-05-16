import { writeFileSync } from 'fs';
import { Game, GameStage } from '../core/dvonn';

const winners: [number, number] = [0, 0];
const moves = [];
for (let i = 0; i < 100000; i += 1) {
  const game = new Game();
  game.randomPositioning();
  let movesCount = 0;
  while (game.state.stage !== GameStage.GameOver) {
    game.randomMove();
    movesCount += 1;
  }
  moves.push(movesCount);
  winners[game.state.winner] += 1;
}

writeFileSync('./movesInGame.json', JSON.stringify(moves));
