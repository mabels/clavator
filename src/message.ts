
import * as uuid from 'node-uuid';
//import * as WebSocket from 'ws';

// import * as leftPad from 'left-pad';

export class Header {
  action: string
  transaction: string
  public setAction(a: string) {
    let n = new Header();
    n.action = a;
    n.transaction = this.transaction;
    return n;
  }
  public static fill(js: any) {
    let h = new Header();
    h.action = js['action'];
    h.transaction = js['transaction'];
    return h;
  }
}
export interface Message {
  header: Header,
  data: string
};

function fixlength(i: number, l: number) {
  let i_str = i.toString(16);
  let zeros = "";
  for (let j = i_str.length; j < l; ++j) {
    zeros = zeros + "0";
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
  }
}

export function prepare<T>(action: Header, data: T = null): string {
  let header = JSON.stringify(action);
  let payload = JSON.stringify(data || {});
  return fixlength(header.length, 8) + header + payload;
}


export class Transaction<T> {
  public header: Header;
  public data: T;

  public asMsg() : string {
    console.log("Transaction:asMsg:", this);
    return prepare(this.header, this.data);
  }
}

export function newTransaction<T>(action: string, data: T = null) : Transaction<T> {
  let t = new Transaction<T>();
  t.header = new Header();
  t.header.action = action;
  t.data = data;
  t.header.transaction = uuid.v4();
  return t;
}

export function broadcast(action: string) {
  let h = new Header();
  h.action = action;
  h.transaction = undefined;
  return h;
}

export function toHeader(m: Message, action: string = null) : Header {
  let h = new Header();
  h.action = action ? action : m.header.action;
  h.transaction = m.header.transaction;
  return h;
}