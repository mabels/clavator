import * as React from 'react';
// import * as classnames from 'classnames';
import { Message } from '../../../model';
import { Dispatch } from '../../model';
import { observable, IObservableValue, computed, action } from 'mobx';
import { Dialog, DialogTitle } from '@material-ui/core';
import { observer } from 'mobx-react';

interface ChannelStatusProps extends React.Props<ChannelStatus> {
  readonly channel: Dispatch;
}

enum Status {
  NotStarted = 'not started',
  Connected = 'connected',
  NotConnected = 'not connected',
}

@observer
export class ChannelStatus extends
  React.Component<ChannelStatusProps, {}> {

  public readonly status: IObservableValue<Status>;

  constructor(props: ChannelStatusProps) {
    super(props);
    this.status = observable.box(Status.NotStarted);
  }

  public onOpen(e: Event): void {
    setTimeout(action(() => this.status.set(Status.Connected)), 500);
  }

  @action
  public onClose(e: CloseEvent): void {
    this.status.set(Status.NotConnected);
  }

  public onMessage(_: Message.Header, data: string): void {
    /* */
  }

  public componentDidMount(): void {
    this.props.channel.register(this);
  }

  public componentWillUnmount(): void {
    this.props.channel.unregister(this);
  }

  public render(): JSX.Element {
    console.log(`ChannelStatus`, this.status.get());
    return <Dialog
        className="waitForConnect"
        open={this.status.get() !== Status.Connected}
      >
        <DialogTitle>Wait for Reconnect</DialogTitle>
      </Dialog>;
  }
}
