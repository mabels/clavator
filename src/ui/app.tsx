import * as React from 'react';
import './normalize.css';
import './skeleton.css';
import './app.less';
import 'font-awesome/less/font-awesome.less';
const Clavator = require('./img/clavator.png');

// import { observable } from 'mobx';
// import { observer } from 'mobx-react';

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
import { Assistent, AssistentState } from './components/assistent';
import * as ReactModal from 'react-modal';
import Progressor from './components/controls/progressor';

const channel = WsChannel.Dispatch.create();
const cardStatusListState = new CardStatusListState(channel);
const keyChainListState = new KeyChainListState(channel);

class AppState {
  public createKeyDialog: boolean;
  public selectedTabIndex: number;
  public assistentState: AssistentState;
  public openProgressor: boolean;
}

// @observer
export class App extends React.Component<{}, AppState> {

  constructor() {
    super();
    this.state = {
      createKeyDialog: false,
      selectedTabIndex: 0,
      assistentState: new AssistentState(),
      openProgressor: false
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
      onClose={() => this.setState({ createKeyDialog: false })} />;
  }

  /*
  private isSelectedTab(id: number): boolean {
    return this.state.selectedTabIndex == id;
  }
  */

  private renderProgressor(): JSX.Element {
    /*
    if (!this.state.openProgressor) {
      return null;
    }
    */
    return <ReactModal
      isOpen={this.state.openProgressor}
      closeTimeoutMS={150}
      onAfterOpen={() => { /* */ }}
      contentLabel="Modal"
      shouldCloseOnOverlayClick={true}
    >
      <i onClick={() => {
          this.setState({ openProgressor: false });
        }}
        className="closeBox fa fa-close"></i>
      <Progressor
        channel={channel}
        msg={'Clavator'}
        controls={true} />
    </ReactModal>;
  }

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={channel}>
        <img src={Clavator} className="logo" />
        {this.renderProgressor()}
        <Tabs
          selectedIndex={this.state.selectedTabIndex}
          onSelect={(index: number, last: number, event: Event) => {
            console.log('Tabs:', index, last, event);
            // this.state.selectedTab = index;
            this.setState(Object.assign(this.state, {
              selectedTabIndex: index
            }));
            return true;
          }}>
          <TabList className="MainMenu" >
            <Tab className="KeyChainList">KeyChainList</Tab>
            <Tab className="CardStatusList">CardStatusList</Tab>
            <Tab className="Assistent">Assistent</Tab>
            <a title="add new key"
              onClick={() => {
                this.setState({ openProgressor: !this.state.openProgressor });
              }}
              className="closeBox">
              <i className="fa fa-comment"></i>
            </a>
          </TabList>
          <TabPanel>
            <a title="add new key"
              onClick={() => { this.setState({ createKeyDialog: true }); }}
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
            <Assistent
              assistentState={this.state.assistentState}
              channel={channel}
              cardStatusListState={cardStatusListState} />
          </TabPanel>
        </Tabs>
      </ChannelStatus>
    );
  }
}

export default App;
