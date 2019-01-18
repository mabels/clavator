import { Message } from '../../model';

export interface WsMessage {
  (h: Message.Header, data: string): void;
}
export interface WsChannel {
  onClose(e: CloseEvent): void;
  onOpen(e: Event): void;
  onMessage(h: Message.Header, data: string): void;
}

export class Dispatch {
  private isActive: boolean;
  private ws: WebSocket;
  private wscs: WsChannel[] = [];
  private onMessages: Set<WsMessage> = new Set<WsMessage>();

  public static create(): Dispatch {
    let wscd = new Dispatch();
    wscd.connector();
    return wscd;
  }

  constructor() {
    this.isActive = false;
  }

  public register(wsc: WsChannel): void {
    this.wscs.push(wsc);
    if (this.isActive) {
      wsc.onOpen(null);
    }
  }
  public unregister(wsc: WsChannel): void {
    this.wscs = this.wscs.filter(item => item !== wsc);
  }
  public send(m: string): void {
    this.ws.send(m);
  }

  public close(): void {
    this.ws.close();
  }

  public onMessage(cb: WsMessage): WsMessage {
    this.onMessages.add(cb);
    return cb;
  }

  public unMessage(cb: (h: Message.Header, data: string) => void): void {
    this.onMessages.delete(cb);
  }

  public connector(): void {
    let wsproto = 'ws';
    if (window.location.protocol == 'https:') {
      wsproto = 'wss';
    }
    console.log('connector', `${wsproto}://${window.location.host}/`);
    this.ws = new WebSocket(`${wsproto}://${window.location.host}/`);
    this.ws.onopen = (e: Event) => {
      // debugger
      this.isActive = true;
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onOpen) {
          wsc.onOpen(e);
        }
      });
    };
    this.ws.onclose = (e: CloseEvent) => {
      // debugger
      this.isActive = false;
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onClose) {
          wsc.onClose(e);
        }
      });
      setTimeout(this.connector.bind(this), 1000);
    };
    this.ws.onmessage = (e: MessageEvent) => {
      const msg = Message.fromData(e.data);
      // console.log('onmessage', msg);
      this.wscs.forEach((wsc: WsChannel) => {
        if (wsc.onMessage) {
          wsc.onMessage(msg.header, msg.data);
        }
      });
      this.onMessages.forEach((cb) => { cb(msg.header, msg.data); });
    };
  }

}

export function create(): Dispatch {
  return Dispatch.create();
}
