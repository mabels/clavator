import * as React from 'react';
import classnames from 'classnames';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { NestedFlag, } from '../../../model';
import {
  ViewWarrent,
  DoublePassword } from '../../model';
import { InputDoublePassword } from '../controls';
import { RcApproveWarrents } from './rc-approve-warrents';

interface RcDoublePasswordProps extends React.Props<RcDoublePassword> {
  // label?: string;
  doublePassword: DoublePassword;
  idx: number;
  readOnly: NestedFlag;
  onReadable?: (readable: boolean) => void;
}

@observer
export class RcDoublePassword extends
  React.Component<RcDoublePasswordProps, {}> {

  public readonly readOnly: NestedFlag;

  constructor(props: RcDoublePasswordProps) {
    super(props);
    this.readOnly = new NestedFlag(this.props.readOnly);
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
        readonly: this.readOnly.is,
        completed: dp.warrents.valid,
        columns: true,
        good: dp.valid
      })} >
      <InputDoublePassword
        label="Password"
        onReadable={this.props.onReadable}
        readOnly={this.readOnly.is}
        doublePassword={dp}
        passwordControl={dp.first} />
      <InputDoublePassword
        label="Repeat Password"
        onReadable={this.props.onReadable}
        readOnly={this.readOnly.is}
        doublePassword={dp}
        passwordControl={dp.second} />
      {React.Children.map(this.props.children, (child, i) => {
        return React.cloneElement(child as any, { readOnly: this.readOnly } );
      })}
      <RcApproveWarrents
        readOnly={this.readOnly}
        valid={dp.valid}
        viewWarrents={dp.warrents}
        showWarrents={dp.showWarrent()}
        approved={action((vw: ViewWarrent) => {
          dp._readable.set(false);
          // console.log('RcApproveWarrents:approved');
        })}
      />
    </div>;
  }

}
