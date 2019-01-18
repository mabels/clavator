import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Dispatch } from '../../model';
import { GpgKey } from '../../../gpg/types';
import { ReadAsciiRespond } from '../controls';

interface DialogRenderAsciiProps {
  onClose: () => void;
  channel: Dispatch;
  secKey: GpgKey;
  action: string;
}

export const DialogRenderAscii = observer((props: DialogRenderAsciiProps) => {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { /* */ }}
        contentLabel="Modal"
      >
        <i onClick={props.onClose} className="closeBox fa fa-close"></i>
        <h4>{props.action}:{props.secKey.fingerPrint.fpr}</h4>
        <ReadAsciiRespond
          action={props.action}
          channel={props.channel}
          secKey={props.secKey}
         />
      </ReactModal>
    );
  });
