import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Dispatch } from '../../model';
import { ReadAsciiRespond } from '../controls';
import { IObservableValue, IObservableArray } from 'mobx';
import { KeyChainDialogQItem } from './key-chain-list';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

interface DialogRenderAsciiProps {
  readonly onClose: () => void;
  readonly channel: Dispatch;
  // readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly current: KeyChainDialogQItem;
  // readonly action: IObservableValue<string>;
  // readonly passPhrase: IObservableValue<string>;
}

export const DialogRenderAscii = observer((props: DialogRenderAsciiProps) => {
    return (
      <Dialog
        open={true}
        scroll={'paper'}
      >
        <DialogActions>
        <Button onClick={props.onClose}>close</Button>
        </DialogActions>
        <DialogTitle>{props.current.action}:{props.current.secKey.fingerPrint.fpr}</DialogTitle>
        <DialogContent>
        <ReadAsciiRespond
          action={props.current.action}
          channel={props.channel}
          secKey={props.current.secKey}
          // passPhrase={props.passPhrase.get()}
         /></DialogContent>
      </Dialog>
    );
  });
