import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import BooleanValue from '../../../model/boolean-value';
import SimpleKeyCommon from '../../model/simple-key-common';
import InputExpireDate from '../controls/input-expire-date';
import RcUids from './rc-uids';
import RcKeyParam from './rc-key-params';
import RcApproveWarrents from '../controls/rc-approve-warrents';

class RcSimpleKeyCommonState {
  // public readonly: boolean;
}

interface RcSimpleKeyCommonProps extends React.Props<RcSimpleKeyCommon> {
  simpleKeyCommon: SimpleKeyCommon;
}

@observer export class RcSimpleKeyCommon extends
  React.Component<RcSimpleKeyCommonProps, RcSimpleKeyCommonState> {

  constructor() {
    super();
    this.state = { /* readonly: false  */ };
  }

  public render(): JSX.Element {
    // console.log('SimpleYubiKeyCommon:', this.st
    // this.props.simpleYubiKey.expireDate.valid() &&
    // this.props.simpleYubiKey.keyParams.valid() &&
    // this.props.simpleYubiKey.uids.valid());
    // debugger;
    return (
      <RcApproveWarrents classNames={['SimpleKeyCommon']}
          showWarrents={this.props.simpleKeyCommon.showWarrents()}
          viewWarrents={this.props.simpleKeyCommon.viewWarrents}
          readonly={this.props.simpleKeyCommon.viewWarrents.lock}
          completed={this.props.simpleKeyCommon.completed}
          valid={this.props.simpleKeyCommon.valid()} >
        <InputExpireDate title="Expire-Date"
          expireDate={this.props.simpleKeyCommon.expireDate}
          completed={this.props.simpleKeyCommon.completed}
          readonly={this.props.simpleKeyCommon.viewWarrents.lock} />
        <RcUids uids={this.props.simpleKeyCommon.uids}
          completed={this.props.simpleKeyCommon.completed}
          readonly={this.props.simpleKeyCommon.viewWarrents.lock} />
        <RcKeyParam keyParams={this.props.simpleKeyCommon.keyParams}
          completed={this.props.simpleKeyCommon.completed}
          readonly={this.props.simpleKeyCommon.viewWarrents.lock} />
      </RcApproveWarrents>
    );
  }

}

export default RcSimpleKeyCommon;
