import { Pin } from './pin';
// import { MutableString } from '../../model';
import { observable, IObservableValue, computed } from 'mobx';

export class KeyToYubiKey {
  public readonly _fingerprint: IObservableValue<string> = observable.box('');
  public readonly _card_id: IObservableValue<string> = observable.box('');
  public readonly _slot_id: IObservableValue<number> = observable.box(undefined);
  public readonly admin_pin: Pin = new Pin();
  public readonly passphrase: IObservableValue<string> = observable.box(); // MutableString = new MutableString();

  public static fill(js: any): KeyToYubiKey {
    const ra = new KeyToYubiKey();
    ra._fingerprint.set(js['_fingerprint'] || js['fingerprint']);
    ra._card_id.set(js['_card_id'] || js['card_id']);
    ra._slot_id.set(js['_slot_id'] || js['slot_id']);
    ra.admin_pin._pin.set(js['admin_pin']['pin']);
    ra.passphrase.set(js['passphrase']);
    return ra;
  }

  @computed
  public get slot_id(): number {
    return this._slot_id.get();
  }

  @computed
  public get card_id(): string {
    return this._card_id.get();
  }

  @computed
  public get fingerprint(): string {
    return this._fingerprint.get();
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
