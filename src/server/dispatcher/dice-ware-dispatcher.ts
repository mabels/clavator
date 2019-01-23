import * as WebSocket from 'ws';
import { Dispatcher } from '../dispatcher';
import { DiceWare, Diced } from '../../dice-ware';
import { Progress, Message } from '../../model';
import { Observer } from '../observer';

import { DICEWAREWORLDLISTS } from './dice-ware-word-list-data';

export class DiceWareDispatcher implements Dispatcher {
  private static readonly diceWares: DiceWare[] = [];

  public static create(): DiceWareDispatcher {
    return new DiceWareDispatcher();
  }

  private static listToDiceWare(fname: string, body: string): DiceWare {
    const list = body
      .split(/\r?\n/)
      .map(line => Diced.parse(line))
      .filter(d => d);
    // console.log('listToDiceWare:', list);
    return new DiceWare(fname, list);
  }

  private static moduleToDiceWare(): Promise<DiceWare[]> {
    if (DiceWareDispatcher.diceWares.length > 0) {
      return Promise.resolve(DiceWareDispatcher.diceWares);
    }
    return new Promise((rs, rj) => {
      DICEWAREWORLDLISTS.then(diceWordLists => {
        Array.prototype.push.apply(
          DiceWareDispatcher.diceWares,
          diceWordLists.map(wl =>
            DiceWareDispatcher.listToDiceWare(wl.url, wl.body)
          )
        );
        rs(DiceWareDispatcher.diceWares);
      }).catch(rj);
    });
  }

  public static get(): Promise<DiceWare[]> {
    return new Promise((resolv, reject) => {
      resolv(DiceWareDispatcher.moduleToDiceWare());
    });
  }

  // public static read(fname: string): Promise<DiceWare> {
  //   return new Promise((resolve, reject) => {
  //     fsExtra.readFile(fname).then(file => {
  //       const list = file.toString('utf-8').split(/\r?\n/).map(line => Diced.parse(line)).filter(d => d);
  //       // console.log('DiceWareDispatcher.read:', list);
  //       resolve(new DiceWare(fname, list));
  //     }).catch(reject);
  //   });
  // }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('DiceWareDispatcher.run', m.header);
    if (m.header.action != 'DiceWares.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const header = Message.toHeader(m, 'Progressor.Clavator');
    DiceWareDispatcher.get()
      .then(diceWares => {
        console.log(JSON.stringify(diceWares[0]));
        ws.send(
          Message.prepare(header, Progress.info(`DiceWareRequest Action`))
        );
        // console.log('DiceWares.Response:', JSON.stringify(diceWares[0]));
        ws.send(
          Message.prepare(
            header.setAction('DiceWares.Response'),
            diceWares.map(dw => dw.toObj())
          )
        );
      })
      .catch(_ => {
        console.log('error:', _);
        ws.send(
          Message.prepare(header, Progress.fail('can not read diceware file'))
        );
      });
    return true;
  }
}
