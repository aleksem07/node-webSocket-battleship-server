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
      id: 0,
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

  private createGame(roomID: number, userID: number) {
    const responseCreateRoom = {
      type: 'create_game',
      data: JSON.stringify({ idGame: roomID, idPlayer: userID }),
      id: 0,
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responseCreateRoom));
    });
  }

  private updateRooms() {
    const roomsUpdate = this.rooms.getRoomsUpdate();
    const responceUpdateRoom = {
      type: 'update_room',
      data: JSON.stringify(roomsUpdate),
      id: 0,
    };

    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responceUpdateRoom));
    });
  }

  private updateWinners() {
    const allPlayers = this.players.players.map((player) => ({
      name: player.name,
      wins: player.wins,
    }));
    const responseUpdateWinners = {
      type: 'update_winners',
      data: JSON.stringify(allPlayers),
      id: 0,
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(responseUpdateWinners));
    });
  }

  public setupWS() {
    wss.on('connection', (ws) => {
      console.log('Client connected');

      ws.on('message', (message) => {
        console.log(message.toString());
        const data = JSON.parse(message.toString());
        let user = this.players.players[data.id];

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

            this.updateRooms();

            this.updateWinners();

            break;

          case 'create_room':
            user = this.players.players[this.players.getID()];
            this.rooms.createRoom([user]);

            this.updateRooms();

            break;

          case 'add_user_to_room':
            user = this.players.players[this.players.getID()];
            const parsedData2 = JSON.parse(data.data);
            const idGame = parsedData2.indexRoom;

            this.rooms.addToRoom(idGame, user);
            this.updateRooms();

            console.log(this.rooms.rooms[idGame].players);

            if (this.rooms.rooms[idGame].players.length > 1) {
              this.createGame(idGame, user.id);
              this.rooms.deleteRoom(idGame);
            }

            break;

          case 'add_ships':
            const respStart = {
              type: 'start_game',
              data: JSON.stringify({}),
              id: user.id,
            };

            ws.send(JSON.stringify(respStart));
            break;

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
