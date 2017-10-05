import { observable } from 'mobx';
import Validatable from './validatable';

let objectId = 0;

export class StringValue implements Validatable {
  public readonly key: string;
  public match: RegExp;
  @observable public value: string;
  public errorText: string;

  public static fill(js: any, dv: StringValue): void {
    dv.value = js['value'] || dv.value;
  }

  public constructor(match: RegExp, e: string) {
    this.key = `StringValue:${objectId++}`;
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
