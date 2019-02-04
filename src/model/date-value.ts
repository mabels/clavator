import { ObjectId } from './object-id';
import { IObservableValue, observable, computed, action, IValueDidChange } from 'mobx';
import { format_date } from './helper';

export interface DateValueObj {
  readonly formatDate: string;
  readonly errText: string;
}

export class DateValue extends ObjectId {
  public readonly date: IObservableValue<Date>;
  public readonly formatDate: IObservableValue<string>;
  public errText: string;

  public constructor(v: Date, e: string) {
    super('DateValue');
    this.errText = e;
    this.date = observable.box(undefined);
    this.date.observe(action((chg: IValueDidChange<Date>) => {
      const f = format_date(chg.newValue);
      this.formatDate.set(f);
      // chg.newValue.setHours(0);
      // chg.newValue.setMinutes(0);
      // chg.newValue.setSeconds(0);
      // chg.newValue.setMilliseconds(0);
      // console.log('observe fix', chg.newValue);
    }));
    this.formatDate = observable.box(undefined);
    this.formatDate.observe(action((chg: IValueDidChange<string>) => {
      this.date.set(new Date(chg.newValue));
    }));
    action(() => this.formatDate.set(format_date(v)))();
  }

  @action
  public fill(js: DateValueObj): void {
    this.formatDate.set(js.formatDate);
    this.errText = js.errText;
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

  public toObj(): DateValueObj {
    return {
      formatDate: this.formatDate.get(),
      errText: this.errText
    };
  }
}
