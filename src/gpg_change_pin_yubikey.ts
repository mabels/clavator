
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';
import RequestChangePin from './gpg/request_change_pin';

import * as Progress from './progress'

export class GpgChangePinYubikey implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public run(ws: WebSocket, m: Message.Message) : boolean {
    console.log("GpgChangePinYubikey.run", m.header)
    if (m.header.action != "GpgChangePinYubikey.run") {
      return false;
    }
    let a = JSON.parse(m.data) || {};
    let rcp = RequestChangePin.fill(a);

    ws.send(Message.prepare("Progressor.Clavator", Progress.ok(`ChangePin your Yubikey now:${rcp.action} ...`)))

    this.gpg.changePin(rcp.action, rcp,  (res: Gpg.Result) => {
      if (res.exitCode != 0) {
        ws.send(Message.prepare("Progressor.Clavator", Progress.fail(res.stdOut +"\n" + res.stdErr)))
      } else {
        ws.send(Message.prepare("Progressor.Clavator", Progress.ok(`pin for ${rcp.action} changed`, true)))
      }
    })
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgChangePinYubikey(g)
  }
}

export default GpgChangePinYubikey;
