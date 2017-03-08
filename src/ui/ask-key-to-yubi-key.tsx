
import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import MutableString from '../gpg/mutable_string';
import KeyToYubiKey from '../gpg/key-to-yubikey';
import * as CardStatus from '../gpg/card_status';

import { CardStatusListState } from './card-status-list-state';

import * as classnames from 'classnames';

import * as WsChannel from './ws-channel';
import * as Message from '../message';

import ButtonToProgressor from './button-to-progressor';

interface AskKeyToYubiKeyState {
  keyToYubiKey: KeyToYubiKey;
  transaction: Message.Transaction<KeyToYubiKey>;
}

interface AskKeyToYubiKeyProps extends React.Props<AskKeyToYubiKey> {
  fingerprint: string,
  channel: WsChannel.Dispatch;
  slot_id: number,
  cardStatusListState: CardStatusListState;
}

export class AskKeyToYubiKey
  extends React.Component<AskKeyToYubiKeyProps, AskKeyToYubiKeyState>
{
  constructor() {
    super();
    let transaction = Message.newTransaction<KeyToYubiKey>("SendKeyToYubiKey.run");
    transaction.data = new KeyToYubiKey();
    this.state = {
      keyToYubiKey: transaction.data,
      transaction: transaction
    };
    this.sendKeyToYubiKey = this.sendKeyToYubiKey.bind(this)
  }

  componentWillMount() {
    this.state.keyToYubiKey.fingerprint = this.props.fingerprint
    this.state.keyToYubiKey.slot_id = this.props.slot_id
    this.state.keyToYubiKey.card_id = this.props.cardStatusListState.cardStatusList[0].reader.cardid;
  }

  // public fingerprint: string;
  // public app_id: string;
  // public admin_pin: Pin;
  // public passphrase: MutableString = new MutableString();
  public sendKeyToYubiKey() {
    console.log("sendKeyToYubiKey", this.state.keyToYubiKey)
    this.state.transaction.data = this.state.keyToYubiKey;
    this.props.channel.send(this.state.transaction.asMsg());
  }

  public render_card_slot() {
    let selected = `${this.state.keyToYubiKey.card_id}:Slot${this.state.keyToYubiKey.slot_id}`
    return (
      <select value={this.state.keyToYubiKey.slot_id}
        onChange={(e: any) => {
          this.state.keyToYubiKey.slot_id = ~~e.target.value;
          console.log("this.state.keyToYubiKey:", this.state.keyToYubiKey);
          this.setState(Object.assign({}, this.state, {
            keyToYubiKey: this.state.keyToYubiKey
          }))
        }} >
        {this.props.cardStatusListState.cardStatusList.map((cardstatus) => {
          return cardstatus.keyStates.map((ks: CardStatus.KeyState, idx: number) => {
            let key = `${cardstatus.reader.cardid}:Slot${idx + 1}`
            return (<option value={idx + 1} key={key}>{key}</option>)
          })
        })}
      </select>
    );
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
        {this.render_card_slot()}
        <div className="row">
        <label>Passphrase:</label><input type="password"
          className={classnames({ good: this.state.keyToYubiKey.verify() })}
          name={`aktyk-${this.props.fingerprint}`} required={true}
          onChange={(e: any) => {
            this.state.keyToYubiKey.passphrase.value = e.target.value;
            this.setState(Object.assign({}, this.state, {
              keyToYubiKey: this.state.keyToYubiKey
            }))
          }} />
          </div>

        <div className="row">
        <label>AdminPin:</label><input type="password"
          className={classnames({ good: this.state.keyToYubiKey.admin_pin.verify() })}
          name={`aktyk-${this.props.fingerprint}`} required={true}
          onChange={(e: any) => {
            this.state.keyToYubiKey.admin_pin.pin = e.target.value;
            this.setState(Object.assign({}, this.state, {
              keyToYubiKey: this.state.keyToYubiKey
            }))
          }} />
        </div>

         <ButtonToProgressor 
          channel={this.props.channel}
          onClick={this.sendKeyToYubiKey}
          transaction={this.state.transaction}
         >Send</ButtonToProgressor>

        {/*<button
          className={classnames({ good: this.state.keyToYubiKey.verify() })}
          disabled={!this.state.keyToYubiKey.verify()}
          type="button"
          onClick={(e: any) => {
            this.sendKeyToYubiKey()
          }}>Ready</button>*/}
      </form>
    );
  }
}
