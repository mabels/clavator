
import * as React from 'react';
import * as classnames from 'classnames';
import * as Message from '../message';
import * as WsChannel from './ws-channel';
import * as ReactModal from 'react-modal';


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
    this.setState({ status: "connected" });
  }

  onClose(e: CloseEvent) {
    this.setState({ status: "not connected" });
  }

  onMessage(action: Message.Header, data: string) {
  }

  componentWillMount() {
    this.props.channel.register(this);
  }

  private renderStatus() {
    if (this.state.status == "connected" || this.state.status == "not started") {
      console.log("NOT: renderStatus:", this.state.status);
      return null;
    }
    console.log("renderStatus:", this.state.status);
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        contentLabel="Modal"
      >
        <h3>Wait for Reconnect</h3>
      </ReactModal>
    )
  }

  public render(): JSX.Element {
    // debugger
    return (
      <div className={this.state.status}>
        {this.props.children}
        {this.renderStatus()}
      </div>
    );
  }

}
