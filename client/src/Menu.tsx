/** @jsx jsx */
import React from 'react';
import styled from '@emotion/styled';
import { css, jsx } from '@emotion/core';
import { Link } from 'react-router-dom';

interface MenuProps {
  className?: string;
}

class Menu extends React.Component<MenuProps> {
  public render() {
    return (
      <div className={this.props.className}>
        <div className="menu-body">
          <Link to="/" className="menu-link">
            Play with friend
          </Link>
          <Link to="/game-ai" className="menu-link">
            Play with AI
          </Link>
          <Link to="/rules" className="menu-link">
            Rules
          </Link>
        </div>
      </div>
    );
  }
}

export default styled(Menu)`
  height: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: Arial, Helvetica, sans-serif;

  .menu-body {
    box-shadow: 2px 2px 2px 2px black;
    display: flex;
    flex-direction: column;
  }

  .menu-link {
    padding: 10px;
    background-color: red;
    margin: 5px;
  }
`;
