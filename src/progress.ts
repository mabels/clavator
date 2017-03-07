
export class Progress {
  id: number;
  isOk: boolean;
  isEndOfMessages: boolean;
  msgs: string[];
}

let id: number = 0;

export function fill(js: any): Progress {
  let p = new Progress();
  p.id = js['id'];
  p.isOk = js['isOk'];
  p.isEndOfMessages = js['isEndOfMessages'];
  p.msgs = js['msgs'];
  return p;
}

export function fail(msg: string): Progress {
  let p = new Progress();
  p.id = id++;
  p.isOk = false;
  p.isEndOfMessages = true;
  p.msgs = [msg];
  return p
}

export function ok(msg: string, ieom = false): Progress {
  let p = new Progress();
  p.id = id++;
  p.isOk = true;
  p.isEndOfMessages = ieom;
  p.msgs = [msg];
  return p
}

export function info(msg: string, ieom = false): Progress {
  let p = new Progress();
  p.id = id++;
  p.isOk = true;
  p.isEndOfMessages = ieom;
  p.msgs = msg.split(/[\n\r]+/);
  console.log("info=", p.msgs)
  return p
}

export function error(msg: string, ieom = false): Progress {
  let p = new Progress();
  p.id = id++;
  p.isOk = false;
  p.isEndOfMessages = ieom;
  p.msgs = msg.split(/[\n\r]+/);
  return p
}
