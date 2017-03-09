import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';
const Clavator = require('./clavator.png');

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
import { Progressor } from './progressor';
import { ChannelStatus } from './channel-status';
import * as WsChannel from './ws-channel';
import { CardStatusListState } from './card-status-list-state'
import { KeyChainListState } from './key-chain-list-state'
import DialogCreateKey from './dialog-create-key';
import Assistent from './assistent';

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

  protected componentWillUnmount(): void {
    channel.close();
  }

  public render_createKey() {
    if (!this.state.createKeyDialog) {
      return null;
    }
    return <DialogCreateKey channel={channel} 
            onClose={() => this.setState({createKeyDialog: false})}/>
  }

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={channel}>
        <img src={Clavator} className="logo" />
        <Tabs selectedIndex={0} >
          <TabList>
            <Tab>KeyChainList</Tab>
            <Tab>CardStatusList</Tab>
            <Tab>Assistent</Tab>
          </TabList>
          <TabPanel>
            <a title="add new key"
                onClick={() => {this.setState({createKeyDialog: true})}}
                name="create-key"
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
            <Assistent channel={channel}/>
          </TabPanel>
        </Tabs>
      </ChannelStatus>
    );
  }
}
