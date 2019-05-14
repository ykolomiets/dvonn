import React from 'react';
import ReactDOM from 'react-dom';
import {
  Game as DvonnLogic,
  GameState as DvonnLogicState,
  GameStage,
  PlayerColor,
} from '../../../common/src/core/dvonn';
import Board from './Board';

type GameState = {
  coreLogicState: DvonnLogicState;
};

class Game extends React.Component<{}, GameState> {
  private logic: DvonnLogic;

  public constructor(props: {}) {
    super(props);

    this.logic = new DvonnLogic();
    this.logic.randomPositioning();

    this.state = {
      coreLogicState: this.logic.state,
    };
  }

  private randomMove = () => {
    this.logic.randomMove();
    this.setState({
      coreLogicState: this.logic.state,
    });
  };

  private aiMove = () => {
    this.logic.aiMove();
    this.setState({
      coreLogicState: this.logic.state,
    });
  };

  private moveBack = () => {
    this.logic.moveBack();
    this.setState({
      coreLogicState: this.logic.state,
    });
  };

  private handleMove = (from: number, to: number) => {
    if (this.logic.state.stage !== GameStage.MovingPieces) return;
    this.logic.movePiece(this.logic.state.turn, from, to);
    this.setState({
      coreLogicState: this.logic.state,
    });
  };

  public render() {
    let stage: string = 'unknown';
    let availableMoves = null;
    switch (this.state.coreLogicState.stage) {
      case GameStage.PlacingPieces:
        stage = 'Placing pieces';
        break;
      case GameStage.MovingPieces:
        stage = `Moving pieces: ${this.state.coreLogicState.turn === PlayerColor.White ? 'white' : 'black'}`;
        availableMoves = this.logic.getAvailableMoves(this.state.coreLogicState.turn);
        break;
      case GameStage.GameOver:
        stage = 'GameOver';
        break;
    }
    return (
      <div>
        <h1>Stage: {stage}</h1>
        <Board
          board={this.state.coreLogicState.board}
          availableMoves={availableMoves}
          turn={this.state.coreLogicState.stage === GameStage.MovingPieces ? this.state.coreLogicState.turn : undefined}
          onMove={this.handleMove}
          size={{ width: 1353, height: 500 }}
        />
        <button onClick={this.randomMove}>Random Move</button>
        <br />
        <button onClick={this.aiMove}>AI Move</button>
        <br />
        <br />
        <br />
        <button onClick={this.moveBack}>Move back</button>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
