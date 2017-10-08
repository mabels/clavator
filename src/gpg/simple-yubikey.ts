import { observable } from 'mobx';
import DateValue from './date-value';
import Option from './option';
import Container from './container';
import Validatable from './validatable';
// import StringValue from './string-value';
import KeyGenUid from './key-gen-uid';
import Warrents from './warrents';
import KeyParams from './key-params';
import PassPhrase from './pass-phrase';
import { expireDate, assignOnError } from './helper';

export class SimpleYubikey {
  @observable public readonly warrents: Warrents;

  @observable public expireDate: DateValue;
  @observable public keyParams: KeyParams;

  @observable public uids: Container<KeyGenUid>;
  @observable public passPhrase: PassPhrase;
  @observable public adminKey: PassPhrase;
  @observable public userKey: PassPhrase;

  public static createPassPhrase(warrents: Warrents, reg: string, errText: string,
    minLen: number, maxLen?: number): PassPhrase {
    let strMaxLen = maxLen || '';
    let wlen = warrents.length();
    if (wlen > maxLen) {
      wlen = maxLen;
    }
    minLen = minLen / wlen;
    if (!minLen) {
      minLen = 1;
    }
    maxLen = maxLen / wlen;
    if (!maxLen) {
      maxLen = 1;
    }
    // if (wlen >= 8) {
    //   return wlen;
    // }
    // let quot = ~~(8 / wlen);
    // if (quot * wlen == 8) {
    //   return 8;
    // } else {
    //   return (1 + quot) * wlen;
    // }
    if (minLen == maxLen) {
    }
    console.log('createPassPhrease', wlen, warrents, maxLen, minLen);
    const regex = new RegExp(`^${reg}{${minLen},${strMaxLen}}$`);
    return new PassPhrase(warrents.map(w => w), regex, errText);
  }
  constructor(warrents: Warrents) {
    this.warrents = warrents;
    this.expireDate = new DateValue(expireDate(), 'expireDate error');
    this.keyParams = new KeyParams();
    this.uids = new Container<KeyGenUid>(() => { return new KeyGenUid(); });
    this.uids.add(new KeyGenUid());
    this.passPhrase = SimpleYubikey.createPassPhrase(warrents, '.', 'PassPhrase error', 14);
    this.adminKey = SimpleYubikey.createPassPhrase(warrents, '[0-9]', 'adminpin error', 8, 8);
    this.userKey = new PassPhrase(1, /^[0-9]{6,8}$/, 'userPin Error');
  }

  public valid(): boolean {
    return this.warrents.valid() &&
      this.expireDate.valid() &&
      this.keyParams.valid() &&
      this.uids.valid() &&
      this.passPhrase.valid() &&
      this.adminKey.valid() &&
      this.userKey.valid();
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
