import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';
// import "react-font-awesome";

// import "./clavator.png";
const Clavator = require('./clavator.png');

import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
// import { ResetYubikey } from './reset-yubikey';
import { Progressor } from './progressor';
import { ChannelStatus } from './channel-status';

import * as WsChannel from './ws-channel';

interface AppState {
  channel: WsChannel.Dispatch;
}

export class App extends React.Component<{}, AppState> {
 
  constructor() {
    super();
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
  public render(): JSX.Element {
    return (
     <div>
      <ul className="navigation">

      	<li className="nav-item"><a href="#"><img src={Clavator} width="150px" title="Clavator"/></a></li>
      	<li className="nav-item"><a href="#CreateKey">CreateKey</a></li>
      	<li className="nav-item"><a href="#">Write2YubiKey</a></li>
      	<li className="nav-item"><a href="#KeyChainList">KeyChainList</a></li>
      	<li className="nav-item"><a href="#CardStatusList">CardStatusList</a></li>
      	<li className="nav-item"><a href="#Progressor">Logs</a></li>
      </ul>

      <input type="checkbox" id="nav-trigger" className="nav-trigger" />
      <label htmlFor="nav-trigger"><ChannelStatus channel={this.state.channel} /></label>

      <div className="site-wrap">

        <a name="CreateKey"></a>
        <h3>CreateKey</h3>
        <CreateKey channel={this.state.channel} />
        <a name="KeyChainList"></a>
        <h3>KeyChainList</h3>
        <KeyChainList channel={this.state.channel} />
        <a name="CardStatusList"></a>
        <h3>CardStatusList</h3>
        <CardStatusList channel={this.state.channel} />
        <a name="Progressor"></a>
        <h3>Logs</h3>
        <Progressor channel={this.state.channel} msg="Clavator" controls={true} />
      </div>
    </div>
    );
  }

}
