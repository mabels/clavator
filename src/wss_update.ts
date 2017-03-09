import * as Message from './message';
import * as WebSocket from 'ws';

export interface Equalizer<T> {
  eq(o: T): boolean;
}

export class WssUpdate<T extends Equalizer<T>> {
  prevWss: Set<WebSocket> = new Set<WebSocket>([]);
  prevT: T[] = [];

  public run(action: string, wss: WebSocket[], t: T[], cb: () => void) {
    let wssChanged: WebSocket[] = [];
    let wssUnChanged: WebSocket[] = [];
    wss.forEach((ws) => {
      if (!this.prevWss.has(ws)) {
        this.prevWss.add(ws);
        wssChanged.push(ws);
      } else {
        wssUnChanged.push(ws);
      }
    })
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
    this.prevT = t;
    let needCb = false;
    if (wssChanged.length) {
      console.log(`Changed:WssUpdate:action=${action} keysChanged=${keysChanged}`);
      needCb = needCb || this.send(wssChanged, action, t, cb);
    }
    if (keysChanged) {
      console.log(`KeyChanged:WssUpdate:action=${action} keysChanged=${keysChanged}`);
      needCb = needCb || this.send(wssUnChanged, action, t, cb);
    }
    if (!needCb) {
      cb();
    }
  }
  send(wss: WebSocket[], action: string, t:T[], cb: () => void) {
    let cnt = wss.length;
    let header = Message.broadcast(action);
    wss.forEach((ws: WebSocket) => {
      console.log("header:", header);
      ws.send(Message.prepare(header, t), (error: any) => {
        if (--cnt <= 0) {
          cb();
        }
      });
    })
    return wss.length>0;
  }
}

export default WssUpdate;