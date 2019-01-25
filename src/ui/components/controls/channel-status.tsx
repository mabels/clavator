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

@observer
export class ChannelStatus extends
  React.Component<ChannelStatusProps, {}> {

  public readonly status: IObservableValue<string>;

  constructor(props: ChannelStatusProps) {
    super(props);
    this.status = observable.box('not started');
  }

  @action
  public onOpen(e: Event): void {
    this.status.set('connected');
  }

  @action
  public onClose(e: CloseEvent): void {
    this.status.set('not connected');
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
        open={!(this.status.get() == 'connected' || this.status.get() == 'not started')}
      >
        <DialogTitle>Wait for Reconnect</DialogTitle>
      </Dialog>;
  }
}
