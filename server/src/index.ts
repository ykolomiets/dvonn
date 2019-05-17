import express from 'express';
import ioServer from 'socket.io';
import { createServer } from 'http';
import GameWithTwoPlayers from './GameWithTwoPlayers';
import GameWithAi from './GameWithAi';

const app = express();
const http = createServer(app);

app.use(express.static('client-build'));

const io = ioServer(http);

io.of('ai').on('connection', socket => {
  const game = new GameWithAi(socket);
});

const waitingQueue: SocketIO.Socket[] = [];

io.of('real').on('connection', socket => {
  const opponent = waitingQueue.shift();
  if (opponent) {
    opponent.removeAllListeners('disconnect');
    const game = new GameWithTwoPlayers(socket, opponent);
  } else {
    waitingQueue.push(socket);
    socket.on('disconnect', () => {
      console.log('Disconnect: Removed from waiting queue');
      waitingQueue.splice(waitingQueue.indexOf(socket), 1);
    });
  }
});

http.listen(3000, () => {
  console.log('Listening on port 3000!');
});
