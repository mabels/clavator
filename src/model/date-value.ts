import { ObjectId } from './object-id';
import { observable } from 'mobx';

export class DateValue extends ObjectId {
  @observable
  public value: Date;
  public errText: string;

  public static fill(js: any, dv: DateValue): void {
    dv.value = new Date(js['value']) || dv.value;
  }

  public constructor(v: Date, e: string) {
    super('DateValue');
    this.value = v;
    this.errText = e;
  }

  public valid(): boolean {
    let tomorrow = new Date(Date.now());
    tomorrow.setHours(tomorrow.getHours() + 24);
    return this.value.getTime() > tomorrow.getTime();
  }
}
