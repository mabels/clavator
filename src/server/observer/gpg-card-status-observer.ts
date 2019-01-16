import * as WebSocket from 'ws';

// import * as Message from './message';
import * as Observer from '../observer';

import * as Gpg from '../../gpg/gpg';
import * as CardStatus from '../../gpg/card-status';
import WssUpdate from '../wss-update';

class GpgCardStatusObserver {
  public observer: Observer.Observer;
  public timeoutId: any;
  public gpg: Gpg.Gpg;
  public actionCount: number;
  public prev: WssUpdate<CardStatus.Gpg2CardStatus> = new WssUpdate<
    CardStatus.Gpg2CardStatus
  >();

  public static create(
    gpg: Gpg.Gpg,
    obs: Observer.Observer
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
    this.gpg.card_status((err: string, keys: CardStatus.Gpg2CardStatus[]) => {
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

export default GpgCardStatusObserver;
