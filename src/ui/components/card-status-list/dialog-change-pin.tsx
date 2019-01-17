
import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Gpg2CardStatus } from '../../../gpg';
import { AppState } from '../../model';
import { ChangePin } from './change-pin';

export interface DialogChangePinProps {
  onClose: () => void;
  cardStatus: Gpg2CardStatus;
  appState: AppState;
  type: string;
}

export const DialogChangePin = observer((props: DialogChangePinProps) => {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: 'right' }}
           onClick={props.onClose}
           className="fa fa-close"></i>
        <h4>ChangePin:{props.type}</h4>
        <h5>{props.cardStatus.name}({props.cardStatus.reader.cardid})</h5>
        <ChangePin type={props.type}
          appState={props.appState}
          app_id={props.cardStatus.reader.cardid} />
      </ReactModal>
    );
});
