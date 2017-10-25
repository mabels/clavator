import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../../../model/boolean-value';
import SimpleYubiKey from '../../model/simple-yubikey';
import RcCheckWarrents from './rc-check-warrents';
import DateValue from '../../../model/date-value';
import { format_date } from '../../../model/helper';
import PassPhrase from '../../model/pass-phrase';
import ApprovablePart from '../../model/approvable-part';
import ApprovableWarrents from '../../model/approvable-warrents';
import InputPassword from '../controls/input-password';

class RcWarrentState {
}

interface RcWarrentProps extends React.Props<RcWarrent> {
  approvableParts: ApprovablePart[];
  approvablePart: ApprovablePart;
  approvableWarrents: ApprovableWarrents;
}

@observer
export class RcWarrent extends
  React.Component<RcWarrentProps, RcWarrentState> {

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    if (this.props.approvableWarrents.length() == 1) {
      return null;
    }
    const pp = this.props.approvablePart;
    if (pp.regMinMaxWarrent && !pp.approved.value) {
      return <button disabled={pp.approved.value || !pp.valid()}
        onClick={(e) => {
          console.log('Approved:', pp.regMinMaxWarrent.warrent.warrent.value);
          e.preventDefault();
          pp.approved.set(true);
        }} >{pp.regMinMaxWarrent.warrent.warrent.value}</button>;
    }
    return null;
  }

}

export default RcWarrent;
