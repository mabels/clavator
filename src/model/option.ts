import { ObjectId } from './object-id';
import { observable, IObservableValue, computed } from 'mobx';

export class Option<T> extends ObjectId {
  public readonly _value: IObservableValue<T>;
  public readonly options: T[] = [];
  public readonly errText: string;

  public static fill<U>(js: any, dv: Option<U>): void {
    // console.log(">>>>Option>>>", js)
    dv._value.set(js['_value'] || js['value'] || dv.value);
    // console.log("<<<<<<Option<<<<", dv)
  }

  public constructor(v: T, t: T[], e: string) {
    super('Option');
    this._value = observable.box(v);
    this.options = t;
    this.errText = e;
  }

  @computed
  public get value(): T {
    return this._value.get();
  }

  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map(o => cb(this.value == o, o));
  }

  @computed
  public get valid(): boolean {
    return !!this.options.find((i: T) => i == this.value);
  }
}
