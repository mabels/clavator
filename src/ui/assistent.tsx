
import * as React from 'react';
import { observable } from 'mobx';
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

  private renderReady(): JSX.Element {
    return <span>ready</span>;
  }

  private renderSimpleCreateKey(): JSX.Element {
    console.log(this.state.warrents.length(), this.state.warrents.valid());
    if (!(this.state.warrents.length() && this.state.warrents.valid())) {
      return;
    }
    return <ul>
      <CheckWarrents simpleYubiKey={this.state.simpleYubiKey}>
      <li>Expire-Date</li>
      <li>Name-Real</li>
      <li>Name-Email</li>
      <li>Name-Comment</li>
      <li>Key-Type</li>
      <li>Master-Length</li>
      <li>SubKey-Length</li>
      </CheckWarrents>
      <li><RcPassPhrase title="Password-Parts-0" simpleYubiKey={this.state.simpleYubiKey} /></li>
      <li><RcPassPhrase title="Password-Parts-1" simpleYubiKey={this.state.simpleYubiKey} /></li>
      <li><RcPassPhrase title="Admin-Key-Parts-0" simpleYubiKey={this.state.simpleYubiKey} /></li>
      <li><RcPassPhrase title="Admin-Key-Parts-1" simpleYubiKey={this.state.simpleYubiKey} /></li>
      <li>User-Key-0</li>
      <li>User-Key-1</li>
      <li>{this.renderReady()}</li>
    </ul>;
  }

  public render(): JSX.Element {
    return (
      <div>
        <RcWarrents warrents={this.state.warrents}
          completed={() => {
            this.setState(Object.assign(this.state, {
              simpleYubiKey: new SimpleYubiKey(this.state.warrents)
            }));
          }} />
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
