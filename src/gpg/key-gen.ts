import Option from '../model/option';
import MultiOption from '../model/multi-option';
import DateValue from '../model/date-value';
import KeyGenUid from './key-gen-uid';
import Container from '../model/container';
import Pallet from '../model/pallet';
import ObjectId from '../model/object-id';

import { assignOnError, format_date, expireDate  } from '../model/helper';
import { StringValue } from '../model/string-value';

// export class Uid extends KeyGenUid {

// }

export class ValidatableString {
  public match: RegExp;
  public value: string;
  public errText: string;
  public constructor(match: RegExp, e: string) {
    this.match = match;
    this.value = '';
    this.errText = e;
  }
}

// export class PwPair {
//   public match: RegExp;
//   public password: string;
//   public verify: string;
//   public errText: string;

//   public static fill(js: any, dv: PwPair): void {
//     dv.password = js['password'] || dv.password;
//     dv.verify = js['verify'] || dv.verify;
//   }
//   public constructor(match: RegExp, e: string) {
//     this.match = match;
//     this.password = '';
//     this.verify = '';
//     this.errText = e;
//   }

//   public setPassword(pwd: string): void {
//     this.password = this.verify = pwd;
//   }

//   public valid_password(): boolean {
//     return this.match.test(this.password);
//   }
//   public valid_verify(): boolean {
//     return this.match.test(this.verify);
//   }

//   public valid(): boolean {
//     return this.password == this.verify && this.match.test(this.password);
//   }
// }

export class KeyInfo extends ObjectId implements Pallet {
  public type: Option<string>;
  public length: Option<number>;
  public usage: MultiOption<string>;

  public constructor(type = 'RSA', length = 4096, usage = ['sign', 'encr', 'auth']) {
    super('KeyInfo');
    this.type = new Option(type, ['RSA', 'DSA'], 'keyType Error');
    this.length = new Option(length, [1024, 2048, 4096, 8192], 'sub keyLength Error');
    this.usage = new MultiOption(usage, ['cert', 'sign', 'encr', 'auth'], 'keyUsage Error');
  }
  public fill(js: any): void {
    Option.fill(js['type'] || {}, this.type);
    Option.fill(js['length'] || {}, this.length);
    MultiOption.fill(js['usage'] || {}, this.usage);
    // console.log("<<<<", ki)
    // return ki;
  }

  public valid(): boolean {
    return this.type.valid() && this.length.valid() &&
      this.usage.valid();
  }

  public errText(): string[] {
    let ret: string[] = [];
    assignOnError(this.type.valid(), ret, this.type.errText);
    assignOnError(this.length.valid(), ret, this.length.errText);
    assignOnError(this.usage.valid(), ret, this.usage.errText);
    return ret;
  }

  public toObj(): any {
    return {
      type: this.type.value,
      length: this.length.value,
      usage: this.usage.values
    };
  }
}

// export class SubKeys {
//   subKeys: KeyInfo[] = [];
//   public errText() : string[] {
//     let ret : string[] = [];
//     for (let sk of this.subKeys) {
//       !sk.valid() && Array.prototype.push.apply(ret, sk.errText());
//     }
//     return ret;
//   }
//   public add(ki: KeyInfo) {
//     this.subKeys.push(ki);
//   }
//   public valid() {
//     let ret = true;
//     for (let sk of this.subKeys) {
//       ret = ret && sk.valid();
//     }
//     return ret;
//   }
//   public static fill(js: any, sb: SubKeys) : SubKeys {
//     sb.subKeys = [];
//     for(let ki of js['subKeys']) {
//         sb.add(KeyInfo.fill(ki, new KeyInfo()));
//     }
//     return sb;
//   }
// }

export class KeyGen {
  public password: StringValue = new StringValue(/^.{14,1024}$/, 'Password Error');
  public keyInfo: KeyInfo = new KeyInfo('RSA', 4096, ['cert']);
  public expireDate: DateValue = new DateValue(expireDate(), 'expireDate error');
  public uids: Container<KeyGenUid> = new Container<KeyGenUid>(() => { return new KeyGenUid(); });
  public subKeys: Container<KeyInfo> = new Container<KeyInfo>(() => { return new KeyInfo(); });

  public static withSubKeys(cnt: number): KeyGen {
    let ret = new KeyGen();
    for (let i = 0; i < cnt; ++i) {
      ret.subKeys.add(new KeyInfo());
    }
    return ret;
  }
  public static fill(js: any, kg: KeyGen): void {
    StringValue.fill(js['password'] || {}, kg.password);
    // PwPair.fill(js['adminPin']||{}, kg.adminPin);
    // PwPair.fill(js['userPin']||{}, kg.userPin);
    kg.keyInfo.fill(js['keyInfo']);
    kg.uids.fill(js['uids']);
    // StringValue.fill(js['nameReal']||{}, kg.nameReal);
    // StringValue.fill(js['nameEmail']||{}, kg.nameEmail);
    // StringValue.fill(js['nameComment']||{}, kg.nameComment);
    DateValue.fill(js['expireDate'] || {}, kg.expireDate);
    kg.subKeys.fill(js['subKeys']);
    // SubKeys.fill(js['subKeys']||[], kg.subKeys);
  }

  public errText(): string[] {
    let ret: string[] = [];
    assignOnError(this.password.valid(), ret, this.password.errText());
    // !this.adminPin.valid() && ret.push(this.adminPin.errText);
    // !this.userPin.valid() && ret.push(this.userPin.errText);
    assignOnError(this.keyInfo.valid(), ret,  this.keyInfo.errText());
    assignOnError(this.subKeys.valid(), ret,  this.subKeys.errText());
    assignOnError(this.uids.valid(), ret,  this.uids.errText());
    assignOnError(this.expireDate.valid(), ret, this.expireDate.errText);
    return ret;
  }

  public valid(): boolean {
    // console.log(this.errText());
    let ret = this.password.valid() &&
      //  this.adminPin.valid() && this.userPin.valid() &&
      this.keyInfo.valid() &&
      this.uids.valid() &&
      this.subKeys.valid() &&
      this.expireDate.valid();
    // if (!ret) {
    //   console.log("keygen:", this.errText());
    // }
    return ret;
  }

  public masterCommand(): string {
    let ret = [
      'Key-Type: ' + this.keyInfo.type.value,
      'Key-Length: ' + this.keyInfo.length.value,
      'Key-Usage: ' + this.keyInfo.usage.values,
      'Name-Real: ' + this.uids.first().name.value,
      'Name-Email: ' + this.uids.first().email.value,
    ];
    if (this.uids.first().comment.value.length > 0) {
      ret.push('Name-Comment: ' + this.uids.first().comment.value);
    }
    ret.push('Expire-Date: ' + format_date(this.expireDate.value));
    ret.push('%commit');
    ret.push('%echo done');
    return ret.join('\n');
  }

}

export default KeyGen;
