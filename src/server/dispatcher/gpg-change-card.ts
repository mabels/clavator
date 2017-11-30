
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import ChangeCard from '../../gpg/change-card';
// import * as CardStatus from './gpg/card_status';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';

export class GpgChangeCard implements Dispatcher {
  public gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): GpgChangeCard {
    return new GpgChangeCard(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    console.log('GpgChangeCard.run', m.header);
    if (m.header.action != 'ChangeCard.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let a = JSON.parse(m.data) || {};
    let cc = ChangeCard.fill(a);
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    let header = Message.toHeader(m, 'Progressor.Clavator');
    if (!cc.valid()) {
      ws.send(Message.prepare(header, Progress.fail('Failed received ChangeCard is not valid')));
      return;
    }
    // console.log('>>>', kg.masterCommand())
    ws.send(Message.prepare(header, Progress.info(`ChangeCard Action`)));
    this.gpg.changeCard(cc).subscribe(res => {
      ws.send(Message.prepare(header, Progress.info(res.exec.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.exec.stdErr)));
      ws.send(Message.prepare(header.setAction('ChangeCard.Completed')));
      // send cardlist
    });
    return true;
  }

}

export default GpgChangeCard;
