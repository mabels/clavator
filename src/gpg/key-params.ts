import Option from '../model/option';
import Validatable from '../model/validatable';
import { assignOnError } from '../model/helper';

export class KeyParams implements Validatable {
  public type: Option<string>;
  public masterLen: Option<number>;
  public subLen: Option<number>;

  constructor() {
    this.type = new Option('RSA', ['RSA', 'DSA'], 'keyType Error');
    this.masterLen = new Option(4096, [1024, 2048, 4096, 8192], 'master keyLength Error');
    this.subLen = new Option(4096, [1024, 2048, 4096, 8192], 'master keyLength Error');
  }

  public valid(): boolean {
    return this.type.valid() && this.masterLen.valid() && this.subLen.valid();
  }

  public errText(): string[] {
    const ret: string[] = [];
    assignOnError(this.type.valid(), ret, this.type.errText);
    assignOnError(this.masterLen.valid(), ret, this.masterLen.errText);
    assignOnError(this.subLen.valid(), ret, this.subLen.errText);
    return ret;
  }

  public fill(js: any): void {
    this.type.value = js['type'];
    this.masterLen.value = js['masterLen'];
    this.subLen.value = js['subLen'];
  }

}

export default KeyParams;
