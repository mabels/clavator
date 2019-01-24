import { Message } from '../../model';
import { IObservableValue, observable, action } from 'mobx';

export interface WsMessage {
  (h: Message.Header, data: string): void;
}
export interface WsChannel {
  onClose(e: CloseEvent): void;
  onOpen(e: Event): void;
  onMessage(h: Message.Header, data: string): void;
}

export class Dispatch {
  private readonly isActive: IObservableValue<boolean>;
  private readonly ws: IObservableValue<WebSocket>;
  private readonly wscs: WsChannel[] = [];
  private readonly onMessages: Set<WsMessage> = new Set<WsMessage>();

  public static create(): Dispatch {
    const wscd = new Dispatch();
    wscd.connector();
    return wscd;
  }

  constructor() {
    this.isActive = observable.box(false);
    this.ws = observable.box();
  }

  public register(wsc: WsChannel): void {
    this.wscs.push(wsc);
    if (this.isActive) {
      wsc.onOpen(null);
    }
  }
  public unregister(wsc: WsChannel): void {
    const idx = this.wscs.indexOf(wsc);
    if (idx >= 0) {
      this.wscs.splice(idx, idx);
    }
    // this.wscs = this.wscs.filter(item => item !== wsc);
  }

  public send(m: string): void {
    if (this.ws.get()) {
      this.ws.get().send(m);
    } else {
      throw new Error('ws socket not connected');
    }
  }

  @action
  public close(): void {
    const ws = this.ws.get();
    if (ws) {
      ws.close();
    }
  }

  public onMessage(cb: WsMessage): WsMessage {
    this.onMessages.add(cb);
    return cb;
  }

  public unMessage(cb: (h: Message.Header, data: string) => void): void {
    this.onMessages.delete(cb);
  }

  @action
  public connector(): void {
    let wsproto = 'ws';
    if (window.location.protocol == 'https:') {
      wsproto = 'wss';
    }
    console.log('connector', `${wsproto}://${window.location.host}/`);
    const ws = new WebSocket(`${wsproto}://${window.location.host}/`);
    ws.onopen = action((e: Event) => {
      // debugger
      this.isActive.set(true);
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onOpen) {
          wsc.onOpen(e);
        }
      });
    });
    ws.onclose = action((e: CloseEvent) => {
      // debugger
      this.isActive.set(false);
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onClose) {
          wsc.onClose(e);
        }
      });
      this.ws.set(undefined);
      setTimeout(this.connector.bind(this), 1000);
    });
    ws.onmessage = (e: MessageEvent) => {
      const msg = Message.fromData(e.data);
      // console.log('onmessage', msg);
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onMessage) {
          wsc.onMessage(msg.header, msg.data);
        }
      });
      this.onMessages.forEach((cb) => { cb(msg.header, msg.data); });
    };
    this.ws.set(ws);
  }

}

export function create(): Dispatch {
  return Dispatch.create();
}
