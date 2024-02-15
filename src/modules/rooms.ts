import { IPlayer } from './players';

interface IRoom {
  id: number;
  players: IPlayer[];
}

export class Rooms {
  public rooms: IRoom[] = [];

  createRoom(players: IPlayer[]): IRoom {
    const room: IRoom = {
      id: this.rooms.length,
      players,
    };
    this.rooms.push(room);
    return room;
  }
}
