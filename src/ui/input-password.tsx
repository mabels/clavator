
import * as React from 'react';

import * as classnames from 'classnames';

import RequestChangePin from '../gpg/request_change_pin';

interface ChangePinState {
  pin: RequestChangePin
}

interface ChangePinProps extends React.Props<ChangePin> {
  pin: RequestChangePin,
  completed: () => {}
}

export class ChangePin extends React.Component<ChangePinProps, ChangePinState> {

  constructor() {
    super();
    this.state = { };
  }
  // public static contextTypes = {
  //  socket: React.PropTypes.object
  // };

  protected componentDidMount(): void {

  }

  protected componentWillUnmount(): void {
  }

  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    // debugger
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
    // debugger
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
    // debugger
  }

  public reset_yubikey() {

  }


  public render(): JSX.Element {
    return (
        <div className="InputPassword">
          <label>{label}:</label><input type="password"
            name={key} required={true}
            className={classnames({"u-full-width": true, good: pp.valid_password()})}
            onChange={(e:any) => {
              pp.password = e.target.value;
              this.setState(this.state);
            }}
          />
        </div>)    );
  }

}
