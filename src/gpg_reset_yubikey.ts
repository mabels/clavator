
import * as expressWsTs from 'express-ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class GpgResetYubikey implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
    console.log("GpgResetYubikey.run", m.header)
    if (m.header.action != "ResetYubikey") {
      ws.send(Message.prepare("Progressor.ResetYubikey", Progress.fail("Ohh")))
      return false;
    }
    ws.send(Message.prepare("Progressor.ResetYubikey", Progress.ok("Resetting your Yubikey now. This will take a couple of seconds. ...")))

    this.gpg.resetYubikey((res: Gpg.Result) => {
      if (res.stdOut.split("\n").find((i:string) => {return i.startsWith("ERR ")})) {
        res.stdOut.split("\n").forEach((s: string) => {
          ws.send(Message.prepare("Progressor.ResetYubikey", Progress.fail(s)))
        })
      } else {
          ws.send(Message.prepare("Progressor.ResetYubikey", Progress.ok("Almost done. Remove your Yubikey now and plug it in again.", true)))
        // res.stdOut.split("\n").forEach((s: string) => {
        //   ws.send(Message.prepare("Progressor.ResetYubikey", Progress.ok(s)))
        // })
      }
    })

    // attributes: string[], stdIn: string, cb: (res: Result) => void)

    // let kg = new KeyGen.KeyGen();
    // let a = JSON.parse(m.data) || {}
    // KeyGen.KeyGen.fill(a, kg)
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    // if (!kg.valid()) {
    //   console.log("valid failed")
    //   ws.send(Message.prepare("Progressor.CreateKeySet", Progress.fail("Failed send KeyGen is not valid")))
    //   return;
    // }
    // console.log("ok:", a);
    // ws.send(Message.prepare("Progressor.CreateKeySet", Progress.fail("Mhhh")))
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgResetYubikey(g)
  }
}

export default GpgResetYubikey;
