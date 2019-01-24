
import * as React from 'react';
import * as ReactModal from 'react-modal';
import { AskKeyToYubiKey } from '../card-status-list/ask-key-to-yubi-key';
import { AppState } from '../../model';
// import { GpgKey, SecretKey } from '../../../gpg/types';
import { IObservableArray } from 'mobx';
import { KeyChainDialogQItem } from './key-chain-list';

interface DialogSendToCardProps {
  readonly onClose: () => void;
  // readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly current: KeyChainDialogQItem;
  readonly appState: AppState;
}

export function DialogSendToCard(props: DialogSendToCardProps): JSX.Element {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
      >
        <i style={{ float: 'right' }}
           onClick={props.onClose}
           className="closeBox fa fa-close"></i>
        <h4>SendKeyToCard</h4>
        {props.current.secKey.fingerPrint.fpr}
        <AskKeyToYubiKey
          slot_id={props.current.idx + 1}
          fingerprint={props.current.secKey.fingerPrint.fpr}
          appState={props.appState}
        />
      </ReactModal>

    );
  }
