import { ObjectId } from './object-id';
import { IObservableValue, observable, computed } from 'mobx';

export class DateValue extends ObjectId {
  public readonly _value: IObservableValue<Date>;
  public errText: string;

  public static fill(js: any, dv: DateValue): void {
    dv._value.set(new Date(js['_value'] || js['value']) || dv.value);
  }

  public constructor(v: Date, e: string) {
    super('DateValue');
    this._value = observable.box(v);
    this.errText = e;
  }

  @computed
  public get value(): Date {
    return this._value.get();
  }

  public valid(): boolean {
    let tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return this.value.getTime() > tomorrow.getTime();
  }
}
