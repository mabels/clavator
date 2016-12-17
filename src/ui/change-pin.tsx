
import * as React from 'react';

import * as classnames from 'classnames';

import RequestChangePin from '../gpg/request_change_pin';

interface ChangePinState {
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


  public render_form() : JSX.Element {
    return (
    <form className="ChangePin">
      <div className={classnames({row: true, good: this.state.keyGen.adminPin.valid()})}>
     {this.render_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
     {this.render_verify_password("AdminPin", "cq-adminpin", this.state.keyGen.adminPin)}
     </div>
      <div className={classnames({row: true, good: this.state.keyGen.userPin.valid()})}>
     {this.render_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
     {this.render_verify_password("UserPin", "cq-userpin", this.state.keyGen.userPin)}
     </div>
    <button type="button"
      onClick={this.state.completed()}>ResetYubikey</button>
    </form>
    );
      // min={KeyGen.format_date(Date.now())}
      // value={KeyGen.format_date(this.state.keyGen.expireDate)} />
  }


  public render(): JSX.Element {
    return (
      <div className="ResetYubikey" >
        {this.render_form()}
      </div>
    );
  }

}
