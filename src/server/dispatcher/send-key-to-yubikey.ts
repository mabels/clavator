
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import RequestChangePin from './gpg/request_change_pin';
import KeyToYubiKey from '../../gpg/key-to-yubikey';

import * as Progress from '../../model/progress';
import { SimpleYubikey } from '../../ui/model/simple-yubikey';

export class SendKeyToYubiKey implements Dispatcher {
  private gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): SendKeyToYubiKey {
    return new SendKeyToYubiKey(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    console.log('SimpleYubiKey.run', m.header);
    if (m.header.action != 'SimpleYubiKey.run') {
      return false;
    }
    let a = JSON.parse(m.data) || {};
    let rcp = SimpleYubikey.fill(a);
    let header = m.header.setAction('Progressor.Clavator');

    ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:${rcp} ...`)));

    console.log('Jojo', m.data);

    // this.gpg.keyToYubiKey(rcp, (res: Gpg.Result) => {
    //   if (res.exitCode != 0) {
    //     ws.send(Message.prepare(header, Progress.fail(res.stdOut + '\n' + res.stdErr)));
    //   } else {
    //     ws.send(Message.prepare(header, Progress.ok(`keyToYubiKey for ${rcp} changed`, true)));
    //   }
      ws.send(Message.prepare(header.setAction('SimpleYubiKey.Completed')));
    // });
    return true;
  }

}

export default SendKeyToYubiKey;
