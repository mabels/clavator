
import * as WebSocket from 'ws';
import { Message, Progress } from '../../model';
import { Dispatcher } from '../dispatcher';

import { Result, Gpg } from '../../gpg';
import { ChangeCard } from '../../gpg/types';
import { Observer } from '../observer';

export class GpgChangeCard implements Dispatcher {
  public readonly gpg: Gpg;

  public static create(g: Gpg): GpgChangeCard {
    return new GpgChangeCard(g);
  }

  constructor(g: Gpg) {
    this.gpg = g;
  }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('GpgChangeCard.run', m.header);
    if (m.header.action != 'ChangeCard.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const a = JSON.parse(m.data) || {};
    const cc = ChangeCard.fill(a);
    console.log('run:-1', m.header.action);
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    const header = Message.toHeader(m, 'Progressor.Clavator');
    console.log('run:-2', m.header.action);
    if (!cc.valid) {
      console.log('run:-3', m.header.action, cc);
      ws.send(Message.prepare(header, Progress.fail('Failed received ChangeCard is not valid')));
      return;
    }
    // console.log('>>>', kg.masterCommand())
    console.log('run:-4', m.header.action);
    ws.send(Message.prepare(header, Progress.info(`ChangeCard Action`)));
    console.log('run:-5', m.header.action);
    this.gpg.changeCard(cc, (res: Result) => {
      console.log('run:-6', m.header.action);
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      ws.send(Message.prepare(header.setAction('ChangeCard.Completed')));
      // send cardlist
    });
    return true;
  }

}
