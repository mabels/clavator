
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import CreateKey from './create-key';
import * as WsChannel from './ws-channel';

interface AssistentCreateKeyState {
}

interface AssistentCreateKeyProps extends React.Props<AssistentCreateKey> {
  onNext: () => void;
  channel: WsChannel.Dispatch;
}

export class AssistentCreateKey
  extends React.Component<AssistentCreateKeyProps, AssistentCreateKeyState>
{
  constructor() {
    super();
    this.state = {
    };
  }
  public render(): JSX.Element {
    return (
      <div>
        <CreateKey channel={this.props.channel} 
          />
        <button onClick={this.props.onNext}>Next</button>
      </div>
    );
  }
}

export default AssistentCreateKey;