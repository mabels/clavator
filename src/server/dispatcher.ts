import * as WebSocket from 'ws';
import * as Message from '../model/message';
// import { Observer } from './observer';

export interface Dispatcher {
  run(ws: WebSocket, m: Message.Message): boolean;
}

export default Dispatcher;
