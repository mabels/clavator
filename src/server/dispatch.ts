import * as WebSocket from 'ws';

import { Dispatcher } from './dispatcher';
import { Observer } from './observer';
import { Gpg } from '../gpg';
import { Message } from '../model';
import {
  GpgCreateKeySet,
  GpgResetYubikey,
  GpgChangePinYubikey,
  GpgChangeCard,
  DeleteSecretKey,
  RequestAsciiDispatcher,
  SendKeyToYubiKey,
  DiceWareDispatcher
} from './dispatcher';

export class Dispatch {
  public dispatcher: Dispatcher[] = [];

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('Dispatch.run', m.header);
    return !!this.dispatcher.find((dispatch: Dispatcher) =>
      dispatch.run(observer, ws, m)
    );
  }
}

export function startDispatch(gpg: Gpg): Dispatch {
  console.log('Dispatch.start');
  let dispatch = new Dispatch();
  dispatch.dispatcher.push(GpgCreateKeySet.create(gpg));
  dispatch.dispatcher.push(GpgResetYubikey.create(gpg));
  dispatch.dispatcher.push(GpgChangePinYubikey.create(gpg));
  dispatch.dispatcher.push(DeleteSecretKey.create(gpg));
  dispatch.dispatcher.push(RequestAsciiDispatcher.create(gpg));
  dispatch.dispatcher.push(SendKeyToYubiKey.create(gpg));
  dispatch.dispatcher.push(GpgChangeCard.create(gpg));
  dispatch.dispatcher.push(DiceWareDispatcher.create());
  return dispatch;
}
