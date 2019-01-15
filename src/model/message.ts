import * as uuid from 'node-uuid';
// import * as Progress from './progress';
import * as rxme from 'rxme';

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
export class Message {
  public header: Header;
  public data: string;

  public static actionMatch(action: string, cb: rxme.MatcherCallback<Message>): rxme.MatcherCallback {
    return rxme.Matcher.Type<Message>(Message, (m, sub, rx) => {
      if (!action || action == m.header.action) {
        cb(m, sub, rx);
      }
    });
  }

  public static match(cb: rxme.MatcherCallback<Message>): rxme.MatcherCallback {
    return this.actionMatch(null, cb);
  }

  constructor(header?: Header, data?: string) {
    this.header = header;
    this.data = data;
  }

  public reply(action: string): Message {
    const ret = new Message();
    ret.header = this.header.setAction(action);
    return ret;
  }

  public send(sub: rxme.Subject): Message {
    sub.next(new rxme.RxMe(this));
    return this;
  }
  public dataToJson(a: any): Message {
    this.data = JSON.stringify(a);
    return this;
  }
  public progressFail(str: string): Message {
    return this.dataToJson(Progress.fail(str));
  }

  public progressOk(str: string): Message {
    return this.dataToJson(Progress.ok(str));
  }

  public progressInfo(str: string): Message {
    return this.dataToJson(Progress.info(str));
  }

  public progressError(str: string): Message {
    return this.dataToJson(Progress.error(str));
  }

  public prepare(): string {
    const header = JSON.stringify(this.header);
    const payload = this.data || '{}';
    return fixlength(header.length, 8) + header + payload;
  }
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
  return new Message(Header.fill(header), data.slice(8 + hlen));
}

export function prepare<T>(action: Header, data: T = null): string {
  let header = JSON.stringify(action);
  let payload = JSON.stringify(data || {});
  return fixlength(header.length, 8) + header + payload;
}

export class Transaction<T> {
  public header: Header;
  public data: T;

  public asMsg(data?: T): string {
    this.data = data || this.data;
    console.log('Transaction:asMsg:', this);
    return prepare(this.header, this.data);
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
