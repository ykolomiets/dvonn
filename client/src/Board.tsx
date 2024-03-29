/** @jsx jsx */
import React from 'react';
import { css, jsx } from '@emotion/core';
import boardImage from '../assets/images/board.svg';
import { Cell, PieceColor, PieceStack } from '../../common/core/cell';
import Piece, { PieceStatus } from './Piece';
import { AvailableMoves, PlayerColor, GameStage } from '../../common/core/dvonn';

export enum BoardStage {
  Waiting,
  PlacingPieces,
  MovingPieces,
}

interface LastMoveInfo {
  move: [number, number];
  boardBeforeMove: Cell[];
}

interface BoardWaitingProps {
  size: { width: number; height: number };
  stage: BoardStage.Waiting;
  board: Cell[];
  boardHash: Object;
  lastMove: LastMoveInfo | null;
}
interface BoardPlacingProps {
  size: { width: number; height: number };
  stage: BoardStage.PlacingPieces;
  turn: PlayerColor;
  piece: PieceColor;
  board: Cell[];
  boardHash: Object;
  onPlace: (to: number) => void;
}

interface BoardMovingProps {
  size: { width: number; height: number };
  stage: BoardStage.MovingPieces;
  turn: PlayerColor;
  board: Cell[];
  boardHash: Object;
  lastMove: LastMoveInfo | null;
  availableMoves: AvailableMoves | null;
  onMove: (from: number, to: number) => void;
}

type BoardProps = BoardWaitingProps | BoardPlacingProps | BoardMovingProps;

interface BoardState {
  selectedPieceIndex: number;
  boardHash: Object;
  animate: boolean;
}

class Board extends React.Component<BoardProps, BoardState> {
  private pieceSize: number;
  public constructor(props: BoardProps) {
    super(props);
    this.state = {
      animate: true,
      selectedPieceIndex: -1,
      boardHash: props.boardHash,
    };
    this.pieceSize = props.size.height / 5;
  }

  public static getDerivedStateFromProps(props: BoardProps, state: BoardState) {
    if (props.boardHash !== state.boardHash) {
      return {
        animate: true,
        boardHash: props.boardHash,
        selectedPieceIndex: -1,
      };
    } else {
      return {
        animate: false,
      };
    }
  }

  private selectPiece(index: number): void {
    console.log('Select piece', index);
    if (this.props.stage !== BoardStage.MovingPieces) return;

    const cell = this.props.board[index];
    if (cell.pieceStack === null) return;
    if (
      cell.pieceStack.upperColor === PieceColor.Red ||
      (cell.pieceStack.upperColor === PieceColor.Black && this.props.turn === PlayerColor.White) ||
      (cell.pieceStack.upperColor === PieceColor.White && this.props.turn === PlayerColor.Black)
    ) {
      return;
    }
    this.setState({
      selectedPieceIndex: index,
    });
  }

  private unselectPiece(): void {
    if (this.props.stage !== BoardStage.MovingPieces) return;

    this.setState({
      selectedPieceIndex: -1,
    });
  }

  private handlePieceClick = (index: number) => {
    if (this.props.stage !== BoardStage.MovingPieces) return;

    const cell = this.props.board[index];
    if (cell.pieceStack === null) return;

    if (this.state.selectedPieceIndex === -1) {
      this.selectPiece(index);
    } else {
      if (cell.index === this.state.selectedPieceIndex) {
        this.unselectPiece();
        return;
      }

      const selected = this.state.selectedPieceIndex;
      const availableMoves = this.props.availableMoves;
      if (availableMoves && availableMoves[selected] && availableMoves[selected].includes(index)) {
        console.log(`Move: ${this.state.selectedPieceIndex} -> ${index}`);
        this.props.onMove(this.state.selectedPieceIndex, index);
        this.unselectPiece();
      } else {
        this.selectPiece(index);
      }
    }
  };

  private renderWaitingPieces() {
    if (this.props.stage !== BoardStage.Waiting) return <h1>Error</h1>;

    if (this.props.lastMove !== null) {
      return this.renderLastMove();
    }

    return this.props.board.map(cell => {
      if (cell.pieceStack === null) return null;
      return (
        <Piece
          key={cell.index}
          index={cell.index}
          status={PieceStatus.None}
          moved={false}
          stackSize={cell.pieceStack.stackSize}
          upperColor={cell.pieceStack.upperColor}
          containsDvonnPiece={cell.pieceStack.containsDvonnPiece}
          size={this.pieceSize}
          position={this.getPiecePosition(cell.index)}
          onClick={() => {}}
        />
      );
    });
  }

  private renderLastMove() {
    if (this.props.stage !== BoardStage.MovingPieces && this.props.stage !== BoardStage.Waiting) {
      return <h1>Error</h1>;
    }

    const props = this.props as {
      board: Cell[];
      lastMove: LastMoveInfo | null;
    };

    if (props.lastMove === null) {
      return <h1>Error</h1>;
    }

    const pieces: JSX.Element[] = [];
    const boardAfterMove = props.board;
    const { move, boardBeforeMove } = props.lastMove;

    for (let i = 0; i < boardAfterMove.length; i++) {
      const index = i;
      const cellBeforeMove = boardBeforeMove[i];
      const cellAfterMove = boardAfterMove[i];
      if (cellBeforeMove.pieceStack === null) continue;

      if (index === move[1]) {
        pieces.push(
          <Piece
            key={move[1]}
            index={move[1]}
            status={cellAfterMove.pieceStack === null ? PieceStatus.Removed : PieceStatus.None}
            upperColor={cellBeforeMove.pieceStack.upperColor}
            stackSize={cellBeforeMove.pieceStack.stackSize}
            containsDvonnPiece={cellBeforeMove.pieceStack.containsDvonnPiece}
            size={this.pieceSize}
            moved={false}
            position={this.getPiecePosition(move[1])}
          />
        );
        continue;
      }

      if (index === move[0]) {
        const targetCell = boardAfterMove[move[1]];
        if (targetCell.pieceStack === null) {
          const targetStateBeforeMove = boardBeforeMove[move[1]].pieceStack;
          if (targetStateBeforeMove) {
            pieces.push(
              <Piece
                key={move[0]}
                index={move[1]}
                status={PieceStatus.Removed}
                moved={true}
                upperColor={cellBeforeMove.pieceStack.upperColor}
                stackSize={cellBeforeMove.pieceStack.stackSize + targetStateBeforeMove.stackSize}
                containsDvonnPiece={
                  cellBeforeMove.pieceStack.containsDvonnPiece || targetStateBeforeMove.containsDvonnPiece
                }
                size={this.pieceSize}
                position={this.getPiecePosition(move[1])}
              />
            );
          }
        } else {
          pieces.push(
            <Piece
              key={move[0]}
              index={move[1]}
              status={PieceStatus.None}
              moved={true}
              upperColor={targetCell.pieceStack.upperColor}
              stackSize={targetCell.pieceStack.stackSize}
              containsDvonnPiece={targetCell.pieceStack.containsDvonnPiece}
              size={this.pieceSize}
              position={this.getPiecePosition(move[1])}
              onClick={this.handlePieceClick}
            />
          );
        }

        continue;
      }

      if (cellAfterMove.pieceStack === null) {
        pieces.push(
          <Piece
            key={index}
            index={index}
            status={PieceStatus.Removed}
            moved={false}
            upperColor={cellBeforeMove.pieceStack.upperColor}
            stackSize={cellBeforeMove.pieceStack.stackSize}
            containsDvonnPiece={cellBeforeMove.pieceStack.containsDvonnPiece}
            size={this.pieceSize}
            position={this.getPiecePosition(index)}
          />
        );
      } else {
        pieces.push(
          <Piece
            key={index}
            index={index}
            status={PieceStatus.None}
            moved={false}
            upperColor={cellAfterMove.pieceStack.upperColor}
            stackSize={cellAfterMove.pieceStack.stackSize}
            containsDvonnPiece={cellAfterMove.pieceStack.containsDvonnPiece}
            size={this.pieceSize}
            position={this.getPiecePosition(index)}
            onClick={this.handlePieceClick}
          />
        );
      }
    }
    return pieces;
  }

  private renderMovingPieces() {
    if (this.props.stage !== BoardStage.MovingPieces) return <h1>Error</h1>;

    const props: BoardMovingProps = this.props;

    if (props.lastMove && this.state.animate) {
      return this.renderLastMove();
    }

    let availableMoves: number[] = [];
    if (props.availableMoves && props.availableMoves[this.state.selectedPieceIndex]) {
      availableMoves = props.availableMoves[this.state.selectedPieceIndex];
    }
    return props.board.map(cell => {
      if (cell.pieceStack === null) return null;

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
          index={cell.index}
          status={status}
          moved={false}
          stackSize={cell.pieceStack.stackSize}
          upperColor={cell.pieceStack.upperColor}
          containsDvonnPiece={cell.pieceStack.containsDvonnPiece}
          size={this.pieceSize}
          position={this.getPiecePosition(cell.index)}
          onClick={this.handlePieceClick}
        />
      );
    });
  }

  public render() {
    let pieces;
    if (this.props.stage === BoardStage.Waiting) {
      pieces = this.renderWaitingPieces();
    } else if (this.props.stage === BoardStage.MovingPieces) {
      pieces = this.renderMovingPieces();
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
        {pieces}
      </div>
    );
  }

  private positions: { x: number; y: number }[] = [];
  private getPiecePosition(
    index: number
  ): {
    x: number;
    y: number;
  } {
    if (this.positions[index]) {
      return this.positions[index];
    }

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
    const pos = {
      x: xOffset * this.props.size.width - this.pieceSize / 2,
      y: yOffset * this.props.size.height - this.pieceSize / 2,
    };
    this.positions[index] = pos;
    return pos;
  }
}

export default Board;
