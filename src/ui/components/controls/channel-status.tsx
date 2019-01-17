import * as React from 'react';
import * as ReactModal from 'react-modal';
// import * as classnames from 'classnames';
import { Message } from '../../../model';
import { Dispatch } from '../../model';
import { observable } from 'mobx';

interface ChannelStatusState {
  status: string;
}

interface ChannelStatusProps extends React.Props<ChannelStatus> {
  channel: Dispatch;
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
    if (this.status == 'connected' || this.status == 'not started') {
      // console.log("NOT: renderStatus:", this.state.status);
      return null;
    }
    console.log('renderStatus:', this.status);
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
    if (this.status == 'connected' || this.status == 'not started') {
      // console.log("NOT: renderStatus:", this.state.status);
      return this.props.children;
    }
    return null;
  }

  public render(): JSX.Element {
    return (
      <div className={this.status}>
        {this.renderChildren()}
        {this.renderStatus()}
      </div>
    );
  }

}
