import Pallet from './pallet';
import StringValue from './string-value';
// import RegMinMaxWarrent from './reg-min-max-warrent';

let warrentKey = 1;
export class Warrent implements Pallet {
  public readonly key: string;
  public warrent: StringValue = new StringValue(/[a-zA-Z_\-0-9]{2,}/, 'comment error');

  constructor() {
    this.key = `Warrent:${warrentKey++}`;
  }

  public value(): string {
    return this.warrent.value;
  }

  public valid(): boolean {
    return this.warrent.valid();
  }

  public errText(): string[] {
    return this.warrent.errText();
  }

  public fill(js: any): void {
    return this.warrent.fill(js['initial']);
  }

}

export default Warrent;
