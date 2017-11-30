import * as ws from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import { Result } from '../../gpg/result';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';

export class DeleteSecretKey implements Dispatcher {
  private gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): DeleteSecretKey {
    return new DeleteSecretKey(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public run(myws: ws, m: Message.Message): boolean {
    console.log('DeleteSecretKey.run', m.header);
    if (m.header.action != 'DeleteSecretKey') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let payload = JSON.parse(m.data);
    let header = Message.toHeader(m, 'Progressor.Clavator');
    myws.send(Message.prepare(header,
      Progress.ok('DeleteSecretKey=' + m.data)));
    this.gpg.deleteSecretKey(payload.fpr).subscribe(res => {
      myws.send(Message.prepare(header, Progress.info(res.exec.stdOut)));
      myws.send(Message.prepare(header, Progress.error(res.exec.stdErr)));
      if (res.exec.stdOut.split('\n').find((i: string) => { return i.startsWith('ERR '); })) {
        res.exec.stdOut.split('\n').forEach((s: string) => {
          myws.send(Message.prepare(header, Progress.fail(s)));
        });
      } else {
        this.gpg.deletePublicKey(payload.fpr).subscribe(rs => {
          myws.send(Message.prepare(header, Progress.info(rs.exec.stdOut)));
          myws.send(Message.prepare(header, Progress.error(rs.exec.stdErr)));
          myws.send(Message.prepare(header, Progress.ok('DeleteKey Successfull', true)));
        });
      }
    });
    return true;
  }

}

export default DeleteSecretKey;
