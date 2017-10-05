
import * as WebSocket from 'ws';
import * as Message from './message';
import Dispatcher from './dispatcher';

import * as KeyGen from './gpg/key-gen';
import * as ListSecretKeys from './gpg/list_secret_keys';
import * as Gpg from './gpg/gpg';

import * as Progress from './progress';

export class GpgCreateKeySet implements Dispatcher {
  public gpg: Gpg.Gpg;

  public static create(g: Gpg.Gpg): GpgCreateKeySet {
    return new GpgCreateKeySet(g);
  }

  constructor(gpg: Gpg.Gpg) {
    this.gpg = gpg;
  }

  public createSubKeys(header: Message.Header, ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen, cb: () => void): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.length()) {
      // console.log('createSubKeys:2');
      cb();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create subKey:' + cnt)));
    // console.log('createSubKeys:3');
    this.gpg.createSubkey(fpr, ki, ki.subKeys.get(cnt), (res: Gpg.Result) => {
      // console.log('createSubKeys:4');
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      // console.log('createSubKeys:5');
      this.createSubKeys(header, ws, cnt + 1, fpr, ki, cb);
    });

  }

  public addUids(header: Message.Header, ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen, cb: () => void): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.uids.length()) {
      cb();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create Uids:' + cnt)));
    this.gpg.addUid(fpr, ki, ki.uids.get(cnt), (res: Gpg.Result) => {
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      // console.log('createSubKeys:5');
      this.addUids(header, ws, cnt + 1, fpr, ki, cb);
    });
  }

  public run(ws: WebSocket, m: Message.Message): boolean {
    console.log('CreateKeySet.Request', m.header);
    if (m.header.action != 'CreateKeySet.Request') {
      // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Ohh')))
      return false;
    }
    let kg = new KeyGen.KeyGen();
    let a = JSON.parse(m.data) || {};
    KeyGen.KeyGen.fill(a, kg);
    // console.log(m, a, kg)
    // console.log(kg.valid(), kg.errText())
    let header = Message.toHeader(m, 'Progressor.Clavator');
    if (!kg.valid()) {
      ws.send(Message.prepare(header,
        Progress.fail(`Failed send KeyGen is not valid ${kg.errText().join('\n')}`)));
      return;
    }
    // console.log('>>>', kg.masterCommand())
    ws.send(Message.prepare(header, Progress.info(kg.masterCommand())));
    this.gpg.createMasterKey(kg, (res: Gpg.Result) => {
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      this.gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
        if (err) {
          console.error(err);
          return;
        }
        for (let key of keys) {
          for (let uid of key.uids) {
            if (uid.name == kg.uids.first().name.value && uid.email == kg.uids.first().email.value) {
              this.addUids(header, ws, 1, key.fingerPrint.fpr, kg, () => {
                this.createSubKeys(header, ws, 0, key.fingerPrint.fpr, kg, () => {
                  this.gpg.getSecretKey(key.fingerPrint.fpr, (_key: ListSecretKeys.SecretKey) => {
                    if (_key) {
                      ws.send(Message.prepare(header, Progress.ok('KeysetCreated', true)));
                      console.log('CreateKeySet.Completed', header.setAction('CreateKeySet.Completed'));
                      ws.send(Message.prepare(header.setAction('CreateKeySet.Completed'), _key));
                    } else {
                      ws.send(Message.prepare(header, Progress.ok('KeysetFailed', true)));
                      ws.send(Message.prepare(header.setAction('CreateKeySet.Failed')));
                    }
                  });
                });
              });
            }
          }
        }
      });
      // this.gpg
    });
    // create master gpg --expert --gen-key
    // not here gpg --gen-revoke B8EFD59D
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // create subkey --edit-key ...
    // ws.send(Message.prepare('Progressor.Clavator', Progress.fail('Mhhh')))
    return true;
  }

}

export default GpgCreateKeySet;
