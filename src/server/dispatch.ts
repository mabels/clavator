
import * as WebSocket from 'ws';

import * as Message from '../model/message';

import * as Gpg from '../gpg/gpg';
import Dispatcher from './dispatcher';
// import { Observer } from './observer';
import GpgCreateKeySet from './dispatcher/gpg-create-key-set';
import GpgResetYubikey from './dispatcher/gpg-reset-yubikey';
import GpgChangePinYubikey from './dispatcher/gpg-change-pin-yubikey';
import GpgChangeCard from './dispatcher/gpg-change-card';
import DeleteSecretKey from './dispatcher/delete-secret-key';
import RequestAsciiDispatcher from './dispatcher/request-ascii-dispatcher';
import SendKeyToYubiKey from './dispatcher/send-key-to-yubikey';
import DiceWareDispatcher from './dispatcher/dice-ware-dispatcher';

export class Dispatch {
    public dispatcher: Dispatcher[] = [];

    public run(ws: WebSocket, m: Message.Message): boolean {
        // console.log('Dispatch.run', m.header);
        return !!(this.dispatcher.find((dispatch: Dispatcher) => dispatch.run(ws, m)));
    }

}

export function start(gpg: Gpg.Gpg): Dispatch {
    console.log('Dispatch.start');
    let dispatch = new Dispatch();
    dispatch.dispatcher.push(GpgCreateKeySet.create(gpg));
    dispatch.dispatcher.push(GpgResetYubikey.create(gpg));
    dispatch.dispatcher.push(GpgChangePinYubikey.create(gpg));
    dispatch.dispatcher.push(DeleteSecretKey.create(gpg));
    dispatch.dispatcher.push(RequestAsciiDispatcher.create(gpg));
    dispatch.dispatcher.push(SendKeyToYubiKey.create(gpg));
    dispatch.dispatcher.push(GpgChangeCard.create(gpg));
    dispatch.dispatcher.push(DiceWareDispatcher.create(gpg.gpgCmds.gpg.resultQueue));
    return dispatch;
}
