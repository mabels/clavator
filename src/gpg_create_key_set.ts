
import * as expressWsTs from 'express-ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as KeyGen from './gpg/key-gen';
import * as Gpg from './gpg/gpg';

import * as Progress from './progress'

export class GpgCreateKeySet implements Dispatcher {
  public run(ws: expressWsTs.ExpressWebSocket, m: Message.Message) : boolean {
    console.log("GpgCreateKeySet.run", m.header)
    if (m.header.action != "CreateKeySet") {
      ws.send(Message.prepare("Progressor.CreateKeySet", Progress.fail("Ohh")))
      return false;
    }
    let kg = new KeyGen.KeyGen();
    let a = JSON.parse(m.data) || {}
    KeyGen.KeyGen.fill(a, kg)
    console.log(m, a, kg)
    console.log(kg.valid(), kg.errText())
    if (!kg.valid()) {
      console.log("valid failed")
      ws.send(Message.prepare("Progressor.CreateKeySet", Progress.fail("Failed send KeyGen is not valid")))
      return;
    }
    console.log("ok:", a);
    ws.send(Message.prepare("Progressor.CreateKeySet", Progress.fail("Mhhh")))
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgCreateKeySet()
  }
}

export default GpgCreateKeySet;
