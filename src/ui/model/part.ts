import { observable } from 'mobx';
import RegMinMaxWarrent from './reg-min-max-warrent';
import Validatable from '../../model/validatable';
import StringValue from '../../model/string-value';
import PassPhrase from './pass-phrase';

export class Part implements Validatable {
  @observable public part: StringValue;
  @observable public verify: StringValue;
  public regMinMaxWarrent: RegMinMaxWarrent;
  public passPhrase: PassPhrase;

  constructor(passPhrase: PassPhrase, warrent: RegMinMaxWarrent) {
    this.part = new StringValue(warrent.createReg(), '');
    this.verify = new StringValue(warrent.createReg(), '');
    this.regMinMaxWarrent = warrent;
    this.passPhrase = passPhrase;
  }

  public valid(): boolean {
    return this.part.valid() && this.verify.valid() &&
      this.part.value === this.verify.value;
  }

  public errText(): string[] {
    return [];
  }

  public fill(js: any): Part {
    this.part = js['part'];
    this.verify = js['verify'];
    this.regMinMaxWarrent = RegMinMaxWarrent.fill(js['RegMinMaxWarrent']);
    // this.regMinMaxWarrent.fill();
    // this.passPhrase = js['passPhrase'];
    return this;
  }
}

export default Part;
