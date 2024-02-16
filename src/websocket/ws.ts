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

        if (!data) {
          console.error('No data received');
          return;
        }

        switch (data.type) {
          case 'reg':
            const parsedData = JSON.parse(data.data);

            if (!parsedData.name || !parsedData.password) {
              console.error('Name and password are required');
              return;
            }
            if (parsedData.name.length < 5 || parsedData.password.length < 5) {
              console.error('Password must be at least 5 characters long');
              return;
            }

            const name = parsedData.name;
            const password = parsedData.password;
            user = this.players.registerPlayer(name, password);
            this.players.players[user.id] = user;

            const responseRegUser = {
              type: 'reg',
              data: JSON.stringify({
                name: user.name,
                index: user.id,
                error: false,
                errorText: '',
              }),
              id: data.id,
            };
            // wss.clients.forEach((client) => {
            ws.send(JSON.stringify(responseRegUser));
            // });

            const allPlayers = this.players.players.map((player) => ({
              name: player.name,
              wins: player.wins,
            }));
            const responseUpdateWinners = {
              type: 'update_winners',
              data: JSON.stringify(allPlayers),
              id: data.id,
            };
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(responseUpdateWinners));
            });

            console.log(this.players.players);
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
            break;

          default:
            console.error('Unknown message type');
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
}
