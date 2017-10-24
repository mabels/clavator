
import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as classnames from 'classnames';
// import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import AssistentCreateKey from './assistent-create-key';
import AssistentSendKeyToCard from './assistent-send-key-to-card';
import AssistentCompleted from './assistent-completed';
import AssistentCheckCard from './assistent-checkcard';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import * as WsChannel from './ws-channel';
import CardStatusListState from './card-status-list-state';
import Warrents from '../gpg/warrents';
import Warrent from '../gpg/warrent';
import SimpleYubiKey from '../gpg/simple-yubikey';
import RcWarrents from './rc-warrents';
import RcCheckWarrents from './rc-check-warrents';
import RcSimpleKeyCommon from './rc-simple-key-common';
import InputPassPhrase from './input-pass-phrase';

class AssistentState {
  // public current: Actions.Steps;
  // public completed: Actions.Steps;
  // public secretKey: ListSecretKeys.SecretKey;

  @observable public warrents: Warrents;
  @observable public simpleYubiKey: SimpleYubiKey;
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
      simpleYubiKey: null
    };
    this.handleReady = this.handleReady.bind(this);
  }

  private handleReady(): void {
    /* */
  }

  private renderReady(): JSX.Element {
    return <div className="row">
      <button type="button" onClick={this.handleReady}>ready</button>
    </div>;
  }

  private renderSimpleCreateKey(): JSX.Element {
    // console.log(this.state.warrents.length(), this.state.warrents.valid());
    if (!this.state.simpleYubiKey) {
      return;
    }
    console.log('renderSimpleCreateKey', this.state.simpleYubiKey.common.approvableWarrents.non());
    return <div className={classnames({
        SimpleCreateKey: true,
        good: this.state.simpleYubiKey.valid(),
        completed: this.state.simpleYubiKey.completed()
    })}>
      <RcSimpleKeyCommon simpleKeyCommon={this.state.simpleYubiKey.common} />
      <div className={classnames({
          Passwords: true,
          readonly: this.state.simpleYubiKey.common.approvableWarrents.non()
        })}>
      <InputPassPhrase label="PasswordPhase"
         readonly={this.state.simpleYubiKey.common.approvableWarrents.non()}
         approvedWarrents={this.state.simpleYubiKey.common.approvableWarrents}
         passPhrase={this.state.simpleYubiKey.passPhrase} />
      <InputPassPhrase label="Admin-Key"
         readonly={this.state.simpleYubiKey.common.approvableWarrents.non()}
         approvedWarrents={this.state.simpleYubiKey.common.approvableWarrents}
         passPhrase={this.state.simpleYubiKey.adminKey} />
      <InputPassPhrase label="User-Key"
         readonly={this.state.simpleYubiKey.common.approvableWarrents.non()}
         approvedWarrents={this.state.simpleYubiKey.common.approvableWarrents}
         passPhrase={this.state.simpleYubiKey.userKey}/>
      </div>
      {this.renderReady()}
    </div>;
  }

  private renderWarrents(): JSX.Element {
    if (this.state.simpleYubiKey) {
      return;
    }
    return <div>
      <label>WarrentsList:</label>
      <RcWarrents
        warrents={this.state.warrents}
        completed={() => {
          this.setState(Object.assign(this.state, {
            simpleYubiKey: new SimpleYubiKey(this.state.warrents)
          }));
        }} />
        </div>;
  }

  public render(): JSX.Element {
    return (
      <div>
        {this.renderWarrents()}
        {this.renderSimpleCreateKey()}
      </div>
    );
  }
}

export default Assistent;
