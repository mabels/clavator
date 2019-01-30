import { ObjectId } from './object-id';
import { IObservableValue, observable, computed } from 'mobx';
import { format_date } from './helper';

export class DateValue extends ObjectId {
  public readonly value: IObservableValue<string>;
  public errText: string;

  public static fill(js: any, dv: DateValue): void {
    dv.value.set(js['_value'] || js['value'] || dv.value);
  }

  public constructor(v: Date, e: string) {
    super('DateValue');
    this.value = observable.box(v.toString());
    this.errText = e;
  }

  @computed
  public get valid(): boolean {
    const tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return (new Date(this.value.get())).getTime() > tomorrow.getTime();
  }

  @computed
  public get formatDate(): string {
    return format_date(new Date(this.value.get()));
  }

  @computed
  public get isoString(): string {
    return (new Date(this.value.get())).toISOString();
  }

  public toObj(): string {
    return this.isoString;
  }
}
