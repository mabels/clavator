
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import RequestChangePin from '../../gpg/request-change-pin';
import { Observer } from '../observer';

import * as Progress from '../../model/progress';

export class GpgChangePinYubikey implements Dispatcher {

  public gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): GpgChangePinYubikey {
    return new GpgChangePinYubikey(g);
  }
  constructor(g: Gpg.Gpg) {
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

    this.gpg.changePin(rcp.action, rcp).subscribe(res => {
      if (res.isError()) {
        ws.send(Message.prepare(header, Progress.fail(`${res.exec.stdOut}\n${res.exec.stdErr}`)));
      } else {
        ws.send(Message.prepare(header, Progress.ok(`pin for ${rcp.action} changed`, true)));
      }
      ws.send(Message.prepare(header.setAction('GpgChangePinYubikey.Completed'), null));
    });
    return true;
  }

}

export default GpgChangePinYubikey;
