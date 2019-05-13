import { Game, GameStage } from '../core/dvonn';
import { writeFileSync } from 'fs';

const winners: [number, number] = [0, 0];
const moves = [];
for (let i = 0; i < 100000; i++) {
  const game = new Game();
  game.randomPositioning();
  let movesCount = 0;
  while (game.state.stage !== GameStage.GameOver) {
    game.randomMove();
    movesCount++;
  }
  moves.push(movesCount);
  winners[game.state.winner]++;
}

writeFileSync('./movesInGame.json', JSON.stringify(moves));
