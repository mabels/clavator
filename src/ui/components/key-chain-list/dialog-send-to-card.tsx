
import * as React from 'react';
import * as ReactModal from 'react-modal';
import { AskKeyToYubiKey } from '../card-status-list/ask-key-to-yubi-key';
import { AppState } from '../../model';
import { GpgKey } from '../../../gpg';

interface DialogSendToCardProps {
  onClose: () => void;
  secKey: GpgKey;
  idx: number;
  appState: AppState;
}

export function DialogSendToCard(props: DialogSendToCardProps): JSX.Element {
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
