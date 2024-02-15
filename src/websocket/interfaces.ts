export interface IWSMessage<T> {
  type: string;
  data: T;
  id: number;
}

export interface IRegistrationRequest {
  name: string;
  password: string;
}

export interface IRegistrationResponse {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

export interface IError {
  message: string;
  errorCode: string;
}

export interface ICreateRoom {
  idGame: number;
  idPlayer: number;
}
