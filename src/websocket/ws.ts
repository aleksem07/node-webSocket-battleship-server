import { wss } from '../server/server';
import { IWSMessage, IRegistrationRequest, IRegistrationResponse, ICreateRoom } from './interfaces';
import { Rooms } from '../modules/rooms';
import { Players } from '../modules/players';
import WebSocket from 'ws';

export class WSHandler {
  private rooms: Rooms;
  private players: Players;

  constructor() {
    this.rooms = new Rooms();
    this.players = new Players();
  }

  private registerUser(name: string, userID: number, wss: WebSocket) {
    const responseRegUser = {
      type: 'reg',
      data: JSON.stringify({
        name,
        index: userID,
        error: false,
        errorText: '',
      }),
      id: userID,
    };

    wss.send(JSON.stringify(responseRegUser));
  }

  private validation(name: string, password: string) {
    if (!name || !password) {
      console.error('Name and password are required');
      return;
    }
    if (name.length < 5 || password.length < 5) {
      console.error('Password must be at least 5 characters long');
      return;
    }
  }

  private updateRooms(id: number) {
    const roomsUpdate = this.rooms.getRoomsUpdate();
    const responceUpdateRoom = {
      type: 'update_room',
      data: JSON.stringify(roomsUpdate),
      id,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responceUpdateRoom));
    });
  }

  private updateWinners(id: number) {
    const allPlayers = this.players.players.map((player) => ({
      name: player.name,
      wins: player.wins,
    }));
    const responseUpdateWinners = {
      type: 'update_winners',
      data: JSON.stringify(allPlayers),
      id,
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responseUpdateWinners));
    });
  }

  private createRoom(roomID: number, userID: number, ws: WebSocket) {
    const responseCreateRoom = {
      type: 'create_game',
      data: JSON.stringify({ idGame: roomID, idPlayer: userID }),
      id: userID,
    };
    ws.send(JSON.stringify(responseCreateRoom));
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

            this.validation(parsedData.name, parsedData.password);

            const name = parsedData.name;
            const password = parsedData.password;
            user = this.players.registerPlayer(name, password);

            this.players.setID(user.id);

            console.log('user');
            console.log(user.id);
            this.players.players[user.id] = user;

            this.registerUser(user.name, user.id, ws);

            this.updateRooms(data.id);

            this.updateWinners(data.id);

            break;

          case 'create_room':
            user = this.players.players[this.players.getID()];
            room = this.rooms.createRoom([user]);

            this.createRoom(room.id, user.id, ws);

            // this.updateRooms(data.id);

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
