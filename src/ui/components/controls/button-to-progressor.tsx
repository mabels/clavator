import * as React from 'react';
import * as Message from '../../../model/message';
import * as WsChannel from '../../model/ws-channel';
import { Progressor } from './progressor';
import { observer } from 'mobx-react';

interface ButtonToProgressorState {
  running: boolean;
}

interface ButtonToProgressorProps extends React.Props<ButtonToProgressor> {
  onClick: () => void;
  channel: WsChannel.Dispatch;
  transaction: Message.Transaction<any>;
  disabled?: boolean;
}

@observer
export class ButtonToProgressor extends React.Component<ButtonToProgressorProps, ButtonToProgressorState> {

  constructor() {
    super();
    this.state = {
      running: false,
    };
  }

  public render(): JSX.Element {
    if (this.state.running) {
      return <Progressor
        channel={this.props.channel}
        msg={'Clavator'}
        transaction={this.props.transaction.header.transaction}
        controls={true} />;
    } else {
      return <button onClick={() => {
          this.setState({running: true});
          this.props.onClick(); }
        }
        disabled={this.props.disabled}
        >{this.props.children}</button>;
    }
  }
}

export default ButtonToProgressor;
