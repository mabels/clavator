import Pallet from './pallet';
import StringValue from './string-value';

let warrentKey = 1;
export class Warrent implements Pallet {
  public readonly key: string;
  public initial: StringValue = new StringValue(/[a-zA-Z_\-0-9]{2,}/, 'comment error');

  constructor() {
    this.key = `Warrent:${warrentKey++}`;
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
