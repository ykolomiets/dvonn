import React from 'react';
import {
  Game as DvonnLogic,
  GameState as DvonnGameState,
  SerializedGameState,
  PlayerColor,
  GameStage,
} from '../../common/core/dvonn';
import styled from '@emotion/styled';
import openSocket from 'socket.io-client';
import Board, { BoardStage } from './Board';

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
    };

function InfoBar(props: InfoBarProps) {
  let message = '';
  switch (props.stage) {
    case GameStage.GameOver:
      message = `${props.winner === PlayerColor.White ? 'White' : 'Black'} won!`;
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
  className?: string;
}

type GameState = {
  isWaitingForOpponent: boolean;
  opponentLeft: boolean;
  playerColor: PlayerColor;
  coreLogicState: DvonnGameState;
};

class Game extends React.Component<GameProps, GameState> {
  private dvonnLogic: DvonnLogic;
  private socket: SocketIOClient.Socket | null = null;

  public constructor(props: GameProps) {
    super(props);

    this.dvonnLogic = new DvonnLogic();
    this.state = {
      isWaitingForOpponent: true,
      playerColor: PlayerColor.Black,
      coreLogicState: this.dvonnLogic.state,
      opponentLeft: false,
    };
  }

  public componentDidMount() {
    const url = this.props.realPlayer ? 'http://localhost:3000/real' : 'http://localhost:3000/ai';
    this.socket = openSocket(url, {
      transports: ['websocket'],
      forceNew: true,
    });

    this.socket.on('state', (state: SerializedGameState) => {
      console.log('From server: ', state);
      this.dvonnLogic.setSerializedState(state);
      this.setState({
        coreLogicState: this.dvonnLogic.state,
      });
    });
    this.socket.on('color', (color: PlayerColor) => {
      console.log('From server: ', color);
      this.setState({
        isWaitingForOpponent: false,
        playerColor: color,
        coreLogicState: this.dvonnLogic.state,
      });
    });
    this.socket.on('move', (move: [number, number], state: SerializedGameState) => {
      this.dvonnLogic.setSerializedState(state);
      this.setState({
        coreLogicState: this.dvonnLogic.state,
      });
    });
    this.socket.on('opponentLeft', () => {
      this.setState({
        opponentLeft: true,
      });
    });
  }

  public componentWillUnmount() {
    console.log('ComponentWillUnmount');
    if (this.socket) {
      console.log('Disconnect');
      this.socket.disconnect();
    }
  }

  private onPlace = (to: number) => {
    if (this.state.isWaitingForOpponent || this.state.coreLogicState.stage !== GameStage.PlacingPieces) return;

    this.dvonnLogic.placePiece(this.state.playerColor, to);
    this.setState({
      coreLogicState: this.dvonnLogic.state,
    });
    if (this.socket) {
      this.socket.emit('place', to);
    }
  };

  private onMove = (from: number, to: number) => {
    if (
      this.state.isWaitingForOpponent ||
      this.state.coreLogicState.stage !== GameStage.MovingPieces ||
      this.state.playerColor !== this.state.coreLogicState.turn
    ) {
      return;
    }

    this.dvonnLogic.movePiece(this.state.playerColor, from, to);
    this.setState({
      coreLogicState: this.dvonnLogic.state,
    });
    if (this.socket) {
      this.socket.emit('move', [from, to]);
    }
  };

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
          stage={BoardStage.PlacingPieces}
          turn={this.state.playerColor}
          size={{ width: 1353, height: 500 }}
          board={this.state.coreLogicState.board}
          onPlace={this.onPlace}
        />
      );
    } else if (this.state.coreLogicState.stage === GameStage.MovingPieces) {
      infoBar = (
        <InfoBar stage={GameStage.MovingPieces} turn={this.state.coreLogicState.turn} player={this.state.playerColor} />
      );
      board = (
        <Board
          stage={BoardStage.MovingPieces}
          turn={this.state.playerColor}
          size={{ width: 1353, height: 500 }}
          board={this.state.coreLogicState.board}
          onMove={this.onMove}
          availableMoves={this.dvonnLogic.getAvailableMoves(this.state.playerColor)}
        />
      );
    } else if (this.state.coreLogicState.stage === GameStage.GameOver) {
      infoBar = (
        <InfoBar stage={GameStage.GameOver} winner={this.state.coreLogicState.winner} player={this.state.playerColor} />
      );
      board = (
        <Board stage={BoardStage.Waiting} size={{ width: 1353, height: 500 }} board={this.state.coreLogicState.board} />
      );
    }

    return (
      <div className={this.props.className}>
        <div className="game-wrapper">
          {infoBar}
          {board}
        </div>
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
    display: flex;
    flex-direction: column;
  }
`;
