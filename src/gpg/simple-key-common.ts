
import { observable, computed } from 'mobx';
import DateValue from './date-value';
import KeyParams from './key-params';
import Container from './container';
import KeyGenUid from './key-gen-uid';
import Warrents from './warrents';
import ApprovableWarrents from './approvable-warrents';
import { expireDate, assignOnError } from './helper';

export class SimpleKeyCommon {
  @observable public readonly approvableWarrents: ApprovableWarrents;

  @observable public expireDate: DateValue;
  @observable public keyParams: KeyParams;
  @observable public uids: Container<KeyGenUid>;

  constructor(warrents: Warrents) {
    this.approvableWarrents = ApprovableWarrents.from(warrents);
    this.expireDate = new DateValue(expireDate(), 'expireDate error');
    this.keyParams = new KeyParams();
    this.uids = new Container<KeyGenUid>(() => { return new KeyGenUid(); });
    this.uids.add(new KeyGenUid());
  }

  public valid(): boolean {
    // console.log('SimpleKeyCommons:valid:', this.uids.length(),
    // this.uids.valid());
    return this.expireDate.valid() &&
    this.keyParams.valid() &&
    this.uids.valid();
  }

  @computed public get completed(): boolean {
    console.log('SimpleKeyCommons:completed:', this.approvableWarrents.map(i => i.approved.value),
       this.valid(), this.approvableWarrents.completed());
    return this.approvableWarrents.completed() && this.valid();
  }

}

export default SimpleKeyCommon;
