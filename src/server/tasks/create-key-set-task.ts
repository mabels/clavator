import * as WebSocket from 'ws';
import * as Message from '../../model/message';
import * as KeyGen from '../../gpg/key-gen';
import * as Gpg from '../../gpg/gpg';
// import Result from '../../gpg/result';
// import * as Progress from '../../model/progress';
import * as ListSecretKeys from '../../gpg/list-secret-keys';
// import * as rx from 'rxjs';
import * as rxme from 'rxme';
import { ResultExec } from '../../gpg/result';
// import { ResultObservable, ResultObserver, ResultContainer } from '../../gpg/result';

export default class CreateKeySetTask {

  public static run(gpg: Gpg.Gpg, kg: KeyGen.KeyGen):
    rxme.Observable {
    return rxme.Observable.create(obs => {
      if (!kg.valid()) {
        const err = `Failed send KeyGen is not valid ${kg.errText().join('\n')}`;
        obs.next(rxme.LogError(err));
        obs.complete();
        return;
      }
      gpg.createMasterKey(kg).match(ListSecretKeys.SecretKey.match(res => {
        this.addUids(gpg, 1, res.fingerPrint.fpr, kg).match(ResultExec.match(addUidsRes => {
          this.createSubKeys(gpg, 0, res.fingerPrint.fpr, kg).match(ListSecretKeys.SecretKey.match(cskRes => {
            obs.complete();
            return true;
          })).passTo(obs);
          return true;
        })).passTo(obs);
        return true;
      })).passTo(obs);
      // this.gpg
    });
  }

  private static _createSubKeys(obs: rxme.Observer, gpg: Gpg.Gpg,
    cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    if (cnt >= ki.subKeys.length()) {
      // console.log('createSubKeys:2');
      obs.complete();
      return;
    }
    gpg.createSubkey(fpr, ki, ki.subKeys.get(cnt)).match(ListSecretKeys.SecretKey.match(res => {
      // if (res.doProgress(obs)) { return; }
      // if (res.doError(obs)) { return; }
      // console.log('createSubKeys:4');
      this._createSubKeys(obs, gpg, cnt + 1, fpr, ki);
    })).passTo(obs);
  }

  public static createSubKeys(gpg: Gpg.Gpg, cnt: number, fpr:
    string, ki: KeyGen.KeyGen): rxme.Observable {
    return rxme.Observable.create(obs => {
      this._createSubKeys(obs, gpg, cnt, fpr, ki);
    });
  }

  private static _addUids(obs: rxme.Observer, gpg: Gpg.Gpg, cnt: number, fpr: string, ki: KeyGen.KeyGen): void {
    if (cnt >= ki.uids.length()) {
      obs.complete();
      return;
    }
    gpg.addUid(fpr, ki, ki.uids.get(cnt)).match(ResultExec.match(res => {
      // if (res.doProgress(obs)) { return; }
      // if (res.doError(obs)) { return; }
      // console.log('createSubKeys:5');
      // obs.next(rxme.Msg.Type(res));
      this._addUids(obs, gpg, cnt + 1, fpr, ki);
      // return true;
    })).passTo(obs);
  }
  public static addUids(gpg: Gpg.Gpg, cnt: number, fpr: string, ki: KeyGen.KeyGen): rxme.Observable {
    // console.log('createSubKeys:1', cnt, ki.subKeys.subKeys.length);
    return rxme.Observable.create(obs => {
      this._addUids(obs, gpg, cnt, fpr, ki);
    });
  }
}
