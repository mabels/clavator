
// import * as WebSocket from 'ws';
// import * as Message from './message';

import * as Gpg from '../gpg/gpg';
import * as ListSecretKeys from '../gpg/list-secret-keys';
import * as CardStatus from '../gpg/card-status';
import * as rxme from 'rxme';
// import { globalAgent } from 'https';

class Monitor<T> {
  public timeoutId: any;
  public readonly gpg: Gpg.Gpg;
  public actionCount: number;
  public ros: rxme.Observer<T>[];
  public prev: T;
  public readonly _action: (this: Monitor<T>, ros: rxme.Observer<T>[], force: boolean) => void;

  public static create<T>(gpg: Gpg.Gpg,
    _action: (this: Monitor<T>, ros: rxme.Observer<T>[], force: boolean) => void): rxme.Observable<T> {
    const monitor = new Monitor<T>(gpg, _action);
    return rxme.Observable.create(T, (obs: rxme.Observer<T>) => {
      monitor.register(obs);
      return () => monitor.unregister(obs);
    });
  }

  private constructor(gpg: Gpg.Gpg, _action: (this: Monitor<T>,
    ros: rxme.Observer<T>[], force: boolean) => void) {
    this._action = _action;
    this.action = this.action.bind(this);
    this.gpg = gpg;
    this.actionCount = 0;
    this.ros = [];
  }

  public register(obs: rxme.Observer<T>): void {
    clearTimeout(this.timeoutId);
    this.ros.push(obs);
    this.action(obs);
  }

  public unregister(obs: rxme.Observer<T>): void {
    console.log('unregister');
    this.ros = this.ros.filter(o => o !== obs);
    if (!this.ros.length) {
      clearTimeout(this.timeoutId);
    }
  }

  public resume(): void {
    this.timeoutId = setTimeout(this.action, 5000);
  }

  public action(newros: rxme.Observer<T>): void {
    let ros = this.ros;
    if (newros) {
      ros = [newros];
    }
    if (!ros.length) {
      return;
    }
    this.actionCount++;
    this._action(ros, !!newros);
  }

}

function equals(a: any, b: any): boolean {
  if (a.length != b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (!a[i].eq(b[i])) {
      return false;
    }
  }
  return true;
}

function gpgListSecretKeysMonitor(this: Monitor<ListSecretKeys.SecretKey[]>,
  ros: rxme.Observer<ListSecretKeys.SecretKey[]>[], force: boolean): void {
  // console.log('y', ros.length, force);
  const keys: ListSecretKeys.SecretKey[] = [];
  this.gpg.list_secret_keys().subscribe(key => {
    if (key.doProgress(ros)) { return; }
    if (key.doError(ros)) { return; }
    keys.push(key.data);
  }, null, () => {
    if (force || !this.prev || !equals(this.prev, keys)) {
      this.prev = keys;
      // console.log('x', ros.length, force);
      ros.forEach(obs => {
        // console.log('z', ros.length, force);
        obs.next(ResultContainer.builder<ListSecretKeys.SecretKey[]>(this.gpg.resultQueue()).setData(keys));
      });
    }
    this.timeoutId = setTimeout(this.action, 5000);
  });
}
function gpgCardStatusMonitor(this: Monitor<CardStatus.Gpg2CardStatus[]>,
  ros: rxme.Observer<CardStatus.Gpg2CardStatus[]>[], force: boolean): void {
  // console.log(ros.length, force);
  const keys: CardStatus.Gpg2CardStatus[] = [];
  this.gpg.card_status().subscribe(key => {
    if (key.doProgress(ros)) { return; }
    if (key.doError(ros)) { return; }
    keys.push(key.data);
  }, null, () => {
    if (force || !this.prev || !equals(this.prev, keys)) {
      this.prev = keys;
      ros.forEach(obs => {
        obs.next(ResultContainer.builder<CardStatus.Gpg2CardStatus[]>(this.gpg.resultQueue()).setData(keys));
      });
    }
    this.timeoutId = setTimeout(this.action, 5000);
  });
}

export function start(gpg: Gpg.Gpg): rxme.Observable<any> {
  console.log('Monitor.start');
  const glskm = Monitor.create(gpg, gpgListSecretKeysMonitor);
  const gcsm = Monitor.create(gpg, gpgCardStatusMonitor);
  return rxme.Observable.create((obs: rxme.Observer<any>) => {
    const sglskm = glskm.subscribe(globs => {
      obs.next(globs);
    });
    const sgcsm = gcsm.subscribe(globs => {
      obs.next(globs);
    });
    return () => {
      console.log('monitor unsubscribe:');
      sglskm.unsubscribe();
      sgcsm.unsubscribe();
    };
  });
}
