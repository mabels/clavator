import { observable } from 'mobx';
import Validatable from './validatable';

let objectId = 0;

export class BooleanValue implements Validatable {
  public readonly key: string;
  public errorText: string;
  @observable public value: boolean;

  public static fill(js: any, dv: BooleanValue): void {
    dv.value = js['value'] || dv.value;
  }

  public constructor(errorText: string) {
    this.errorText = errorText;
    this.key = `BooleanValue:${objectId++}`;
    this.value = true;
  }

  public set(b: boolean): BooleanValue {
    this.value = b;
    return this;
  }

  public errText(): string[] {
    return [ this.errorText ];
  }

  public valid(): boolean {
    return true;
  }

  public fill(js: any): void {
    this.value = js['value'];
  }

}

export default BooleanValue;
