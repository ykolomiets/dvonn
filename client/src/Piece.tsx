import React, { SFC } from 'react';
import styled from '@emotion/styled';
import { PieceColor } from '../../common/src/cell';

interface PieceProps {
  className?: string;
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
  size: number;
  position: { x: number; y: number };
  selected: boolean;
  onClick: () => void;
}

class Piece extends React.Component<PieceProps> {
  public render() {
    return (
      <div className={`${this.props.className}`} onClick={this.props.onClick}>
        <div className="inner-circle">
          <p className="stack-size">{this.props.stackSize}</p>
        </div>
      </div>
    );
  }
}

export default styled(Piece)`
  position: absolute;
  transform: ${(props: PieceProps) => {
    const pos = props.position;
    return `translate(${pos.x}px, ${pos.y}px)`;
  }};

  transition: background-color 100ms linear;

  box-sizing: border-box;
  padding: 5px;
  background-color: ${(props: PieceProps) => (props.selected ? 'green' : 'transparent')};
  border-radius: 100%;

  width: ${(props: PieceProps) => props.size}px;
  height: ${(props: PieceProps) => props.size}px;

  .inner-circle {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    border-radius: 100%;
    border-style: solid;
    border-width: 20px;
    border-color: ${(props: PieceProps) => {
      switch (props.upperColor) {
        case PieceColor.White:
          return 'gray';
        case PieceColor.Black:
          return 'black';
        case PieceColor.Red:
          return 'red';
      }
    }};
    background-color: ${(props: PieceProps) => (props.containsDvonnPiece ? 'red' : 'ghostwhite')};
  }

  .stack-size {
    color: black;
    font-size: 30px;
    font-family: sans-Arial, Helvetica, sans-serif;
    user-select: none;
  }
`;
