import * as WebSocket from 'ws';

// import * as Message from './message';
import { Observer } from './observer';

import { Gpg, Gpg2CardStatus } from '../../gpg';
import { WssUpdate } from '../wss-update';

export class GpgCardStatusObserver {
  public observer: Observer;
  public timeoutId: any;
  public gpg: Gpg;
  public actionCount: number;
  public prev: WssUpdate<Gpg2CardStatus> = new WssUpdate<Gpg2CardStatus>();

  public static create(
    gpg: Gpg,
    obs: Observer
  ): GpgCardStatusObserver {
    let glsko = new GpgCardStatusObserver();
    glsko.gpg = gpg;
    glsko.actionCount = 0;
    glsko.observer = obs;
    glsko.action = glsko.action.bind(glsko);
    glsko.start();
    return glsko;
  }

  constructor() {
    this.action = this.action.bind(this);
  }

  public register(ws: WebSocket): void {
    console.log('GpgCardStatusObserver: register');
    clearTimeout(this.timeoutId);
    this.action([ws]);
  }

  public suspend(): void {
    clearTimeout(this.timeoutId);
  }

  public resume(): void {
    this.timeoutId = setTimeout(this.action, 5000);
  }

  public action(wss = this.observer.wss): void {
    this.actionCount++;
    console.log(
      'Card-Status: actionCount:',
      this.actionCount,
      this.observer.wss.length,
      this.gpg
    );
    if (!wss.length) {
      return;
    }
    this.gpg.card_status((err: string, keys: Gpg2CardStatus[]) => {
      if (err) {
        if (!err.includes('OpenPGP card not available')) {
          console.error(err);
        }
        keys = [];
      }
      this.prev.run('CardStatusList', wss, keys, () => {
        // console.log('CardStatusList:setTimeout');
        this.timeoutId = setTimeout(this.action, 5000);
      });
    });
  }

  public start(): void {
    console.log('Card-Status: started');
  }
}
