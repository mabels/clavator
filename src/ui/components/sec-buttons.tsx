import * as React from 'react';

import { SecretKey, GpgKey } from '../../gpg/types';
import { Dialogs } from './key-chain-list';
import {
  MutableString,
  RequestAscii,
  Message,
  RespondAscii
} from '../../model';

export interface SecButtonsProps {
  sk: SecretKey;
  gpgKey: GpgKey;
}

function processAscii(
  key: GpgKey,
  action: string,
  dialog: Dialogs,
  pp: string = null
): void {
  const ra = new RequestAscii();
  ra.action = action;
  ra.fingerprint = key.fingerPrint.fpr;
  ra.passphrase = new MutableString();
  ra.passphrase.value = pp;
  this.setState(
    Object.assign({}, this.state, {
      dialog: dialog,
      action: action,
      key: key,
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
  this.props.appState.channel.send(
    Message.newTransaction('RequestAscii', ra).asMsg()
  );
}

function requestAscii(key: GpgKey, action: string): void {
  processAscii(key, action, Dialogs.openAscii);
}

function requestAsciiWithPassphrase(key: GpgKey, action: string): void {
  this.setState(
    Object.assign({}, this.state, {
      dialog: Dialogs.askPassPhraseAscii,
      action: action,
      key: key,
      passPhrase: new MutableString(),
      respondAscii: null
    })
  );
}

function deleteSecretKey(key: SecretKey): void {
  if (confirm(`Really delete ${key.keyId} <${key.uids[0].email}>?`)) {
    this.props.appState.channel.send(
      Message.newTransaction('DeleteSecretKey', key.fingerPrint).asMsg()
    );
  }
}

export function SecButtons(props: SecButtonsProps): JSX.Element {
  return (
    <td className="action">
      <a
        title="pem-private"
        onClick={() => requestAsciiWithPassphrase(props.gpgKey, 'pem-private')}
      >
        <i className="fa fa-key" />
      </a>
      <a
        title="pem-public"
        onClick={() => requestAscii(props.gpgKey, 'pem-public')}
      >
        <i className="fa fa-bullhorn" />
      </a>
      <a
        title="ssh-public"
        onClick={() => requestAscii(props.gpgKey, 'ssh-public')}
      >
        <i className="fa fa-terminal" />
      </a>
      <a
        title="pem-revoke"
        onClick={() => requestAscii(props.gpgKey, 'pem-revoke')}
      >
        <i className="fa fa-bug" />
      </a>
      <a title="delete" onClick={() => deleteSecretKey(props.sk)}>
        <i className="fa fa-trash" />
      </a>
    </td>
  );
}
