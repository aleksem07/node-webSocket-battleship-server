import { server } from './server/server';
import { wss } from './server/server';

require('dotenv').config();

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    console.log('Received message:', message.toString());
    wss.clients.forEach((client) => {
      client.send(message.toString());
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on port:${PORT}`);
});
