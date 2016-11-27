
import * as expressWsTs from 'express-ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as KeyGen from './gpg/key-gen';
import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class GpgCreateKeySet implements Dispatcher {
  gpg: Gpg.Gpg;
  constructor(gpg :Gpg.Gpg) {
      this.gpg = gpg
  }
  public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
    console.log("GpgCreateKeySet.run", m.header)
    if (m.header.action != "CreateKeySet") {
      // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Ohh")))
      return false;
    }
    let kg = new KeyGen.KeyGen();
    let a = JSON.parse(m.data) || {}
    KeyGen.KeyGen.fill(a, kg)
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    if (!kg.valid()) {
      ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Failed send KeyGen is not valid")))
      return;
    }
    // console.log(">>>", kg.masterCommand())
    ws.send(Message.prepare("Progressor.Clavator", Progress.info(kg.masterCommand())));
    this.gpg.createMasterKey(kg, (res: Gpg.Result) => {
      // console.log("res=", res)
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)))
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)))
    });
    // create master gpg --expert --gen-key
    // not here gpg --gen-revoke B8EFD59D
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Mhhh")))
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgCreateKeySet(g)
  }
}

export default GpgCreateKeySet;
