import { ObjectId } from './object-id';
import { IObservableValue, observable } from 'mobx';

export class DateValue extends ObjectId {
  public value: IObservableValue<Date>;
  public errText: string;

  public static fill(js: any, dv: DateValue): void {
    dv.value.set(new Date(js['value']) || dv.value.get());
  }

  public constructor(v: Date, e: string) {
    super('DateValue');
    this.value = observable.box(v);
    this.errText = e;
  }

  public valid(): boolean {
    let tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return this.value.get().getTime() > tomorrow.getTime();
  }
}
