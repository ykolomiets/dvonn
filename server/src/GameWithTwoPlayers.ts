import { Game as DvonnLogic, PlayerColor, GameStage, GameResult } from '../../common/core/dvonn';
import db, { GameInfo } from './db';

interface Player {
  color: PlayerColor;
  socket: SocketIO.Socket;
}

class GameWithTwoPlayers {
  private logic: DvonnLogic;

  private player1: Player;

  private player2: Player;

  private started: boolean;

  private info: GameInfo;

  public constructor(socket1: SocketIO.Socket, socket2: SocketIO.Socket) {
    this.player1 = {
      color: Math.random() > 0.5 ? PlayerColor.White : PlayerColor.Black,
      socket: socket1,
    };
    this.player2 = {
      color: this.player1.color === PlayerColor.White ? PlayerColor.Black : PlayerColor.White,
      socket: socket2,
    };
    this.logic = new DvonnLogic();
    this.logic.randomPositioning();
    const state = this.logic.getSerializedState();
    this.info = {
      startPosition: state.board,
      moves: [],
      result: GameResult.Draw,
    };
    this.player1.socket.emit('state', state);
    this.player2.socket.emit('state', state);
    this.player1.socket.emit('color', this.player1.color);
    this.player2.socket.emit('color', this.player2.color);
    this.player1.socket.on('move', move => this.onMove(this.player1, this.player2, move));
    this.player2.socket.on('move', move => this.onMove(this.player2, this.player1, move));

    this.player1.socket.on('disconnect', () => {
      this.player2.socket.emit('opponentLeft');
      this.player2.socket.disconnect(true);
    });
    this.player2.socket.on('disconnect', () => {
      this.player1.socket.emit('opponentLeft');
      this.player1.socket.disconnect(true);
    });

    this.started = false;
    setTimeout(() => this.start(), 1000);
  }

  private start(): void {
    this.started = true;
    this.player1.socket.emit('start');
    this.player2.socket.emit('start');
  }

  private onMove(player: Player, opponent: Player, move: [number, number]): void {
    if (!this.started) {
      player.socket.emit('state', this.logic.getSerializedState());
      return;
    }
    try {
      this.logic.movePiece(player.color, move[0], move[1]);
    } catch (e) {
      player.socket.emit('state', this.logic.getSerializedState());
    }
    opponent.socket.emit('opponentMove', move, this.logic.getSerializedState());
    this.info.moves.push(move);
    if (this.logic.state.stage === GameStage.GameOver) {
      this.info.result = this.logic.state.result;
      this.finish();
    }
  }

  private finish(): void {
    this.player1.socket.disconnect(true);
    this.player2.socket.disconnect(true);
    db.saveGamePvP(this.info);
  }
}

export default GameWithTwoPlayers;
