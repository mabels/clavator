import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactModal from 'react-modal';
import { observable, configure, action, IObservableValue } from 'mobx';
import { observer } from 'mobx-react';

const Clavator = require('./img/clavator.png');

// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import { KeyChainList, CreateKey } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
import { ChannelStatus } from './components/controls';
import { DialogCreateKey } from './components/key-chain-list/dialog-create-key';
import { Assistent } from './components/assistent';
import { AppState } from './model/app-state';
import { AppProgressor } from './app-progressor';
import { Typography } from '@material-ui/core';

configure({
 enforceActions: 'always'
});

enum TabsEnum {
  KeyChainList = 'KeyChainList',
  CardStatusList = 'CardStatusList',
  Assistent = 'Assistent'
}

interface TabsEnumProps extends React.Props<{}> {
  readonly selectedTab: TabsEnum;
  readonly my: TabsEnum;
}

const TabPanel: React.SFC<TabsEnumProps> = observer((props: TabsEnumProps) => {
  if (props.my !== props.selectedTab) {
    return <></>;
  }
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
});

@observer
export class App extends React.Component<{}, {}> {

  private appState: AppState;
  public readonly createKeyDialog: IObservableValue<boolean> = observable.box(false);

  // public readonly selectedTabIndex: IObservableValue<number> = observable.box(0);

  public readonly selectedTab: IObservableValue<TabsEnum> = observable.box(TabsEnum.KeyChainList);

  public constructor(props: {} = {}) {
    super(props);
    this.appState = AppState.create();
  }

  public componentDidMount(): void {
    const el = ReactDOM.findDOMNode(this).parentElement;
    console.log(`ParentElement:${el}`);
    ReactModal.setAppElement(el);
  }

  public componentWillUnmount(): void {
    this.appState.channel.close();
  }

  public render_createKey(): JSX.Element {
    if (!this.createKeyDialog.get()) {
      return null;
    }
    return <DialogCreateKey
      appState={this.appState}
      onClose={action(() => this.createKeyDialog.set(false))} />;
  }

  /*
  private isSelectedTab(id: number): boolean {
    return this.state.selectedTabIndex == id;
  }
  */

  public render(): JSX.Element {
    return (
      <ChannelStatus channel={this.appState.channel}>
        {/* <img src={Clavator} className="logo" /> */}
        <AppProgressor progressState={this.appState.progressorState} />
        <AppBar position="static">
          <Tabs value={this.selectedTab.get()} onChange={action((e: any, newValue: TabsEnum) => {
            this.selectedTab.set(newValue);
            console.log(newValue);
          })}>
            <Tab label="KeyChainList" value={TabsEnum.KeyChainList} />
            <Tab label="CardStatusList" value={TabsEnum.CardStatusList} />
            <Tab label="Assistent" value={TabsEnum.Assistent} />
            {/* <a title="add new key"
              onClick={action(() => {
                this.appState.progressorState.open.set(!this.appState.progressorState.open.get());
                console.log(`open: progressor ${this.appState.progressorState.open.get()}`);
              })}
              className="closeBox">
              <i className="fa fa-comment"></i>
            </a> */}
          </Tabs>
          </AppBar>
          <TabPanel selectedTab={this.selectedTab.get()} my={TabsEnum.KeyChainList}>
            <a title="add new key"
              onClick={action(() => this.createKeyDialog.set(true))}
              className="closeBox">
              <i className="fa fa-plus"></i>
            </a>
            <KeyChainList appState={this.appState} />
            {this.render_createKey()}
          </TabPanel>
          <TabPanel selectedTab={this.selectedTab.get()} my={TabsEnum.CardStatusList}>
            <CardStatusList appState={this.appState} />
          </TabPanel>
          <TabPanel selectedTab={this.selectedTab.get()} my={TabsEnum.Assistent}>
            <Assistent appState={this.appState} />
          </TabPanel>
      </ChannelStatus>
    );
  }
}
