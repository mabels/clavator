
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher, { MessageSubject } from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
import { ResultExec } from '../../gpg/result';

// import * as Progress from '../../model/progress';

import RequestAscii from '../../model/request-ascii';
import RespondAscii from '../../model/respond-ascii';
import * as rxme from 'rxme';

function processResult(m: Message.Message, req: RequestAscii, send: MessageSubject):
  rxme.MatcherCallback {
  return ResultExec.match(res => {
    m.reply('RespondAscii')
        .dataToJson(new RespondAscii(req.action, req.fingerprint, res.stdOut)).send(send);
  });
}

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.match(Message.Message.actionMatch('RequestAscii', req => {
    // console.log('RequestAscii.run', m);
    const payload = RequestAscii.fill(JSON.parse(req.data));
    switch (payload.action) {
      case 'pem-private':
        gpg.pemPrivateKey(payload).match(processResult(req, payload, ret.send));
        break;
      case 'pem-public':
        gpg.pemPublicKey(payload).match(processResult(req, payload, ret.send));
        break;
      case 'pem-revoke':
        gpg.pemRevocation(payload).match(processResult(req, payload, ret.send));
        break;
      case 'ssh-public':
        gpg.sshPublic(payload).match(processResult(req, payload, ret.send));
        break;
      default:
        req.reply('Progressor.Clavator').progressFail('RequestAscii unhandled:' + payload.action).send(ret.send);
    }
  }));
  return ret;
}

export default { create: create };
