import * as ws from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import { Result } from '../../gpg/result';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match((_, req) => {
    // console.log('DeleteSecretKey.run', req.header);
    if (req.header.action != 'DeleteSecretKey') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const payload = JSON.parse(req.data);
    const reply = req.reply('Progressor.Clavator');
    reply.progressOk(`DeleteSecretKey=${req.data}`).send(ret.send);
    gpg.deleteSecretKey(payload.fpr).match((_, res) => {
      reply.progressInfo(res.stdOut).send(ret.send);
      reply.progressError(res.stdErr).send(ret.send);
      if (res.stdOut.split('\n').find((i: string) => { return i.startsWith('ERR '); })) {
        res.stdOut.split('\n').forEach((s: string) => {
          reply.progressFail(s).send(ret.send);
        });
      } else {
        gpg.deletePublicKey(payload.fpr).match((__, rs) => {
          reply.progressInfo(rs.stdOut).send(ret.send);
          reply.progressError(rs.stdErr).send(ret.send);
          reply.progressOk('DeleteKey Successfull').send(ret.send);
          return true;
        }).passTo();
      }
      return true;
    });
  });
  return ret;
}

export default { create: create };
