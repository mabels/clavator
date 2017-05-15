import * as WebSocket from 'ws';

// import * as Message from './message';
import * as Observer from './observer';

import * as Gpg from './gpg/gpg';
import * as ListSecretKeys from "./gpg/list_secret_keys";
import WssUpdate from './wss_update'

class GpgListSecretKeysObserver {
  public observer: Observer.Observer;
  public timeoutId: any;
  public gpg: Gpg.Gpg;
  public actionCount: number;
  public prev = new WssUpdate<ListSecretKeys.SecretKey>();

  public static create(gpg: Gpg.Gpg, obs: Observer.Observer): GpgListSecretKeysObserver {
    let glsko = new GpgListSecretKeysObserver();
    glsko.gpg = gpg;
    glsko.actionCount = 0;
    glsko.observer = obs;
    glsko.start();
    glsko.action = glsko.action.bind(glsko);
    return glsko;
  }

  public register(ws: WebSocket) {
    clearTimeout(this.timeoutId);
    this.action([ws]);
  }

  public action(wss = this.observer.wss) {
    this.actionCount++;
    //console.log("actionCount:", this.actionCount, this.observer.wss.length, this.gpg);
    if (!wss.length) {
      return;
    }
    this.gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
      if (err) {
        console.error(err);
        keys = [];
      }
      this.prev.run("KeyChainList", wss, keys, () => {
        this.timeoutId = setTimeout(this.action, 5000);
      });
    });
  }

  public start() {
    // console.log("started");
  }
}

export default GpgListSecretKeysObserver;
