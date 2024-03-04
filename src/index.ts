import { server } from './server/server';
import { WSHandler } from './websocket/ws';

const wsHandler = new WSHandler();

wsHandler.setupWS();

require('dotenv').config();

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on port:${PORT}`);
});
