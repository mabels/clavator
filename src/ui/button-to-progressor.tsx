
import * as React from 'react';

import * as ReactModal from 'react-modal';

import * as CardStatus from '../gpg/card_status';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import { Progressor } from './progressor';

import { ChangePin } from './change-pin';

import { Pin } from '../gpg/pin';

import ChangeCard from '../gpg/change_card';

import * as classnames from 'classnames';
import { observer } from 'mobx-react';

interface ButtonToProgressorState {
  running: boolean;
}

interface ButtonToProgressorProps extends React.Props<ButtonToProgressor> {
  onClick: () => void;
  channel: WsChannel.Dispatch;
  transaction: Message.Transaction<any>
}

@observer
export class ButtonToProgressor extends React.Component<ButtonToProgressorProps, ButtonToProgressorState> {

  constructor() {
    super();
    this.state = {
      running: false
    };
  }
  public render() {
    if (this.state.running) {
      return <Progressor
        channel={this.props.channel}
        msg={"Clavator"}
        transaction={this.props.transaction.header.transaction}
        controls={true} />
    } else {
      return <button onClick={() => { this.setState({running:true}); this.props.onClick()}}>{this.props.children}</button>
    }
  }
}

export default ButtonToProgressor;