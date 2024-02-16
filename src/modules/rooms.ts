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

  getRoomsUpdate(): { roomId: number; roomUsers: { name: string; index: number }[] }[] {
    return this.rooms.map((room) => ({
      roomId: room.id,
      roomUsers: room.players.map((player) => ({
        name: player.name,
        index: player.id,
      })),
    }));
  }
}
