
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
    this.state = { status: "not started"};
  }
  protected componentDidMount(): void {
  }

  protected componentWillUnmount(): void {
  }

  onOpen(e:Event) {
    this.setState(Object.assign({}, this.state, { status: "connected" }));
  }

  onClose(e:CloseEvent) {
    this.setState(Object.assign({}, this.state, { status: "not connected" }));
  }

  onMessage(action: Message.Header, data: string) {
  }


  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
  }

  public render(): JSX.Element {
    // debugger
    return (
      <button type="button">{this.state.status}</button>
    );
  }

}
