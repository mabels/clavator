
import * as React from 'react';

import * as classnames from 'classnames';

import RequestChangePin from '../gpg/request_change_pin';

import * as WsChannel from './ws-channel';

import * as Message from '../message';

interface ChangePinState {
  pin: RequestChangePin;
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
      pin: new RequestChangePin()
    };
  }

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    console.log("componentWillReceiveProps:", nextProps)
    if (nextProps.type) {
      // console.log("prop set", nextProps.type)
      this.setState(Object.assign({}, this.state, {
        pin: this.state.pin.changeAction(nextProps.type)
      }))
    }
  }

  public doPinChange(pin: RequestChangePin) {
    // debugger
    this.props.channel.send(Message.newTransaction("GpgChangePinYubikey.run", pin).asMsg());
  }

  public render(): JSX.Element {
    // console.log("Render:", 
    //   this.state.pin.admin_pin,
    //   this.state.pin.new_pin,
    //   this.state.pin.new_pin_verify,
    //   this.state.pin.verifyText())
    return (
      <form className={classnames({ "ChangePin": true, good: this.state.pin.verify() })}>
        <label>AdminPin:</label><input type="password"
          name="admin-pin" required={true}
          className={classnames({ good: this.state.pin.admin_pin.verify() })}
          onChange={(e: any) => {
            this.state.pin.admin_pin.pin = e.target.value;
            this.setState(Object.assign({}, this.state, {
              pin: this.state.pin
            }))
          }} />

        <label>NewPin{this.props.type}:</label><input type="password"
          name="new-pin" required={true}
          className={classnames({ good: this.state.pin.new_pin.verify() })}
          onChange={(e: any) => {
            this.state.pin.new_pin.pin = e.target.value
            this.setState(Object.assign({}, this.state, {
              pin: this.state.pin
            }))
          }} />
        <input type="password"
          name="verify-new-pin" required={true}
          className={classnames({ good: this.state.pin.new_pin_verify.verify() })}
          onChange={(e: any) => {
            this.state.pin.new_pin_verify.pin = e.target.value
            this.setState(Object.assign({}, this.state, {
              pin: this.state.pin
            }))
          }} />
        <button type="button"
          className={classnames({ good: this.state.pin.verify() })}
          disabled={!this.state.pin.verify()}
          onClick={(e: any) => {
            this.state.pin.app_id = this.props.app_id;
            this.setState(Object.assign({}, this.state, {
              pin: this.state.pin
            }))
            this.doPinChange(this.state.pin)
          }}>Change</button>    </form>
    );
  }

}
