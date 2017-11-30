
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
// import RequestChangePin from './gpg/request_change_pin';
// import KeyToYubiKey from '../../gpg/key-to-yubikey';

import * as Progress from '../../model/progress';
import { SimpleYubikey } from '../../ui/model/simple-yubikey';
import CreateKeySetTask from '../tasks/create-key-set-task';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
// import { Observer } from '../observer';

export class SendKeyToYubiKey implements Dispatcher {
  private readonly gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): SendKeyToYubiKey {
    return new SendKeyToYubiKey(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  private sendKeysToCard(ws: WebSocket, header: Message.Header,
    ksk: ListSecretKeys.SecretKey, syk: SimpleYubikey, idx = 0): void {
    if (idx == 0) {
      console.log('start-suspend observer');
      throw 'need help';
      // observer.suspend();
    }
    if (idx >= ksk.subKeys.length) {
      ws.send(Message.prepare(header.setAction('SimpleYubiKey.Completed')));
      console.log('completed-resume observer');
      throw 'need help';
      // observer.resume();
      // return;
    }
    const subkey = ksk.subKeys[idx];
    ws.send(Message.prepare(header,
        Progress.ok(`start keyToYubiKey for ${subkey.fingerPrint.fpr}:${idx}`)));
    this.gpg.keyToYubiKey(syk.asKeyToYubiKey(subkey.fingerPrint.fpr, idx + 1)).subscribe(res => {
      if (res.isError()) {
        console.error('error-resume observer', res);
        // observer.resume();
        ws.send(Message.prepare(header, Progress.fail(`${res.exec.stdOut}\n${res.exec.stdErr}`)));
      } else {
        ws.send(Message.prepare(header,
          Progress.ok(`keyToYubiKey for ${subkey.fingerPrint.fpr}:${idx} changed`, true)));
        this.sendKeysToCard(ws, header, ksk, syk, idx + 1);
      }
    });
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    if (m.header.action != 'SimpleYubiKey.run') {
      return false;
    }
    console.log('SimpleYubiKey.run', m.header);
    let a = JSON.parse(m.data) || {};
    let syk = SimpleYubikey.fill(a);
    let header = m.header.setAction('Progressor.Clavator');

    console.log('SimpleYubiKey', syk.toObj(), syk.asKeyGen().password, syk.asKeyGen().password.valid());
    ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:${syk} ...`)));
    CreateKeySetTask.run(this.gpg, ws, m, syk.asKeyGen()).subscribe(ksk => {
        console.log('then:CreateKeySetTask:');
        ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:completed:create-key-gpg`)));
        this.sendKeysToCard(ws, header, ksk.data, syk);
    });

    // this.gpg.keyToYubiKey(rcp, (res: Gpg.Result) => {
    //   if (res.exitCode != 0) {
    //     ws.send(Message.prepare(header, Progress.fail(res.stdOut + '\n' + res.stdErr)));
    //   } else {
    //     ws.send(Message.prepare(header, Progress.ok(`keyToYubiKey for ${rcp} changed`, true)));
    //   }
    // });
    return true;
  }

}

export default SendKeyToYubiKey;
