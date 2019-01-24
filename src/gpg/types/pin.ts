import { observable, computed, IObservableValue, action } from 'mobx';

export interface PinProps {
  readonly pin?: string;
  readonly _pin?: IObservableValue<string>;
  readonly match?: RegExp;
}

const PinDefaultRegex = '/.+/';
export class Pin {
  public readonly _pin: IObservableValue<string>;
  public match: RegExp;

  @action
  public static fill(js: any): Pin {
    const pin = new Pin({
      pin: js['_pin'] || js['pin'],
      match: new RegExp(js['match'] || PinDefaultRegex)
    });
    return pin;
  }

  public constructor(props: PinProps = {}) {
    if (props.pin) {
      this._pin = observable.box(props.pin);
    } else if (props._pin) {
      this._pin = props._pin;
    } else {
      this._pin = observable.box('');
    }
    this.match = props.match || new RegExp(PinDefaultRegex);
  }

  @computed
  public get pin(): string {
    return this._pin.get();
  }

  public verify(): boolean {
    return this.verifyText().length == 0;
  }
  public verifyText(): string[] {
    const ret: string[] = [];
    if (!this.match.test(this.pin)) {
      ret.push(`Pin does not match:${this.match.toString()}`);
    }
    return ret;
  }
}

export function AdminPin(): Pin {
  return new Pin({
    match: /[0-9]{8}/
  });
}
