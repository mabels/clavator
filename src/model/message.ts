import * as uuid from 'uuid';
import { observable } from 'mobx';

export class Header {
  public action: string;
  public transaction: string;

  public static fill(js: any): Header {
    let h = new Header();
    h.action = js['action'];
    h.transaction = js['transaction'];
    return h;
  }

  public setAction(a: string): Header {
    let n = new Header();
    n.action = a;
    n.transaction = this.transaction;
    return n;
  }

}
export interface Message {
  header: Header;
  data: string;
}

function fixlength(i: number, l: number): string {
  let i_str = i.toString(16);
  let zeros = '';
  for (let j = i_str.length; j < l; ++j) {
    zeros = zeros + '0';
  }
  return zeros + i_str;
}

// export function receive<T>(data: string, action: string, cb: (t:T) => void) {
//   let hlen = parseInt(data.slice(0,8), 16);
//   let header = data.slice(8,8+hlen);
//   if (JSON.parse(header).action == action) {
//     cb(JSON.parse(data.slice(8+hlen)));
//   }
// }

export function fromData(data: string): Message {
  let hlen = parseInt(data.slice(0, 8), 16);
  let header = JSON.parse(data.slice(8, 8 + hlen));
  return {
    header: Header.fill(header),
    data: data.slice(8 + hlen)
  };
}

export function prepare<T>(action: Header, data: T = null): string {
  let header = JSON.stringify(action);
  let payload = JSON.stringify(data || {});
  return fixlength(header.length, 8) + header + payload;
}

export class Transaction<T> {
  public header: Header;
  @observable
  public data: T;

  public asMsg(data?: T): string {
    console.log('Transaction:asMsg:', this);
    return prepare(this.header, data || this.data);
  }
}

export function newTransaction<T>(action: string, data: T = null): Transaction<T> {
  let t = new Transaction<T>();
  t.header = new Header();
  t.header.action = action;
  t.data = data;
  t.header.transaction = uuid.v4();
  return t;
}

export function broadcast(action: string): Header {
  let h = new Header();
  h.action = action;
  h.transaction = undefined;
  return h;
}

export function toHeader(m: Message, action: string = null): Header {
  let h = new Header();
  h.action = action ? action : m.header.action;
  h.transaction = m.header.transaction;
  return h;
}
