import ReactDOM from 'react-dom';
import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Menu from './Menu';
import Rules from './Rules';
import Game from './Game';

function Root() {
  return (
    <Router>
      <Route exact path="/" component={Menu} />
      <Route exact path="/game-ai" component={Game} />
      <Route exact path="/rules" component={Rules} />
    </Router>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
