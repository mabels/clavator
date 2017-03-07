
function debugArray(match: string[]) {
  // let ret = {};
  // for (let i = 0; i < match.length; ++i) {
  //     ret[i] = match[i];
  // }
  // console.log(ret);
}
const reNameAndEmail = /^\s*(.*)\s+\<(\S+)\>\s*$/;
const reNameAndCommentAndEmail = /^\s*(.*)\s+\((.*)\)\s+\<(\S+)\>\s*$/;
export class Uid {
  trust: string;
  name: string;
  email: string;
  comment: string;
  created: number;
  id: string;
  key: string;

  public eq(o: Uid) {
    return this.trust == o.trust &&
      this.name == o.name &&
      this.email == o.email &&
      this.comment == o.comment &&
      this.created == o.created &&
      this.id == o.id &&
      this.key == o.key;
  }

  //uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
  fill(match: string[]) {
    debugArray(match);
    this.trust = match[1];
    this.created = parseInt(match[5], 10);
    this.key = this.id = match[7];
    let nacae = reNameAndCommentAndEmail.exec(match[9]);
    if (nacae) {
      this.name = nacae[1];
      this.comment = nacae[2];
      this.email = nacae[3];
    } else {
      let nae = reNameAndEmail.exec(match[9]);
      this.name = nae[1];
      this.email = nae[2];
    }
    //this.comment = match[5];
    return this;
  }
}

class FingerPrint {
  fpr: string;

  public eq(o: FingerPrint) {
    return this.fpr == o.fpr;
  }

  fill(match: string[]) {
    debugArray(match);
    this.fpr = match[9];
    return this;
  }
}

class Group {
  grp: string;

  public eq(o: Group) {
    return this.grp == o.grp;
  }

  fill(match: string[]) {
    debugArray(match);
    this.grp = match[9];
    return this;
  }
}

const Ciphers: { [id: string]: string; } = {
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
  key: string;
  created: number;
  expires: number;
  uses: string[] = [];
  group: Group = new Group();
  fingerPrint: FingerPrint = new FingerPrint();

  public usesEq(o: string[]) {
    if (this.uses.length != o.length) {
      return false;
    }
    for (let i = 0; i < this.uses.length; ++i) {
      if (this.uses[i] != o[i]) {
        return false;
      }
    }
    return true;
  }

  public eq(o: Key) {
    return this.type == o.type &&
      this.trust == o.trust &&
      this.cipher == o.cipher &&
      this.funky == o.funky &&
      this.bits == o.bits &&
      this.keyId == o.keyId &&
      this.key == o.key &&
      this.created == o.created &&
      this.expires == o.expires &&
      this.usesEq(o.uses) &&
      this.group.eq(o.group) &&
      this.fingerPrint.eq(o.fingerPrint);
  }

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
    this.cipher = Ciphers[match[3]] || 'UNK' + match[3];
    this.key = this.keyId = match[4];
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

  public eq(o: SecretKey) {
    if (this.uids.length != o.uids.length) {
      return false;
    }
    if (this.subKeys.length != o.subKeys.length) {
      return false;
    }
    for (let i = 0; i < this.uids.length; ++i) {
      if (!this.uids[i].eq(o.uids[i])) {
        return false;
      }
    }
    for (let i = 0; i < this.subKeys.length; ++i) {
      if (!this.subKeys[i].eq(o.subKeys[i])) {
        return false;
      }
    }
  }
}

const reCrNl = /\r?\n/;
// const reKey = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\/([0-9A-F]+)\s+(\S+)\s+\[(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reLongKeyId = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\s+(\S+)\s+\[(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reUid = /^uid\s+\[\s*(\S+)\s*\]\s+(.*)\s+\<(\S+)\>\s*$/;
// const reKeyId = /^\s+([0-9A-F]+)\s*$/;

export function run(str: string): SecretKey[] {
  let ret: SecretKey[] = [];
  let currentSec: SecretKey = null;
  let currentKey: Key = null;
  str.split(reCrNl).forEach((line: string) => {
    if (!line.trim().length) { return }
    let match = line.split(':');
    switch (match[0]) {
      case 'sec':
        currentSec = (new SecretKey()).fill(match);
        currentKey = currentSec;
        ret.push(currentSec);
        break;
      case 'uid':
        currentSec.uids.push((new Uid()).fill(match));
        break;
      case 'ssb':
        currentKey = (new Key()).fill(match);
        currentSec.subKeys.push(currentKey);
        break;
      case 'fpr':
        currentKey.fingerPrint.fill(match)
        break;
      case 'grp':
        currentKey.group.fill(match)
        break;
      default:
        console.warn("unknown type:", match[0]);
    }
  });
  return ret;
}
