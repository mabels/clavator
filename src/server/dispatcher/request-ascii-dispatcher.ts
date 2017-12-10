
import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import Dispatcher, { MessageSubject } from '../dispatcher';

import * as Gpg from '../../gpg/gpg';
import { } from '../../gpg/result';

import * as Progress from '../../model/progress';

import RequestAscii from '../../model/request-ascii';
import RespondAscii from '../../model/respond-ascii';
import * as rxme from 'rxme';
// import { Observer } from '../observer';

function processResult(m: Message.Message, req: RequestAscii, send: MessageSubject):
  (res: ResultContainer<any>) => void {
  return (res: ResultContainer<string>) => {
    if (res.isProgress()) {
      m.reply('Progressor.Clavator').progressInfo(JSON.stringify(res.progress)).send(send);
      return;
    }
    if (res.isError()) {
      m.reply('Progressor.Clavator').progressError(JSON.stringify(res)).send(send);
      return;
    }
    m.reply('RespondAscii')
        .dataToJson(new RespondAscii(req.action, req.fingerprint, res.exec.stdOut)).send(send);
  };
}

export function create(gpg: Gpg.Gpg): Dispatcher {
  const ret = new Dispatcher();
  ret.recv.subscribe(req => {
    if (req.header.action != 'RequestAscii') {
      return;
    }
    // console.log('RequestAscii.run', m);
    const payload = RequestAscii.fill(JSON.parse(req.data));
    switch (payload.action) {
      case 'pem-private':
        gpg.pemPrivateKey(payload).subscribe(processResult(req, payload, ret.send));
        break;
      case 'pem-public':
        gpg.pemPublicKey(payload).subscribe(processResult(req, payload, ret.send));
        break;
      case 'pem-revoke':
        gpg.pemRevocation(payload).subscribe(processResult(req, payload, ret.send));
        break;
      case 'ssh-public':
        gpg.sshPublic(payload).subscribe(processResult(req, payload, ret.send));
        break;
      default:
        req.reply('Progressor.Clavator').progressFail('RequestAscii unhandled:' + payload.action).send(ret.send);
    }
  });
  return ret;
}

export default { create: create };
