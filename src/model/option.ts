import ObjectId from './object-id';
import { observable } from 'mobx';

export class Option<T> extends ObjectId {
  @observable public value: T;
  public options: T[] = [];
  public errText: string;

  public static fill<U>(js: any, dv: Option<U>): void {
    // console.log(">>>>Option>>>", js)
    dv.value = js['value'] || dv.value;
    // console.log("<<<<<<Option<<<<", dv)
  }

  public constructor(v: T, t: T[], e: string) {
    super('Option');
    this.value = v;
    this.options = t;
    this.errText = e;
  }

  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(this.value == o, o));
  }
  public valid(): boolean {
    return !!this.options.find((i: T) => i == this.value);
  }
}

export default Option;
