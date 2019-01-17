import { observable } from 'mobx';
import Validatable from './validatable';
import ObjectId from './object-id';

export class BooleanValue extends ObjectId implements Validatable {
  public errorText: string;
  @observable public value: boolean;

  public static fill(js: any, dv: BooleanValue): void {
    dv.value = js['value'] || dv.value;
  }

  public constructor(errorText: string) {
    super('BooleanValue');
    this.errorText = errorText;
    this.value = true;
  }

  public set(b: boolean): BooleanValue {
    this.value = b;
    return this;
  }

  public errText(): string[] {
    return [this.errorText];
  }

  public valid(): boolean {
    return true;
  }

  public fill(js: any): void {
    this.value = js['value'];
  }
}

// export default BooleanValue;
