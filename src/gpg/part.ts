import { observable } from 'mobx';
import Warrent from './warrent';
import Validatable from './validatable';
import PassPhrase from './pass-phrase';
import StringValue from './string-value';

export class Part implements Validatable {
  @observable public part: StringValue;
  @observable public verify: StringValue;
  public warrent: Warrent;
  public passPhrase: PassPhrase;

  constructor(passPhrase: PassPhrase, warrent?: Warrent) {

    this.part = new StringValue(passPhrase.partRegex, '');
    this.verify = new StringValue(passPhrase.partRegex, '');
    this.warrent = warrent;
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
    this.warrent = new Warrent();
    this.warrent.fill(js['warrent']);
    // this.passPhrase = js['passPhrase'];
    return this;
  }
}

export default Part;
