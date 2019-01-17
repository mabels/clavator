import * as WebSocket from 'ws';
import { Message } from '../../model';
import { Observer } from './../observer';

export interface Dispatcher {
  run(observer: Observer, ws: WebSocket, m: Message.Message): boolean;
}
