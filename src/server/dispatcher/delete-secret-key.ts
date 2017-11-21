import * as ws from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';

import * as Progress from '../../model/progress';
import { Observer } from '../observer';

export class DeleteSecretKey implements Dispatcher {
  private gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): DeleteSecretKey {
    return new DeleteSecretKey(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public run(observer: Observer, myws: ws, m: Message.Message): boolean {
    console.log('DeleteSecretKey.run', m.header);
    if (m.header.action != 'DeleteSecretKey') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let payload = JSON.parse(m.data);
    let header = Message.toHeader(m, 'Progressor.Clavator');
    myws.send(Message.prepare(header,
      Progress.ok('DeleteSecretKey=' + m.data)));
    this.gpg.deleteSecretKey(payload.fpr, (res: Gpg.Result) => {
      myws.send(Message.prepare(header, Progress.info(res.stdOut)));
      myws.send(Message.prepare(header, Progress.error(res.stdErr)));
      if (res.stdOut.split('\n').find((i: string) => { return i.startsWith('ERR '); })) {
        res.stdOut.split('\n').forEach((s: string) => {
          myws.send(Message.prepare(header, Progress.fail(s)));
        });
      } else {
        this.gpg.deletePublicKey(payload.fpr, (rs: Gpg.Result) => {
          myws.send(Message.prepare(header, Progress.info(rs.stdOut)));
          myws.send(Message.prepare(header, Progress.error(rs.stdErr)));
          myws.send(Message.prepare(header, Progress.ok('DeleteKey Successfull', true)));
        });
      }
    });
    return true;
  }

}

export default DeleteSecretKey;
