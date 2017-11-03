import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import NestedFlag from '../../../model/nested-flag';
// import SimpleYubiKey from '../../model/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
// import DateValue from '../../../model/date-value';
// import { format_date } from '../../../model/helper';
// import PassPhrase from '../../model/pass-phrase';
import DoublePassword from '../../model/double-password';
// import ViewWarrents from '../../model/view-warrents';
import InputPassword from '../controls/input-password';
import RcApproveWarrents from './rc-approve-warrents';
import ViewWarrent from '../../model/view-warrent';
// import { isApproved } from '../../model/helper';

class RcDoublePasswordState {
  @observable public readOnly: NestedFlag;
}

interface RcDoublePasswordProps extends React.Props<RcDoublePassword> {
  // label?: string;
  doublePassword: DoublePassword;
  idx: number;
  readOnly: NestedFlag;
}

@observer
export class RcDoublePassword extends
  React.Component<RcDoublePasswordProps, RcDoublePasswordState> {

  constructor() {
    super();
    this.state = {
      readOnly: null
    };
  }

  public componentWillMount(): void {
    this.setState(Object.assign(this.state, {
      readOnly: new NestedFlag(this.props.readOnly)
    }));
  }

  public render(): JSX.Element {
    const dp = this.props.doublePassword;
    // console.log('renderRow:', this.props.idx, dp.objectId(), dp.valid(), dp);
    // const readonly = dp.valid() && dp.warrents.valid();
      // !isApproved(this.props.doublePassword, this.props.approvedWarrents);
    console.log('RcDoublePassword:', this.state.readOnly.is, this.state.readOnly);
    return <div key={dp.objectId()}
      className={classnames({
        RcDoublePassword: true,
        four: true,
        readonly: this.state.readOnly.is,
        completed: dp.warrents.valid(),
        columns: true,
        good: dp.valid()
      })} >
      <label>{this.props.idx + 1}</label>
      {React.Children.map(this.props.children, (child, i) => {
        // debugger;
        return React.cloneElement(child as any, { readOnly: this.state.readOnly } );
        // (child as any).readOnly = this.state.readOnly;
        // return child;
      })}
      <InputPassword readOnly={this.state.readOnly} doublePassword={dp} passwordControl={dp.first} />
      <InputPassword readOnly={this.state.readOnly} doublePassword={dp} passwordControl={dp.second} />
      <RcApproveWarrents
        readOnly={this.state.readOnly}
        valid={dp.valid()}
        viewWarrents={dp.warrents}
        showWarrents={dp.showWarrent()}
        approved={(vw: ViewWarrent) => {
          dp.readable = false;
          console.log('RcApproveWarrents:approved');
        }}
      />
    </div>;
  }

}

export default RcDoublePassword;
