import * as Message from '../message';

export interface WsChannel {
  onClose(e:CloseEvent) : void;
  onMessage(h: Message.Header, data: string) : void;
}

export class Dispatch {
  private ws: WebSocket;
  private wscs: WsChannel[] = [];

  public register(wsc: WsChannel) {
    this.wscs.push(wsc);
  }
  public unregister(wsc: WsChannel) {
      this.wscs = this.wscs.filter(item => item !== wsc);
  }
  public send(m: string, cb: (error: any) => void) : void {
    this.ws.send(m);
  }

  public close() {
    this.ws.close();
  }

  public static create() : Dispatch {
    let wscd = new Dispatch();
    wscd.ws = new WebSocket(`ws://${window.location.host}/`);
    // wscd.ws.onopen = (e: Event) => {
    //   console.log(e);
    //   wscd.ws.send("Hello Clavator")
    // };
    wscd.ws.onclose = (e: CloseEvent) => {
      wscd.wscs.forEach((wsc: WsChannel) => {
        wsc.onClose && wsc.onClose(e)
      });
    }
    wscd.ws.onmessage = (e: MessageEvent) => {
      let msg = Message.fromData(e.data);
      console.log("onmessage", msg);
      wscd.wscs.forEach((wsc: WsChannel) => {
        wsc.onMessage && wsc.onMessage(msg.header, msg.data);
      });
    };
    return wscd;
  }

}

export function create() : Dispatch {
  return Dispatch.create();
}
