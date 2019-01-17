import * as React from 'react';
import classnames from 'classnames';
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
  onReadable?: (readable: boolean) => void;
}

@observer
export class RcDoublePassword extends
  React.Component<RcDoublePasswordProps, RcDoublePasswordState> {

  constructor(props: RcDoublePasswordProps) {
    super(props);
    this.state = {
      readOnly: null
    };
  }

  public componentWillMount(): void {
    this.setState(Object.assign(this.state, {
      readOnly: new NestedFlag(this.props.readOnly)
    }));
  }

  private renderIndexLabel(idx: number): JSX.Element {
    if (typeof(idx) != 'number') {
      return null;
    }
    return <label>{this.props.idx + 1}</label>;
  }

  public render(): JSX.Element {
    const dp = this.props.doublePassword;
    // console.log('renderRow:', this.props.idx, dp.objectId(), dp.valid(), dp);
    // const readonly = dp.valid() && dp.warrents.valid();
      // !isApproved(this.props.doublePassword, this.props.approvedWarrents);
    // console.log('RcDoublePassword:', dp.objectId(), dp.readable, dp);
    return <div key={dp.objectId()}
      className={classnames({
        RcDoublePassword: true,
        four: true,
        readonly: this.state.readOnly.is,
        completed: dp.warrents.valid(),
        columns: true,
        good: dp.valid()
      })} >
      {this.renderIndexLabel(this.props.idx)}
      <InputPassword onReadable={this.props.onReadable}
        readOnly={this.state.readOnly}
        doublePassword={dp}
        passwordControl={dp.first} />
      <InputPassword onReadable={this.props.onReadable}
        readOnly={this.state.readOnly}
        doublePassword={dp}
        passwordControl={dp.second} />
      {React.Children.map(this.props.children, (child, i) => {
        return React.cloneElement(child as any, { readOnly: this.state.readOnly } );
      })}
      <RcApproveWarrents
        readOnly={this.state.readOnly}
        valid={dp.valid()}
        viewWarrents={dp.warrents}
        showWarrents={dp.showWarrent()}
        approved={(vw: ViewWarrent) => {
          dp.readable = false;
          // console.log('RcApproveWarrents:approved');
        }}
      />
    </div>;
  }

}
