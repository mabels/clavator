import * as React from 'react';
import classnames from 'classnames';
import { RequestChangePin } from '../../../gpg/types';
import { Message } from '../../../model';
import { ButtonToProgressor, InputPassword } from '../controls';
import { AppState } from '../../model';

interface ChangePinProps extends React.Props<ChangePin> {
  readonly completed?: () => {};
  readonly type: string;
  readonly app_id: string;
  readonly appState: AppState;
}

export class ChangePin extends React.Component<ChangePinProps, {}> {

  public readonly pin: RequestChangePin;
  public readonly transaction: Message.Transaction<RequestChangePin>;

  constructor(props: ChangePinProps) {
    super(props);
    this.pin = new RequestChangePin(),
    this.pin.changeAction(this.props.type);
    this.transaction = Message.newTransaction<RequestChangePin>('GpgChangePinYubikey.run');
  }

  public doPinChange = (): void => {
    this.pin._app_id.set(this.props.app_id);
    this.transaction.data = this.pin;
    this.props.appState.channel.send(this.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (
      <form
        className={classnames({ 'ChangePin': true, good: this.pin.verify() })}>
        <InputPassword
          valid={this.pin.admin_pin.valid}
          label="current AdminPin"
          value={this.pin.admin_pin.pin} />
        <InputPassword
          valid={this.pin.new_pin.valid}
          label={`NewPin${this.props.type}`}
          value={this.pin.new_pin.pin} />
        <InputPassword
          label="Repeat NewPin"
          valid={this.pin.new_pin_verify.valid}
          value={this.pin.new_pin_verify.pin} />
        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.doPinChange}
          transaction={this.transaction}
        >Change</ButtonToProgressor>
      </form>
    );
  }

}
