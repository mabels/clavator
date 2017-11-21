
import * as React from 'react';
import * as ReactModal from 'react-modal';
// import * as CopyToClipboard from 'react-copy-to-clipboard';
import { AskKeyToYubiKey } from '../card-status-list/ask-key-to-yubi-key';
import * as ListSecretKeys from '../../../gpg/list-secret-keys';
// import * as WsChannel from '../../model/ws-channel';
// import { CardStatusListState } from '../../model/card-status-list-state';
// import { ProgressorState } from '../controls/progressor';
import AppState from '../../model/app-state';

interface DialogSendToCardState {
}

interface DialogSendToCardProps extends React.Props<DialogSendToCard> {
  onClose: () => void;
  secKey: ListSecretKeys.Key;
  idx: number;
  appState: AppState;
}

export class DialogSendToCard extends React.Component<DialogSendToCardProps, DialogSendToCardState> {

  constructor() {
    super();
    this.state = {
    };
  }

  public render(): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
      >
        <i style={{ float: 'right' }} onClick={this.props.onClose} className="closeBox fa fa-close"></i>
        <h4>SendKeyToCard</h4>
        {this.props.secKey.fingerPrint.fpr}
        <AskKeyToYubiKey
          slot_id={this.props.idx + 1}
          fingerprint={this.props.secKey.fingerPrint.fpr}
          appState={this.props.appState}
        />
      </ReactModal>

    );
  }

}
export default DialogSendToCard;
