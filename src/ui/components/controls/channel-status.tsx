import * as React from 'react';
// import * as classnames from 'classnames';
import * as Message from '../../../model/message';
import * as WsChannel from '../../model/ws-channel';
import ReactModal from 'react-modal';

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
    this.state = { status: 'not started' };
  }

  public onOpen(e: Event): void {
    this.setState({ status: 'connected' });
  }

  public onClose(e: CloseEvent): void {
    this.setState({ status: 'not connected' });
  }

  public onMessage(action: Message.Header, data: string): void {
    /* */
  }

  public componentWillMount(): void {
    this.props.channel.register(this);
  }

  public componentWillUnmount(): void {
    this.props.channel.unregister(this);
  }

  private renderStatus(): JSX.Element {
    if (this.state.status == 'connected' || this.state.status == 'not started') {
      // console.log("NOT: renderStatus:", this.state.status);
      return null;
    }
    console.log('renderStatus:', this.state.status);
    return <ReactModal
        className="waitForConnect"
        isOpen={true}
        closeTimeoutMS={150}
        contentLabel="Modal"
      >
        <h3>Wait for Reconnect</h3>
      </ReactModal>;
  }

  public render(): JSX.Element {
    return (
      <div className={this.state.status}>
        {this.props.children}
        {this.renderStatus()}
      </div>
    );
  }

}

export default ChannelStatus;
