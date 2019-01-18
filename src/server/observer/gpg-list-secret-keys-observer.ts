import * as WebSocket from 'ws';
import { Observer } from './observer';

import { Gpg } from '../../gpg';
import { SecretKey } from '../../gpg/types';
import { WssUpdate } from '../wss-update';

export class GpgListSecretKeysObserver {
  public observer: Observer;
  public timeoutId: any;
  public gpg: Gpg;
  public actionCount: number;
  public prev: WssUpdate<SecretKey> = new WssUpdate<SecretKey>();

  public static create(
    gpg: Gpg,
    obs: Observer
  ): GpgListSecretKeysObserver {
    let glsko = new GpgListSecretKeysObserver();
    glsko.gpg = gpg;
    glsko.actionCount = 0;
    glsko.observer = obs;
    glsko.start();
    glsko.action = glsko.action.bind(glsko);
    return glsko;
  }

  public register(ws: WebSocket): void {
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
    // console.log('actionCount:', this.actionCount, this.observer.wss.length, this.gpg);
    if (!wss.length) {
      return;
    }
    this.gpg.list_secret_keys(
      (err: string, keys: SecretKey[]) => {
        if (err) {
          console.error(err);
          keys = [];
        }
        this.prev.run('KeyChainList', wss, keys, () => {
          this.timeoutId = setTimeout(this.action, 5000);
        });
      }
    );
  }

  public start(): void {
    // console.log('started');
  }
}
