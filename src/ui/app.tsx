import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';

import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
import { ResetYubikey } from './reset-yubikey';
import { Progressor } from './progressor';

import * as WsChannel from './ws-channel';

interface AppState {
  channel: WsChannel.Dispatch;
}

export class App extends React.Component<{}, AppState> {

  public static childContextTypes = {
   socket: React.PropTypes.object
  };


  // getChildContext() {
  //   return { channel: this.state.socket };
  // }

  constructor() {
    super();
    // let sk : ListSecretKeys.SecretKey[] = [];
    this.state = {
      channel: null
    };
  }

  protected componentDidMount(): void {
    this.setState(Object.assign({}, this.state, { channel: WsChannel.create() }));
  }

  protected componentWillUnmount(): void {
    this.state.channel.close();
    this.setState(Object.assign({}, this.state, { channel: null }));
  }

  // componentWillReceiveProps(nextProps: any, nextContext: any) {
  //   debugger
  // }

  // shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
  //   debugger
  //   return true;
  // }

  // componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
  //   debugger
  // }

  // componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
  //   debugger
  // }

  public render(): JSX.Element {
    return (
      <div className="app container">
          <div className="row">
            <div className="one column">
              <image src="clavator.png" />
              Clavator
            </div>
            <div className="eleven columns"></div>
          </div>
          <div className="row">
            <ResetYubikey channel={this.state.channel} />
          </div>
          <div className="row">
            <Progressor channel={this.state.channel} msg="ResetYubikey"/>
          </div>
              <CreateKey channel={this.state.channel} />
          <div className="row">
              <Progressor channel={this.state.channel} msg="CreateKeySet"/>
          </div>
          <div className="row">
            <div className="three column"></div>
            <div className="nine column">
              <KeyChainList channel={this.state.channel} />
            </div>
          </div>
          <div className="row">
            <div className="three column"></div>
            <div className="nine column">
              <CardStatusList channel={this.state.channel} />
            </div>
          </div>
          <div className="row">
            <div className="twelve column"></div>
          </div>
      </div>

    );
  }

}
