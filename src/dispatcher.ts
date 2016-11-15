
import * as expressWsTs from 'express-ws';

import * as Message from './message';

export interface Dispatcher {
  run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean
}
export default Dispatcher;
