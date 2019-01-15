import * as React from 'react';
import * as classnames from 'classnames';
import RequestChangePin from '../../../gpg/request-change-pin';
// import * as WsChannel from '../../model/ws-channel';
import * as Message from '../../../model/message';
import ButtonToProgressor from '../controls/button-to-progressor';
import AppState from '../../model/app-state';

interface ChangePinState {
  pin: RequestChangePin;
  transaction: Message.Transaction<RequestChangePin>;
}

interface ChangePinProps extends React.Props<ChangePin> {
  completed?: () => {};
  type: string;
  app_id: string;
  appState: AppState;
}

export class ChangePin extends React.Component<ChangePinProps, ChangePinState> {

  constructor(props: ChangePinProps) {
    super(props);
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
            onChange={(e: any) => {
              this.state.pin.admin_pin.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
        </div>

        <div className="row">
          <label>NewPin{this.props.type}:</label><input type="password"
            name="new-pin"
            className={classnames({ good: this.state.pin.new_pin.verify() })}
            onChange={(e: any) => {
              this.state.pin.new_pin.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
          <input type="password"
            name="verify-new-pin"
            className={classnames({ good: this.state.pin.new_pin_verify.verify() })}
            onChange={(e: any) => {
              this.state.pin.new_pin_verify.pin = e.target.value;
              this.setState(Object.assign({}, this.state, {
                pin: this.state.pin
              }));
            }} />
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
