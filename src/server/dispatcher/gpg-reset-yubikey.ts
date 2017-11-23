
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';
import * as Gpg from '../../gpg/gpg';
import Result from '../../gpg/result';
import * as Progress from '../../model/progress';
import { Observer } from '../observer';

export class GpgResetYubikey implements Dispatcher {
  public gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): GpgResetYubikey {
    return new GpgResetYubikey(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    console.log('GpgResetYubikey.run', m.header);
    if (m.header.action != 'ResetYubikey') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let header = Message.toHeader(m, 'Progressor.Clavator');
    ws.send(Message.prepare(header,
       Progress.ok('Resetting your Yubikey now. This will take a couple of seconds. ...')));

    this.gpg.resetYubikey((res: Result) => {
      // ws.send(Message.prepare(header, res));
      if (res.stdOut.split('\n').find((i: string) => { return i.startsWith('ERR '); })) {
        res.stdOut.split('\n').forEach((s: string) => {
          ws.send(Message.prepare(header, Progress.fail(s)));
        });
      } else {
        ws.send(Message.prepare(header,
          Progress.ok('Almost done. Remove your Yubikey now and plug it in again.', true)));
        // res.stdOut.split('\n').forEach((s: string) => {
        //   ws.send(Message.prepare('Progressor.Clavator', Progress.ok(s)))
        // })
      }
      ws.send(Message.prepare(header.setAction('GpgResetYubikey.Completed'), null));
    });

    // attributes: string[], stdIn: string, cb: (res: Result) => void)

    // let kg = new KeyGen.KeyGen();
    // let a = JSON.parse(m.data) || {}
    // KeyGen.KeyGen.fill(a, kg)
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    // if (!kg.valid()) {
    //   console.log('valid failed')
    //   ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Failed send KeyGen is not valid')))
    //   return;
    // }
    // console.log('ok:', a);
    // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Mhhh')))
    return true;
  }

}

export default GpgResetYubikey;
