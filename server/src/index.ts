import express from 'express';
import { createServer } from 'http';

const app = express();
const http = createServer(app);

app.use(express.static('client-build'));

http.listen(3000, () => {
  console.log('Listening on port 3000!');
});
