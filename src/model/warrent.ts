import { ObjectId } from './object-id';
import { Pallet } from './pallet';
import { StringValue } from './string-value';
import { computed } from 'mobx';

export class Warrent extends ObjectId implements Pallet {
  public readonly warrent: StringValue;

  constructor(name?: string) {
    super('Warrent');
    this.warrent = new StringValue(/[a-zA-Z_\-0-9]{2,}/, 'comment error', name);
  }

  public value(): string {
    return this.warrent.value;
  }

  @computed
  public get valid(): boolean {
    return this.warrent.valid;
  }

  @computed
  public get errText(): string[] {
    return this.warrent.errText;
  }

  public fill(js: any): void {
    return this.warrent.fill(js['initial']);
  }

  public toObj(): any {
    return this.warrent.value;
  }

}
