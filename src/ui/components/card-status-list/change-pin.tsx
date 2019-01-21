import * as React from 'react';
import classnames from 'classnames';
import { RequestChangePin } from '../../../gpg/types';
import { Message } from '../../../model';
import { ButtonToProgressor } from '../controls';
import { AppState } from '../../model';
import { action } from 'mobx';

interface ChangePinState {
  readonly pin: RequestChangePin;
  readonly transaction: Message.Transaction<RequestChangePin>;
}

interface ChangePinProps extends React.Props<ChangePin> {
  readonly completed?: () => {};
  readonly type: string;
  readonly app_id: string;
  readonly appState: AppState;
}

export class ChangePin extends React.Component<ChangePinProps, ChangePinState> {

  constructor(props: ChangePinProps) {
    super(props);
    this.state = {
      pin: new RequestChangePin(),
      transaction: Message.newTransaction<RequestChangePin>('GpgChangePinYubikey.run')
    };
    // this.doPinChange = this.doPinChange.bind(this);
  }

  public componentWillMount(): void {
    this.state.pin.changeAction(this.props.type);
  }

  public doPinChange = (): void => {
    this.state.pin._app_id.set(this.props.app_id);
    this.state.transaction.data = this.state.pin;
    this.props.appState.channel.send(this.state.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className={classnames({ 'ChangePin': true, good: this.state.pin.verify() })}>
        <div className="row">
          <label>AdminPin:</label><input type="password"
            name="admin-pin"
            className={classnames({ good: this.state.pin.admin_pin.verify() })}
            onChange={action((e: any) => {
              this.state.pin.admin_pin._pin.set(e.target.value);
            })} />
        </div>

        <div className="row">
          <label>NewPin{this.props.type}:</label><input type="password"
            name="new-pin"
            className={classnames({ good: this.state.pin.new_pin.verify() })}
            onChange={action((e: any) => {
              this.state.pin.new_pin._pin.set(e.target.value);
            })} />
          <input type="password"
            name="verify-new-pin"
            className={classnames({ good: this.state.pin.new_pin_verify.verify() })}
            onChange={action((e: any) => {
              this.state.pin.new_pin_verify._pin.set(e.target.value);
            })} />
        </div>

        <ButtonToProgressor
          appState={this.props.appState}
          onClick={this.doPinChange}
          transaction={this.state.transaction}
        >Change</ButtonToProgressor>

      </form>
    );
  }

}
