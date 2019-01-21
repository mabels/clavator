import { observable, IObservableValue, computed } from 'mobx';

export class MutableString {
  public readonly _value: IObservableValue<string> = observable.box(undefined);

  public static fill(js: any): MutableString {
    let m = new MutableString();
    if (js) {
      m._value.set(js['value']);
    }
    return m;
  }

  @computed
  public get value(): string {
    return this._value.get();
  }
}
