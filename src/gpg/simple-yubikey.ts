import { observable } from 'mobx';
import DateValue from './date-value';
import Option from './option';
import Container from './container';
import Validatable from './validatable';
// import StringValue from './string-value';
import KeyGenUid from './key-gen-uid';
import Warrents from './warrents';
import Warrent from './warrent';
import KeyParams from './key-params';
import PassPhrase from './pass-phrase';
import SimpleKeyCommon from './simple-key-common';
import { expireDate, assignOnError } from './helper';

export class SimpleYubikey {
  @observable public readonly warrents: Warrents;

  @observable public common: SimpleKeyCommon;

  @observable public passPhrase: PassPhrase;
  @observable public adminKey: PassPhrase;
  @observable public userKey: PassPhrase;

  constructor(warrents: Warrents) {
    this.warrents = warrents;
    this.common = new SimpleKeyCommon(warrents);
    this.passPhrase = PassPhrase.createPassPhrase(warrents, '.', 'PassPhrase error', 14);
    this.adminKey = PassPhrase.createPassPhrase(warrents, '[0-9]', 'adminpin error', 8, 8);
    const me = (new Warrents()).add(warrents.first());
    this.userKey = PassPhrase.createPassPhrase(me, '[0-9]', 'userPin Error', 6, 8);
  }

  public valid(): boolean {
    return this.warrents.valid() &&
      this.common.valid() &&
      this.passPhrase.valid() &&
      this.adminKey.valid() &&
      this.userKey.valid();
  }

  public completed(): boolean {
    // console.log('SimpleYubikey:',
    //       this.valid(),
    //       this.common.completed(),
    //       this.passPhrase.completed(),
    //       this.adminKey.completed(),
    //       this.userKey.valid());
    return this.valid() &&
           this.common.completed &&
           this.passPhrase.completed() &&
           this.adminKey.completed() &&
           this.userKey.completed();
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
