
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
import SimpleYubiKey from '../gpg/simple-yubikey';
import RcWarrents from './rc-warrents';
import CheckWarrents from './check-warrents';
import RcPassPhrase from './rc-pass-phrase';
import SimpleYubiKeyCommon from './simple-yubi-key-common';
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
      warrents: new Warrents(),
      simpleYubiKey: null
    };
    this.handleReady = this.handleReady.bind(this);
  }
  public render_steps(): JSX.Element {
    // switch (this.state.current) {
    //   case Actions.Steps.CreateKey:
    //     return <AssistentCreateKey
    //       channel={this.props.channel}
    //       secretKey={this.state.secretKey}
    //       onNext={() => {
    //         console.log('SecretKey:', this.state.secretKey);
    //         this.setState({
    //           secretKey: this.state.secretKey,
    //           current: Actions.Steps.CheckCard,
    //           completed: this.state.completed | Actions.Steps.CreateKey
    //             | Actions.Steps.CheckCard // achtung muss weg!
    //         });
    //       }} />;
    //   case Actions.Steps.CheckCard:
    //     return <AssistentCheckCard
    //       cardStatusListState={this.props.cardStatusListState}
    //       secretKey={this.state.secretKey}
    //       onNext={() => {
    //         this.setState({
    //           current: Actions.Steps.SendToCard,
    //           completed: this.state.completed | Actions.Steps.CheckCard
    //         });
    //       }} />;
    //   case Actions.Steps.SendToCard:
    //     return <AssistentSendKeyToCard onNext={() => {
    //         this.setState({
    //           current: Actions.Steps.Completed,
    //           completed: this.state.completed | Actions.Steps.SendToCard | Actions.Steps.Completed
    //         });
    //       }} />;
    //   case Actions.Steps.Completed:
    //     return <AssistentCompleted />;
    // }
    return null;
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
    return <form className={classnames({ good: this.state.simpleYubiKey.valid() })}>
      <SimpleYubiKeyCommon simpleYubiKey={this.state.simpleYubiKey} />
      <InputPassPhrase label="PasswordPhase" passPhrase={this.state.simpleYubiKey.passPhrase} />
      <InputPassPhrase label="Admin-Key" passPhrase={this.state.simpleYubiKey.adminKey} />
      <InputPassPhrase label="User-Key" passPhrase={this.state.simpleYubiKey.userKey}/>
      {this.renderReady()}
    </form>;
  }

  private renderWarrents(): JSX.Element {
    if (this.state.simpleYubiKey) {
      return;
    }
    return <RcWarrents warrents={this.state.warrents}
    completed={() => {
      this.setState(Object.assign(this.state, {
        simpleYubiKey: new SimpleYubiKey(this.state.warrents)
      }));
    }} />;
  }

  public render(): JSX.Element {
    return (
      <div>
        {this.renderWarrents()}
        {this.renderSimpleCreateKey()}
      </div>
      // <Actions.Actions current={this.state.current}
      //                  completed={this.state.completed}
      //                  onClick={(a) => {
      //                    if (a & this.state.completed) {
      //                      this.setState({current: a});
      //                    }
      //                  }}
      //                  >
      //   {this.render_steps()}
      // </Actions.Actions>
    );
  }
}

export default Assistent;
