/** @jsx jsx */
import React from 'react';
import { css, jsx } from '@emotion/core';
import boardImage from '../assets/images/board.svg';
import { Cell, PieceColor } from '../../common/core/cell';
import Piece, { PieceStatus } from './Piece';
import { AvailableMoves, PlayerColor } from '../../common/core/dvonn';

interface BoardProps {
  turn: PlayerColor | undefined;
  board: Cell[];
  availableMoves: AvailableMoves | null;
  size: { width: number; height: number };
  onMove: (from: number, to: number) => void;
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

  private selectPiece(index: number): void {
    const piece = this.props.board[index];
    if (piece.state.isEmpty) return;
    if (
      piece.state.upperColor === PieceColor.Red ||
      (piece.state.upperColor === PieceColor.Black && this.props.turn === PlayerColor.White) ||
      (piece.state.upperColor === PieceColor.White && this.props.turn === PlayerColor.Black)
    ) {
      return;
    }
    this.setState({
      selectedPieceIndex: index,
    });
  }

  private unselectPiece(): void {
    this.setState({
      selectedPieceIndex: -1,
    });
  }

  private handlePieceClick(index: number): void {
    const piece = this.props.board[index];
    if (piece.state.isEmpty) return;
    if (this.state.selectedPieceIndex === -1) {
      this.selectPiece(index);
    } else {
      if (piece.index === this.state.selectedPieceIndex) {
        this.unselectPiece();
        return;
      }

      const selected = this.state.selectedPieceIndex;
      const availableMoves = this.props.availableMoves;
      if (availableMoves && availableMoves[selected] && availableMoves[selected].includes(index)) {
        console.log(`Move: ${this.state.selectedPieceIndex} -> ${index}`);
        this.props.onMove(this.state.selectedPieceIndex, index);
      }
      this.setState({ selectedPieceIndex: -1 });
    }
  }

  public render() {
    let availableMoves: number[] = [];

    if (this.props.availableMoves && this.props.availableMoves[this.state.selectedPieceIndex]) {
      //TODO:  remove this shit
      availableMoves = this.props.availableMoves[this.state.selectedPieceIndex];
    }

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
          let status: PieceStatus = PieceStatus.None;
          if (this.state.selectedPieceIndex === cell.index) {
            status = PieceStatus.Selected;
          } else if (
            this.state.selectedPieceIndex !== -1 &&
            this.state.selectedPieceIndex !== cell.index &&
            availableMoves.includes(cell.index)
          ) {
            status = PieceStatus.Highlighted;
          }

          return (
            <Piece
              key={cell.index}
              status={status}
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
