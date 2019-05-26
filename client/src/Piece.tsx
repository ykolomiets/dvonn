/** @jsx jsx */
import React, { SFC } from 'react';
import { jsx, css, keyframes } from '@emotion/core';
import { PieceColor } from '../../common/core/cell';
import moveMp3 from '../assets/sounds/Move.mp3';

export enum PieceStatus {
  None,
  Selected,
  Highlighted,
  Removed,
}

interface PieceProps {
  index: number;
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
  size: number;
  position: { x: number; y: number };
  status: PieceStatus;
  moved: boolean;
  onClick?: (index: number) => void;
}

class Piece extends React.Component<PieceProps> {
  private static delayBeforeRemove = 1;
  private static moveSound = new Audio(moveMp3);

  private onClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.index);
    }
  };

  public shouldComponentUpdate(nextProps: PieceProps): boolean {
    if (
      nextProps.stackSize !== this.props.stackSize ||
      nextProps.status !== this.props.status ||
      nextProps.moved !== this.props.moved
    ) {
      return true;
    }
    return false;
  }

  public render() {
    let boxShadow = 'none';
    if (this.props.status === PieceStatus.Selected) {
      boxShadow = '0px 0px 10px 5px blue';
    } else if (this.props.status === PieceStatus.Highlighted) {
      boxShadow = '0px 0px 10px 10px green';
    }

    let borderColor = 'gray';
    if (this.props.upperColor === PieceColor.Black) {
      borderColor = 'black';
    } else if (this.props.upperColor === PieceColor.Red) {
      borderColor = 'red';
    }

    let animation = {
      move: '',
      duration: '',
      curve: '',
      delay: '',
    };
    let transition = '';
    let transform = '';
    let zIndex = 0;
    switch (this.props.status) {
      case PieceStatus.None:
      case PieceStatus.Selected:
      case PieceStatus.Highlighted:
        transform = `translate(${this.props.position.x}px, ${this.props.position.y}px)`;
        break;
      case PieceStatus.Removed:
        transform = `translate(${this.props.position.x}px, ${this.props.position.y}px)`;

        animation.move = keyframes`
          from {
            transform: translate(${this.props.position.x}px, ${this.props.position.y}px);
          }
          to {
            transform: translate(${this.props.position.x}px, -50px);
            opacity: 0;
          }
        `;
        animation.duration = '1s';
        animation.curve = 'ease';
        animation.delay = `${Piece.delayBeforeRemove}s`;
        break;
    }
    if (this.props.moved) {
      Piece.moveSound.play();
      transition = `transform 0.3s ease`;
      transform = `translate(${this.props.position.x}px, ${this.props.position.y}px)`;
      zIndex = 10;
    }

    return (
      <div
        css={css`
          position: absolute;
          animation: ${animation.move} ${animation.duration} ${animation.curve} ${animation.delay};
          animation-fill-mode: forwards;
          transition: ${transition};
          transform: ${transform};
          z-index: ${zIndex};
          box-shadow: ${boxShadow};
          width: ${this.props.size}px;
          height: ${this.props.size}px;

          display: flex;
          justify-content: center;
          align-items: center;
          box-sizing: border-box;
          border-radius: 100%;
          border-style: solid;
          border-width: 20px;
          border-color: ${borderColor};

          background-color: ${this.props.containsDvonnPiece ? 'red' : 'ghostwhite'};
        `}
        onClick={this.onClick}
      >
        <p
          css={css`
            color: black;
            font-size: 30px;
            font-family: sans-Arial, Helvetica, sans-serif;
            user-select: none;
          `}
        >
          {this.props.stackSize}
        </p>
      </div>
    );
  }
}

export default Piece;
