
import * as expressWsTs from 'express-ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class DeleteSecretKey implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
    console.log("DeleteSecretKey.run", m.header)
    if (m.header.action != "DeleteSecretKey") {
      // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Ohh")))
      return false;
    }
    let payload = JSON.parse(m.data);
    ws.send(Message.prepare("Progressor.Clavator",
      Progress.ok("DeleteSecretKey="+m.data)))
    this.gpg.deleteSecretKey(payload.fpr, (res: Gpg.Result) => {
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
      if (res.stdOut.split("\n").find((i:string) => {return i.startsWith("ERR ")})) {
        res.stdOut.split("\n").forEach((s: string) => {
          ws.send(Message.prepare("Progressor.Clavator", Progress.fail(s)));
        })
      } else {
        this.gpg.deletePublicKey(payload.fpr, (res: Gpg.Result) => {
          ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
          ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
          ws.send(Message.prepare("Progressor.Clavator", Progress.ok("DeleteKey Successfull", true)))
        })
      }
    })
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new DeleteSecretKey(g)
  }
}

export default DeleteSecretKey;
