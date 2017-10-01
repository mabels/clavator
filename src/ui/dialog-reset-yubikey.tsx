import * as React from 'react';
import ReactModal from 'react-modal';
import * as CardStatus from '../gpg/card_status';
import * as Message from '../message';
import * as WsChannel from './ws-channel';
// import { Progressor } from './progressor';
import ButtonToProgressor from './button-to-progressor';

interface DialogResetYubiKeyState {
  transaction: Message.Transaction<any>;
}

interface DialogResetYubiKeyProps extends React.Props<DialogResetYubiKey> {
  onClose: () => void;
  cardStatus: CardStatus.Gpg2CardStatus;
  channel: WsChannel.Dispatch;
}

export class DialogResetYubiKey extends React.Component<DialogResetYubiKeyProps, DialogResetYubiKeyState> {

  constructor() {
    super();
    this.state = {
      transaction: Message.newTransaction('ResetYubikey')
    };
    this.resetYubikey = this.resetYubikey.bind(this);
  }

  private resetYubikey(): void {
    this.props.channel.send(this.state.transaction.asMsg());
  }

  public render(): JSX.Element {
    return (<ReactModal
      isOpen={true}
      closeTimeoutMS={150}
      onAfterOpen={() => { /* */ }}
      contentLabel="Modal"
      shouldCloseOnOverlayClick={true}
    >
      <i style={{ float: 'right' }}
         onClick={this.props.onClose}
         className="closeBox fa fa-close"></i>
      <h4>ResetYubikey:</h4>
      <h5>{this.props.cardStatus.name}({this.props.cardStatus.reader.cardid})</h5>

      <ButtonToProgressor
        channel={this.props.channel}
        onClick={this.resetYubikey}
        transaction={this.state.transaction}
      >REALY WIPE YUBIKEY</ButtonToProgressor>
    </ReactModal>);
  }

}

export default DialogResetYubiKey;
