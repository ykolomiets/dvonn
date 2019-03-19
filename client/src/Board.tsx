import React, { SFC } from 'react';
import styled from '@emotion/styled';
import boardImage from '../assets/images/board.svg';
import { Cell } from '../../common/src/cell';
import Piece from './Piece';

const DvonnBoard: SFC<{ className?: string }> = ({ className, children) => (
  <div
    className={className}
    onClick={ev => {
      console.log(ev.clientX, ev.clientY);
    }}
  >
    {children}
  </div>
);

const StyledDvonnBoard = styled(DvonnBoard)`
  position: relative;
  width: 1353px;
  height: 500px;
  background-image: url(${boardImage});
  background-size: contain;
`;

interface BoardProps {
  board: Cell[];
}

class Board extends React.Component<BoardProps> {
  public render() {
    return (
      <StyledDvonnBoard>
        {this.props.board.map(cell =>
          cell.state.isEmpty ? null : (
            <Piece
              key={cell.index}
              index={cell.index}
              stackSize={cell.state.stackSize}
              upperColor={cell.state.upperColor}
              containsDvonnPiece={cell.state.containsDvonnPiece}
            />
          )
        )}
      </StyledDvonnBoard>
    );
  }
}

export default Board;
