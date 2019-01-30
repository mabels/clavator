import { observable, IObservableValue, computed } from 'mobx';
import { Validatable } from './validatable';
import { ObjectId } from './object-id';

export class StringValue extends ObjectId implements Validatable {
  public match: RegExp;
  public readonly _value: IObservableValue<string>;
  public readonly errorText: string;

  public static fill(js: any, dv: StringValue): void {
    dv._value.set(js['_value'] || js['value'] || dv.value);
    // console.log(`StringValue:${dv.value}:${js['value']}`);
  }

  public constructor(match: RegExp, errorText: string, value = '') {
    super('StringValue');
    this.match = match;
    this._value = observable.box(value ? value : '');
    this.errorText = errorText;
  }

  @computed
  public get value(): string {
    return this._value.get();
  }

  @computed
  public get length(): number {
    return this.value.length;
  }

  public get errText(): string[] {
    return [ this.errorText ];
  }

  @computed
  public get valid(): boolean {
    return this.match.test(this.value);
  }

  public fill(js: any): void {
    this._value.set(js);
  }

}
