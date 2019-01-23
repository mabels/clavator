import { observable, IObservableFactories, IObservableArray } from 'mobx';
import { ObjectId } from './object-id';

export class MultiOption<T> extends ObjectId {
  public readonly values: IObservableArray<T>;
  public readonly options: T[];
  public readonly errText: string;

  public static fill<U>(js: any, dv: MultiOption<U>): void {
    dv.values.replace(js['values'] || dv.values);
  }

  public constructor(v: T[], t: T[], e: string) {
    super('MultiOption');
    this.values = observable.array(v);
    this.options = t;
    this.errText = e;
  }

  public map(cb: (selected: boolean, o: T) => any): any {
    return this.options.map((o) => cb(!!this.values.find((q: T) => q == o), o));
  }

  public valid(): boolean {
    return this.values.length == this.options.filter((q: T) => {
      return !!this.values.find((u: T) => u == q);
    }).length;
  }

}
