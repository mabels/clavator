import Pin from './pin';
import MutableString from '../model/mutable-string';
import { observable } from 'mobx';

export class KeyToYubiKey {
  public fingerprint: string;
  public card_id: string;
  @observable
  public slot_id: number = null;
  public admin_pin: Pin = new Pin();
  public passphrase: MutableString = new MutableString();

  public static fill(js: any): KeyToYubiKey {
    let ra = new KeyToYubiKey();
    ra.fingerprint = js['fingerprint'];
    ra.card_id = js['card_id'];
    ra.slot_id = js['slot_id'];
    ra.admin_pin.pin = js['admin_pin']['pin'];
    ra.passphrase = MutableString.fill(js['passphrase']);
    return ra;
  }

  constructor() {
    this.fingerprint = '';
    this.card_id = '';
  }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }

  public verifyText(): string[] {
    let ret: string[] = [];
    if (this.fingerprint.length == 0) {
      ret.push('fingerprint had to set.');
    }
    if (this.slot_id === null && this.slot_id < 0) {
      ret.push('slot_id not set.');
    }
    if (this.card_id.length == 0) {
      ret.push('card-id had to be set.');
    }
    ret = ret.concat(this.admin_pin.verifyText());
    if (this.passphrase.value == null || this.passphrase.value.length <= 8) {
      ret.push('passphrase had to be set.');
    }
    return ret;
  }
}

// export default KeyToYubiKey;
