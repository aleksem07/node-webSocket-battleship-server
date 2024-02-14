import { server } from './server/server';
import { wss } from './server/server';

require('dotenv').config();

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'error') {
      console.log(data);
      return;
    }

    if (data.type === 'reg') {
      const resp = { type: 'reg', data: '{"name":"222","password":"dfgdfgdfg"}', id: 0 };
      // wss.clients.forEach((client) => {
      ws.send(JSON.stringify(resp));
      // });
      return;
    }

    if (data.type === 'create_room') {
      const resp = { type: 'create_game', data: '{"idGame":"1","idPlayer":"0"}', id: 0 };
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(resp));
      });
      return;
    }

    console.log(message.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`The server is running on port:${PORT}`);
});
