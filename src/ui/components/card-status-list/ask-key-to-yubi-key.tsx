import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import { KeyToYubiKey } from '../../../gpg/types';
import { Message } from '../../../model';
import { ButtonToProgressor } from '../controls';
import { AppState } from '../../model';
import { CardSlot } from './card-slot';
import { action } from 'mobx';

interface AskKeyToYubiKeyState {
  keyToYubiKey: KeyToYubiKey;
  transaction: Message.Transaction<KeyToYubiKey>;
}

interface AskKeyToYubiKeyProps extends React.Props<AskKeyToYubiKey> {
  fingerprint: string;
  appState: AppState;
  slot_id: number;
}

@observer
export class AskKeyToYubiKey
  extends React.Component<AskKeyToYubiKeyProps, AskKeyToYubiKeyState> {
  constructor(props: AskKeyToYubiKeyProps) {
    super(props);
    let transaction = Message.newTransaction<KeyToYubiKey>('SendKeyToYubiKey.run');
    transaction.data = new KeyToYubiKey();
    this.state = {
      keyToYubiKey: transaction.data,
      transaction: transaction
    };
    this.sendKeyToYubiKey = this.sendKeyToYubiKey.bind(this);
  }

  public componentWillMount(): void {
    this.state.keyToYubiKey._fingerprint.set(this.props.fingerprint);
    this.state.keyToYubiKey._slot_id.set(this.props.slot_id);
    this.state.keyToYubiKey._card_id.set(this.props.appState.cardStatusListState.cardStatusList[0].reader.cardid);
  }

  public sendKeyToYubiKey(): void {
    // console.log('sendKeyToYubiKey', this.state.keyToYubiKey)
    this.state.transaction.data = this.state.keyToYubiKey;
    this.props.appState.channel.send(this.state.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className={classnames({ 'AskKeyToYubiKey': true, good: this.state.keyToYubiKey.verify() })}
        key={this.props.fingerprint}>
        <CardSlot
          keyToYubiKey={this.state.keyToYubiKey}
          appState={this.props.appState} />
        <div className="row">
          <label>Passphrase:</label><input type="password"
            className={classnames({ good: this.state.keyToYubiKey.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={action((e: any) => {
              this.state.keyToYubiKey.passphrase._value.set(e.target.value);
            })} />
        </div>

        <div className="row">
          <label>AdminPin:</label><input type="password"
            className={classnames({ good: this.state.keyToYubiKey.admin_pin.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={action((e: any) => {
              this.state.keyToYubiKey.admin_pin._pin.set(e.target.value);
            })} />
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
