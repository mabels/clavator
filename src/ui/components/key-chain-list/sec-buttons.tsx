import * as React from 'react';
import { IObservableValue, action, IObservableArray } from 'mobx';
import { propTypes } from 'mobx-react';

import { SecretKey, GpgKey } from '../../../gpg/types';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import {
  RequestAscii,
  Message,
} from '../../../model';
import { AppState } from '../../model';
import { TableCell } from '@material-ui/core';
import VpnKey from '@material-ui/icons/VpnKey';
import Public from '@material-ui/icons/Public';
import Code from '@material-ui/icons/Code';
import Stop from '@material-ui/icons/Stop';
import Delete from '@material-ui/icons/Delete';

export interface SecButtonsProps {
  // readonly action: IObservableValue<string>;
  readonly appState: AppState;
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly selectedKey: SecretKey;
  // readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly pp?: string;
}

function processAscii(props: SecButtonsProps,
  act: string,
  dialog: KeyChainListDialogs,
  pp: string = undefined
): void {
  const ra = new RequestAscii({
    fingerprint: props.selectedKey.fingerPrint.fpr,
    passphrase: pp,
    action: act
  });

  props.dialogQ.push({
    dialogs: dialog,
    action: act,
    secKey: props.selectedKey
  });
  // props.dialogSecKey.set(props.selectedKey);
  // props.action.set(act);
  // props.appState.channel.send(
  //  Message.newTransaction('RequestAscii', ra).asMsg()
  // );
  /*
      key: key,
  props.key.set(props.gpgKey);
      respondAscii: null,

      receiver: this.props.appState.channel.onMessage(
        (actionx: Message.Header, data: string) => {
          console.log('processAscii:', actionx);
          if (actionx.action != 'RespondAscii') {
            return;
          }
          const pem = RespondAscii.fill(JSON.parse(data));
          if (key.fingerPrint.fpr != pem.fingerprint) {
            return;
          }
          console.log('Got: Respond:', pem);
          this.respondAscii = pem;
        }
      )
    })
  );
  */
}

function requestAscii(props: SecButtonsProps, act: string): () => void {
  return action(() => {
    processAscii(props, act, KeyChainListDialogs.openAscii);
  });
}

function requestAsciiWithPassphrase(props: SecButtonsProps, act: string): () => void {
  return action(() => {
    props.dialogQ.push({
      dialogs: KeyChainListDialogs.askPassPhraseAscii,
      action: act,
      secKey: props.selectedKey
    });
  });
}

function deleteSecretKey(props: SecButtonsProps): void {
  if (confirm(`Really delete ${props.selectedKey.keyId} <${props.selectedKey.uids[0].email}>?`)) {
    props.appState.channel.send(
      Message.newTransaction('DeleteSecretKey', props.selectedKey.fingerPrint).asMsg()
    );
  }
}

export function SecButtons(props: SecButtonsProps): JSX.Element {
  return (
    <TableCell className="action">
      <a
        title="pem-private"
        onClick={requestAsciiWithPassphrase(props, 'pem-private')}
      >
      <VpnKey />
      </a>
      <a
        title="pem-public"
        onClick={requestAscii(props, 'pem-public')}
      >
      <Public />
      </a>
      <a
        title="ssh-public"
        onClick={requestAscii(props, 'ssh-public')}
      >
        <Code />
      </a>
      <a
        title="pem-revoke"
        onClick={requestAscii(props, 'pem-revoke')}
      >
        <Stop />
      </a>
      <a title="delete" onClick={() => deleteSecretKey(props)}>
        <Delete />
      </a>
    </TableCell>
  );
}
