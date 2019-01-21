import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Dispatch } from '../../model';
import { GpgKey } from '../../../gpg/types';
import { ReadAsciiRespond } from '../controls';
import { IObservableValue } from 'mobx';

interface DialogRenderAsciiProps {
  readonly onClose: () => void;
  readonly channel: Dispatch;
  readonly secKey: GpgKey;
  readonly action: IObservableValue<string>;
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
          action={props.action.get()}
          channel={props.channel}
          secKey={props.secKey}
         />
      </ReactModal>
    );
  });
