import * as React from 'react';
import * as ReactModal from 'react-modal';
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
    this.status = observable.box(Status.NotConnected);
  }

  @action
  public onOpen(e: Event): void {
    this.status.set(Status.Connected);
  }

  @action
  public onClose(e: CloseEvent): void {
    this.status.set(Status.NotConnected);
  }

  public onMessage(_: Message.Header, data: string): void {
    /* */
  }

  public componentWillMount(): void {
    this.props.channel.register(this);
  }

  public componentWillUnmount(): void {
    this.props.channel.unregister(this);
  }

  public render(): JSX.Element {
    return <Dialog
        className="waitForConnect"
        open={!(this.status.get() === Status.Connected ||
                this.status.get() == Status.NotConnected)}
      >
        <DialogTitle>Wait for Reconnect</DialogTitle>
      </Dialog>;
  }
}
