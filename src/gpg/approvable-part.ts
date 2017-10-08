import { observable } from 'mobx';
import Warrent from './warrent';
import PassPhrase from './pass-phrase';
import Part from './part';
import BooleanValue from './boolean-value';

export class ApprovablePart extends Part {
  @observable public approved: BooleanValue;

  constructor(passPhrase: PassPhrase, warrent?: Warrent) {
    super(passPhrase, warrent);
    this.approved = new BooleanValue('').set(false);
  }

}

export default ApprovablePart;
