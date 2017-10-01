import * as React from 'react';
import * as classnames from 'classnames';
import RequestChangePin from '../gpg/request_change_pin';
import * as WsChannel from './ws-channel';
import * as Message from '../message';
import ButtonToProgressor from './button-to-progressor';

interface ChangePinState {
  pin: RequestChangePin;
  transaction: Message.Transaction<RequestChangePin>;
}

interface ChangePinProps extends React.Props<ChangePin> {
  completed?: () => {};
  type: string;
  app_id: string;
  channel: WsChannel.Dispatch;
}

export class ChangePin extends React.Component<ChangePinProps, ChangePinState> {

  constructor() {
    super();
    this.state = {
      pin: new RequestChangePin(),
      transaction: Message.newTransaction<RequestChangePin>('GpgChangePinYubikey.run')
    };
    this.doPinChange = this.doPinChange.bind(this);
  }

  public componentWillMount(): void {
    this.setState(Object.assign({}, this.state, {
      pin: this.state.pin.changeAction(this.props.type)
    }));
  }

  public doPinChange(): void {
    this.state.pin.app_id = this.props.app_id;
    this.state.transaction.data = this.state.pin;
    this.setState({
      pin: this.state.pin,
      transaction: this.state.transaction
    });
    this.props.channel.send(this.state.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        className={classnames({ 'ChangePin': true, good: this.state.pin.verify() })}>
        <div className="row">
          <label>AdminPin:</label><input type="password"
            name="admin-pin" required={true}
            className={classnames({ good: this.state.pin.admin_pin.verify() })}
            onChange={(e: any) => {
              this.state.pin.admin_pin.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
        </div>

        <div className="row">
          <label>NewPin{this.props.type}:</label><input type="password"
            name="new-pin" required={true}
            className={classnames({ good: this.state.pin.new_pin.verify() })}
            onChange={(e: any) => {
              this.state.pin.new_pin.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
          <input type="password"
            name="verify-new-pin" required={true}
            className={classnames({ good: this.state.pin.new_pin_verify.verify() })}
            onChange={(e: any) => {
              this.state.pin.new_pin_verify.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
        </div>

        <ButtonToProgressor
          channel={this.props.channel}
          onClick={this.doPinChange}
          transaction={this.state.transaction}
        >Change</ButtonToProgressor>

      </form>
    );
  }

}
