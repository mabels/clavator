import { observable } from 'mobx';
import { NestedFlag, Warrents, Warrent } from '../../model';
import { PassPhrase } from './pass-phrase';
import { SimpleKeyCommon } from './simple-key-common';
import { DiceWare } from '../../dice-ware';
import { CharFormat } from './char-format';
import { KeyGen, KeyInfo, KeyToYubiKey } from '../../gpg/types';

// import { assignOnError } from '../../model/helper';

export class SimpleYubikey {
  public readonly warrents: Warrents;

  public readonly common: SimpleKeyCommon;
  public smartCardId: string;
  public readonly passPhrase: PassPhrase;
  public readonly adminKey: PassPhrase;
  public readonly userKey: PassPhrase;
  @observable public readonly readOnly: NestedFlag;

  public static createDiceWare(warrents: Warrents): Warrents {
    const ret = new Warrents();
    for (let i = 0; i < 8; ++i) {
      ret.add(warrents.get(i % warrents.length));
    }
    return ret;
  }

  public static fill(obj: any): SimpleYubikey {
    const warrents = new Warrents();
    obj['warrents'].forEach((warrent: string) => warrents.add(new Warrent(warrent)));
    const syk = new SimpleYubikey(warrents, [], obj['smartCardId']);
    syk.common.fill(syk.warrents, obj['common']);
    syk.passPhrase.fill(obj['passPhrase']);
    syk.adminKey.fill(obj['adminKey']);
    syk.userKey.fill(obj['userKey']);
    return syk;
  }

  constructor(warrents: Warrents, diceWares: DiceWare[], smartCardId: string) {
    this.warrents = warrents;
    this.smartCardId = smartCardId;
    this.readOnly = new NestedFlag(false);
    this.common = new SimpleKeyCommon(warrents, this.readOnly);
    this.passPhrase = PassPhrase.createDoublePasswords(8, new Warrents(this.warrents.map(w => w)), diceWares,
      CharFormat.wildcard(), 'PassPhrase error', ' ', 1);
    this.adminKey = PassPhrase.createPerWarrent(new Warrents(this.warrents.map(w => w)), null,
      CharFormat.decNumber(), 'adminpin error', '', 8, 8);
    const me = (new Warrents()).add(warrents.first());
    this.userKey = PassPhrase.createPerWarrent(me, null, CharFormat.decNumber(), 'userPin Error', '', 6, 8);
  }

  // @computed public get readOnly(): boolean {
  //   return this.common.viewWarrents.non();
  // }

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

  public asKeyGen(): KeyGen {
    const kg = KeyGen.withSubKeys(3);
    this.common.uids.forEach(k => kg.uids.add(k));
    kg.expireDate.value = this.common.expireDate.value;
    kg.keyInfo = new KeyInfo(this.common.keyParams.type.value,
                             this.common.keyParams.masterLen.value,
                             ['cert']);
    kg.subKeys.forEach(ki => {
      ki.type.value = this.common.keyParams.type.value;
      ki.length.value = this.common.keyParams.subLen.value;
    });
    kg.password.value.set(this.passPhrase.getPassPhrase());
    return kg;
  }

  public asKeyToYubiKey(fpr: string, slot_id: number): KeyToYubiKey {
    const ktyk = new KeyToYubiKey();
    ktyk.card_id = this.smartCardId;
    ktyk.admin_pin.pin = '12345678';
    ktyk.fingerprint = fpr;
    ktyk.slot_id = slot_id;
    ktyk.passphrase.value = this.passPhrase.getPassPhrase();
    return ktyk;
  }

  // public password: PwPair = new PwPair(/^.{14,1024}$/, 'Password Error');
  // // adminPin: PwPair = new PwPair(/^[0-9]{8}$/, "adminPin Error");
  // // userPin: PwPair = new PwPair(/^[0-9]{6,8}$/, "userPin Error");
  // public keyInfo: KeyInfo = new KeyInfo('RSA', 4096, ['cert']);
  // public expireDate: DateValue = new DateValue(expireDate(), 'expireDate error');
  // public uids: Container<Uid> = new Container<Uid>(() => { return new Uid(); });
  // public subKeys: Container<KeyInfo> = new Container<KeyInfo>(() => { return new KeyInfo(); });

  public toObj(): any {
    return {
      smartCardId: this.smartCardId,
      warrents: this.warrents.toObj(),
      common: this.common.toObj(),
      passPhrase: this.passPhrase.toObj(),
      adminKey: this.adminKey.toObj(),
      userKey: this.userKey.toObj(),
    };
  }

}
