
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher'

import * as Gpg from './gpg/gpg';
import ChangeCard from './gpg/change_card';

import * as Progress from './progress';

export class GpgChangeCard implements Dispatcher {

  gpg: Gpg.Gpg

  constructor(g: Gpg.Gpg){
    this.gpg = g
  }

  public run(ws: WebSocket, m: Message.Message) : boolean {
    console.log("GpgChangeCard.run", m.header)
    if (m.header.action != "ChangeCard") {
      // ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Ohh")))
      return false;
    }
    let a = JSON.parse(m.data) || {}
    let cc = ChangeCard.fill(a);
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    if (!cc.valid()) {
      ws.send(Message.prepare("Progressor.Clavator", Progress.fail("Failed received ChangeCard is not valid")))
      return;
    }
    // console.log(">>>", kg.masterCommand())
    ws.send(Message.prepare("Progressor.Clavator", Progress.info(`ChangeCard Action ${cc.action}`)));
    this.gpg.changeCard(cc, (res: Gpg.Result) => {
      ws.send(Message.prepare("Progressor.Clavator", Progress.info(res.stdOut)));
      ws.send(Message.prepare("Progressor.Clavator", Progress.error(res.stdErr)));
      // send cardlist
    })
    return true;
  }
  public static create(g: Gpg.Gpg) {
    return new GpgChangeCard(g)
  }
}

export default GpgChangeCard;
