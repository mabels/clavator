
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
import CardStatusListState from '../model/card-status-list-state';
import Warrents from '../../gpg/warrents';
import Warrent from '../../gpg/warrent';
// import ViewWarrents from '../model/warrent';
import SimpleYubiKey from '../model/simple-yubikey';
import RcWarrents from './controls/rc-warrents';
// import RcCheckWarrents from './assistent/rc-check-warrents';
import RcSimpleKeyCommon from './assistent/rc-simple-key-common';
import InputPassPhrase from './controls/input-pass-phrase';
import ButtonToProgressor from './controls/button-to-progressor';
import DiceWareInputPassPhrase from './assistent/dice-ware-input-pass-phrase';
import RandomInputPassPhrase from './assistent/random-input-pass-phrase';
import DiceWare from '../../dice-ware/dice-ware';
import * as Message from '../../model/message';

class AssistentState {
  // public current: Actions.Steps;
  // public completed: Actions.Steps;
  // public secretKey: ListSecretKeys.SecretKey;

  @observable public warrents: Warrents;
  @observable public simpleYubiKey: SimpleYubiKey;
  public diceWareTransaction: Message.Transaction<DiceWare>;
  public simpleYubiKeyTransaction: Message.Transaction<SimpleYubiKey>;
  public diceWares: DiceWare[];
}

interface AssistentProps extends React.Props<Assistent> {
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

@observer
export class Assistent
  extends React.Component<AssistentProps, AssistentState> {
  constructor() {
    super();
    this.state = {
      // current: Actions.Steps.CheckCard, // Actions.Steps.CreateKey,
      // completed: Actions.Steps.None,
      // secretKey: new ListSecretKeys.SecretKey(),
      warrents: (new Warrents()).add(new Warrent()),
      simpleYubiKey: null,
      diceWareTransaction: Message.newTransaction('DiceWares.Request'),
      simpleYubiKeyTransaction: Message.newTransaction<SimpleYubiKey>('SimpleYubiKey.run'),
      diceWares: null
    };
    this.handleReady = this.handleReady.bind(this);
  }

  public componentDidMount(): void {
    this.props.channel.onMessage((cb, data) => {
      // debugger;
      // console.log('DiceWare:', cb.action);
      if (cb.action == 'DiceWares.Response') {
        const diceWares = JSON.parse(data);
        this.setState(Object.assign(this.state, {
            diceWares: diceWares.map((dw: any) => DiceWare.fill(dw))
        }));
        // console.log('DiceWares.Response', this.state);
      }
    });
    this.props.channel.send(this.state.diceWareTransaction.asMsg());
  }

  private handleReady(): void {
    console.log('ready:', this.state.simpleYubiKey.toObj());
    this.state.simpleYubiKeyTransaction.data = this.state.simpleYubiKey.toObj();
    this.props.channel.send(this.state.simpleYubiKeyTransaction.asMsg());
    /* */
  }

  private renderReady(): JSX.Element {
    return <div className="row">
      {/* <ButtonToProgressor
          disabled={!this.state.simpleYubiKey.completed()}
          channel={this.props.channel}
          onClick={this.handleReady}
          transaction={this.state.simpleYubiKeyTransaction}
          >ready</ButtonToProgressor> */}
          <button onClick={this.handleReady}>testing</button>
    </div>;
  }

  private renderSimpleCreateKey(): JSX.Element {
    // console.log(this.state.warrents.length(), this.state.warrents.valid());
    if (!(this.state.simpleYubiKey && this.state.diceWares)) {
      return;
    }
    // console.log('renderSimpleCreateKey', this.state.simpleYubiKey.common.approvableWarrents.non());
    // this.state.simpleYubiKey.adminKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    // this.state.simpleYubiKey.userKey.readonly.set(this.state.simpleYubiKey.common.viewWarrents.non());
    return <div className={classnames({
        SimpleCreateKey: true,
        readOnly: this.state.simpleYubiKey.readOnly.is,
        good: this.state.simpleYubiKey.valid(),
        completed: this.state.simpleYubiKey.completed()
    })}>
      <RcSimpleKeyCommon
        readOnly={this.state.simpleYubiKey.readOnly}
        simpleKeyCommon={this.state.simpleYubiKey.common} />
      <div className={classnames({
          Passwords: true,
          readonly: this.state.simpleYubiKey.readOnly.is
        })}>
        <DiceWareInputPassPhrase label="PasswordPhase"
          diceWares={this.state.diceWares}
          readOnly={this.state.simpleYubiKey.readOnly}
          approvedWarrents={this.state.simpleYubiKey.common.viewWarrents}
          passPhrase={this.state.simpleYubiKey.passPhrase} />
        <RandomInputPassPhrase label="Admin-Key"
          readOnly={this.state.simpleYubiKey.readOnly}
          approvedWarrents={this.state.simpleYubiKey.common.viewWarrents}
          passPhrase={this.state.simpleYubiKey.adminKey} />
        <RandomInputPassPhrase label="User-Key"
          readOnly={this.state.simpleYubiKey.readOnly}
          approvedWarrents={this.state.simpleYubiKey.common.viewWarrents}
          passPhrase={this.state.simpleYubiKey.userKey}/>
      </div>
      {this.renderReady()}
    </div>;
  }

  private renderWarrents(): JSX.Element {
    if (this.state.simpleYubiKey && this.state.diceWares) {
      return;
    }
    return <div>
      <label>WarrentsList:</label>
      <RcWarrents
        warrents={this.state.warrents}
        completed={() => {
          this.setState(Object.assign(this.state, {
            simpleYubiKey: new SimpleYubiKey(this.state.warrents, this.state.diceWares)
          }));
        }} />
        </div>;
  }

  private renderLoadDiceWare(): JSX.Element {
    if (this.state.diceWares) {
      return;
    }
    return <div>
        <label>Loading DiceWare....</label>
      </div>;
  }

  public render(): JSX.Element {
    return (
      <div>
        {this.renderWarrents()}
        {this.renderLoadDiceWare()}
        {this.renderSimpleCreateKey()}
      </div>
    );
  }
}

export default Assistent;
