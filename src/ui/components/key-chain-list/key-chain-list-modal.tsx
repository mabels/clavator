import * as React from 'react';
import { KeyChainListDialogs } from './key-chain-list';
import { DialogRenderAscii } from './dialog-render-ascii';
import { DialogAskRenderAscii } from './dialog-ask-render-ascii';
import { DialogSendToCard } from './dialog-send-to-card';
import { GpgKey } from '../../../gpg/types';
import { AppState } from '../../model';
import { IObservableValue } from 'mobx';

export interface KeyChainListModalProps {
  readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly action: IObservableValue<string>;
  readonly secKey: GpgKey;
  readonly appState: AppState;
  idx: number;
}

export function KeyChainListModal(props: KeyChainListModalProps): JSX.Element {
  switch (props.dialogs.get()) {
    case KeyChainListDialogs.openAscii:
      return (
        <DialogRenderAscii
          action={props.action}
          secKey={props.secKey}
          onClose={() => this.dialog = KeyChainListDialogs.closed}
          channel={props.appState.channel}
        />
      );
    case KeyChainListDialogs.askPassPhraseAscii:
      return (
        <DialogAskRenderAscii
          action={props.action}
          secKey={props.secKey}
          onClose={() => this.dialog = KeyChainListDialogs.closed}
          channel={props.appState.channel}
        />
      );
    case KeyChainListDialogs.sendToCard:
      return (
        <DialogSendToCard
          idx={props.idx}
          onClose={() => this.dialog = KeyChainListDialogs.closed}
          secKey={props.secKey}
          appState={props.appState}
        />
      );
  }
  return null;
}
