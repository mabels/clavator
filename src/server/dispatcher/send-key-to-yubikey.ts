import * as WebSocket from 'ws';
import { Dispatcher } from '../dispatcher';

import { Message, Progress } from '../../model';
import { Result, Gpg } from '../../gpg';
import { SecretKey } from '../../gpg/types';

import { SimpleYubikey } from '../../ui/model';
import { CreateKeySetTask } from '../tasks/create-key-set-task';
import { Observer } from '../observer';

export class SendKeyToYubiKey implements Dispatcher {
  private readonly gpg: Gpg;

  public static create(g: Gpg): SendKeyToYubiKey {
    return new SendKeyToYubiKey(g);
  }

  constructor(g: Gpg) {
    this.gpg = g;
  }

  private sendKeysToCard(
    observer: Observer,
    ws: WebSocket,
    header: Message.Header,
    ksk: SecretKey,
    syk: SimpleYubikey,
    idx = 0
  ): void {
    if (idx == 0) {
      console.log('start-suspend observer');
      observer.suspend();
    }
    if (idx >= ksk.subKeys.length) {
      ws.send(Message.prepare(header.setAction('SimpleYubiKey.Completed')));
      console.log('completed-resume observer');
      observer.resume();
      return;
    }
    const subkey = ksk.subKeys[idx];
    ws.send(
      Message.prepare(
        header,
        Progress.ok(`start keyToYubiKey for ${subkey.fingerPrint.fpr}:${idx}`)
      )
    );
    this.gpg.keyToYubiKey(
      syk.asKeyToYubiKey(subkey.fingerPrint.fpr, idx + 1),
      (res: Result) => {
        if (res.exitCode != 0) {
          console.error('error-resume observer', res, res.runQueue[0]);
          // observer.resume();
          ws.send(
            Message.prepare(
              header,
              Progress.fail(res.stdOut + '\n' + res.stdErr)
            )
          );
        } else {
          ws.send(
            Message.prepare(
              header,
              Progress.ok(
                `keyToYubiKey for ${subkey.fingerPrint.fpr}:${idx} changed`,
                true
              )
            )
          );
          this.sendKeysToCard(observer, ws, header, ksk, syk, idx + 1);
        }
      }
    );
  }

  public run(observer: Observer, ws: WebSocket, m: Message.Message): boolean {
    if (m.header.action != 'SimpleYubiKey.run') {
      return false;
    }
    console.log('SimpleYubiKey.run', m.header);
    let a = JSON.parse(m.data) || {};
    let syk = SimpleYubikey.fill(a);
    let header = m.header.setAction('Progressor.Clavator');

    console.log(
      'SimpleYubiKey',
      syk.toObj(),
      syk.asKeyGen().password,
      syk.asKeyGen().password.valid
    );
    ws.send(Message.prepare(header, Progress.ok(`SimpleYubiKey:${syk} ...`)));
    CreateKeySetTask.run(this.gpg, ws, m, syk.asKeyGen())
      .then((ksk: SecretKey) => {
        console.log('then:CreateKeySetTask:');
        ws.send(
          Message.prepare(
            header,
            Progress.ok(`SimpleYubiKey:completed:create-key-gpg`)
          )
        );
        this.sendKeysToCard(observer, ws, header, ksk, syk);
      })
      .catch(err => {
        console.log('catch:CreateKeySetTask:', err);
        ws.send(
          Message.prepare(
            header,
            Progress.fail(`SimpleYubiKey:fail:create-key-gpg`)
          )
        );
      });

    // this.gpg.keyToYubiKey(rcp, (res: Gpg.Result) => {
    //   if (res.exitCode != 0) {
    //     ws.send(Message.prepare(header, Progress.fail(res.stdOut + '\n' + res.stdErr)));
    //   } else {
    //     ws.send(Message.prepare(header, Progress.ok(`keyToYubiKey for ${rcp} changed`, true)));
    //   }
    // });
    return true;
  }
}
