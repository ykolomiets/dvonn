import React from 'react';
import ReactDOM from 'react-dom';
import { Game as DvonnLogic, GameState as DvonnLogicState, GameStage } from '../../common/src/dvonn';
import Board from './Board';

class Game extends React.Component<{}, DvonnLogicState> {
  private logic: DvonnLogic;

  public constructor(props: {}) {
    super(props);

    this.logic = new DvonnLogic();
    this.logic.randomPositioning();

    this.state = this.logic.state;
  }

  private randomMove = () => {
    this.logic.randomMove();
    this.setState(this.logic.state);
  };

  public render() {
    let stage: string = 'unknown';
    switch (this.state.stage) {
      case GameStage.PlacingPieces:
        stage = 'Placing pieces';
        break;
      case GameStage.MovingPieces:
        stage = 'Moving pieces';
        break;
      case GameStage.GameOver:
        stage = 'GameOver';
        break;
    }
    return (
      <div>
        <h1>Stage: {stage}</h1>
        <Board board={this.state.board} />
        <button onClick={this.randomMove}>Move</button>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
