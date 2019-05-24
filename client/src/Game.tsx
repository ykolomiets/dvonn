import React from 'react';
import styled from '@emotion/styled';
import openSocket from 'socket.io-client';
import Board, { BoardStage } from './Board';
import {
  Game as DvonnLogic,
  GameState as DvonnGameState,
  SerializedGameState,
  PlayerColor,
  GameStage,
  Score,
} from '../../common/core/dvonn';
import { Cell } from '../../common/core/cell';

type InfoBarProps =
  | {
      stage: GameStage.PlacingPieces | GameStage.MovingPieces;
      player: PlayerColor;
      turn: PlayerColor;
    }
  | {
      stage: GameStage.GameOver;
      player: PlayerColor;
      winner: PlayerColor;
      score: Score;
    };

function InfoBar(props: InfoBarProps) {
  let message = '';
  switch (props.stage) {
    case GameStage.GameOver:
      const score = `${props.score[PlayerColor.White]} - ${props.score[PlayerColor.Black]}`;
      message = `${props.winner === PlayerColor.White ? 'White' : 'Black'} won! Final score: ${score}`;
      break;
    case GameStage.PlacingPieces:
      message = `${props.turn === PlayerColor.White ? 'White' : 'Black'} place piece`;
      break;
    case GameStage.MovingPieces:
      message = `${props.turn === PlayerColor.White ? 'White' : 'Black'} move piece`;
      break;
  }
  return (
    <div>
      <h1>You play {props.player === PlayerColor.White ? 'white' : 'black'}</h1>
      <h2>{message}</h2>
    </div>
  );
}

interface GameProps {
  realPlayer: boolean;
  url: string;
  port: number;
  className?: string;
}

type GameState = {
  isWaitingForOpponent: boolean;
  opponentLeft: boolean;
  playerColor: PlayerColor;
  coreLogicState: DvonnGameState;
  lastMove: {
    move: [number, number];
    boardBeforeMove: Cell[];
  } | null;
};

class Game extends React.Component<GameProps, GameState> {
  private dvonnLogic: DvonnLogic;
  private socket: SocketIOClient.Socket | null = null;

  public constructor(props: GameProps) {
    super(props);

    this.dvonnLogic = new DvonnLogic();
    this.state = {
      isWaitingForOpponent: true,
      opponentLeft: false,
      playerColor: PlayerColor.Black,
      coreLogicState: this.dvonnLogic.state,
      lastMove: null,
    };
  }

  public componentDidMount() {
    const url = `${this.props.url}:${this.props.port}${this.props.realPlayer ? '/real' : '/ai'}`;
    this.socket = openSocket(url, {
      transports: ['websocket'],
      forceNew: true,
    });

    this.socket.on('state', (state: SerializedGameState) => {
      this.dvonnLogic.setSerializedState(state);
      this.setState({
        coreLogicState: this.dvonnLogic.state,
      });
    });
    this.socket.on('color', (color: PlayerColor) => {
      this.setState({
        isWaitingForOpponent: false,
        playerColor: color,
        coreLogicState: this.dvonnLogic.state,
      });
    });
    this.socket.on('opponentMove', (move: [number, number], state: SerializedGameState) => {
      this.movePiece((this.state.playerColor + 1) % 2, move[0], move[1]);
      this.validateState(state);
    });
    this.socket.on('opponentLeft', () => {
      this.setState({
        opponentLeft: true,
      });
    });
  }

  public componentWillUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private validateState(state: SerializedGameState) {
    const currentState = this.dvonnLogic.getSerializedState();
    let valid = true;
    if (
      ((currentState.stage === GameStage.MovingPieces && state.stage === GameStage.MovingPieces) ||
        (currentState.stage === GameStage.PlacingPieces && state.stage === GameStage.PlacingPieces)) &&
      currentState.turn !== state.turn
    ) {
      valid = false;
    }
    if (currentState.board !== state.board) {
      valid = false;
    }
    if (valid === false) {
      this.dvonnLogic.setSerializedState(state);
      this.setState({
        coreLogicState: this.dvonnLogic.state,
        lastMove: null,
      });
    }
  }

  private onPlayerPlace = (to: number) => {
    if (this.state.isWaitingForOpponent || this.state.coreLogicState.stage !== GameStage.PlacingPieces) return;

    this.dvonnLogic.placePiece(this.state.playerColor, to);
    this.setState({
      coreLogicState: this.dvonnLogic.state,
    });
    if (this.socket) {
      this.socket.emit('place', to);
    }
  };

  private onPlayerMove = (from: number, to: number) => {
    if (
      this.state.isWaitingForOpponent ||
      this.state.coreLogicState.stage !== GameStage.MovingPieces ||
      this.state.playerColor !== this.state.coreLogicState.turn
    ) {
      return;
    }

    if (this.movePiece(this.state.playerColor, from, to)) {
      if (this.socket) {
        this.socket.emit('move', [from, to]);
      }
    }
  };

  private movePiece(color: PlayerColor, from: number, to: number): boolean {
    if (this.dvonnLogic.movePiece(color, from, to)) {
      this.setState({
        coreLogicState: this.dvonnLogic.state,
        lastMove: {
          move: [from, to],
          boardBeforeMove: this.dvonnLogic.getPreviousBoard(),
        },
      });
      return true;
    }
    return false;
  }

  public render() {
    if (this.state.isWaitingForOpponent) {
      return <h1>Waiting for opponent</h1>;
    }
    if (this.state.opponentLeft) {
      return <h1>Opponent left</h1>;
    }

    let board;
    let infoBar;
    if (this.state.coreLogicState.stage === GameStage.PlacingPieces) {
      infoBar = (
        <InfoBar
          stage={GameStage.PlacingPieces}
          turn={this.state.coreLogicState.turn}
          player={this.state.playerColor}
        />
      );
      board = (
        <Board
          size={{ width: 1353, height: 500 }}
          stage={BoardStage.PlacingPieces}
          turn={this.state.playerColor}
          board={this.state.coreLogicState.board}
          onPlace={this.onPlayerPlace}
        />
      );
    } else if (this.state.coreLogicState.stage === GameStage.MovingPieces) {
      infoBar = (
        <InfoBar stage={GameStage.MovingPieces} turn={this.state.coreLogicState.turn} player={this.state.playerColor} />
      );
      board = (
        <Board
          size={{ width: 1353, height: 500 }}
          stage={BoardStage.MovingPieces}
          turn={this.state.playerColor}
          lastMove={this.state.lastMove}
          board={this.state.coreLogicState.board}
          onMove={this.onPlayerMove}
          availableMoves={this.dvonnLogic.getAvailableMoves(this.state.playerColor)}
        />
      );
    } else if (this.state.coreLogicState.stage === GameStage.GameOver) {
      const finalScore = this.dvonnLogic.getScore();
      infoBar = (
        <InfoBar
          stage={GameStage.GameOver}
          player={this.state.playerColor}
          winner={this.state.coreLogicState.winner}
          score={finalScore}
        />
      );
      board = (
        <Board
          size={{ width: 1353, height: 500 }}
          stage={BoardStage.Waiting}
          board={this.state.coreLogicState.board}
          lastMove={this.state.lastMove}
        />
      );
    }

    return (
      <div className={this.props.className}>
        {infoBar}
        <div className="game-wrapper">{board}</div>
      </div>
    );
  }
}

export default styled(Game)`
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .game-wrapper {
    box-shadow: 0px 0px 2px 2px black;
    padding: 30px;
    display: flex;
    flex-direction: column;
  }
`;
