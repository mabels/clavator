import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../gpg/boolean-value';
import SimpleKeyCommon from '../gpg/simple-key-common';
import InputExpireDate from './input-expire-date';
import RcUids from './rc-uids';
import RcKeyParam from './rc-key-params';
import RcCheckWarrents from './rc-check-warrents';

class RcSimpleKeyCommonState {
  @observable public readonly: BooleanValue;
}

interface RcSimpleKeyCommonProps extends React.Props<RcSimpleKeyCommon> {
  simpleKeyCommon: SimpleKeyCommon;
}

@observer export class RcSimpleKeyCommon extends
  React.Component<RcSimpleKeyCommonProps, RcSimpleKeyCommonState> {

  constructor() {
    super();
    this.state = { readonly: (new BooleanValue('')).set(false) };
  }

  public render(): JSX.Element {
    // console.log('SimpleYubiKeyCommon:', this.props.simpleYubiKey.expireDate.valid() &&
    // this.props.simpleYubiKey.keyParams.valid() &&
    // this.props.simpleYubiKey.uids.valid());
    return (
      <RcCheckWarrents classNames={['SimpleKeyCommon']}
          approvableWarrents={this.props.simpleKeyCommon.approvableWarrents}
          readonly={this.state.readonly}
          completed={this.props.simpleKeyCommon.completed}
          valid={this.props.simpleKeyCommon.valid()} >
        <InputExpireDate title="Expire-Date" expireDate={this.props.simpleKeyCommon.expireDate}
          readonly={this.state.readonly} />
        <RcUids uids={this.props.simpleKeyCommon.uids} readonly={this.state.readonly} />
        <RcKeyParam keyParams={this.props.simpleKeyCommon.keyParams} readonly={this.state.readonly} />
      </RcCheckWarrents>
    );
  }

}

export default RcSimpleKeyCommon;
