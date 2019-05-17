import { Game as DvonnLogic, PlayerColor, GameStage } from '../../common/core/dvonn';
import getBestMove from '../../common/ai/ai';

class GameWithAi {
  private socket: SocketIO.Socket;

  private playerTurn: PlayerColor;

  private aiTurn: PlayerColor;

  private logic: DvonnLogic;

  private started: boolean;

  public constructor(socket: SocketIO.Socket) {
    this.socket = socket;
    this.playerTurn = Math.random() > 0.5 ? PlayerColor.White : PlayerColor.Black;
    this.aiTurn = this.playerTurn === PlayerColor.White ? PlayerColor.Black : PlayerColor.White;
    this.logic = new DvonnLogic();
    this.logic.randomPositioning();
    this.socket.emit('state', this.logic.getSerializedState());
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
      this.next();
    } catch (e) {
      this.socket.emit('state', this.logic.getSerializedState());
    }
  }

  private next(): void {
    if (this.logic.state.stage === GameStage.MovingPieces) {
      if (this.logic.state.turn !== this.playerTurn) {
        const move = getBestMove(this.logic.state.board, this.aiTurn === PlayerColor.White, 4);
        if (move) {
          this.logic.movePiece(this.aiTurn, move[0], move[1]);
          this.socket.emit('move', move, this.logic.getSerializedState());
          if (this.logic.state.turn === this.aiTurn) {
            setTimeout(() => this.next(), 2000);
          }
        }
      }
    } else if (this.logic.state.stage === GameStage.GameOver) {
      this.socket.disconnect();
    }
  }
}

export default GameWithAi;
