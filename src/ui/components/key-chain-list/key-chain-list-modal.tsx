import * as React from 'react';
import { Dialogs } from './key-chain-list';
import { DialogRenderAscii } from './dialog-render-ascii';
import { DialogAskRenderAscii } from './dialog-ask-render-ascii';
import { DialogSendToCard } from './dialog-send-to-card';
import { GpgKey } from '../../../gpg/types';
import { AppState } from '../../model';

export interface KeyChainListModalProps {
  dialog: Dialogs;
  secKey: GpgKey;
  appState: AppState;
  idx: number;
  action: string;
}

export function KeyChainListModal(props: KeyChainListModalProps): JSX.Element {
  switch (props.dialog) {
    case Dialogs.openAscii:
      return (
        <DialogRenderAscii
          action={props.action}
          secKey={props.secKey}
          onClose={() => this.dialog = Dialogs.closed}
          channel={props.appState.channel}
        />
      );
    case Dialogs.askPassPhraseAscii:
      return (
        <DialogAskRenderAscii
          action={props.action}
          secKey={props.secKey}
          onClose={() => this.dialog = Dialogs.closed}
          channel={props.appState.channel}
        />
      );
    case Dialogs.sendToCard:
      return (
        <DialogSendToCard
          idx={props.idx}
          onClose={() => this.dialog = Dialogs.closed}
          secKey={props.secKey}
          appState={props.appState}
        />
      );
  }
  return null;
}
