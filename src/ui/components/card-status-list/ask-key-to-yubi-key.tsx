import * as React from 'react';

// import MutableString from '../gpg/mutable_string';
import KeyToYubiKey from '../../../gpg/key-to-yubikey';
// import * as CardStatus from '../gpg/card_status';
import KeyState from '../../../gpg/key-state';

import { CardStatusListState } from '../../model/card-status-list-state';

import * as classnames from 'classnames';

import * as WsChannel from '../../model/ws-channel';
import * as Message from '../../../model/message';
import { ProgressorState } from '../controls/progressor';

import ButtonToProgressor from '../controls/button-to-progressor';
import AppState from '../../model/app-state';

interface AskKeyToYubiKeyState {
  keyToYubiKey: KeyToYubiKey;
  transaction: Message.Transaction<KeyToYubiKey>;
}

interface AskKeyToYubiKeyProps extends React.Props<AskKeyToYubiKey> {
  fingerprint: string;
  appState: AppState;
  slot_id: number;
}

export class AskKeyToYubiKey
  extends React.Component<AskKeyToYubiKeyProps, AskKeyToYubiKeyState> {
  constructor() {
    super();
    let transaction = Message.newTransaction<KeyToYubiKey>('SendKeyToYubiKey.run');
    transaction.data = new KeyToYubiKey();
    this.state = {
      keyToYubiKey: transaction.data,
      transaction: transaction
    };
    this.sendKeyToYubiKey = this.sendKeyToYubiKey.bind(this);
  }

  public componentWillMount(): void {
    this.state.keyToYubiKey.fingerprint = this.props.fingerprint;
    this.state.keyToYubiKey.slot_id = this.props.slot_id;
    this.state.keyToYubiKey.card_id = this.props.appState.cardStatusListState.cardStatusList[0].reader.cardid;
  }

  public sendKeyToYubiKey(): void {
    // console.log('sendKeyToYubiKey', this.state.keyToYubiKey)
    this.state.transaction.data = this.state.keyToYubiKey;
    this.props.appState.channel.send(this.state.transaction.asMsg());
  }

  public render_card_slot(): JSX.Element {
    // let selected = `${this.state.keyToYubiKey.card_id}:Slot${this.state.keyToYubiKey.slot_id}`;
    return (
      <div className="row">
        <select
          className="three columns"
          value={this.state.keyToYubiKey.slot_id}
          onChange={(e: any) => {
            this.state.keyToYubiKey.slot_id = ~~e.target.value;
            console.log('this.state.keyToYubiKey:', this.state.keyToYubiKey);
            this.setState(Object.assign({}, this.state, {
              keyToYubiKey: this.state.keyToYubiKey
            }));
          }} >
          {this.props.appState.cardStatusListState.cardStatusList.map((cardstatus) => {
            return cardstatus.keyStates.map((ks: KeyState, idx: number) => {
              let key = `${cardstatus.reader.cardid}:Slot${idx + 1}`;
              return (<option value={idx + 1} key={key}>{key}</option>);
            });
          })}
        </select>
      </div>
    );
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className={classnames({ 'AskKeyToYubiKey': true, good: this.state.keyToYubiKey.verify() })}
        key={this.props.fingerprint}>
        {this.render_card_slot()}
        <div className="row">
          <label>Passphrase:</label><input type="password"
            className={classnames({ good: this.state.keyToYubiKey.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={(e: any) => {
              this.state.keyToYubiKey.passphrase.value = e.target.value;
              this.setState(Object.assign({}, this.state, {
                keyToYubiKey: this.state.keyToYubiKey
              }));
            }} />
        </div>

        <div className="row">
          <label>AdminPin:</label><input type="password"
            className={classnames({ good: this.state.keyToYubiKey.admin_pin.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={(e: any) => {
              this.state.keyToYubiKey.admin_pin.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                keyToYubiKey: this.state.keyToYubiKey
              }));
            }} />
        </div>

        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.sendKeyToYubiKey}
          transaction={this.state.transaction}
        >Send</ButtonToProgressor>

      </form>
    );
  }
}
