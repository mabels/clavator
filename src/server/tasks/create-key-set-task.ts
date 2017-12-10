import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import * as KeyGen from '../../gpg/key-gen';
import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
import * as Progress from '../../model/progress';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
// import * as rx from 'rxjs';
import * as rxme from 'rxme';
// import { ResultObservable, ResultObserver, ResultContainer } from '../../gpg/result';

export default class CreateKeySetTask {

  public static run(gpg: Gpg.Gpg, kg: KeyGen.KeyGen):
    rxme.Observable<ListSecretKeys.SecretKey> {
    return rxme.Observable.create(ListSecretKeys.SecretKey, (obs: rxme.Observer<ListSecretKeys.SecretKey>) => {
      if (!kg.valid()) {
        const err = `Failed send KeyGen is not valid ${kg.errText().join('\n')}`;
        obs.next(ResultContainer.builder<ListSecretKeys.SecretKey>(gpg.gpgCmds.gpg.resultQueue)
          .setNodeError(new Error(err)));
        obs.complete();
        return;
      }
      gpg.createMasterKey(kg).match((_, res) => {
        this.addUids(gpg, 1, res.fingerPrint.fpr, kg).match((__, addUidsRes) => {
          this.createSubKeys(gpg, 0, res.fingerPrint.fpr, kg).match((___, cskRes) => {
            cskRes.doComplete(obs);
            return true;
          }).passTo(obs);
          return true;
        }).passTo(obs);
        return true;
      }).passTo(obs);
      // this.gpg
    });
  }

  private static _createSubKeys(obs: rxme.Observer<ListSecretKeys.SecretKey>, gpg: Gpg.Gpg,
    cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.length()) {
      // console.log('createSubKeys:2');
      obs.complete();
      return;
    }
    gpg.createSubkey(fpr, ki, ki.subKeys.get(cnt)).match((_, res) => {
      // if (res.doProgress(obs)) { return; }
      // if (res.doError(obs)) { return; }
      // console.log('createSubKeys:4');
      obs.next(rxme.data(res));
      this._createSubKeys(obs, gpg, cnt + 1, fpr, ki);
      return true;
    }).passTo(obs);
  }
  public static createSubKeys(gpg: Gpg.Gpg, cnt: number, fpr:
    string, ki: KeyGen.KeyGen): rxme.Observable<ListSecretKeys.SecretKey> {
    return rxme.Observable.create(ListSecretKeys.SecretKey, (obs: rxme.Observer<ListSecretKeys.SecretKey>) => {
      this._createSubKeys(obs, gpg, cnt, fpr, ki);
    });
  }

  private static _addUids(obs: rxme.Observer<void>, gpg: Gpg.Gpg, cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    if (cnt >= ki.uids.length()) {
      obs.complete();
      return;
    }
    gpg.addUid(fpr, ki, ki.uids.get(cnt)).match((_, res) => {
      // if (res.doProgress(obs)) { return; }
      // if (res.doError(obs)) { return; }
      // console.log('createSubKeys:5');
      obs.next(rxme.data(res));
      this._addUids(obs, gpg, cnt + 1, fpr, ki);
      return true;
    }).passTo(obs);
  }
  public static addUids(gpg: Gpg.Gpg, cnt: number, fpr: string, ki: KeyGen.KeyGen): rxme.Observable<void> {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    return rxme.Observable.create(null, (obs: rxme.Observer<void>) => {
      this._addUids(obs, gpg, cnt, fpr, ki);
    });
  }
}
