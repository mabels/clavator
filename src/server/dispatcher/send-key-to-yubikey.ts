
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
// import RequestChangePin from './gpg/request_change_pin';
// import KeyToYubiKey from '../../gpg/key-to-yubikey';

// import * as Progress from '../../model/progress';
import { SimpleYubikey } from '../../ui/model/simple-yubikey';
import CreateKeySetTask from '../tasks/create-key-set-task';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
import { ResultExec } from '../../gpg/result';
import * as rx from 'rxjs';
// import { Observer } from '../observer';

function sendKeysToCard(gpg: Gpg.Gpg, req: Message.Message,
  ksk: ListSecretKeys.SecretKey, syk: SimpleYubikey, idx = 0): void {
  if (idx == 0) {
    console.log('start-suspend observer');
    throw 'need help';
    // observer.suspend();
  }
  if (idx >= ksk.subKeys.length) {
    // ws.send(Message.prepare(header.setAction('SimpleYubiKey.Completed')));
    // console.log('completed-resume observer');
    // throw 'need help';
    // observer.resume();
    // return;
  }
  const subkey = ksk.subKeys[idx];
  // ws.send(Message.prepare(header,
  //   Progress.ok(`start keyToYubiKey for ${subkey.fingerPrint.fpr}:${idx}`)));
  gpg.keyToYubiKey(syk.asKeyToYubiKey(subkey.fingerPrint.fpr, idx + 1)).match(ResultExec.match(res => {
      this.sendKeysToCard(req, ksk, syk, idx + 1);
  }));
}

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match(Message.Message.actionMatch('SimpleYubiKey.run', req => {
    // console.log('SimpleYubiKey.run', m.header);
    let a = JSON.parse(req.data) || {};
    let syk = SimpleYubikey.fill(a);
    // let header = m.header.setAction('Progressor.Clavator');

    // console.log('SimpleYubiKey', syk.toObj(), syk.asKeyGen().password, syk.asKeyGen().password.valid());
    // ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:${syk} ...`)));
    CreateKeySetTask.run(this.gpg, syk.asKeyGen()).match(ListSecretKeys.SecretKey.match(ksk => {
      // console.log('then:CreateKeySetTask:');
      // ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:completed:create-key-gpg`)));
      this.sendKeysToCard(gpg, req, ksk, syk);
    }));

    // this.gpg.keyToYubiKey(rcp, (res: Gpg.Result) => {
    //   if (res.exitCode != 0) {
    //     ws.send(Message.prepare(header, Progress.fail(res.stdOut + '\n' + res.stdErr)));
    //   } else {
    //     ws.send(Message.prepare(header, Progress.ok(`keyToYubiKey for ${rcp} changed`, true)));
    //   }
    // });
    // return true;
  }));
  return ret;
}

export default { create: create };
