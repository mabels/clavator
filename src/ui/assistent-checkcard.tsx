
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import * as WsChannel from './ws-channel';

interface AssistentCheckcardState {
  current: Actions.Steps
}

interface AssistentCheckcardProps extends React.Props<AssistentCheckcard> {
  onNext: () => void;
  channel: WsChannel.Dispatch;
}

export class AssistentCheckcard
  extends React.Component<AssistentCheckcardProps, AssistentCheckcardState>
{
  constructor() {
    super();
    this.state = {
      current: Actions.Steps.CreateKey
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        AssistentCheckcard
        <button onClick={this.props.onNext}>Next</button>
      </div>
    );
  }
}

export default AssistentCheckcard;