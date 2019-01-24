
import * as React from 'react';
import * as ReactModal from 'react-modal';
import { AskKeyToYubiKey } from '../card-status-list/ask-key-to-yubi-key';
import { AppState } from '../../model';
// import { GpgKey, SecretKey } from '../../../gpg/types';
import { IObservableArray } from 'mobx';
import { KeyChainDialogQItem } from './key-chain-list';
import { Dialog, DialogActions, DialogTitle, DialogContent, Button } from '@material-ui/core';

interface DialogSendToCardProps {
  readonly onClose: () => void;
  // readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly current: KeyChainDialogQItem;
  readonly appState: AppState;
}

export function DialogSendToCard(props: DialogSendToCardProps): JSX.Element {
    return (
      <Dialog
        open={true}
        scroll={'paper'}
      >
      <DialogActions>
        <Button>
        <i style={{ float: 'right' }}
           onClick={props.onClose}
           className="closeBox fa fa-close"></i>
        </Button>
      </DialogActions>
        <DialogTitle>SendKeyToCard:{props.current.secKey.fingerPrint.fpr}</DialogTitle>
        <DialogContent>
        <AskKeyToYubiKey
          slot_id={props.current.idx + 1}
          fingerprint={props.current.secKey.fingerPrint.fpr}
          appState={props.appState}
        />
        </DialogContent>
      </Dialog>
    );
  }
