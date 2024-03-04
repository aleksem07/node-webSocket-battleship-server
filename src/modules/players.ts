import WebSocket from 'ws';

export interface IPlayer {
  id: number;
  name: string;
  password: string | number;
  wins?: number;
}

export class Players {
  public players: IPlayer[] = [];
  public id: number = 0;
  public playerWsMap: Map<number, WebSocket> = new Map();

  registerPlayer(name: string, password: string, wins = 0): IPlayer {
    const player: IPlayer = {
      id: this.players.length,
      name,
      password,
      wins,
    };
    this.players.push(player);
    return player;
  }

  setID(id: number) {
    this.id = id;
  }

  getID() {
    return this.id;
  }

  setPlayerWs(playerId: number, ws: WebSocket) {
    this.playerWsMap.set(playerId, ws);
  }
}
