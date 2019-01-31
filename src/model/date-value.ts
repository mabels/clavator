import { ObjectId } from './object-id';
import { IObservableValue, observable, computed, action, IValueDidChange } from 'mobx';
import { format_date } from './helper';

export class DateValue extends ObjectId {
  public readonly date: IObservableValue<Date>;
  public readonly formatDate: IObservableValue<string>;
  public readonly errText: string;

  public static fill(js: any, dv: DateValue): void {
    dv.date.set(js['date'] || dv.date);
  }

  public constructor(v: Date, e: string) {
    super('DateValue');
    this.errText = e;
    this.date = observable.box(v);
    this.formatDate = observable.box(format_date(v));
    this.date.observe(action((chg: IValueDidChange<Date>) => {
      this.formatDate.set(format_date(chg.newValue));
    }));
    this.formatDate.observe(action((chg: IValueDidChange<string>) => {
      this.date.set(new Date(chg.newValue));
    }));
  }

  @computed
  public get valid(): boolean {
    const tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return this.date.get().getTime() > tomorrow.getTime();
  }

  /*
  @computed
  public get formatDate(): string {
    return format_date(this.date.get());
  }
  */

  @computed
  public get isoString(): string {
    return this.date.get().toISOString();
  }

  public toObj(): string {
    return this.isoString;
  }
}
