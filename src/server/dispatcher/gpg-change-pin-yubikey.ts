
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import RequestChangePin from '../../gpg/request-change-pin';
// import { Observer } from '../observer';

import * as Progress from '../../model/progress';

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match((_, req) => {
    // console.log('GpgChangePinYubikey.run', req.header);
    if (req.header.action != 'GpgChangePinYubikey.run') {
      return false;
    }
    const a = JSON.parse(req.data) || {};
    const rcp = RequestChangePin.fill(a);
    const reply = req.reply('Progressor.Clavator');
    reply.progressOk(`ChangePin your Yubikey now:${rcp.action} ...`).send(ret.send);

    gpg.changePin(rcp.action, rcp).match((_, res) => {
      if (res.isError()) {
        reply.progressFail(`${res.exec.stdOut}\n${res.exec.stdErr}`).send(ret.send);
      } else {
        reply.progressOk(`pin for ${rcp.action} changed`).send(ret.send);
      }
      req.reply('GpgChangePinYubikey.Completed').send(ret.send);
    }).passTo();
    return true;
  });
  return ret;
}

export default { create: create };
