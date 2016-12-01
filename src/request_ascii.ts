
import * as expressWsTs from 'express-ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class RequestAscii implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public processResult(ws: expressWsTs.ExpressWebSocket) {
    return (res: Gpg.Result) => {

    }
  }

  public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
    console.log("RequestAscii.run", m.header)
    if (m.header.action != "RequestAscii") {
      // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Ohh")))
      return false;
    }
    let payload = JSON.parse(m.data);
    ws.send(Message.prepare("Progressor.Clavator",
      Progress.ok("RequestAscii="+m.data)))
    switch (payload.action) {
      case 'pem-private':
        this.gpg.pemPrivateKey(payload.fingerPrint.fpr, this.processResult(ws));
        break;
      case 'pem-public':
        this.gpg.pemPublicKey(payload.fingerPrint.fpr, this.processResult(ws));
        break;
      case 'pem-revoke':
        this.gpg.pemRevocation(payload.fingerPrint.fpr, this.processResult(ws));
        break;
      case 'ssh-public':
        this.gpg.sshPublic(payload.fingerPrint.fpr, this.processResult(ws));
        break;
      default:
          ws.send(Message.prepare("Progressor.Clavator",
            Progress.fail("RequestAscii unhandled:"+payload.action)))
    }
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new RequestAscii(g)
  }
}

export default RequestAscii;
