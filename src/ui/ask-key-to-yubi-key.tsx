
import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import MutableString from '../gpg/mutable_string';
import KeyToYubiKey from '../gpg/key-to-yubikey';

import * as classnames from 'classnames';

interface AskKeyToYubiKeyState {
  keyToYubiKey: KeyToYubiKey
}

interface AskKeyToYubiKeyProps extends React.Props<AskKeyToYubiKey> {
  fingerprint: string,
  completed: () => void;
}

export class AskKeyToYubiKey
  extends React.Component<AskKeyToYubiKeyProps, AskKeyToYubiKeyState>
{
  constructor() {
    super();
    this.state = {
      keyToYubiKey: new KeyToYubiKey()
    };
  }

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    this.state.keyToYubiKey.fingerprint = nextProps.fingerprint
  }

  // public fingerprint: string;
  // public app_id: string;
  // public admin_pin: Pin;
  // public passphrase: MutableString = new MutableString();
  public sendKeyToYubiKey() {
    console.log("sendKeyToYubiKey", this.props.fingerprint)
  }

  public render(): JSX.Element {
    // SecretKeys {this.state.cardStatusList.length || ""}
    //<h3>AskPassphrase.{this.props.msg}
    // <button onClick={this.handleClearClick}>Clear({this.state.progressList.length})</button>
    console.log("ask-key-to-yubi-key", this.state.keyToYubiKey, this.state.keyToYubiKey.verifyText())
    return (
      <form
        className={classnames({ "AskKeyToYubiKey": true, good: this.state.keyToYubiKey.verify() })}
        key={this.props.fingerprint}>
        <label>Passphrase:</label><input type="password"
          className={classnames({ good: this.state.keyToYubiKey.verify() })}
          name={`aktyk-${this.props.fingerprint}`} required={true}
          onChange={(e: any) => {
            this.state.keyToYubiKey.passphrase.value = e.target.value;
            this.setState(Object.assign({}, this.state, {
              keyToYubiKey: this.state.keyToYubiKey
            }))
          }} />

        <label>AdminPin:</label><input type="password"
          className={classnames({ good: this.state.keyToYubiKey.admin_pin.verify() })}
          name={`aktyk-${this.props.fingerprint}`} required={true}
          onChange={(e: any) => {
            this.state.keyToYubiKey.admin_pin.pin = e.target.value;
            this.setState(Object.assign({}, this.state, {
              keyToYubiKey: this.state.keyToYubiKey
            }))
          }} />

        <button
          className={classnames({ good: this.state.keyToYubiKey.verify() })}
          disabled={!this.state.keyToYubiKey.verify()}
          type="button"
          onClick={(e: any) => {
            this.sendKeyToYubiKey()
          }}>Ready</button>
      </form>
    );
  }
}
