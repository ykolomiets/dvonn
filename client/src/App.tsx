import React from 'react';
import ReactDOM from 'react-dom';

const App = ({ params }: { params: string }) => (
  <div>
    <h1>HELLO WORLD {params}</h1>
  </div>
);

ReactDOM.render(<App params="Huy" />, document.getElementById('root'));
