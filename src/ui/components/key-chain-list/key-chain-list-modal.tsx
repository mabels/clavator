import * as React from 'react';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import { DialogRenderAscii } from './dialog-render-ascii';
import { DialogAskRenderAscii } from './dialog-ask-render-ascii';
import { DialogSendToCard } from './dialog-send-to-card';
// import { GpgKey, SecretKey } from '../../../gpg/types';
import { AppState } from '../../model';
import { /* IObservableValue, */ action, IObservableArray, IObservableValue } from 'mobx';
import { observer } from 'mobx-react';
// import { MutableString } from '../../../model';
// import { resetIdCounter } from 'react-tabs';

export interface KeyChainListModalProps {
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  // readonly dialogs: IObservableValue<KeyChainListDialogs>;
  // readonly action: IObservableValue<string>;
  // readonly selectedKey: SecretKey;
  readonly appState: AppState;
  // readonly passPhrase: IObservableValue<string>;
  // readonly idx: number;
}

export const KeyChainListModal = observer((props: KeyChainListModalProps): JSX.Element => {
  if (props.dialogQ.length <= 0) {
    return <></>;
  }
  // debugger;
  const first = props.dialogQ[0];
  console.log('KeyChainListModal:first:', first);
  const toClose = action(() => {
    if (props.dialogQ[0] === first) {
      console.log('KeyChainListModal:Close:', first);
      props.dialogQ.shift();
    }
  });
  switch (first.dialogs) {
    case KeyChainListDialogs.openAscii:
      return (
        <DialogRenderAscii
          // dialogQ={props.dialogQ}
          onClose={toClose}
          current={first}
          channel={props.appState.channel}
          // passPhrase={props.passPhrase}
        />
      );
    case KeyChainListDialogs.askPassPhraseAscii:
      return (
        <DialogAskRenderAscii
          // dialogQ={props.dialogQ}
          onClose={toClose}
          channel={props.appState.channel}
          current={first}
        />
      );
    case KeyChainListDialogs.sendToCard:
      return (
        <DialogSendToCard
          // idx={props.idx}
          onClose={toClose}
          // dialogQ={props.dialogQ}
          current={first}
          appState={props.appState}
        />
      );
  }
  return null;
});
