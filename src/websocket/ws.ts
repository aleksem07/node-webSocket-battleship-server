import { wss } from '../server/server';
import { Rooms } from '../modules/rooms';
import { Players } from '../modules/players';
import { Type } from '../common/const';
import WebSocket from 'ws';

export class WSHandler {
  private rooms: Rooms;
  private players: Players;
  private shipsAddedCount: number = 0;

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
    this.players.setPlayerWs(userID, wss);
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
    wss.on('connection', (ws: WebSocket) => {
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
          case Type.REGISTRATION_USER:
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
            const parsedData2 = JSON.parse(data.data);
            const idGame = parsedData2.indexRoom;
            const currentUserID2 = this.players.getID();
            const currentUser2 = this.players.players[currentUserID2];

            this.rooms.addToRoom(idGame, currentUser2);
            this.players.setPlayerWs(currentUserID2, ws);

            this.updateRooms();

            console.log(this.rooms.rooms[idGame].players);

            if (this.rooms.rooms[idGame].players.length > 1) {
              this.createGame(idGame, currentUser2.id);
              // this.rooms.deleteRoom(idGame);
            }

            break;

          case 'add_ships':
            this.shipsAddedCount++;
            const parsedData3 = JSON.parse(data.data);
            const idGame2 = 0;
            console.log('players ------------------');
            console.log(this.rooms.rooms[idGame2].players);

            const room = this.rooms.rooms[idGame2];
            console.log('room ------------------');
            console.log(room);

            const currentPlayerIndex1 = room.players[0].id;
            const currentPlayerIndex2 = room.players[1].id;

            const respStart1 = {
              type: 'start_game',
              data: JSON.stringify({
                ships: parsedData3.ships,
                currentPlayerIndex: currentPlayerIndex1,
              }),
            };

            const respStart2 = {
              type: 'start_game',
              data: JSON.stringify({
                ships: parsedData3.ships,
                currentPlayerIndex: currentPlayerIndex2,
              }),
            };

            room.players.forEach((player) => {
              const ws = this.players.playerWsMap.get(player.id);
              if (ws) {
                ws.send(
                  JSON.stringify(player.id === currentPlayerIndex1 ? respStart1 : respStart2)
                );
              } else {
                console.error(`WebSocket not found for player with ID ${player.id}`);
              }
            });
            break;

          case 'attack':
            if (this.shipsAddedCount === 2) {
              const currentUserID1 = this.players.getID();
              const currentUser = this.players.players[currentUserID1];
              console.log(currentUser);

              const parsedData4 = JSON.parse(data.data);
              const attack = parsedData4.position;
              const respAttack = {
                type: 'attack',
                data: JSON.stringify({
                  attack,
                  currentPlayerIndex: currentUserID1,
                  status: 'miss',
                }),
                id: currentUserID1,
              };

              ws.send(JSON.stringify(respAttack));
            }
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
