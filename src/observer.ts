
import * as expressWsTs from 'express-ws';

import * as Gpg from './gpg/gpg';
import * as ListSecretKeys from "./gpg/list_secret_keys";


class GpgListSecretKeysObserver {
  public observer: Observer;
  public timeoutId: any;
  public gpg: Gpg.Gpg;
  public actionCount: number;
  public static create(gpg: Gpg.Gpg, obs: Observer) : GpgListSecretKeysObserver {
      let glsko = new GpgListSecretKeysObserver();
      glsko.gpg = gpg;
      glsko.actionCount = 0;
      glsko.observer = obs;
      glsko.start();
      return glsko;
  }

  public register(ws: expressWsTs.ExpressWebSocket) {
    if (this.observer.wss.length == 1) {
      clearTimeout(this.timeoutId);
      this.action();
    } else {
      ws.send("Init-Message");
    }
  }

  public action() {
    this.actionCount++;
    console.log("actionCount:", this.actionCount, this.observer.wss.length, this.gpg);
    if (!this.observer.wss.length) {
      return;
    }
    this.gpg.list_secret_keys((err: string, keys: ListSecretKeys.SecretKey[]) => {
      if (err) {
        console.error(err);
        return;
      }
      let cnt = 0;
      let found = false;
      for (let ws of this.observer.wss) {
        cnt++;
        found = true;
        console.log("sending", cnt);
        ws.send(JSON.stringify(keys), (error: any) => {
          console.log("completed", cnt);
          if (--cnt <= 0) {
            this.timeoutId = setTimeout(this.action.bind(this), 5000);
          }
        });
      }
      if (!found) {
        this.timeoutId = setTimeout(this.action.bind(this), 5000);
      }
    });
  }

  public start() {
    console.log("started");
  }

}

class Observer {
    public wss : expressWsTs.ExpressWebSocket[] = [];
    public gpgListSecretKeysObserver : GpgListSecretKeysObserver;
    public register(ws: expressWsTs.ExpressWebSocket) {
      this.wss.push(ws);
      this.gpgListSecretKeysObserver.register(ws);
    }

    public unregister(ws: expressWsTs.ExpressWebSocket) {
      this.wss = this.wss.filter(item => item !== ws);
    }

    public static start(gpg: Gpg.Gpg) : Observer {
      console.log("Observer.start");
      let obs = new Observer();
      obs.gpgListSecretKeysObserver = GpgListSecretKeysObserver.create(gpg, obs);
      return obs;
    }
}

export function start(gpg: Gpg.Gpg) : Observer {
    return Observer.start(gpg);
}
