import { observable, IObservableValue, computed } from 'mobx';
import { Validatable } from './validatable';
import { ObjectId } from './object-id';

export class BooleanValue extends ObjectId implements Validatable {
  public errorText: string;
  public readonly _value: IObservableValue<boolean> = observable.box(true);

  public static fill(js: any, dv: BooleanValue): void {
    dv._value.set(js['_value'] || js['value'] || dv.value);
  }

  public constructor(errorText: string) {
    super('BooleanValue');
    this.errorText = errorText;
  }

  @computed
  public get value(): boolean {
    return this._value.get();
  }

  public set(b: boolean): BooleanValue {
    this._value.set(b);
    return this;
  }

  public errText(): string[] {
    return [this.errorText];
  }

  public valid(): boolean {
    return true;
  }

  public fill(js: any): void {
    this._value.set(js['value']);
  }
}
