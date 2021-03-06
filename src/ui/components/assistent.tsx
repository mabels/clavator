
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable, action, IObservableArray, IObservableValue } from 'mobx';
import classnames from 'classnames';

import { Dispatch, AppState, SimpleYubikey } from '../model';
import { Option, Message, Warrent, Warrents } from '../../model';
import { RcOption, RcWarrents, ClavatorForm } from './controls';
import { RcSimpleKeyCommon } from './assistent/rc-simple-key-common';
import { DiceWareInputPassPhrase } from './assistent/dice-ware-input-pass-phrase';
import { RandomInputPassPhrase } from './assistent/random-input-pass-phrase';
import { DiceWare } from '../../dice-ware';
import { Card, CardHeader, CardContent } from '@material-ui/core';
// import Progressor from './controls/progressor';

export class AssistentState {
  // public current: Actions.Steps;
  // public completed: Actions.Steps;
  // public secretKey: ListSecretKeys.SecretKey;

  public readonly warrents: Warrents;
  public readonly _simpleYubiKey: IObservableValue<SimpleYubikey>;
  public diceWareTransaction: Message.Transaction<DiceWare>;
  public simpleYubiKeyTransaction: Message.Transaction<SimpleYubikey>;
  public readonly diceWares: IObservableArray<DiceWare> = observable.array([]);
  public readonly diceWareLoading: IObservableValue<boolean>;

  constructor() {
    this.warrents = (new Warrents()).add(new Warrent());
    this._simpleYubiKey = observable.box();
    this.diceWareTransaction = Message.newTransaction('DiceWares.Request');
    this.simpleYubiKeyTransaction = Message.newTransaction<SimpleYubikey>('SimpleYubiKey.run');
    this.diceWareLoading = observable.box(false);
  }

  public get simpleYubiKey(): SimpleYubikey {
    return this._simpleYubiKey.get();
  }

  @action
  public load(channel: Dispatch): void {
    console.log(`load-DiceWare:1`);
    if (this.diceWares.length || this.diceWareLoading.get()) {
      return;
    }
    this.diceWareLoading.set(true);
    channel.onMessage(action((header: Message.Header, data: string) => {
      // debugger;
      console.log('DiceWare:Action:1:', header.action);
      if (header.action == 'DiceWares.Response') {
        console.log('DiceWare:Action:2:', header.action);
        const diceWares = JSON.parse(data);
        this.diceWares.push.apply(
          this.diceWares, diceWares.map((dw: any) => (DiceWare.fill(dw))));
        console.log('DiceWares.Response', this.diceWares);
        this.diceWareLoading.set(false);
      }
    }));
    console.log(`load-DiceWare:2`);
    channel.send(this.diceWareTransaction.asMsg());
    console.log(`load-DiceWare:3`);
  }

}

interface AssistentProps extends React.Props<Assistent> {
  appState: AppState;
}

@observer
export class Assistent extends React.Component<AssistentProps> {
  constructor(props: AssistentProps) {
    super(props);
    // this.state = {
      // warrents: (new Warrents()).add(new Warrent()),
      // simpleYubiKey: null,
      // diceWareTransaction: Message.newTransaction('DiceWares.Request'),
      // simpleYubiKeyTransaction: Message.newTransaction<SimpleYubiKey>('SimpleYubiKey.run'),
      // diceWares: null
    // };
    // this.handleReady = this.handleReady.bind(this);
  }

  public componentDidMount(): void {
    this.props.appState.assistentState.load(this.props.appState.channel);
  }

  @action
  private handleReady(): void {
    console.log('ready:', this.props.appState.assistentState.simpleYubiKey.toObj());
    this.props.appState.assistentState.simpleYubiKeyTransaction.data =
      this.props.appState.assistentState.simpleYubiKey.toObj();
    this.props.appState.channel.send(this.props.appState.assistentState.simpleYubiKeyTransaction.asMsg());
    /* */
  }

  private renderReady(): JSX.Element {
    const ops = this.props.appState.cardStatusListState.cardStatusList.map(cs => cs.reader.cardid);
    return <div className="row">
        <RcOption
          readOnly={this.props.appState.assistentState.simpleYubiKey.readOnly}
          name="SmartCards"
          label="SmartCards:"
          onChange={action((value: string) => {
            this.props.appState.assistentState.simpleYubiKey.smartCardId.set(value);
          })}
          option={new Option<String>(ops[0], ops, 'unknown error')}/>
      <button onClick={() => this.handleReady()}>testing</button>
    </div>;
  }

  private renderSimpleCreateKey(assistentState: AssistentState): JSX.Element {
    // console.log(this.state.warrents.length(), this.state.warrents.valid());
    if (!(assistentState.simpleYubiKey && assistentState.diceWares.length)) {
      return;
    }
    // console.log('renderSimpleCreateKey', this.state.simpleYubiKey.common.approvableWarrents.non());
    // this.state.simpleYubiKey.adminKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    // this.state.simpleYubiKey.userKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    return <ClavatorForm className={classnames({
      SimpleCreateKey: true,
      readOnly: assistentState.simpleYubiKey.readOnly.is,
      good: assistentState.simpleYubiKey.valid,
      completed: assistentState.simpleYubiKey.completed()
    })}>
      <RcSimpleKeyCommon
        readOnly={assistentState.simpleYubiKey.readOnly}
        simpleKeyCommon={assistentState.simpleYubiKey.common} />
      <div className={classnames({
        Passwords: true,
        readonly: assistentState.simpleYubiKey.readOnly.is
      })}>
        <DiceWareInputPassPhrase label="PasswordPhase"
          diceWares={assistentState.diceWares}
          readOnly={assistentState.simpleYubiKey.readOnly}
          approvedWarrents={assistentState.simpleYubiKey.common.viewWarrents}
          passPhrase={assistentState.simpleYubiKey.passPhrase} />
        <RandomInputPassPhrase label="Admin-Key"
          readOnly={assistentState.simpleYubiKey.readOnly}
          approvedWarrents={assistentState.simpleYubiKey.common.viewWarrents}
          passPhrase={assistentState.simpleYubiKey.adminKey} />
        <RandomInputPassPhrase label="User-Key"
          readOnly={assistentState.simpleYubiKey.readOnly}
          approvedWarrents={assistentState.simpleYubiKey.common.viewWarrents}
          passPhrase={assistentState.simpleYubiKey.userKey} />
      </div>
      {this.renderReady()}
    </ClavatorForm>;
  }

  private renderWarrents(assistentState: AssistentState): JSX.Element {
    if (assistentState.simpleYubiKey && assistentState.diceWares.length) {
      return;
    }
    return <CardContent>
      <label>WarrentsList:</label>
      <RcWarrents
        warrents={assistentState.warrents}
        completed={action(() => {
          assistentState._simpleYubiKey.set(new SimpleYubikey(assistentState.warrents,
            assistentState.diceWares,
            this.props.appState.cardStatusListState.cardStatusList[0].reader.cardid));
        })} />
    </CardContent>;
  }

  private renderLoadDiceWare(assistentState: AssistentState): JSX.Element {
    if (assistentState.diceWares && assistentState.diceWares.length) {
      return <CardHeader>Assistent</CardHeader>;
    }
    return <CardHeader>Loading DiceWare....</CardHeader>;
  }

  public render(): JSX.Element {
    return (
      <Card>
        {this.renderLoadDiceWare(this.props.appState.assistentState)}
        {this.renderWarrents(this.props.appState.assistentState)}
        {this.renderSimpleCreateKey(this.props.appState.assistentState)}
      </Card>
    );
  }
}
