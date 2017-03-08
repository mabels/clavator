import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// import "react-font-awesome";

import { render } from 'react-dom';

// import { Subject, Observable } from 'rxjs';

// import "./clavator.png";
const Clavator = require('./clavator.png');

import { KeyChainList } from './key-chain-list';
import { CardStatusList } from './card-status-list';
import { CreateKey } from './create-key';
// import { ResetYubikey } from './reset-yubikey';
import { Progressor } from './progressor';
import { ChannelStatus } from './channel-status';

// import { Provider } from 'react-redux';

import * as WsChannel from './ws-channel';

// import * as Rx from 'rxjs';

import { CardStatusListState } from './card-status-list-state'
import { KeyChainListState } from './key-chain-list-state'

import DialogCreateKey from './dialog-create-key';

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
        <Tabs selectedIndex={0} >
          <TabList>
            {/*<Tab>CreateKey</Tab>*/}
            <Tab>KeyChainList</Tab>
            <Tab>CardStatusList</Tab>
            {/*<Tab>Logs</Tab>*/}
          </TabList>
          {/*<TabPanel>
            <a name="CreateKey"></a>
            <h3>CreateKey</h3>
            <CreateKey channel={channel} />
          </TabPanel>*/}
          <TabPanel>
            <a name="KeyChainList"></a>
            <a title="add new key"
                onClick={() => {this.setState({createKeyDialog: true})}}
                name="create-key"
                className="closeBox">
                <i className="fa fa-plus"></i>
            </a>
            {this.render_createKey()}
            <h3>KeyChainList</h3>
            <KeyChainList
              keyChainListState={keyChainListState}
              cardStatusListState={cardStatusListState}
              channel={channel} />
          </TabPanel>
          <TabPanel>
            <a name="CardStatusList"></a>
            <h3>CardStatusList</h3>
            <CardStatusList channel={channel} cardStatusListState={cardStatusListState} />
          </TabPanel>
          {/*<TabPanel>
            <a name="Progressor"></a>
            <h3>Logs</h3>
            <Progressor channel={channel} msg="Clavator" controls={true} />
          </TabPanel>*/}
        </Tabs>
      </ChannelStatus>
    );
  }
}
