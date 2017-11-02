import { observable } from 'mobx';
import Validatable from './validatable';
import ObjectId from './object-id';

export class StringValue extends ObjectId implements Validatable {
  public match: RegExp;
  @observable public value: string;
  public errorText: string;

  public static fill(js: any, dv: StringValue): void {
    dv.value = js['value'] || dv.value;
  }

  public constructor(match: RegExp, e: string) {
    super('StringValue');
    this.match = match;
    this.value = '';
    this.errorText = e;
  }

  public errText(): string[] {
    return [ this.errorText ];
  }

  public valid(): boolean {
    return this.match.test(this.value);
  }

  public fill(js: any): void {
    this.value = js;
  }

}

export default StringValue;
