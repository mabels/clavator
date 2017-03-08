import * as WebSocket from 'ws';

import * as Message from './message';
import * as Observer from './observer';


import * as Gpg from './gpg/gpg';
import * as CardStatus from "./gpg/card_status";
import WssUpdate from './wss_update';

class GpgCardStatusObserver {
  public observer: Observer.Observer;
  public timeoutId: any;
  public gpg: Gpg.Gpg;
  public actionCount: number;
  public prev = new WssUpdate<CardStatus.Gpg2CardStatus>();

  constructor() {
    this.action = this.action.bind(this);
  }

  public static create(gpg: Gpg.Gpg, obs: Observer.Observer) : GpgCardStatusObserver {
      let glsko = new GpgCardStatusObserver();
      glsko.gpg = gpg;
      glsko.actionCount = 0;
      glsko.observer = obs;
      glsko.action = glsko.action.bind(glsko);
      glsko.start();
      return glsko;
  }

  public register(ws: WebSocket) {
    console.log("GpgCardStatusObserver: register");
    clearTimeout(this.timeoutId);
    this.action([ws]);
  }

  public action(wss = this.observer.wss) {
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
      this.prev.run("CardStatusList", wss, keys, () => {
        // console.log("CardStatusList:setTimeout");
        this.timeoutId = setTimeout(this.action, 5000);
      })
    });
  }

  public start() {
    // console.log("started");
  }

}

export default GpgCardStatusObserver;
