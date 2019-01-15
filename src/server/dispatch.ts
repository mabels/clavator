
import * as WebSocket from 'ws';

import * as Message from '../model/message';

import * as Gpg from '../gpg/gpg';
import { Dispatcher, MessageObservable, MessageSubject } from './dispatcher';
// import { Observer } from './observer';
import GpgCreateKeySet from './dispatcher/gpg-create-key-set';
import GpgResetYubikey from './dispatcher/gpg-reset-yubikey';
import GpgChangePinYubikey from './dispatcher/gpg-change-pin-yubikey';
import GpgChangeCard from './dispatcher/gpg-change-card';
import DeleteSecretKey from './dispatcher/delete-secret-key';
import RequestAsciiDispatcher from './dispatcher/request-ascii-dispatcher';
import SendKeyToYubiKey from './dispatcher/send-key-to-yubikey';
import DiceWareDispatcher from './dispatcher/dice-ware-dispatcher';
import * as rxme from 'rxme';
// import { ResultObservable, ResultObserver } from '../gpg/result';
// import * as rx from 'rxjs';

export class Dispatch extends Dispatcher {
    public readonly dispatchers: Dispatcher[] = [];
    private readonly gpg: Gpg.Gpg;

    public static match(cb: rxme.MatcherCallback<Dispatch>): rxme.MatcherCallback {
        return rxme.Matcher.Type<Dispatch>(Dispatch, cb);
    }

    public static start(gpg: Gpg.Gpg): Dispatch {
        const dispatch = new Dispatch(gpg);
        // dispatch.recv = new rx.Subject<Message.Message>();
        dispatch.dispatchers.push(GpgCreateKeySet.create(gpg));
        dispatch.dispatchers.push(GpgResetYubikey.create(gpg));
        dispatch.dispatchers.push(GpgChangePinYubikey.create(gpg));
        dispatch.dispatchers.push(DeleteSecretKey.create(gpg));
        dispatch.dispatchers.push(RequestAsciiDispatcher.create(gpg));
        dispatch.dispatchers.push(SendKeyToYubiKey.create(gpg));
        dispatch.dispatchers.push(GpgChangeCard.create(gpg));
        dispatch.dispatchers.push(DiceWareDispatcher.create(gpg.gpgCmds.gpg.resultQueue));

        // dispatch.send = rx.Observable.create((obs: rx.Observer<Message.Message>) => {
        console.log('Dispatch.start');
        dispatch.dispatchers.forEach(dp => {
            dp.send.subscribe(msg => {
                // console.log('dispatch-to-recv:', msg);
                dispatch.recv.next(msg);
            });
        });
        dispatch.send.subscribe(msg => {
            // console.log('dispatch-from-send:', msg);
            dispatch.dispatchers.forEach(dp => dp.recv.next(msg));
        });
        // });
        return dispatch;
    }

    constructor(gpg: Gpg.Gpg) {
        super();
        this.gpg = gpg;
    }
}
