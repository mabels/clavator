
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import { Dispatcher, MessageSubject, MessageObservable } from '../dispatcher';

import * as KeyGen from '../../gpg/key-gen';
// import * as ListSecretKeys from '../../gpg/list-secret-keys';
import * as Gpg from '../../gpg/gpg';
import CreateKeySetTask from '../tasks/create-key-set-task';
// import { Dispatch } from '../../ui/model/ws-channel';
// import { Observer } from '../observer';

// import * as Progress from '../../model/progress';

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match(Message.Message.actionMatch('CreateKeySet.Request', req => {
    // console.log('CreateKeySet.Request', req.header);
    const kg = new KeyGen.KeyGen();
    KeyGen.KeyGen.fill(JSON.parse(req.data) || {}, kg);
    // console.log(m, a, kg)
    CreateKeySetTask.run(this.gpg, kg).passTo(ret.send);
    // create master gpg --expert --gen-key
    // not here gpg --gen-revoke B8EFD59D
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    return true;
  }));
  return ret;
}

export default { create: create };
