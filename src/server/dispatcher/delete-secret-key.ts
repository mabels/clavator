import * as ws from 'ws';
import { Dispatcher } from '../dispatcher';

import { Gpg, Result } from '../../gpg';
import { Observer } from '../observer';

import { Progress, Message } from '../../model';

export class DeleteSecretKey implements Dispatcher {
  private gpg: Gpg;

  public static create(g: Gpg): DeleteSecretKey {
    return new DeleteSecretKey(g);
  }

  constructor(g: Gpg) {
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
    myws.send(
      Message.prepare(header, Progress.ok('DeleteSecretKey=' + m.data))
    );
    this.gpg.deleteSecretKey(payload.fpr, (res: Result) => {
      myws.send(Message.prepare(header, Progress.info(res.stdOut)));
      myws.send(Message.prepare(header, Progress.error(res.stdErr)));
      if (
        res.stdOut.split('\n').find((i: string) => {
          return i.startsWith('ERR ');
        })
      ) {
        res.stdOut.split('\n').forEach((s: string) => {
          myws.send(Message.prepare(header, Progress.fail(s)));
        });
      } else {
        this.gpg.deletePublicKey(payload.fpr, (rs: Result) => {
          myws.send(Message.prepare(header, Progress.info(rs.stdOut)));
          myws.send(Message.prepare(header, Progress.error(rs.stdErr)));
          myws.send(
            Message.prepare(header, Progress.ok('DeleteKey Successfull', true))
          );
        });
      }
    });
    return true;
  }
}
