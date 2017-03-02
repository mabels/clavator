import * as Message from '../message';

export interface WsMessage {
  (h: Message.Header, data: string): void;
}
export interface WsChannel {
  onClose(e: CloseEvent): void;
  onOpen(e: Event): void;
  onMessage(h: Message.Header, data: string): void;
}

export class Dispatch {
  private isActive: boolean = false;
  private ws: WebSocket;
  private wscs: WsChannel[] = [];
  private onMessages = new Set<WsMessage>();

  public register(wsc: WsChannel) {
    this.wscs.push(wsc);
    if (this.isActive) {
      wsc.onOpen(null);
    }
  }
  public unregister(wsc: WsChannel) {
    this.wscs = this.wscs.filter(item => item !== wsc);
  }
  public send(m: string, cb: (error: any) => void): void {
    this.ws.send(m);
  }

  public close() {
    this.ws.close();
  }

  public onMessage(cb: (h: Message.Header, data: string) => void) {
    this.onMessages.add(cb);
    return cb;
  }

  public unMessage(cb: (h: Message.Header, data: string) => void) {
    this.onMessages.delete(cb);
  }

  connector() {
    let wsproto = "ws";
    if (window.location.protocol == "https:") {
      wsproto = "wss";
    }
    console.log("connector", `${wsproto}://${window.location.host}/`);
    this.ws = new WebSocket(`${wsproto}://${window.location.host}/`);
    this.ws.onopen = (e: Event) => {
      // debugger
      this.isActive = true;
      this.wscs.forEach((wsc: WsChannel) => {
        wsc.onOpen && wsc.onOpen(e)
      });
    };
    this.ws.onclose = (e: CloseEvent) => {
      // debugger
      this.isActive = false;
      this.wscs.forEach((wsc: WsChannel) => {
        wsc.onClose && wsc.onClose(e)
      });
      setTimeout(this.connector.bind(this), 1000);
    }
    this.ws.onmessage = (e: MessageEvent) => {
      let msg = Message.fromData(e.data);
      // console.log("onmessage", msg);
      this.wscs.forEach((wsc: WsChannel) => {
        wsc.onMessage && wsc.onMessage(msg.header, msg.data);
      });
      this.onMessages.forEach((cb) => { cb(msg.header, msg.data)});
    };
  }

  public static create(): Dispatch {
    let wscd = new Dispatch();
    wscd.connector();
    return wscd;
  }

}

export function create(): Dispatch {
  return Dispatch.create();
}
