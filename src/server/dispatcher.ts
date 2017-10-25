import * as WebSocket from 'ws';
import * as Message from '../model/message';

export interface Dispatcher {
  run(ws: WebSocket, m: Message.Message): boolean;
}

export default Dispatcher;
