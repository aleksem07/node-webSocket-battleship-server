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
        let room = this.rooms.rooms[data.idGame];

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

            const updateRoom = this.rooms.getRoomsUpdate();
            console.log(updateRoom);
            const responceUpdateRoom = {
              type: 'update_room',
              data: JSON.stringify(updateRoom),
              id: data.id,
            };
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(responceUpdateRoom));
            });

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
            room = this.rooms.createRoom([user]);

            const responseCreateRoom = {
              type: 'create_game',
              data: JSON.stringify({ idGame: room.id, idPlayer: user.id }),
              id: data.id,
            };
            ws.send(JSON.stringify(responseCreateRoom));

            const updateRoom1 = this.rooms.getRoomsUpdate();
            console.log(updateRoom1);
            const responceUpdateRoom1 = {
              type: 'update_room',
              data: JSON.stringify(updateRoom1),
              id: data.id,
            };
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(responceUpdateRoom1));
            });

            break;

          // case 'add_ships':
          //   const responseStartGame = {
          //     type: 'start_game',
          //     data: JSON.stringify({ idGame: 0, idPlayer: user.id }),
          //     id: data.id,
          //   };
          //   // wss.clients.forEach((client) => {
          //   ws.send(JSON.stringify(responseStartGame));
          //   // });
          //   break;

          default:
            console.error('Unknown message type');
        }
        console.log(data);
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
}
