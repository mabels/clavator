import * as React from 'react';
import { observer } from 'mobx-react';
import {
  NestedFlag,
} from '../../../model';
import {
  SimpleKeyCommon
} from '../../model';
import {
  InputExpireDate,
  RcApproveWarrents
} from '../controls';
import { RcUids } from './rc-uids';
import { RcKeyParams } from './rc-key-params';

class RcSimpleKeyCommonState {
  // public readonly: boolean;
}

interface RcSimpleKeyCommonProps extends React.Props<RcSimpleKeyCommon> {
  simpleKeyCommon: SimpleKeyCommon;
  readOnly: NestedFlag;
}

@observer
export class RcSimpleKeyCommon extends
  React.Component<RcSimpleKeyCommonProps, RcSimpleKeyCommonState> {

  constructor(props: RcSimpleKeyCommonProps) {
    super(props);
    this.state = { /* readonly: false  */ };
  }

  public render(): JSX.Element {
    // console.log('SimpleYubiKeyCommon:', this.st
    // this.props.simpleYubiKey.expireDate.valid() &&
    // this.props.simpleYubiKey.keyParams.valid() &&
    // this.props.simpleYubiKey.uids.valid());
    // debugger;
    // {/* readOnly={this.props.simpleKeyCommon.viewWarrents.lock} */}
    return (
      <RcApproveWarrents classNames={['SimpleKeyCommon']}
          readOnly={this.props.simpleKeyCommon.readOnly}
          showWarrents={this.props.simpleKeyCommon.showWarrents()}
          viewWarrents={this.props.simpleKeyCommon.viewWarrents}
          completed={this.props.simpleKeyCommon.completed}
          valid={this.props.simpleKeyCommon.valid()} >
        <InputExpireDate title="Expire-Date"
          readOnly={this.props.simpleKeyCommon.readOnly}
          expireDate={this.props.simpleKeyCommon.expireDate}
          completed={this.props.simpleKeyCommon.completed} />
        <RcUids uids={this.props.simpleKeyCommon.uids}
          readOnly={this.props.simpleKeyCommon.readOnly}
          completed={this.props.simpleKeyCommon.completed} />
        <RcKeyParams keyParams={this.props.simpleKeyCommon.keyParams}
          readOnly={this.props.simpleKeyCommon.readOnly}
          completed={this.props.simpleKeyCommon.completed} />
      </RcApproveWarrents>
    );
  }

}
