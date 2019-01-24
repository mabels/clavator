import * as React from 'react';
import * as ReactModal from 'react-modal';

import { Gpg2CardStatus } from '../../../gpg/types';
import { Message } from '../../../model';
import { AppState } from '../../model';
import { ButtonToProgressor } from '../controls';
import { Dialog, DialogTitle, DialogActions, Button } from '@material-ui/core';

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
    return (<Dialog
      open={true}
      scroll={'paper'}
    >
    <DialogTitle>
      ResetYubikey:<br/>
      {this.props.cardStatus.name}({this.props.cardStatus.reader.cardid})
    </DialogTitle>

      <DialogActions>
      <ButtonToProgressor
        appState={this.props.appState}
        onClick={this.resetYubikey}
        transaction={this.transaction}
      >REALY WIPE YUBIKEY</ButtonToProgressor>
        <Button onClick={this.props.onClose}>close</Button>
      </DialogActions>
    </Dialog>);
  }

}
