import { observable } from 'mobx';
import Warrent from '../../gpg/warrent';
import PassPhrase from './pass-phrase';
import Part from './part';
import BooleanValue from '../../model/boolean-value';
import RegMinMaxWarrent from './reg-min-max-warrent';

export class ApprovablePart extends Part {
  @observable public approved: BooleanValue;

  constructor(passPhrase: PassPhrase, warrent?: RegMinMaxWarrent) {
    super(passPhrase, warrent);
    this.approved = new BooleanValue('').set(false);
  }

}

export default ApprovablePart;
