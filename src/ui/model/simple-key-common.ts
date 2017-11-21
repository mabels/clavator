
import { observable, computed } from 'mobx';
import NestedFlag from '../../model/nested-flag';
import DateValue from '../../model/date-value';
import KeyParams from '../../gpg/key-params';
import Container from '../../model/container';
import KeyGenUid from '../../gpg/key-gen-uid';
import Warrents from '../../gpg/warrents';
import ViewWarrents from './view-warrents';
import { expireDate } from '../../model/helper';

export class SimpleKeyCommon {
  @observable public readonly viewWarrents: ViewWarrents;
  @observable public readOnly: NestedFlag;

  @observable public expireDate: DateValue;
  @observable public keyParams: KeyParams;
  @observable public uids: Container<KeyGenUid>;

  constructor(warrents: Warrents, nestedFlag: NestedFlag) {
    this.readOnly = new NestedFlag(nestedFlag);
    this.viewWarrents = ViewWarrents.from(warrents);
    this.expireDate = new DateValue(expireDate(), 'expireDate error');
    this.keyParams = new KeyParams();
    this.uids = new Container<KeyGenUid>(() => { return new KeyGenUid(); });
    const kgu = new KeyGenUid();
    if (warrents.length() > 1) {
      kgu.comment.value = `Warrents ${warrents.tail().map(i => `[${i.warrent.value}]`).join(',')}`;
    }
    this.uids.add(kgu);
  }

  public showWarrents(): boolean {
    return this.viewWarrents.length() > 1;
  }

  public valid(): boolean {
    // console.log('SimpleKeyCommons:valid:', this.uids.length(),
    // this.uids.valid());
    return this.expireDate.valid() &&
    this.keyParams.valid() &&
    this.uids.valid();
  }

  @computed public get completed(): boolean {
    // console.log('SimpleKeyCommons:completed:', this.viewWarrents.map(i => i.approved),
    //  this.valid(), this.viewWarrents.completed());
    return this.viewWarrents.completed() && this.valid();
  }

  public fill(warrents: Warrents, obj: any): void {
    this.expireDate.value = new Date(obj['expireDate']);
    this.keyParams.fill(obj['keyParams']);
    this.uids.fill({ pallets : obj['uids'] });
  }

  public toObj(): any {
    return {
      expireDate: this.expireDate.value.toJSON(),
      approvedWarrents: this.viewWarrents.toObj(),
      keyParams: this.keyParams.toObj(),
      uids: this.uids.toObj()
    };
  }
}

export default SimpleKeyCommon;
