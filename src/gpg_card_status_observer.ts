import * as expressWsTs from 'express-ws';

import * as Message from './message';
import * as Observer from './observer';


import * as Gpg from './gpg/gpg';
import * as CardStatus from "./gpg/card_status";

class GpgCardStatusObserver {
  public observer: Observer.Observer;
  public timeoutId: any;
  public gpg: Gpg.Gpg;
  public actionCount: number;
  public static create(gpg: Gpg.Gpg, obs: Observer.Observer) : GpgCardStatusObserver {
      let glsko = new GpgCardStatusObserver();
      glsko.gpg = gpg;
      glsko.actionCount = 0;
      glsko.observer = obs;
      glsko.start();
      return glsko;
  }

  public register(ws: expressWsTs.ExpressWebSocket) {
    clearTimeout(this.timeoutId);
    this.action([ws]);
  }

  public action(wss=this.observer.wss) {
    this.actionCount++;
    //console.log("actionCount:", this.actionCount, this.observer.wss.length, this.gpg);
    if (!wss.length) {
      return;
    }
    this.gpg.card_status((err: string, keys: CardStatus.Gpg2CardStatus[]) => {
      if (err) {
        if (!err.includes("OpenPGP card not available")) {
          console.error(err);
        }
        keys = [];
      }
      let cnt = 0;
      let found = false;
      for (let ws of wss) {
        cnt++;
        found = true;
        ws.send(Message.prepare("CardStatusList", keys), (error: any) => {
          if (--cnt <= 0) {
            this.timeoutId = setTimeout(this.action.bind(this), 5000);
          }
        });
      }
    });
  }

  public start() {
    // console.log("started");
  }

}

export default GpgCardStatusObserver;