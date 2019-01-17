
import * as WebSocket from 'ws';
import { Message, Progress } from '../../model';
import { Dispatcher } from '../dispatcher';

import { KeyGen, Gpg } from '../../gpg';
// import * as ListSecretKeys from '../../gpg/list-secret-keys';
import { CreateKeySetTask } from '../tasks';
import { Observer } from '../observer';

// import * as Progress from '../../model/progress';

export class GpgCreateKeySet implements Dispatcher {
  public gpg: Gpg;

  public static create(g: Gpg): GpgCreateKeySet {
    return new GpgCreateKeySet(g);
  }

  constructor(gpg: Gpg) {
    this.gpg = gpg;
  }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('CreateKeySet.Request', m.header);
    if (m.header.action != 'CreateKeySet.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const kg = new KeyGen();
    KeyGen.fill(JSON.parse(m.data) || {}, kg);
    // console.log(m, a, kg)
    CreateKeySetTask.run(this.gpg, ws, m, kg)
      .then(() => { /* */ })
      .catch(() => { /* */ });
    // create master gpg --expert --gen-key
    // not here gpg --gen-revoke B8EFD59D
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Mhhh')))
    return true;
  }

}
