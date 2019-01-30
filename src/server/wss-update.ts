import * as WebSocket from 'ws';
import { Message } from '../model/message';
import { IObservableArray, observable } from 'mobx';

export interface Equalizer<T> {
  eq(o: T): boolean;
}

export class WssUpdate<T extends Equalizer<T>> {
  private readonly prevWss: Set<WebSocket> = new Set<WebSocket>([]);
  private readonly prevT: IObservableArray<T> = observable.array([]);

  public run(action: string, wss: WebSocket[], t: T[], cb: () => void): void {
    const wssChanged: WebSocket[] = [];
    const wssUnChanged: WebSocket[] = [];
    wss.forEach(ws => {
      if (!this.prevWss.has(ws)) {
        this.prevWss.add(ws);
        wssChanged.push(ws);
      } else {
        wssUnChanged.push(ws);
      }
    });
    let keysChanged = true;
    if (t.length == this.prevT.length) {
      keysChanged = false;
      for (let i = 0; i < t.length; ++i) {
        if (!t[i].eq(this.prevT[i])) {
          keysChanged = true;
          break;
        }
      }
    }
    this.prevT.replace(t);
    let needCb = false;
    if (wssChanged.length) {
      console.log(
        `Changed:WssUpdate:action=${action} keysChanged=${keysChanged}`
      );
      needCb = needCb || this.send(wssChanged, action, t, cb);
    }
    if (keysChanged) {
      console.log(
        `KeyChanged:WssUpdate:action=${action} keysChanged=${keysChanged}`
      );
      needCb = needCb || this.send(wssUnChanged, action, t, cb);
    }
    if (!needCb) {
      cb();
    }
  }

  public send(
    wss: WebSocket[],
    action: string,
    t: T[],
    cb: () => void
  ): boolean {
    let cnt = wss.length;
    const header = Message.broadcast(action);
    wss.forEach((ws: WebSocket) => {
      console.log('header:', header);
      ws.send(Message.prepare(header, t), (error: any) => {
        if (--cnt <= 0) {
          cb();
        }
      });
    });
    return wss.length > 0;
  }
}
