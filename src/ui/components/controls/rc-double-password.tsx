import * as React from 'react';
import * as classnames from 'classnames';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import BooleanValue from '../../../model/boolean-value';
// import SimpleYubiKey from '../../model/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
// import DateValue from '../../../model/date-value';
// import { format_date } from '../../../model/helper';
// import PassPhrase from '../../model/pass-phrase';
import DoublePassword from '../../model/double-password';
// import ViewWarrents from '../../model/view-warrents';
import InputPassword from '../controls/input-password';
import RcApproveWarrents from './rc-approve-warrents';
// import { isApproved } from '../../model/helper';

class RcDoublePasswordState {
}

interface RcDoublePasswordProps extends React.Props<RcDoublePassword> {
  // label?: string;
  doublePassword: DoublePassword;
  idx: number;
}

@observer
export class RcDoublePassword extends
  React.Component<RcDoublePasswordProps, RcDoublePasswordState> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    const dp = this.props.doublePassword;
    // console.log('renderRow:', this.props.idx, dp.objectId(), dp.valid(), dp);
    const readonly = dp.valid() && dp.warrents.valid();
      // !isApproved(this.props.doublePassword, this.props.approvedWarrents);
    console.log('RcDoublePassword:', dp.valid(),
       dp.first.password.value, dp.second.password.value);
    return <div key={dp.objectId()}
      className={classnames({
        RcDoublePassword: true,
        four: true,
        readonly: readonly,
        completed: dp.warrents.valid(),
        columns: true,
        good: dp.valid()
      })} >
      <label>{this.props.idx + 1}</label>
      {this.props.children}
      <InputPassword readonly={readonly} doublePassword={dp} passwordControl={dp.first} />
      <InputPassword readonly={readonly} doublePassword={dp} passwordControl={dp.second} />
      <RcApproveWarrents
        readonly={!dp.valid()}
        valid={dp.valid()}
        viewWarrents={dp.warrents}
        showWarrents={dp.showWarrent()} />
    </div>;
  }

}

export default RcDoublePassword;
