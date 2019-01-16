import * as WebSocket from 'ws';
// import * as Message from './message';

import * as Gpg from '../gpg/gpg';
import GpgListSecretKeysObserver from './observer/gpg-list-secret-keys-observer';
import GpgCardStatusObserver from './observer/gpg-card-status-observer';

export class Observer {
  public wss: WebSocket[] = [];
  public gpgListSecretKeysObserver: GpgListSecretKeysObserver;
  public gpgCardStatusObserver: GpgCardStatusObserver;

  public static start(gpg: Gpg.Gpg): Observer {
    console.log('Observer.start');
    let obs = new Observer();
    obs.gpgListSecretKeysObserver = GpgListSecretKeysObserver.create(gpg, obs);
    obs.gpgCardStatusObserver = GpgCardStatusObserver.create(gpg, obs);
    return obs;
  }

  public suspend(): void {
    this.gpgListSecretKeysObserver.suspend();
    this.gpgCardStatusObserver.suspend();
  }

  public resume(): void {
    this.gpgListSecretKeysObserver.resume();
    this.gpgCardStatusObserver.resume();
  }

  public register(ws: WebSocket): void {
    this.wss.push(ws);
    this.gpgListSecretKeysObserver.register(ws);
    this.gpgCardStatusObserver.register(ws);
  }

  public unregister(ws: WebSocket): void {
    this.wss = this.wss.filter(item => item !== ws);
  }
}

export function start(gpg: Gpg.Gpg): Observer {
  return Observer.start(gpg);
}
