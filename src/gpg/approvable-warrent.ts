import { observable } from 'mobx';
import Warrent from './warrent';
import BooleanValue from './boolean-value';
import Pallet from './pallet';

let approvableKey = 1;

export class ApprovableWarrent implements Pallet {
  public key: string;
  @observable public readonly approved: BooleanValue;
  @observable public readonly warrent: Warrent;

  constructor(warrent: Warrent) {
    this.key = `ApprovableWarrent:${approvableKey++}`;
    this.approved = new BooleanValue('').set(false);
    this.warrent = warrent;
  }

  public valid(): boolean {
    return this.warrent.valid() && this.approved.value;
  }

  public errText(): string[] {
    return ['WTF'];
  }

  public fill(o: any): void {
    this.key = o['key'] || this.key;
    this.approved.fill(o['approved']);
    this.warrent.fill(o['warrent']);
  }

}

export default ApprovableWarrent;
