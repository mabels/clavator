
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher';

import * as Gpg from './gpg/gpg';

import * as Progress from './progress';

import RequestAscii from './gpg/request_ascii';
import RespondAscii from './respond_ascii';

export class RequestAsciiDispatcher implements Dispatcher {
  private gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): RequestAsciiDispatcher {
    return new RequestAsciiDispatcher(g);
  }

  constructor(g: Gpg.Gpg) {
    this.gpg = g;
  }

  public processResult(header: Message.Header, ws: WebSocket, req: RequestAscii): (res: Gpg.Result) => void {
    return (res: Gpg.Result) => {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.ok(res.stdOut)));
      console.log('send:RespondAscii');
      ws.send(Message.prepare(header.setAction('RespondAscii'),
        new RespondAscii(req.action, req.fingerprint, res.stdOut)));
    };
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    if (m.header.action != 'RequestAscii') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    console.log('RequestAscii.run', m);
    let payload = RequestAscii.fill(JSON.parse(m.data));
    // ws.send(Message.prepare('Progressor.Clavator',
    //   Progress.ok('RequestAscii='+m.data)))
    switch (payload.action) {
      case 'pem-private':
        this.gpg.pemPrivateKey(payload, this.processResult(m.header, ws, payload));
        break;
      case 'pem-public':
        this.gpg.pemPublicKey(payload, this.processResult(m.header, ws, payload));
        break;
      case 'pem-revoke':
        this.gpg.pemRevocation(payload, this.processResult(m.header, ws, payload));
        break;
      case 'ssh-public':
        this.gpg.sshPublic(payload, this.processResult(m.header, ws, payload));
        break;
      default:
        ws.send(Message.prepare(m.header.setAction('Progressor.Clavator'),
          Progress.fail('RequestAscii unhandled:' + payload.action)));
    }
    return true;
  }

}

export default RequestAsciiDispatcher;
