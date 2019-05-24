import React from 'react';

export default function Rules() {
  return (
    <div>
      <h1>Rules</h1>
      <p>
        The board game Dvonn is played by two players (black and white). Each player gets 23 pieces; additionally there
        are 3 special DVONN pieces. The goal is to control as many pieces as possible by stacking them on top of each
        other and to try to keep your stacks linked to the red DVONN pieces.{' '}
      </p>
      <h2>Moves</h2>
      <ol type="1">
        <li>Placing pieces</li>
        <p>
          <ul>
            <li>
              The game starts with an empty board. The players place pieces alternatingly, one at a time. They must
              start with the DVONN pieces and then continue with their own color.
            </li>
            <li>Continue until all spaces on the board are occupied.</li>
          </ul>
        </p>
        <li>Stacking pieces</li>
        <p>
          <ul>
            <li>
              The players move alternatingly. Each turn a player must move one piece or one stack. He may only move a
              piece or a stack of his own color. The color of the topmost piece determines who owns a stack, and thus
              who may move it.
            </li>
            <li>
              A piece or stack must always be moved as a whole and moves as many spaces as there are pieces in the
              stack. They can be moved in any direction, but only along straight lines.
            </li>
            <li>A move may never end in an empty space, but you can move across empty spaces.</li>
            <li>Only pieces or stacks that are not surrounded on all 6 sides can be moved.</li>
            <li>Single DVONN pieces can not be moved, but stacks containing a DVONN piece can.</li>
          </ul>
        </p>
        <li>Losing pieces</li>
        <p>
          <ul>
            <li>
              Pieces and stacks must somehow remain in contact with at least one DVONN piece to remain in play. "In
              contact" means that there must always be a link (directly or through a chain of other pieces) with at
              least one DVONN piece. Otherwise, the pieces are removed from the board at once.
            </li>
            <li>
              All 3 DVONN pieces remain in play until the end of the game, even if one of them becomes isolated, as it
              will always remain in contact with itself.
            </li>
          </ul>
        </p>
        <li>The End</li>
        <p>
          <ul>
            <li>
              The players must play as long as they can. If one player can't make a move any more, the other must still
              continue while he can.
            </li>
            <li>
              The player wins who controls the most pieces with a piece of his color on top of any stack. All pieces in
              the stack are counted independent of their color.
            </li>
          </ul>
        </p>
      </ol>
    </div>
  );
}
