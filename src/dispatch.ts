
import * as WebSocket from 'ws';

import * as Message from './message';

import * as Gpg from './gpg/gpg';
import Dispatcher from './dispatcher';
import GpgCreateKeySet from './gpg_create_key_set';
import GpgResetYubikey from './gpg_reset_yubikey';
import GpgChangePinYubikey from './gpg_change_pin_yubikey';
import GpgChangeCard from './gpg-change-card';
import DeleteSecretKey from './delete_secret_key';
import RequestAsciiDispatcher from './request_ascii_dispatcher';
import SendKeyToYubiKey from './send_key_to_yubikey';

export class Dispatch {
    public dispatcher: Dispatcher[] = [];

    public run(ws: WebSocket, m: Message.Message): boolean {
        console.log('Dispatch.run', m.header);
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
    return dispatch;
}
