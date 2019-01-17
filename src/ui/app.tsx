import * as React from 'react';
import * as ReactModal from 'react-modal';

import './normalize.css';
import './skeleton.css';
import './app.less';
const Clavator = require('./img/clavator.png');

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
import { ChannelStatus } from './components/controls';
import { DialogCreateKey } from './components/key-chain-list/dialog-create-key';
import { Assistent } from './components/assistent';
import { AppState } from './model/app-state';
import { AppProgressor } from './app-progressor';
import { observable } from 'mobx';

// @observer
export class App extends React.Component<{}, {}> {

  private appState: AppState;
  @observable
  public createKeyDialog: boolean;

  @observable
  public selectedTabIndex: number;

  constructor(props: {} = {}) {
    super(props);
    this.selectedTabIndex = 0;
    this.appState = AppState.create();
  }

  public componentWillUnmount(): void {
    this.appState.channel.close();
  }

  public render_createKey(): JSX.Element {
    if (!this.createKeyDialog) {
      return null;
    }
    return <DialogCreateKey appState={this.appState}
      onClose={() => this.createKeyDialog = false} />;
  }

  /*
  private isSelectedTab(id: number): boolean {
    return this.state.selectedTabIndex == id;
  }
  */

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={this.appState.channel}>
        <img src={Clavator} className="logo" />
        <AppProgressor progressState={this.appState.progressorState} />
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
                this.appState.progressorState.open = !this.appState.progressorState.open;
              }}
              className="closeBox">
              <i className="fa fa-comment"></i>
            </a>
          </TabList>
          <TabPanel>
            <a title="add new key"
              onClick={() => this.createKeyDialog = true }
              className="closeBox">
              <i className="fa fa-plus"></i>
            </a>
            <KeyChainList appState={this.appState} />
            {this.render_createKey()}
          </TabPanel>
          <TabPanel>
            <CardStatusList appState={this.appState} />
          </TabPanel>
          <TabPanel>
            <Assistent appState={this.appState} />
          </TabPanel>
        </Tabs>
      </ChannelStatus>
    );
  }
}
