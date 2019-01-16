import * as React from 'react';
// import * as classnames from 'classnames';
import * as Message from '../../../model/message';
import * as WsChannel from '../../model/ws-channel';
import * as ReactModal from 'react-modal';
import { observable } from 'mobx';

interface ChannelStatusState {
  status: string;
}

interface ChannelStatusProps extends React.Props<ChannelStatus> {
  channel: WsChannel.Dispatch;
}

export class ChannelStatus extends
  React.Component<ChannelStatusProps, {}> implements ChannelStatusState {

  @observable public status: string;

  constructor(props: ChannelStatusProps) {
    super(props);
    this.status = 'not started';
  }

  public onOpen(e: Event): void {
    this.status = 'connected';
  }

  public onClose(e: CloseEvent): void {
    this.status = 'not connected';
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

  private renderChildren(): React.ReactNode {
    if (this.state.status == 'connected' || this.state.status == 'not started') {
      // console.log("NOT: renderStatus:", this.state.status);
      return this.props.children;
    }
    return null;
  }

  public render(): JSX.Element {
    return (
      <div className={this.state.status}>
        {this.renderChildren()}
        {this.renderStatus()}
      </div>
    );
  }

}

export default ChannelStatus;
