import * as React from 'react';
import * as ReactModal from 'react-modal';
import * as CardStatus from '../../../gpg/card-status';
import * as Message from '../../../model/message';
// import * as WsChannel from '../../model/ws-channel';
import AppState from '../../model/app-state';
// import { Progressor } from './progressor';
import ButtonToProgressor from '../controls/button-to-progressor';

interface DialogResetYubiKeyState {
  transaction: Message.Transaction<any>;
}

interface DialogResetYubiKeyProps extends React.Props<DialogResetYubiKey> {
  onClose: () => void;
  cardStatus: CardStatus.Gpg2CardStatus;
  appState: AppState;
}

export class DialogResetYubiKey extends React.Component<DialogResetYubiKeyProps, DialogResetYubiKeyState> {

  constructor(props: DialogResetYubiKeyProps) {
    super(props);
    this.state = {
      transaction: Message.newTransaction('ResetYubikey')
    };
    this.resetYubikey = this.resetYubikey.bind(this);
  }

  private resetYubikey(): void {
    this.props.appState.channel.send(this.state.transaction.asMsg());
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
        appState={this.props.appState}
        onClick={this.resetYubikey}
        transaction={this.state.transaction}
      >REALY WIPE YUBIKEY</ButtonToProgressor>
    </ReactModal>);
  }

}
