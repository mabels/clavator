
import * as React from 'react';

import * as classnames from 'classnames';

import './app.less';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import * as KeyGen from '../gpg/key-gen';


interface ResetYubikeyState {
}

interface ResetYubikeyProps extends React.Props<ResetYubikey> {
  channel: WsChannel.Dispatch;
}

export class ResetYubikey extends React.Component<ResetYubikeyProps, ResetYubikeyState> {

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

  onMessage(action: Message.Header, data: string) {
  }
  onClose(e:CloseEvent) {
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
    console.log("reset_yubikey", this);
    this.props.channel.send(Message.prepare("ResetYubikey"), (error: any) => {
      // fixme progressor
    });
  }


  public render_form() : JSX.Element {
    return (
    <form className="slider">
    <button type="button"
      onClick={this.reset_yubikey.bind(this)}>ResetYubikey</button>
    </form>
    );
      // min={KeyGen.format_date(Date.now())}
      // value={KeyGen.format_date(this.state.keyGen.expireDate)} />
  }


  public render(): JSX.Element {
    return (
      <div className="ResetYubikey" >
        <h3>ResetYubikey</h3>
        {this.render_form()}
      </div>
    );
  }

}

// {this.render_key(sk)}
// <li>
// <ul>
// </ul>
// </li>
// <li>
// <ul>
// {sk.subKeys.map((ssb) => <li key={ssb.key}>{this.render_key(ssb)}</li> )}
// </ul>
// </li>
// </li>)}
