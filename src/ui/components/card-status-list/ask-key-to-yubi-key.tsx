import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import { KeyToYubiKey } from '../../../gpg/types';
import { Message } from '../../../model';
import { ButtonToProgressor } from '../controls';
import { AppState } from '../../model';
import { CardSlot } from './card-slot';
import { action } from 'mobx';

export interface AskKeyToYubiKeyProps extends React.Props<AskKeyToYubiKey> {
  readonly fingerprint: string;
  readonly appState: AppState;
  readonly slot_id: number;
}

@observer
export class AskKeyToYubiKey
  extends React.Component<AskKeyToYubiKeyProps, {}> {

  public readonly keyToYubiKey: KeyToYubiKey;
  public readonly transaction: Message.Transaction<KeyToYubiKey>;

  constructor(props: AskKeyToYubiKeyProps) {
    super(props);
    this.keyToYubiKey = new KeyToYubiKey({
      fingerprint: this.props.fingerprint,
      slot_id: this.props.slot_id,
      card_id: this.props.appState.cardStatusListState.cardStatusList[0].reader.cardid
    });
    this.transaction = Message.newTransaction<KeyToYubiKey>('SendKeyToYubiKey.run');
    this.transaction.data = this.keyToYubiKey;
  }

  public sendKeyToYubiKey = (): void => {
    // console.log('sendKeyToYubiKey', this.state.keyToYubiKey)
    this.transaction.data = this.keyToYubiKey;
    this.props.appState.channel.send(this.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className={classnames({ 'AskKeyToYubiKey': true, good: this.keyToYubiKey.verify() })}
        key={this.props.fingerprint}>
        <CardSlot
          keyToYubiKey={this.keyToYubiKey}
          appState={this.props.appState} />
        <div className="row">
          <label>Passphrase:</label><input type="password"
            className={classnames({ good: this.keyToYubiKey.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={action((e: any) => {
              this.keyToYubiKey.passphrase.set(e.target.value);
            })} />
        </div>

        <div className="row">
          <label>AdminPin:</label><input type="password"
            className={classnames({ good: this.keyToYubiKey.admin_pin.verify() })}
            name={`aktyk-${this.props.fingerprint}`}
            onChange={action((e: any) => {
              this.keyToYubiKey.admin_pin._pin.set(e.target.value);
            })} />
        </div>

        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.sendKeyToYubiKey}
          transaction={this.transaction}
        >Send</ButtonToProgressor>

      </form>
    );
  }
}
