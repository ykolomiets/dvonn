import { Game, PlayerColor } from '../dvonn';

describe('Placing pieces', () => {
  it('Wrong position should throw exception', () => {
    const game = new Game();
    expect(() => game.placePiece(PlayerColor.White, -1)).toThrow();
    expect(() => game.placePiece(PlayerColor.White, 49)).toThrow();
    expect(() => game.placePiece(PlayerColor.White, 20)).not.toThrow();
  });

  it('Checking player turn', () => {
    const game = new Game();
    expect(() => game.placePiece(PlayerColor.Black, 0)).toThrow();
    expect(() => game.placePiece(PlayerColor.White, 0)).not.toThrow();
    expect(() => game.placePiece(PlayerColor.White, 1)).toThrow();
    expect(() => game.placePiece(PlayerColor.Black, 1)).not.toThrow();
  });

  it('Checking cell on emptiest', () => {
    const game = new Game();
    expect(() => game.placePiece(PlayerColor.White, 0)).not.toThrow();
    expect(() => game.placePiece(PlayerColor.Black, 0)).toThrow();
  });
});
