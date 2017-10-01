import * as WebSocket from 'ws';
import * as Message from './message';

export interface Dispatcher {
  run(ws: WebSocket, m: Message.Message): boolean;
}

export default Dispatcher;
