import { Pin } from './pin';
// import { MutableString } from '../../model';
import { observable, IObservableValue, computed } from 'mobx';

export interface KeyToYubiKeyProps {
  readonly fingerprint: string;
  readonly card_id: string;

  readonly slot_id?: number;
  readonly passphrase?: string;
  readonly admin_pin?: Pin;
}

export class KeyToYubiKey {
  public readonly fingerprint: string;
  public readonly card_id: string;
  public readonly slot_id: IObservableValue<number>;
  public readonly passphrase: IObservableValue<string>;
  public readonly admin_pin: Pin;

  public static fill(js: any): KeyToYubiKey {
    return new KeyToYubiKey({
      fingerprint: js['_fingerprint'] || js['fingerprint'],
      card_id: js['_card_id'] || js['card_id'],
      slot_id: js['_slot_id'] || js['slot_id'],
      admin_pin: Pin.fill(js['admin_pin']),
      passphrase: js['_passphrase'] || js['passphrase']
    });
  }

  public constructor(props: KeyToYubiKeyProps) {
    this.fingerprint = props.fingerprint;
    this.card_id = props.card_id;
    this.slot_id = observable.box(props.slot_id);
    this.passphrase = observable.box(props.passphrase);
    this.admin_pin = props.admin_pin || new Pin();
  }

  // @computed
  // public get slot_id(): number {
  //   return this._slot_id.get();
  // }

  // @computed
  // public get card_id(): string {
  //   return this._card_id.get();
  // }

  // @computed
  // public get fingerprint(): string {
  //   return this._fingerprint.get();
  // }

  // @computed
  // public get passphrase(): string {
  //   return this._passphrase.get();
  // }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }

  public verifyText(): string[] {
    let ret: string[] = [];
    if (this.fingerprint.length == 0) {
      ret.push('fingerprint had to set.');
    }
    if (typeof this.slot_id.get() !== 'number' && this.slot_id.get() < 0) {
      ret.push('slot_id not set.');
    }
    if (this.card_id.length == 0) {
      ret.push('card-id had to be set.');
    }
    ret = ret.concat(this.admin_pin.verifyText());
    if (typeof this.passphrase.get() !== 'string' || this.passphrase.get().length <= 8) {
      ret.push('passphrase had to be set.');
    }
    return ret;
  }
}
