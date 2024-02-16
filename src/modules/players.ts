export interface IPlayer {
  id: number;
  name: string;
  password: string | number;
  wins?: number;
}

export class Players {
  public players: IPlayer[] = [];

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
}
