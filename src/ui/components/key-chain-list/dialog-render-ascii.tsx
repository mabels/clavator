import * as React from 'react';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';

import { Dispatch } from '../../model';
import { GpgKey } from '../../../gpg/types';
import { ReadAsciiRespond } from '../controls';
import { IObservableValue, IObservableArray } from 'mobx';
import { MutableString } from '../../../model';
import { KeyChainDialogQItem } from './key-chain-list';

interface DialogRenderAsciiProps {
  readonly onClose: () => void;
  readonly channel: Dispatch;
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly current: KeyChainDialogQItem;
  // readonly action: IObservableValue<string>;
  readonly passPhrase: MutableString;
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
        <h4>{props.current.action}:{props.current.secKey.fingerPrint.fpr}</h4>
        <ReadAsciiRespond
          action={props.current.action}
          channel={props.channel}
          secKey={props.current.secKey}
          passPhrase={props.passPhrase}
         />
      </ReactModal>
    );
  });
