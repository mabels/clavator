import * as React from 'react';
import { observer } from 'mobx-react';
import SimpleYubiKey from '../gpg/simple-yubikey';
import InputExpireDate from './input-expire-date';
import RcUids from './rc-uids';
import RcKeyParam from './rc-key-params';
import CheckWarrents from './check-warrents';

interface SimpleYubiKeyCommonState {
}

interface SimpleYubiKeyCommonProps extends React.Props<SimpleYubiKeyCommon> {
  simpleYubiKey: SimpleYubiKey;
}

@observer export class SimpleYubiKeyCommon extends
  React.Component<SimpleYubiKeyCommonProps, SimpleYubiKeyCommonState> {

  constructor() {
    super();
    this.state = {};
  }

  public render(): JSX.Element {
    console.log('SimpleYubiKeyCommon:', this.props.simpleYubiKey.expireDate.valid() &&
    this.props.simpleYubiKey.keyParams.valid() &&
    this.props.simpleYubiKey.uids.valid());
    return (
      <CheckWarrents simpleYubiKey={this.props.simpleYubiKey}
          valid={this.props.simpleYubiKey.expireDate.valid() &&
                 this.props.simpleYubiKey.keyParams.valid() &&
                 this.props.simpleYubiKey.uids.valid()}>
        <InputExpireDate title="Expire-Date" expireDate={this.props.simpleYubiKey.expireDate} />
        <RcUids uids={this.props.simpleYubiKey.uids} />
        <RcKeyParam keyParams={this.props.simpleYubiKey.keyParams} />
      </CheckWarrents>
    );
  }

}

export default SimpleYubiKeyCommon;
