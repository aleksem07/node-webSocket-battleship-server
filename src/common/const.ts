export enum Attack {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
}

export enum Status {
  WIN = 'win',
  LOSE = 'lose',
}

export enum Type {
  REGISTRATION_USER = 'reg',
  UPDATE_WINNERS = 'update_winners',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish',
}
