import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Gpg2CardStatus } from '../../../gpg/types';
import { AppState } from '../../model';
import { ChangePin } from './change-pin';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@material-ui/core';

export interface DialogChangePinProps {
  onClose: () => void;
  cardStatus: Gpg2CardStatus;
  appState: AppState;
  type: string;
}

export const DialogChangePin = observer((props: DialogChangePinProps) => {
  return (
    <Dialog
      open={true}
      scroll={'paper'}
      onClose={props.onClose}
    >
      <DialogTitle>
        ChangePin:{props.type}
        <br />
        {props.cardStatus.name}({props.cardStatus.reader.cardid})
      </DialogTitle>
      <DialogContent>
        <ChangePin
          type={props.type}
          appState={props.appState}
          app_id={props.cardStatus.reader.cardid}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose} >
            Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});
