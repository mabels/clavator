import * as React from 'react';
import * as ReactModal from 'react-modal';

import './normalize.css';
import './skeleton.css';
import './app.less';
const Clavator = require('./img/clavator.png');

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
import ChannelStatus from './components/controls/channel-status';
import DialogCreateKey from './components/key-chain-list/dialog-create-key';
import { Assistent } from './components/assistent';
import { Progressor } from './components/controls/progressor';
import { AppState } from './model/app-state';
import { AppProgressor } from './app-progressor';
import { observable } from 'mobx';

const appState = AppState.create();

class AppViewState {
  // public createKeyDialog: boolean;
  // public openProgressor: boolean;
}

// @observer
export class App extends React.Component<{}, AppViewState> {

  @observable
  public selectedTabIndex: number;

  constructor(props: {} = {}) {
    super(props);
    this.selectedTabIndex = 0;
    /*
    this.state = {
      createKeyDialog: false,
      // openProgressor: false
    };
    */
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

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={appState.channel}>
        <img src={Clavator} className="logo" />
        <AppProgressor progressState={appState.progressorState} />
        <Tabs
          selectedIndex={this.selectedTabIndex}
          onSelect={(index: number, last: number, event: Event) => {
            console.log('Tabs:', index, last, event);
            this.selectedTabIndex = index;
            return true;
          }}>
          <TabList className="MainMenu" >
            <Tab className="KeyChainList">KeyChainList</Tab>
            <Tab className="CardStatusList">CardStatusList</Tab>
            <Tab className="Assistent">Assistent</Tab>
            <a title="add new key"
              onClick={() => {
                appState.progressorState.open = !appState.progressorState.open;
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
