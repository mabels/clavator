
import * as WebSocket from 'ws';
import { Message, Progress } from '../../model';
import { Dispatcher } from '../dispatcher';

import { Gpg, RequestChangePin, Result } from '../../gpg';
import { Observer } from '../observer';

export class GpgChangePinYubikey implements Dispatcher {

  public gpg: Gpg;

  public static create(g: Gpg): GpgChangePinYubikey {
    return new GpgChangePinYubikey(g);
  }
  constructor(g: Gpg) {
    this.gpg = g;
  }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('GpgChangePinYubikey.run', m.header);
    if (m.header.action != 'GpgChangePinYubikey.run') {
      return false;
    }
    let a = JSON.parse(m.data) || {};
    let rcp = RequestChangePin.fill(a);
    let header = Message.toHeader(m, 'Progressor.Clavator');
    ws.send(Message.prepare(header, Progress.ok(`ChangePin your Yubikey now:${rcp.action} ...`)));

    this.gpg.changePin(rcp.action, rcp,  (res: Result) => {
      if (res.exitCode != 0) {
        ws.send(Message.prepare(header, Progress.fail(res.stdOut + '\n' + res.stdErr)));
      } else {
        ws.send(Message.prepare(header, Progress.ok(`pin for ${rcp.action} changed`, true)));
      }
      ws.send(Message.prepare(header.setAction('GpgChangePinYubikey.Completed'), null));
    });
    return true;
  }

}
