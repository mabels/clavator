
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import AssistentCreateKey from './assistent-create-key';
import AssistentSendKeyToCard from './assistent-send-key-to-card';
import AssistentCompleted from './assistent-completed';
import AssistentCheckCard from './assistent-checkcard';
import * as WsChannel from './ws-channel';

interface AssistentState {
  current: Actions.Steps
  completed: Actions.Steps
}

interface AssistentProps extends React.Props<Assistent> {
  channel: WsChannel.Dispatch;
}

export class Assistent
  extends React.Component<AssistentProps, AssistentState>
{
  constructor() {
    super();
    this.state = {
      current: Actions.Steps.CreateKey,
      completed: Actions.Steps.None
    };
  }
  public render_steps() {
    switch (this.state.current) {
      case Actions.Steps.CreateKey:
        return <AssistentCreateKey 
          channel={this.props.channel}
          onNext={() => {
            this.setState({
              current: Actions.Steps.CheckCard,
              completed: this.state.completed|Actions.Steps.CreateKey
            })
          }} />
      case Actions.Steps.CheckCard:
        return <AssistentCheckCard 
          channel={this.props.channel}
          onNext={() => {
            this.setState({
              current: Actions.Steps.SendToCard,
              completed: this.state.completed|Actions.Steps.CheckCard
            })
          }} />
      case Actions.Steps.SendToCard:
        return <AssistentSendKeyToCard onNext={() => {
            this.setState({
              current: Actions.Steps.Completed,
              completed: this.state.completed|Actions.Steps.SendToCard|Actions.Steps.Completed
            })
          }} />
      case Actions.Steps.Completed:
        return <AssistentCompleted />
    }
    return null;
  }

  public render(): JSX.Element {
    return (
      <Actions.Actions current={this.state.current} 
                       completed={this.state.completed} 
                       onClick={(a) => {
                         if (a&this.state.completed) {
                           this.setState({current: a})
                         } 
                       }}
                       > 
        {this.render_steps()}
      </Actions.Actions>
    );
  }
}

export default Assistent;