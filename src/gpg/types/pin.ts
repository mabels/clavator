import { observable, computed, IObservableValue, action, isObservable, IValueDidChange } from 'mobx';

export interface PinProps {
  readonly pin?: string;
  readonly _pin?: IObservableValue<string>;
  readonly match?: RegExp;
}

const PinDefaultRegex = '/.+/';
export class Pin {
  public readonly pin: IObservableValue<string>;
  // public readonly valid: boolean;
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
      this.pin = observable.box(props.pin);
    } else if (props._pin) {
      this.pin = props._pin;
    } else {
      this.pin = observable.box('');
    }
    this.match = props.match || new RegExp(PinDefaultRegex);
  }

  @computed
  public get valid(): boolean {
    return this.pin.get().length > 0;
  }

  public verifyText(): string[] {
    const ret: string[] = [];
    if (!this.match.test(this.pin.get())) {
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
