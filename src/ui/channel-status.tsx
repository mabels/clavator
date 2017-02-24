
import * as React from 'react';
import * as classnames from 'classnames';
import * as Message from '../message';
import * as WsChannel from './ws-channel';


interface ChannelStatusState {
  status: string;
}

interface ChannelStatusProps extends React.Props<ChannelStatus> {
  channel: WsChannel.Dispatch;
}

export class ChannelStatus extends
  React.Component<ChannelStatusProps, ChannelStatusState> {

  constructor() {
    super();
    this.state = { status: "not started" };
  }

  onOpen(e: Event) {
    this.setState(Object.assign({}, this.state, { status: "connected" }));
  }

  onClose(e: CloseEvent) {
    this.setState(Object.assign({}, this.state, { status: "not connected" }));
  }

  onMessage(action: Message.Header, data: string) {
  }

  componentWillMount() {
    this.props.channel.register(this);
  }

  public render(): JSX.Element {
    // debugger
    return (
      <button type="button">{this.state.status}</button>
    );
  }

}
