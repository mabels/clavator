
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import { Dispatcher } from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import ChangeCard from '../../gpg/change-card';
// import * as CardStatus from './gpg/card_status';

import * as Progress from '../../model/progress';
// import { Observer } from '../observer';

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match(req => {
    // console.log('GpgChangeCard.run', req.header);
    if (req.action != 'ChangeCard.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    const a = JSON.parse(req.data) || {};
    const cc = ChangeCard.fill(a);
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    const reply = req.reply('Progressor.Clavator');
    if (!cc.valid()) {
      reply.progressFail('Failed received ChangeCard is not valid').send(ret.send);
      return;
    }
    // console.log('>>>', kg.masterCommand())
    reply.progressInfo(`ChangeCard Action`);
    gpg.changeCard(cc).subscribe(res => {
      reply.progressInfo(res.exec.stdOut).send(ret.send);
      reply.progressError(res.exec.stdErr).send(ret.send);
      req.reply('ChangeCard.Completed').send(ret.send);
      // send cardlist
    });
  });
  return ret;
}

export default { create: create };
