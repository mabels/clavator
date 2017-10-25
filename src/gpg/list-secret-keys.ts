import * as KeyGen from './key-gen';
import KeyGenUid from './key-gen-uid';
import { expireDate } from '../model/helper';

function debugArray(match: string[]): void {
  // let ret = {};
  // for (let i = 0; i < match.length; ++i) {
  //     ret[i] = match[i];
  // }
  // console.log(ret);
}

const reNameAndEmail = /^\s*(.*)\s+\<(\S+)\>\s*$/;
const reNameAndCommentAndEmail = /^\s*(.*)\s+\((.*)\)\s+\<(\S+)\>\s*$/;

export class Uid {
  public trust: string;
  public name: string;
  public email: string;
  public comment: string;
  public created: number;
  public id: string;
  public key: string;

  public static jsfill(js: any): Uid {
    let ret = new Uid();
    ret.trust = js['trust'];
    ret.name = js['name'];
    ret.email = js['email'];
    ret.comment = js['comment'];
    ret.created = js['created'];
    ret.id = js['id'];
    ret.key = js['key'];
    return ret;
  }

  public eq(o: Uid): boolean {
    return this.trust == o.trust &&
      this.name == o.name &&
      this.email == o.email &&
      this.comment == o.comment &&
      this.created == o.created &&
      this.id == o.id &&
      this.key == o.key;
  }

  public toKeyGenUid(): KeyGenUid {
    let ret = new KeyGenUid();
    ret.comment.value = this.comment;
    ret.email.value = this.email;
    ret.name.value = this.name;
    return ret;
  }

  // uid:u::::1464699940::A319A573075CF1606705BDA9FD5F07E5AD24F257::Meno Abels <meno.abels@adviser.com>:::::::::
  public fill(match: string[]): Uid {
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
    // this.comment = match[5];
    return this;
  }
}

class FingerPrint {
  public fpr: string;

  public static jsfill(js: any): FingerPrint {
    let ret = new FingerPrint();
    ret.fpr = js['fpr'];
    return ret;
  }

  public eq(o: FingerPrint): boolean {
    return this.fpr == o.fpr;
  }

  public fill(match: string[]): FingerPrint {
    debugArray(match);
    this.fpr = match[9];
    return this;
  }

}

class Group {
  public grp: string;

  public static jsfill(js: any): Group {
    let ret = new Group();
    ret.grp = js['grp'];
    return ret;
  }

  public eq(o: Group): boolean {
    return this.grp == o.grp;
  }

  public fill(match: string[]): Group {
    debugArray(match);
    this.grp = match[9];
    return this;
  }

}

const Ciphers: { [id: string]: string; } = {
  22: 'ed25519',
  1: 'rsa'
};

export class Key {
  public type: string;
  public trust: string;
  public cipher: string;
  public funky: string;
  public bits: number;
  public keyId: string;
  public key: string;
  public created: number;
  public expires: number;
  public uses: string[] = [];
  public group: Group = new Group();
  public fingerPrint: FingerPrint = new FingerPrint();

  public static jsfill(js: any): Key {
    let ret = new Key();
    return ret.jsfill(js);
  }

  public usesEq(o: string[]): boolean {
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

  public toKeyGenInfo(): KeyGen.KeyInfo {
    let ret = new KeyGen.KeyInfo();
    ret.length.value = this.bits;
    ret.type.value = this.cipher;
    // ret.usage.values = this.
    return ret;
  }

  public jsfill(js: any): Key {
    return this._jsfill(js);
  }

  protected _jsfill(js: any): Key {
    this.type = js['type'];
    this.trust = js['trust'];
    this.cipher = js['cipher'];
    this.funky = js['funky'];
    this.bits = js['bits'];
    this.keyId = js['keyId'];
    this.key = js['key'];
    this.created = js['created'];
    this.expires = js['expires'];
    this.uses = js['uses'] || [];
    this.group = Group.jsfill(js['group'] || {});
    this.fingerPrint = FingerPrint.jsfill(js['fingerPrint'] || {});
    return this;
  }

  public eq(o: Key): boolean {
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

  public fill(match: string[]): Key {
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
  public uids: Uid[] = [];
  public subKeys: Key[] = [];

  public static jsfill(js: any): SecretKey {
    let ret = new SecretKey();
    return ret.jsfill(js);
  }

  public jsfill(js: any): SecretKey {
    this._jsfill(js);
    for (let uid of js['uids']) {
      this.uids.push(Uid.jsfill(uid));
    }
    for (let subKey of js['subKeys']) {
      this.subKeys.push(Key.jsfill(subKey));
    }
    return this;
  }

  public isCreated(cb?: any): any {
    if (this.uids.length > 0 && this.uids[0].name && this.uids[0].name.length) {
      return cb;
    }
    return null;
  }

  public toKeyGen(subKeys = 3): KeyGen.KeyGen {
    let ret = new KeyGen.KeyGen();
    ret.keyInfo.length.value = this.bits || 4096;
    ret.keyInfo.type.value = this.cipher || 'RSA';
    ret.keyInfo.usage.values = ['cert'];
    if (this.expires != null && this.expires > 0) {
      ret.expireDate.value = new Date(this.expires * 1000);
    } else {
      ret.expireDate.value = expireDate();
    }
    for (let sb of this.subKeys) {
      ret.subKeys.push(sb.toKeyGenInfo());
    }
    for (let i = 0; ret.subKeys.length() < subKeys; ++i) {
      ret.subKeys.add(new KeyGen.KeyInfo());
    }
    for (let uid of this.uids) {
      ret.uids.add(uid.toKeyGenUid());
    }
    // debugger
    if (ret.uids.length() < 1) {
      ret.uids.add(new KeyGenUid());
    }
    return ret;
  }

  public eq(o: SecretKey): boolean {
    if (!super.eq(o)) {
      return false;
    }
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
    return true;
  }
}

const reCrNl = /\r?\n/;
// const reKey = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\/([0-9A-F]+)\s+(\S+)\s+\
//    [(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reLongKeyId = /^(sec|ssb)([\#\>]*)\s+([a-zA-Z]+)(\d+)\s+(\S+)\s+\[(\S+)\]\s+\[\S*\s*(\d+\-\d+\-\d+)\s*\]\s*$/;
// const reUid = /^uid\s+\[\s*(\S+)\s*\]\s+(.*)\s+\<(\S+)\>\s*$/;
// const reKeyId = /^\s+([0-9A-F]+)\s*$/;

export function run(str: string): SecretKey[] {
  let ret: SecretKey[] = [];
  let currentSec: SecretKey = null;
  let currentKey: Key = null;
  str.split(reCrNl).forEach((line: string) => {
    if (!line.trim().length) { return; }
    let match = line.split(':');
    switch (match[0]) {
      case 'sec':
        let sec = new SecretKey();
        sec.fill(match);
        currentSec = sec;
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
        currentKey.fingerPrint.fill(match);
        break;
      case 'grp':
        currentKey.group.fill(match);
        break;
      default:
        console.warn('unknown type:', match[0]);
    }
  });
  return ret;
}
