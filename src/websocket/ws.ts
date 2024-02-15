import { wss } from '../server/server';
import {
  IWSMessage,
  IRegistrationRequest,
  IRegistrationResponse,
  IError,
  ICreateRoom,
} from './interfaces';
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
        const data: IWSMessage<
          IRegistrationRequest | IRegistrationResponse | IError | ICreateRoom
        > = JSON.parse(message.toString());
        let errorResponse: IWSMessage<string> = {
          type: 'error',
          data: JSON.stringify({ message: 'Something went wrong', errorCode: 'SERVER_ERROR' }),
          id: 0,
        };
        let resp: IWSMessage<string> = { type: 'error', data: '', id: 0 };

        switch (data.type) {
          case 'error':
            errorResponse = {
              type: 'error',
              data: JSON.stringify({
                message: 'Something went wrong',
                errorCode: 'SERVER_ERROR',
              } as IError),
              id: 0,
            };
            ws.send(JSON.stringify(errorResponse));
            break;

          case 'reg':
            resp = {
              type: 'reg',
              data: JSON.stringify({ name: '222', password: 'dfgdfgdfg' }),
              id: 0,
            };
            // wss.clients.forEach((client) => {
            ws.send(JSON.stringify(resp));
            // });
            break;

          case 'create_room':
            resp = { type: 'create_game', data: '{"idGame":"1","idPlayer":"0"}', id: 0 };
            wss.clients.forEach((client) => {
              client.send(JSON.stringify(resp));
            });
            break;
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }
}
