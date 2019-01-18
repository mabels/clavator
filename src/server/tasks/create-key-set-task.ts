import * as WebSocket from 'ws';
import { Message, Progress } from '../../model';
import { Gpg, Result } from '../../gpg';
import { KeyGen, SecretKey } from '../../gpg/types';

export class CreateKeySetTask {
  public static run(
    gpg: Gpg,
    ws: WebSocket,
    m: Message.Message,
    kg: KeyGen
  ): Promise<SecretKey> {
    return new Promise((resolve, reject) => {
      let header = Message.toHeader(m, 'Progressor.Clavator');
      if (!kg.valid()) {
        const err = `Failed send KeyGen is not valid ${kg
          .errText()
          .join('\n')}`;
        ws.send(Message.prepare(header, Progress.fail(err)));
        return reject(err);
      }
      // console.log('>>>', kg.masterCommand())
      ws.send(Message.prepare(header, Progress.info(kg.masterCommand())));
      gpg.createMasterKey(kg, (res: Result) => {
        ws.send(Message.prepare(header, Progress.info(res.stdOut)));
        ws.send(Message.prepare(header, Progress.error(res.stdErr)));
        gpg.list_secret_keys(
          (err: string, keys: SecretKey[]) => {
            if (err) {
              console.error(err);
              reject(err);
              return;
            }
            for (let key of keys) {
              for (let uid of key.uids) {
                if (
                  uid.name == kg.uids.first().name.value &&
                  uid.email == kg.uids.first().email.value
                ) {
                  this.addUids(
                    gpg,
                    header,
                    ws,
                    1,
                    key.fingerPrint.fpr,
                    kg,
                    () => {
                      this.createSubKeys(
                        gpg,
                        header,
                        ws,
                        0,
                        key.fingerPrint.fpr,
                        kg,
                        () => {
                          gpg.getSecretKey(
                            key.fingerPrint.fpr,
                            (_key: SecretKey) => {
                              if (_key) {
                                const msg = 'CreateKeySet.Completed';
                                ws.send(
                                  Message.prepare(
                                    header,
                                    Progress.ok('KeysetCreated')
                                  )
                                );
                                ws.send(
                                  Message.prepare(header.setAction(msg), _key)
                                );
                                console.log(
                                  'Done:Resolve:',
                                  msg,
                                  header.setAction(msg)
                                );
                                resolve(_key);
                                return;
                              } else {
                                ws.send(
                                  Message.prepare(
                                    header,
                                    Progress.error('KeysetFailed')
                                  )
                                );
                                ws.send(
                                  Message.prepare(
                                    header.setAction('CreateKeySet.Failed')
                                  )
                                );
                                console.log('Done:Error:');
                                reject('CreateKeySet.Failed');
                                return;
                              }
                            }
                          );
                        }
                      );
                    }
                  );
                }
              }
            }
          }
        );
        // this.gpg
      });
    });
  }
  public static createSubKeys(
    gpg: Gpg,
    header: Message.Header,
    ws: WebSocket,
    cnt: number,
    fpr: string,
    ki: KeyGen,
    cb: () => void
  ): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.length) {
      // console.log('createSubKeys:2');
      cb();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create subKey:' + cnt)));
    // console.log('createSubKeys:3');
    gpg.createSubkey(fpr, ki, ki.subKeys.get(cnt), (res: Result) => {
      // console.log('createSubKeys:4');
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      // console.log('createSubKeys:5');
      this.createSubKeys(gpg, header, ws, cnt + 1, fpr, ki, cb);
    });
  }

  public static addUids(
    gpg: Gpg,
    header: Message.Header,
    ws: WebSocket,
    cnt: number,
    fpr: string,
    ki: KeyGen,
    cb: () => void
  ): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.uids.length) {
      cb();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create Uids:' + cnt)));
    gpg.addUid(fpr, ki, ki.uids.get(cnt), (res: Result) => {
      ws.send(Message.prepare(header, Progress.info(res.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.stdErr)));
      // console.log('createSubKeys:5');
      this.addUids(gpg, header, ws, cnt + 1, fpr, ki, cb);
    });
  }
}
