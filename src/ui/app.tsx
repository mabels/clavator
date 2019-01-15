import * as React from 'react';
import '../../../src/ui/normalize.css';
import '../../../src/ui/skeleton.css';
import '../../../src/ui/app.less';
// import 'font-awesome/less/font-awesome.less';
const Clavator = require('../../../src/ui/img/clavator.png');

// import { observable } from 'mobx';
// import { observer } from 'mobx-react';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
// import { CreateKey } from './create-key';
// import { Progressor } from './progressor';
import ChannelStatus from './components/controls/channel-status';
// import * as WsChannel from './model/ws-channel';
// import { CardStatusListState } from './model/card-status-list-state';
// import { KeyChainListState } from './model/key-chain-list-state';
import DialogCreateKey from './components/key-chain-list/dialog-create-key';
import { Assistent } from './components/assistent';
import * as ReactModal from 'react-modal';
import { Progressor } from './components/controls/progressor';
import AppState from './model/app-state';

const appState = AppState.create();

class AppViewState {
  public createKeyDialog: boolean;
  public selectedTabIndex: number;
  public openProgressor: boolean;
}

// @observer
export class App extends React.Component<{}, AppViewState> {

  constructor(props: {} = {}) {
    super(props);
    this.state = {
      createKeyDialog: false,
      selectedTabIndex: 0,
      openProgressor: false
    };
  }

  public componentWillUnmount(): void {
    appState.channel.close();
  }

  public render_createKey(): JSX.Element {
    if (!this.state.createKeyDialog) {
      return null;
    }
    return <DialogCreateKey appState={appState}
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
        progressor={appState.progressorState}
        msg={'Clavator'}
        controls={true} />
    </ReactModal>;
  }

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={appState.channel}>
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
            <KeyChainList appState={appState} />
            {this.render_createKey()}
          </TabPanel>
          <TabPanel>
            <CardStatusList appState={appState} />
          </TabPanel>
          <TabPanel>
            <Assistent appState={appState} />
          </TabPanel>
        </Tabs>
      </ChannelStatus>
    );
  }
}

export default App;
