export interface IPlayer {
  id: number;
  name: string;
  password: string | number;
}

export class Players {
  public players: IPlayer[] = [];

  registerPlayer(name: string, password: string): IPlayer {
    const player: IPlayer = {
      id: this.players.length,
      name,
      password,
    };
    this.players.push(player);
    return player;
  }
}
