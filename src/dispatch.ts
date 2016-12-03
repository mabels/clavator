
import * as expressWsTs from 'express-ws';

import * as Message from './message';


import * as Gpg from './gpg/gpg';
import Dispatcher from './dispatcher'
import GpgCreateKeySet from './gpg_create_key_set'
import GpgResetYubikey from './gpg_reset_yubikey';
import DeleteSecretKey from './delete_secret_key';
import RequestAscii from './request_ascii';

export class Dispatch {
    public dispatcher : Dispatcher[] = [];

    public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
      console.log("Dispatch.run", m.header)
      return !!(this.dispatcher.find((dispatch: Dispatcher) => dispatch.run(ws, m)))
    }

}

export function start(gpg: Gpg.Gpg) : Dispatch {
    console.log("Dispatch.start");
    let dispatch = new Dispatch();
    dispatch.dispatcher.push(GpgCreateKeySet.create(gpg))
    dispatch.dispatcher.push(GpgResetYubikey.create(gpg))
    dispatch.dispatcher.push(DeleteSecretKey.create(gpg))
    dispatch.dispatcher.push(RequestAscii.create(gpg))
    return dispatch;
}