import ObjectId from '../model/object-id';
import Pallet from '../model/pallet';
import StringValue from '../model/string-value';
// import RegMinMaxWarrent from './reg-min-max-warrent';

export class Warrent extends ObjectId implements Pallet {
  public warrent: StringValue;

  constructor(name?: string) {
    super('Warrent');
    this.warrent = new StringValue(/[a-zA-Z_\-0-9]{2,}/, 'comment error', name);
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

  public toObj(): any {
    return this.warrent.value;
  }

}

export default Warrent;
