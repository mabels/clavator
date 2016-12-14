
//import * as WebSocket from 'ws';

// import * as leftPad from 'left-pad';

export interface Header {
  action: string
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

export function fromData(data: string) : Message {
  let hlen = parseInt(data.slice(0,8), 16);
  let header = data.slice(8,8+hlen);
  return {
    header: JSON.parse(header),
    data: data.slice(8+hlen)
  }
}

export function prepare<T>(action: string, data: T = null) : string {
  let header = JSON.stringify({
    action: action
  });
  let payload = JSON.stringify(data || {});
  return fixlength(header.length, 8)+header+payload;
}
