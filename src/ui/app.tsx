import * as React from 'react';
import './app.less';
// import AppState from  './app-state';

import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
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
      <div className="app">
          <KeyChainList channel={this.state.channel} />
          <CardStatusList channel={this.state.channel} />
          <CreateKey channel={this.state.channel} />
          <Progressor channel={this.state.channel} msg="CreateKeySet"/>
      </div>

    );
  }

}
