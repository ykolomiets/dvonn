/** @jsx jsx */
import React from 'react';
import { css, jsx } from '@emotion/core';
import boardImage from '../assets/images/board.svg';
import { Cell } from '../../common/src/cell';
import Piece from './Piece';

interface BoardProps {
  board: Cell[];
  size: { width: number; height: number };
}

interface BoardState {
  selectedPieceIndex: number;
}

class Board extends React.Component<BoardProps, BoardState> {
  private pieceSize: number;
  public constructor(props: BoardProps) {
    super(props);
    this.state = {
      selectedPieceIndex: -1,
    };
    this.pieceSize = props.size.height / 5;
  }

  private handlePieceClick(index: number): void {
    console.log('Piece clicked: ', index);
    const piece = this.props.board[index];
    this.setState({
      selectedPieceIndex: index,
    });
  }

  public render() {
    return (
      <div
        css={css`
          position: relative;
          width: ${this.props.size.width}px;
          height: ${this.props.size.height}px;
          background-image: url(${boardImage});
          background-size: contain;
        `}
      >
        {this.props.board.map(cell => {
          if (cell.state.isEmpty) return null;
          return (
            <Piece
              key={cell.index}
              selected={this.state.selectedPieceIndex === cell.index}
              stackSize={cell.state.stackSize}
              upperColor={cell.state.upperColor}
              containsDvonnPiece={cell.state.containsDvonnPiece}
              size={this.pieceSize}
              position={this.getPiecePosition(cell.index)}
              onClick={() => {
                this.handlePieceClick(cell.index);
              }}
            />
          );
        })}
      </div>
    );
  }

  private getPiecePosition(
    index: number
  ): {
    x: number;
    y: number;
  } {
    const xOffsets = [0.117, 0.07, 0.021, 0.07, 0.117];
    const yOffsets = [0.055, 0.278, 0.5, 0.722, 0.945];
    let xOffset;
    let yOffset;
    if (index <= 8) {
      yOffset = yOffsets[0];
      xOffset = xOffsets[0] + index * 0.096;
    } else if (index <= 18) {
      yOffset = yOffsets[1];
      xOffset = xOffsets[1] + (index - 9) * 0.096;
    } else if (index <= 29) {
      yOffset = yOffsets[2];
      xOffset = xOffsets[2] + (index - 19) * 0.096;
    } else if (index <= 39) {
      yOffset = yOffsets[3];
      xOffset = xOffsets[3] + (index - 30) * 0.096;
    } else {
      yOffset = yOffsets[4];
      xOffset = xOffsets[4] + (index - 40) * 0.096;
    }
    return {
      x: xOffset * this.props.size.width - this.pieceSize / 2,
      y: yOffset * this.props.size.height - this.pieceSize / 2,
    };
  }
}

export default Board;
