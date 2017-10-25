
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';
import * as fsExtra from 'fs-extra';

import { DiceWare, Diced } from '../../dice-ware/dice-ware';
// import * as CardStatus from './gpg/card_status';

import * as Progress from '../../model/progress';

export class DiceWareDispatcher implements Dispatcher {

  public static create(): DiceWareDispatcher {
    return new DiceWareDispatcher();
  }

  public static read(fname = './src/dice-ware/eff_large_wordlist.txt'): Promise<DiceWare> {
    return new Promise((resolve, reject) => {
      fsExtra.readFile(fname).then(file => {
        const list = file.toString('utf-8').split(/\r?\n/).map(line => Diced.parse(line)).filter(d => d);
        resolve(new DiceWare(fname, list));
      }).catch(reject);
    });
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    console.log('DiceWareDispatcher.run', m.header);
    if (m.header.action != 'DiceWare.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let header = Message.toHeader(m, 'Progressor.Clavator');
    DiceWareDispatcher.read().then(diceWare => {
      ws.send(Message.prepare(header, Progress.info(`DiceWareRequest Action`)));
      // console.log('DiceWare.Response:', diceWare);
      ws.send(Message.prepare(header.setAction('DiceWare.Response'), diceWare.toObject()));
    }).catch(_ => {
      ws.send(Message.prepare(header, Progress.fail('can not read diceware file')));
    });
    return true;
  }

}

export default DiceWareDispatcher;
