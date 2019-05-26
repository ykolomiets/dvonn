import { Game as DvonnLogic, PlayerColor, GameStage, GameResult } from '../../common/core/dvonn';
import getBestMove from '../../common/ai/ai';
import db, { GameInfo } from './db';

class GameWithAi {
  private socket: SocketIO.Socket;

  private playerTurn: PlayerColor;

  private aiTurn: PlayerColor;

  private logic: DvonnLogic;

  private started: boolean;

  private info: GameInfo;

  public constructor(socket: SocketIO.Socket) {
    this.socket = socket;
    this.playerTurn = Math.random() > 0.5 ? PlayerColor.White : PlayerColor.Black;
    this.aiTurn = this.playerTurn === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    this.logic = new DvonnLogic();
    this.logic.randomPositioning();

    const serializedState = this.logic.getSerializedState();

    this.info = {
      startPosition: serializedState.board,
      moves: [],
      result: GameResult.Draw,
    };

    this.socket.emit('state', serializedState);
    this.socket.emit('color', this.playerTurn);
    this.socket.on('move', move => this.onMove(move));
    this.started = false;
    setTimeout(() => this.start(), 1000);
  }

  private start(): void {
    this.started = true;
    this.socket.emit('start');
    this.next();
  }

  private onMove(move: [number, number]): void {
    if (!this.started) {
      this.socket.emit('state', this.logic.getSerializedState());
      return;
    }
    try {
      this.logic.movePiece(this.playerTurn, move[0], move[1]);
      this.info.moves.push(move);

      this.next();
    } catch (e) {
      this.socket.emit('state', this.logic.getSerializedState());
    }
  }

  private next(): void {
    if (this.logic.state.stage === GameStage.MovingPieces) {
      if (this.logic.state.turn === this.aiTurn) {
        let time = Date.now();
        const move = getBestMove(this.logic.state.board, this.aiTurn === PlayerColor.White, 3500);
        time = Date.now() - time;
        if (move) {
          this.logic.movePiece(this.aiTurn, move[0], move[1]);
          this.info.moves.push(move);
          if (time < 1500) {
            setTimeout(() => {
              this.socket.emit('opponentMove', move, this.logic.getSerializedState());
              this.next();
            }, 1500 - time);
          } else {
            this.socket.emit('opponentMove', move, this.logic.getSerializedState());
            this.next();
          }
        }
      }
    } else if (this.logic.state.stage === GameStage.GameOver) {
      this.info.result = this.logic.state.result;
      this.finish();
    }
  }

  private finish(): void {
    this.socket.disconnect();
    db.saveGameWithAi(this.info, this.aiTurn);
  }
}

export default GameWithAi;
