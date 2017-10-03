import Validatable from './validatable';

export class StringValue implements Validatable {
  public match: RegExp;
  public value: string;
  public errorText: string;

  public static fill(js: any, dv: StringValue): void {
    dv.value = js['value'] || dv.value;
  }

  public constructor(match: RegExp, e: string) {
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
