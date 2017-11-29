import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import * as KeyGen from '../../gpg/key-gen';
import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import * as Progress from '../../model/progress';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
import * as rx from 'rxjs';
import { ResultObservable, ResultObserver, ResultContainer } from '../../gpg/result';

export default class CreateKeySetTask {

  public static run(gpg: Gpg.Gpg, ws: WebSocket, m: Message.Message, kg: KeyGen.KeyGen):
    ResultObservable<ListSecretKeys.SecretKey> {
    return rx.Observable.create((obs: ResultObserver<ListSecretKeys.SecretKey>) => {
      let header = Message.toHeader(m, 'Progressor.Clavator');
      if (!kg.valid()) {
        const err = `Failed send KeyGen is not valid ${kg.errText().join('\n')}`;
        ws.send(Message.prepare(header, Progress.fail(err)));
        obs.next(ResultContainer.builder<ListSecretKeys.SecretKey>(gpg.gpgCmds.gpg.resultQueue)
          .setNodeError(new Error(err)));
        obs.complete();
        return;
      }
      // console.log('>>>', kg.masterCommand())
      ws.send(Message.prepare(header, Progress.info(kg.masterCommand())));
      gpg.createMasterKey(kg).subscribe(res => {
        ws.send(Message.prepare(header, Progress.info(res.exec.stdOut)));
        ws.send(Message.prepare(header, Progress.error(res.exec.stdErr)));
        if (res.doProgress(obs)) { return; }
        if (res.doError(obs)) { return; }
        gpg.list_secret_keys().subscribe(rckey => {
          if (rckey.doProgress(obs)) { return; }
          if (rckey.doError(obs)) { return; }
          const key = rckey.data;
          for (let uid of key.uids) {
            if (uid.name == kg.uids.first().name.value && uid.email == kg.uids.first().email.value) {
              this.addUids(gpg, header, ws, 1, key.fingerPrint.fpr, kg).subscribe(addUidsRes => {
                if (addUidsRes.doProgress(obs)) { return; }
                if (addUidsRes.doError(obs)) { return; }
                this.createSubKeys(gpg, header, ws, 0, key.fingerPrint.fpr, kg).subscribe(cskRes => {
                  if (cskRes.doProgress(obs)) { return; }
                  if (cskRes.doError(obs)) { return; }
                  gpg.getSecretKey(key.fingerPrint.fpr).subscribe(_key => {
                    if (_key.doProgress(obs)) { return; }
                    if (_key.doError(obs)) { return; }
                    if (_key.isOk()) {
                      const msg = 'CreateKeySet.Completed';
                      ws.send(Message.prepare(header, Progress.ok('KeysetCreated')));
                      ws.send(Message.prepare(header.setAction(msg), _key));
                      console.log('Done:Resolve:', msg, header.setAction(msg));
                    } else {
                      ws.send(Message.prepare(header, Progress.error('KeysetFailed')));
                      ws.send(Message.prepare(header.setAction('CreateKeySet.Failed')));
                      console.log('Done:Error:');
                    }
                    _key.doComplete(obs);
                  });
                });
              });
            }
          }
        });
        // this.gpg
      });
    });
  }

  private static _createSubKeys(obs: ResultObserver<void>, gpg: Gpg.Gpg, header: Message.Header,
    ws: WebSocket, cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.length()) {
      // console.log('createSubKeys:2');
      obs.complete();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create subKey:' + cnt)));
    // console.log('createSubKeys:3');
    gpg.createSubkey(fpr, ki, ki.subKeys.get(cnt)).subscribe(res => {
      if (res.doProgress(obs)) { return; }
      if (res.doError(obs)) { return; }
      // console.log('createSubKeys:4');
      ws.send(Message.prepare(header, Progress.info(res.exec.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.exec.stdErr)));
      // console.log('createSubKeys:5');
      obs.next(res);
      this._createSubKeys(obs, gpg, header, ws, cnt + 1, fpr, ki);
    });
  }
  public static createSubKeys(gpg: Gpg.Gpg, header: Message.Header, ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen): ResultObservable<void> {
    return rx.Observable.create((obs: ResultObserver<void>) => {
      this._createSubKeys(obs, gpg, header, ws, cnt, fpr, ki);
    });
  }

  private static _addUids(obs: ResultObserver<void>, gpg: Gpg.Gpg, header: Message.Header,
    ws: WebSocket, cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    if (cnt >= ki.uids.length()) {
      obs.complete();
      return;
    }
    ws.send(Message.prepare(header, Progress.info('create Uids:' + cnt)));
    gpg.addUid(fpr, ki, ki.uids.get(cnt)).subscribe(res => {
      if (res.doProgress(obs)) { return; }
      if (res.doError(obs)) { return; }
      ws.send(Message.prepare(header, Progress.info(res.exec.stdOut)));
      ws.send(Message.prepare(header, Progress.error(res.exec.stdErr)));
      // console.log('createSubKeys:5');
      obs.next(res);
      this._addUids(obs, gpg, header, ws, cnt + 1, fpr, ki);
    });
  }
  public static addUids(gpg: Gpg.Gpg, header: Message.Header, ws: WebSocket, cnt: number, fpr:
    string, ki: KeyGen.KeyGen): ResultObservable<void> {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    return rx.Observable.create((obs: ResultObserver<void>) => {
      this._addUids(obs, gpg, header, ws, cnt, fpr, ki);
    });
  }
}
