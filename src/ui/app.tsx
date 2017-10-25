import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';
const Clavator = require('./img/clavator.png');

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
// import { CreateKey } from './create-key';
// import { Progressor } from './progressor';
import ChannelStatus from './components/controls/channel-status';
import * as WsChannel from './model/ws-channel';
import { CardStatusListState } from './model/card-status-list-state';
import { KeyChainListState } from './model/key-chain-list-state';
import DialogCreateKey from './components/key-chain-list/dialog-create-key';
import Assistent from './components/assistent';

const channel = WsChannel.Dispatch.create();
const cardStatusListState = new CardStatusListState(channel);
const keyChainListState = new KeyChainListState(channel);

interface AppState {
  createKeyDialog: boolean;
}

export class App extends React.Component<{}, AppState> {

  constructor() {
    super();
    this.state = {
      createKeyDialog: false
    };
  }

  public componentWillUnmount(): void {
    channel.close();
  }

  public render_createKey(): JSX.Element {
    if (!this.state.createKeyDialog) {
      return null;
    }
    return <DialogCreateKey channel={channel}
            onClose={() => this.setState({createKeyDialog: false})} />;
  }

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={channel}>
        <img src={Clavator} className="logo" />
        <Tabs >
          <TabList className="MainMenu" >
            <Tab className="KeyChainList">KeyChainList</Tab>
            <Tab className="CardStatusList">CardStatusList</Tab>
            <Tab className="Assistent">Assistent</Tab>
          </TabList>
          <TabPanel>
            <a title="add new key"
                onClick={() => { this.setState({createKeyDialog: true}); }}
                className="closeBox">
                <i className="fa fa-plus"></i>
            </a>
            <KeyChainList
              keyChainListState={keyChainListState}
              cardStatusListState={cardStatusListState}
              channel={channel} />
            {this.render_createKey()}
          </TabPanel>
          <TabPanel>
            <CardStatusList channel={channel} cardStatusListState={cardStatusListState} />
          </TabPanel>
          <TabPanel>
            <Assistent channel={channel} cardStatusListState={cardStatusListState} />
          </TabPanel>
        </Tabs>
      </ChannelStatus>
    );
  }
}

export default App;
