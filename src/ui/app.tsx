import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactModal from 'react-modal';
import { observable, configure, action, IObservableValue } from 'mobx';
import { observer } from 'mobx-react';

import './normalize.css';
import './skeleton.css';
import './app.less';
const Clavator = require('./img/clavator.png');

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { KeyChainList, CreateKey } from './components/key-chain-list';
import { CardStatusList } from './components/card-status-list';
import { ChannelStatus } from './components/controls';
import { DialogCreateKey } from './components/key-chain-list/dialog-create-key';
import { Assistent } from './components/assistent';
import { AppState } from './model/app-state';
import { AppProgressor } from './app-progressor';

configure({
 enforceActions: 'always'
});

@observer
export class App extends React.Component<{}, {}> {

  private appState: AppState;
  public readonly createKeyDialog: IObservableValue<boolean> = observable.box(false);

  public readonly selectedTabIndex: IObservableValue<number> = observable.box(0);

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
        <img src={Clavator} className="logo" />
        <AppProgressor progressState={this.appState.progressorState} />
        <Tabs
          selectedIndex={this.selectedTabIndex.get()}
          onSelect={action((index: number, last: number, event: Event) => {
            console.log('Tabs:', index, last, event);
            this.selectedTabIndex.set(index);
          })}>
          <TabList className="MainMenu" >
            <Tab className="KeyChainList">KeyChainList</Tab>
            <Tab className="CardStatusList">CardStatusList</Tab>
            <Tab className="Assistent">Assistent</Tab>
            <a title="add new key"
              onClick={action(() => {
                this.appState.progressorState.open.set(!this.appState.progressorState.open.get());
                console.log(`open: progressor ${this.appState.progressorState.open.get()}`);
              })}
              className="closeBox">
              <i className="fa fa-comment"></i>
            </a>
          </TabList>
          <TabPanel>
            <a title="add new key"
              onClick={action(() => this.createKeyDialog.set(true))}
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
