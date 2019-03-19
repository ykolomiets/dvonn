import React, { SFC } from 'react';
import styled from '@emotion/styled';
import { PieceColor } from '../../common/src/cell';
import { posix } from 'path';

interface PieceProps {
  className?: string;
  index: number;
  stackSize: number;
  upperColor: PieceColor;
  containsDvonnPiece: boolean;
}

const Piece: SFC<PieceProps> = ({ stackSize, className }) => (
  <div className={className}>
    <p>{stackSize}</p>
  </div>
);

function getPiecePosition(
  index: number
): {
  x: number;
  y: number;
} {
  const xOffsets = [0.117, 0.07, 0.021, 0.07, 0.117];
  const yOffsets = [0.055, 0.278, 0.5, 0.722, 0.945];
  if (index <= 8) {
    return { y: yOffsets[0], x: xOffsets[0] + index * 0.096 };
  } else if (index <= 18) {
    return { y: yOffsets[1], x: xOffsets[1] + (index - 9) * 0.096 };
  } else if (index <= 29) {
    return { y: yOffsets[2], x: xOffsets[2] + (index - 19) * 0.096 };
  } else if (index <= 39) {
    return { y: yOffsets[3], x: xOffsets[3] + (index - 30) * 0.096 };
  } else {
    return { y: yOffsets[4], x: xOffsets[4] + (index - 40) * 0.096 };
  }
}

export default styled(Piece)`
  transition: all 1s ease;
  position: absolute;
  transform: ${(props: PieceProps) => {
    const pos = getPiecePosition(props.index);
    pos.x = pos.x * 1353 - 50;
    pos.y = pos.y * 500 - 50;
    return `translate(${pos.x}px, ${pos.y}px)`;
  }};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
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
  background-color: ${(props: PieceProps) => (props.containsDvonnPiece ? 'red' : 'transparent')};
  p {
    color: black;
    font-size: 30px;
    font-family: sans-Arial, Helvetica, sans-serif;
  }
`;
