
function debugArray(match: string[]) {
  // let ret = {};
  // for (let i = 0; i < match.length; ++i) {
  //     ret[i] = match[i];
  // }
  // console.log(ret);
}
const reNameAndEmail = /^\s*(.*)\s+\<(\S+)\>\s*$/;
export class Uid {
  trust: string;
  name: string;
  email: string;
  comment: string;
  created: number;
  id: string;

  //uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
  fill(match: string[]) {
    debugArray(match);
    this.trust = match[1];
    this.created = parseInt(match[5], 10);
    this.id = match[7];
    let nae = reNameAndEmail.exec(match[9]);
    this.name = nae[1];
    this.email = nae[2];
    //this.comment = match[5];
    return this;
  }
}

const Ciphers : { [id:string]: string; } = {
    22: "ed25519",
    1: "rsa"
}

export class Key {
  type: string;
  trust: string;
  cipher: string;
  funky: string;
  bits: number;
  keyId: string;
  created: number;
  expires: number;
  uses: string[] = [];

// sec:u:256:22:19B013CF06A4BEEF:1464699940:1622379940::u:::cESCA:::#::ed25519::
// ssb:u:256:22:258DE0ECF59BF6FC:1464700731:1622380731:::::a:::+::ed25519:
// ssb:u:4096:1:28E66F405F1BE34D:1464700773:1622380773:::::esa:::D2760001240102010006041775630000::ed25519:
// ssb:u:4096:1:060FF53CB3A32992:1465218501:1622898501:::::es:::D2760001240102010006041775630000::ed25519:
// ssb:u:4096:1:3D851A5DF09DEB9C:1465218921:1622898921:::::es:::D2760001240102010006041775630000::ed25519:

  fill(match: string[]) {
    debugArray(match);
    this.type = match[0];
    this.trust = match[1];
    this.bits = parseInt(match[2], 10);
    this.cipher = Ciphers[match[3]] || 'UNK'+match[3];
    this.keyId = match[4];
    this.created = parseInt(match[5], 10);
    this.expires = parseInt(match[6], 10);
    this.funky = match[14];
    this.uses = match[11].split('').sort();
    return this;
  }
}

export class SecretKey extends Key {
  uids: Uid[] = [];
  subKeys: Key[] = [];
}

const reCrNl = /\r?\n/;
// const reKey = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\/([0-9A-F]+)\s+(\S+)\s+\[(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reLongKeyId = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\s+(\S+)\s+\[(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reUid = /^uid\s+\[\s*(\S+)\s*\]\s+(.*)\s+\<(\S+)\>\s*$/;
// const reKeyId = /^\s+([0-9A-F]+)\s*$/;

export function run(str: string) : SecretKey[] {
  let ret : SecretKey[] = [];
  let currentSec : SecretKey = null;
  str.split(reCrNl).forEach((line: string) => {
    if (!line.trim().length) { return }
    let match = line.split(':');
    switch (match[0]) {
      case 'sec':
        currentSec = (new SecretKey()).fill(match);
        ret.push(currentSec);
        break;
      case 'uid':
        currentSec.uids.push((new Uid()).fill(match));
        break;
      default:
        currentSec.subKeys.push((new Key()).fill(match));
    }
  });
  return ret;
}
