
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as KeyGen from '../../gpg/key-gen';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
import * as Gpg from '../../gpg/gpg';
import CreateKeySetTask from '../tasks/create-key-set-task';

import * as Progress from '../../model/progress';

export class GpgCreateKeySet implements Dispatcher {
  public gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): GpgCreateKeySet {
    return new GpgCreateKeySet(g);
  }

  constructor(gpg: Gpg.Gpg) {
    this.gpg = gpg;
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    console.log('CreateKeySet.Request', m.header);
    if (m.header.action != 'CreateKeySet.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const kg = new KeyGen.KeyGen();
    KeyGen.KeyGen.fill(JSON.parse(m.data) || {}, kg);
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

export default GpgCreateKeySet;
