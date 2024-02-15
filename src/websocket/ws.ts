import { wss } from '../server/server';
import { IWSMessage, IRegistrationRequest, IRegistrationResponse, ICreateRoom } from './interfaces';
import { Rooms } from '../modules/rooms';
import { Players } from '../modules/players';

export class WSHandler {
  private rooms: Rooms;
  private players: Players;

  constructor() {
    this.rooms = new Rooms();
    this.players = new Players();
  }

  public setupWS() {
    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('message', (message) => {
        console.log(message.toString());
        const data = JSON.parse(message.toString());
        let user = this.players.players[data.id];
        // let room = this.rooms.rooms[data.idGame];

        switch (data.type) {
          case 'reg':
            const parsedData = JSON.parse(data.data);
            const name = parsedData.name;
            const password = parsedData.password;
            user = this.players.registerPlayer(name, password);
            console.log(user);
            const response = {
              type: 'reg',
              data: JSON.stringify({
                name: user.name,
                index: user.id,
                error: false,
                errorText: '',
              }),
              id: 0,
            };
            // wss.clients.forEach((client) => {
            ws.send(JSON.stringify(response));
            // });
            break;

          case 'create_room':
          // const respRoom = {
          //   type: 'create_game',
          //   data: JSON.stringify({ idGame: room.id, idPlayer: user.id }),
          //   id: 0,
          // };
          // wss.clients.forEach((client) => {
          //   client.send(JSON.stringify(respRoom));
          // });
          // break;
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
}
