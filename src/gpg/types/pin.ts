import { observable, computed, IObservableValue, action } from 'mobx';

export class Pin {
  public readonly _pin: IObservableValue<string> = observable.box('');
  public match: RegExp = /.+/;

  @action
  public static fill(js: any): Pin {
    const pin = new Pin();
    pin._pin.set(js['pin']);
    return pin;
  }

  @computed
  public get pin(): string {
    return this._pin.get();
  }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }
  public verifyText(): string[] {
    let ret: string[] = [];
    if (!this.match.test(this.pin)) {
      ret.push(`Pin does not match:${this.match.toString()}`);
    }
    return ret;
  }
}

export function AdminPin(): Pin {
  const ret = new Pin();
  ret.match = /[0-9]{8}/;
  return ret;
}
