import DateValue from './date-value';
import Option from './option';
import Container from './container';
import Validatable from './validatable';
// import StringValue from './string-value';
import KeyGenUid from './key-gen-uid';
import Warrents from './warrents';
import { expireDate, assignOnError } from './helper';

export class PassPhrase implements Validatable {
  public partCount: number;
  public partRegex: RegExp;
  public errorText: string;
  public parts: string[];

  constructor(partCount: number, partRegex: RegExp, errText: string) {
    this.partCount = partCount;
    this.partRegex = partRegex;
    this.errorText = errText;
    this.parts = Array(partCount).fill('');
  }

  public valid(): boolean {
    // return this.type.valid() && this.masterLen.valid() && this.subLen.valid();
    return false;
  }

  public errText(): string[] {
    const ret: string[] = [];
    // assignOnError(this.type.valid(), ret, this.type.errText);
    // assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    // assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    this.partCount = js['partCount'];
    this.partRegex = js['partRegex'];
    this.errorText = js['errorText'];
    this.parts = js['parts'];
  }

}

export class KeyParams implements Validatable {
  public type: Option<string>;
  public masterLen: Option<number>;
  public subLen: Option<number>;

  constructor() {
    this.type = new Option('RSA', ['RSA', 'DSA'], 'keyType Error');
    this.masterLen = new Option(4096, [1024, 2048, 4096, 8192], 'master keyLength Error');
    this.subLen = new Option(4096, [1024, 2048, 4096, 8192], 'master keyLength Error');
  }

  public valid(): boolean {
    return this.type.valid() && this.masterLen.valid() && this.subLen.valid();
  }

  public errText(): string[] {
    const ret: string[] = [];
    assignOnError(this.type.valid(), ret, this.type.errText);
    assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    this.type.value = js['type'];
    this.masterLen.value = js['masterLen'];
    this.subLen.value = js['subLen'];
  }

}

export class SimpleYubikey {
  public readonly warrents: Warrents;

  public expireDate: DateValue;
  public keyParams: KeyParams;

  public uids: Container<KeyGenUid>;
  public passPhrase: PassPhrase;
  public adminKey: PassPhrase;
  public userKey: PassPhrase;

  private static createPassPhrase(warrents: Warrents, reg: string, errText: string, 
    minLen: number, maxLen?: number): PassPhrase {
    maxLen = maxLen || 16;
    const wlen = warrents.length();
    // if (wlen >= 8) {
    //   return wlen;
    // }
    // let quot = ~~(8 / wlen);
    // if (quot * wlen == 8) {
    //   return 8;
    // } else {
    //   return (1 + quot) * wlen;
    // }
    const regex = new RegExp(`^${reg}{${minLen},${maxLen}$`);
    return new PassPhrase(wlen, regex, errText);
  }
  constructor(warrents: Warrents) {
    this.warrents = warrents;
    this.expireDate = new DateValue(expireDate(), 'expireDate error');
    this.keyParams = new KeyParams();
    this.uids = new Container<KeyGenUid>(() => { return new KeyGenUid(); });
    this.passPhrase = SimpleYubikey.createPassPhrase(warrents, '[0-9A-Za-z]', 'PassPhrase error', 14);
    this.adminKey = SimpleYubikey.createPassPhrase(warrents, '[0-9]', 'adminpin error', 8, 8);
    this.userKey = new PassPhrase(1, /^[0-9]{6,8}$/, 'userPin Error');
  }

  // public password: PwPair = new PwPair(/^.{14,1024}$/, 'Password Error');
  // // adminPin: PwPair = new PwPair(/^[0-9]{8}$/, "adminPin Error");
  // // userPin: PwPair = new PwPair(/^[0-9]{6,8}$/, "userPin Error");
  // public keyInfo: KeyInfo = new KeyInfo('RSA', 4096, ['cert']);
  // public expireDate: DateValue = new DateValue(expireDate(), 'expireDate error');
  // public uids: Container<Uid> = new Container<Uid>(() => { return new Uid(); });
  // public subKeys: Container<KeyInfo> = new Container<KeyInfo>(() => { return new KeyInfo(); });

}

export default SimpleYubikey;
