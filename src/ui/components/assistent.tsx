
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as classnames from 'classnames';
// import MutableString from '../gpg/mutable_string';
// import * as Actions from './actions';
// import AssistentCreateKey from './assistent-create-key';
// import AssistentSendKeyToCard from './assistent-send-key-to-card';
// import AssistentCompleted from './assistent-completed';
// import AssistentCheckCard from './assistent-checkcard';
// import * as ListSecretKeys from '../../gpg/list-secret-keys';
import * as WsChannel from '../model/ws-channel';
// import CardStatusListState from '../model/card-status-list-state';
import Warrents from '../../gpg/warrents';
import Warrent from '../../gpg/warrent';
// import ViewWarrents from '../model/warrent';
import SimpleYubiKey from '../model/simple-yubikey';
import RcWarrents from './controls/rc-warrents';
// import RcCheckWarrents from './assistent/rc-check-warrents';
import RcSimpleKeyCommon from './assistent/rc-simple-key-common';
// import InputPassPhrase from './controls/input-pass-phrase';
// import ButtonToProgressor from './controls/button-to-progressor';
import DiceWareInputPassPhrase from './assistent/dice-ware-input-pass-phrase';
import RandomInputPassPhrase from './assistent/random-input-pass-phrase';
import DiceWare from '../../dice-ware/dice-ware';
import * as Message from '../../model/message';
// import Progressor from './controls/progressor';
import { RcOption } from './controls/rc-option';
import Option from '../../model/option';
import AppState from '../model/app-state';

export class AssistentState {
  // public current: Actions.Steps;
  // public completed: Actions.Steps;
  // public secretKey: ListSecretKeys.SecretKey;

  @observable public warrents: Warrents;
  @observable public simpleYubiKey: SimpleYubiKey;
  public diceWareTransaction: Message.Transaction<DiceWare>;
  public simpleYubiKeyTransaction: Message.Transaction<SimpleYubiKey>;
  @observable public diceWares: DiceWare[];
  public diceWareLoading: boolean;

  constructor() {
    this.warrents = (new Warrents()).add(new Warrent());
    this.simpleYubiKey = null;
    this.diceWareTransaction = Message.newTransaction('DiceWares.Request');
    this.simpleYubiKeyTransaction = Message.newTransaction<SimpleYubiKey>('SimpleYubiKey.run');
    this.diceWares = [];
    this.diceWareLoading = false;
  }

  public load(channel: WsChannel.Dispatch): void {
    if (this.diceWares.length || this.diceWareLoading) {
      return;
    }
    this.diceWareLoading = true;
    channel.onMessage((cb, data) => {
      // debugger;
      // console.log('DiceWare:', cb.action);
      if (cb.action == 'DiceWares.Response') {
        const diceWares = JSON.parse(data);
        this.diceWares.push.apply(
          this.diceWares, diceWares.map((dw: any) => (DiceWare.fill(dw))));
        console.log('DiceWares.Response', this.diceWares);
        this.diceWareLoading = false;
      }
    });
    channel.send(this.diceWareTransaction.asMsg());
  }

}

interface AssistentProps extends React.Props<Assistent> {
  appState: AppState;
}

@observer
export class Assistent extends React.Component<AssistentProps> {
  constructor() {
    super();
    this.state = {
      // warrents: (new Warrents()).add(new Warrent()),
      // simpleYubiKey: null,
      // diceWareTransaction: Message.newTransaction('DiceWares.Request'),
      // simpleYubiKeyTransaction: Message.newTransaction<SimpleYubiKey>('SimpleYubiKey.run'),
      // diceWares: null
    };
    this.handleReady = this.handleReady.bind(this);
  }

  public componentDidMount(): void {
    this.props.appState.assistentState.load(this.props.appState.channel);
  }

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
          onChange={(value: string) => {
            this.props.appState.assistentState.simpleYubiKey.smartCardId = value;
          }}
          option={new Option<String>(ops[0], ops, 'unknown error')}/>
      <button onClick={this.handleReady}>testing</button>
    </div>;
  }

  private renderSimpleCreateKey(assistentState: AssistentState): JSX.Element {
    // console.log(this.state.warrents.length(), this.state.warrents.valid());
    if (!(assistentState.simpleYubiKey && assistentState.diceWares)) {
      return;
    }
    // console.log('renderSimpleCreateKey', this.state.simpleYubiKey.common.approvableWarrents.non());
    // this.state.simpleYubiKey.adminKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    // this.state.simpleYubiKey.userKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    return <div className={classnames({
      SimpleCreateKey: true,
      readOnly: assistentState.simpleYubiKey.readOnly.is,
      good: assistentState.simpleYubiKey.valid(),
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
    </div>;
  }

  private renderWarrents(assistentState: AssistentState): JSX.Element {
    if (assistentState.simpleYubiKey && assistentState.diceWares) {
      return;
    }
    return <div>
      <label>WarrentsList:</label>
      <RcWarrents
        warrents={assistentState.warrents}
        completed={() => {
          assistentState.simpleYubiKey = new SimpleYubiKey(assistentState.warrents,
            assistentState.diceWares, this.props.appState.cardStatusListState.cardStatusList[0].reader.cardid);
        }} />
    </div>;
  }

  private renderLoadDiceWare(assistentState: AssistentState): JSX.Element {
    if (assistentState.diceWares && assistentState.diceWares.length) {
      return;
    }
    return <div>
      <label>Loading DiceWare....</label>
    </div>;
  }

  public render(): JSX.Element {
    return (
      <div>
        {this.renderWarrents(this.props.appState.assistentState)}
        {this.renderLoadDiceWare(this.props.appState.assistentState)}
        {this.renderSimpleCreateKey(this.props.appState.assistentState)}
      </div>
    );
  }
}

export default Assistent;
