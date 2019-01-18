import { observable, IObservableValue, computed } from 'mobx';
import { Validatable } from './validatable';
import { ObjectId } from './object-id';

export class StringValue extends ObjectId implements Validatable {
  public match: RegExp;
  public value: IObservableValue<string>;
  public errorText: string;

  public static fill(js: any, dv: StringValue): void {
    dv.value.set(js['value'] || dv.value);
    // console.log(`StringValue:${dv.value}:${js['value']}`);
  }

  public constructor(match: RegExp, e: string, value = '') {
    super('StringValue');
    this.match = match;
    this.value = observable.box(value ? value : '');
    this.errorText = e;
  }

  @computed
  public get length(): number {
    return this.value.get().length;
  }

  public errText(): string[] {
    return [ this.errorText ];
  }

  public valid(): boolean {
    return this.match.test(this.value.get());
  }

  public fill(js: any): void {
    this.value = js;
  }

}
