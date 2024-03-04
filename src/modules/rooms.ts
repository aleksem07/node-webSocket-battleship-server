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

  addToRoom(roomId: number, player: IPlayer) {
    const room = this.rooms.find((room) => room.id === roomId);
    if (!room) {
      return;
    }
    room.players.push(player);
  }

  deleteRoom(roomId: number) {
    this.rooms = this.rooms.filter((room) => room.id !== roomId);
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
