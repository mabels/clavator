
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';
import * as Gpg from '../../gpg/gpg';
import { ResultExec } from '../../gpg/result';
// import * as Progress from '../../model/progress';
// import { Observer } from '../observer';

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match(Message.Message.actionMatch('ResetYubikey', req => {
    // console.log('GpgResetYubikey.run', req.header);
    const reply = req.reply('Progressor.Clavator');
    reply.progressOk('Resetting your Yubikey now. This will take a couple of seconds. ...').send(ret.send);

    gpg.resetYubikey().match(ResultExec.match(res => {
      // ws.send(Message.prepare(header, res));
      if (res.stdOut.split(`\n`).find((i: string) => i.startsWith('ERR '))) {
        res.stdOut.split(`\n`).forEach((s: string) => {
          reply.progressFail(s).send(ret.send);
        });
      } else {
        reply.progressOk('Almost done. Remove your Yubikey now and plug it in again.').send(ret.send);
        // res.stdOut.split('\n').forEach((s: string) => {
        //   ws.send(Message.prepare('Progressor.Clavator', Progress.ok(s)))
        // })
      }
      req.reply('GpgResetYubikey.Completed').send(ret.send);
      return true;
    }));

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
  }));
  return ret;
}

export default { create: create };
