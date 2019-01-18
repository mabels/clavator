import * as React from 'react';
import * as ReactModal from 'react-modal';

import { Gpg2CardStatus } from '../../../gpg/types';
import { Message } from '../../../model';
import { AppState } from '../../model';
import { ButtonToProgressor } from '../controls';

export interface DialogResetYubiKeyProps extends React.Props<DialogResetYubiKey> {
  onClose: () => void;
  cardStatus: Gpg2CardStatus;
  appState: AppState;
}

export class DialogResetYubiKey extends React.Component<DialogResetYubiKeyProps, {}> {

  private transaction: Message.Transaction<any>;

  constructor(props: DialogResetYubiKeyProps) {
    super(props);
    this.transaction = Message.newTransaction('ResetYubikey');
    this.resetYubikey = this.resetYubikey.bind(this);
  }

  private resetYubikey(): void {
    this.props.appState.channel.send(this.transaction.asMsg());
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
        transaction={this.transaction}
      >REALY WIPE YUBIKEY</ButtonToProgressor>
    </ReactModal>);
  }

}
