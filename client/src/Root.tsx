import ReactDOM from 'react-dom';
import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Menu from './Menu';
import Rules from './Rules';
import Game from './Game';

const URL = process.env.WSSERVER_URL as string;
const PORT = (process.env.PORT as unknown) as number;

function Root() {
  return (
    <Router>
      <Route exact path="/" component={Menu} />
      <Route exact path="/game-real" component={() => <Game realPlayer={true} url={URL} port={PORT} />} />
      <Route exact path="/game-ai" component={() => <Game realPlayer={false} url={URL} port={PORT} />} />
      <Route exact path="/rules" component={Rules} />
    </Router>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
