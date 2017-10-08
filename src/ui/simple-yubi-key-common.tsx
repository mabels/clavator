import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../gpg/boolean-value';
import SimpleYubiKey from '../gpg/simple-yubikey';
import InputExpireDate from './input-expire-date';
import RcUids from './rc-uids';
import RcKeyParam from './rc-key-params';
import CheckWarrents from './check-warrents';

class SimpleYubiKeyCommonState {
  @observable public readonly: BooleanValue;
}

interface SimpleYubiKeyCommonProps extends React.Props<SimpleYubiKeyCommon> {
  simpleYubiKey: SimpleYubiKey;
}

@observer export class SimpleYubiKeyCommon extends
  React.Component<SimpleYubiKeyCommonProps, SimpleYubiKeyCommonState> {

  constructor() {
    super();
    this.state = { readonly: (new BooleanValue('')).set(false) };
  }

  public render(): JSX.Element {
    // console.log('SimpleYubiKeyCommon:', this.props.simpleYubiKey.expireDate.valid() &&
    // this.props.simpleYubiKey.keyParams.valid() &&
    // this.props.simpleYubiKey.uids.valid());
    return (
      <CheckWarrents simpleYubiKey={this.props.simpleYubiKey}
          readonly={this.state.readonly}
          valid={this.props.simpleYubiKey.expireDate.valid() &&
                 this.props.simpleYubiKey.keyParams.valid() &&
                 this.props.simpleYubiKey.uids.valid()}>
        <InputExpireDate title="Expire-Date" expireDate={this.props.simpleYubiKey.expireDate}
          readonly={this.state.readonly} />
        <RcUids uids={this.props.simpleYubiKey.uids} readonly={this.state.readonly} />
        <RcKeyParam keyParams={this.props.simpleYubiKey.keyParams} readonly={this.state.readonly} />
      </CheckWarrents>
    );
  }

}

export default SimpleYubiKeyCommon;
