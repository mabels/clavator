import * as React from 'react';
import { IObservableValue, action } from 'mobx';
import { propTypes } from 'mobx-react';

import { SecretKey, GpgKey } from '../../gpg/types';
import { KeyChainListDialogs } from './key-chain-list';
import {
  RequestAscii,
  Message,
} from '../../model';
import { AppState } from '../model';

export interface SecButtonsProps {
  readonly appState: AppState;
  readonly sk: SecretKey;
  readonly gpgKey: GpgKey;
  readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly pp?: string;
}

function processAscii(props: SecButtonsProps,
  act: string,
  dialog: KeyChainListDialogs,
  pp: string = undefined
): void {
  const ra = new RequestAscii({
    fingerprint: props.gpgKey.fingerPrint.fpr,
    passphrase: pp,
    action: act
  });

  props.dialogs.set(dialog);
  // props.action.set(action);
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
  props.appState.channel.send(
    Message.newTransaction('RequestAscii', ra).asMsg()
  );
}

function requestAscii(props: SecButtonsProps, act: string): () => void {
  return action(() => {
    processAscii(props, act, KeyChainListDialogs.openAscii);
  });
}

function requestAsciiWithPassphrase(props: SecButtonsProps, act: string): () => void {
  return action(() => {
    props.dialogs.set(KeyChainListDialogs.askPassPhraseAscii);
    // props.action.set(action);
    /*
        key: key,
        passPhrase: new MutableString(),
        respondAscii: null
      })
    );
    */
  });
}

function deleteSecretKey(props: SecButtonsProps): void {
  if (confirm(`Really delete ${props.sk.keyId} <${props.sk.uids[0].email}>?`)) {
    props.appState.channel.send(
      Message.newTransaction('DeleteSecretKey', props.sk.fingerPrint).asMsg()
    );
  }
}

export function SecButtons(props: SecButtonsProps): JSX.Element {
  return (
    <td className="action">
      <a
        title="pem-private"
        onClick={requestAsciiWithPassphrase(props, 'pem-private')}
      >
        <i className="fa fa-key" />
      </a>
      <a
        title="pem-public"
        onClick={requestAscii(props, 'pem-public')}
      >
        <i className="fa fa-bullhorn" />
      </a>
      <a
        title="ssh-public"
        onClick={requestAscii(props, 'ssh-public')}
      >
        <i className="fa fa-terminal" />
      </a>
      <a
        title="pem-revoke"
        onClick={requestAscii(props, 'pem-revoke')}
      >
        <i className="fa fa-bug" />
      </a>
      <a title="delete" onClick={() => deleteSecretKey(props)}>
        <i className="fa fa-trash" />
      </a>
    </td>
  );
}
