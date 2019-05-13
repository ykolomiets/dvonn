import React, { SFC } from 'react';
import styled from '@emotion/styled';
import { PieceColor } from '../../common/src/core/cell';

interface PieceProps {
  className?: string;
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
  size: number;
  position: { x: number; y: number };
  selected: boolean;
  faded: boolean;
  onClick: () => void;
}

class Piece extends React.Component<PieceProps> {
  public render() {
    return (
      <div className={`${this.props.className}`} onClick={this.props.onClick}>
        <p className="stack-size">{this.props.stackSize}</p>
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

  transition: all 100ms ease-in;
  box-shadow: ${(props: PieceProps) => (props.selected ? '0px 0px 10px 5px green' : 'none')};

  opacity: ${(props: PieceProps) => (props.faded ? '0.2' : '1')};

  width: ${(props: PieceProps) => props.size}px;
  height: ${(props: PieceProps) => props.size}px;

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

  .stack-size {
    color: black;
    font-size: 30px;
    font-family: sans-Arial, Helvetica, sans-serif;
    user-select: none;
  }
`;
