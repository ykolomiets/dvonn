import React from 'react';
import ReactDOM from 'react-dom';
import { Game as DvonnLogic, GameState as DvonnLogicState, GameStage, PlayerColor } from '../../common/src/dvonn';
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

  private handleMove = (from: number, to: number) => {
    if (this.state.stage !== GameStage.MovingPieces) return;
    this.logic.movePiece(this.state.turn, from, to);
    this.setState(this.logic.state);
  };

  public render() {
    let stage: string = 'unknown';
    let availableMoves = null;
    switch (this.state.stage) {
      case GameStage.PlacingPieces:
        stage = 'Placing pieces';
        break;
      case GameStage.MovingPieces:
        stage = `Moving pieces: ${this.state.turn === PlayerColor.White ? 'white' : 'black'}`;
        availableMoves = this.logic.getAvailableMoves(this.state.turn);
        break;
      case GameStage.GameOver:
        stage = 'GameOver';
        break;
    }
    return (
      <div>
        <h1>Stage: {stage}</h1>
        <Board
          board={this.state.board}
          availableMoves={availableMoves}
          turn={this.state.stage === GameStage.MovingPieces ? this.state.turn : undefined}
          onMove={this.handleMove}
          size={{ width: 1353, height: 500 }}
        />
        <button onClick={this.randomMove}>Move</button>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById('root'));
