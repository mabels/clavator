import Pallet from './pallet';
import StringValue from './string-value';

let warrentKey = 1;
export class Warrent implements Pallet {
  public readonly key: string;
  public initial: StringValue = new StringValue(/.*/, 'comment error');

  constructor() {
    this.key = '' + warrentKey++;
  }

  public valid(): boolean {
    return this.initial.valid();
  }

  public errText(): string[] {
    return this.initial.errText();
  }

  public fill(js: any): void {
    return this.initial.fill(js['initial']);
  }

}

export default Warrent;
