
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';
import RequestChangePin from './gpg/request_change_pin';
import KeyToYubiKey from './gpg/key-to-yubikey';

import * as Progress from './progress';

export class SendKeyToYubiKey implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public run(ws: WebSocket, m: Message.Message) : boolean {
    console.log("SendKeyToYubiKey.run", m.header)
    if (m.header.action != "SendKeyToYubiKey.run") {
      return false;
    }
    let a = JSON.parse(m.data) || {};
    let rcp = KeyToYubiKey.fill(a);

    ws.send(Message.prepare("Progressor.Clavator", Progress.ok(`SendKeyToYubiKey:${rcp} ...`)))

    this.gpg.keyToYubiKey(rcp,  (res: Gpg.Result) => {
      if (res.exitCode != 0) {
        ws.send(Message.prepare("Progressor.Clavator", Progress.fail(res.stdOut +"\n" + res.stdErr)))
      } else {
        ws.send(Message.prepare("Progressor.Clavator", Progress.ok(`keyToYubiKey for ${rcp} changed`, true)))
      }
    })
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new SendKeyToYubiKey(g)
  }
}

export default SendKeyToYubiKey;
