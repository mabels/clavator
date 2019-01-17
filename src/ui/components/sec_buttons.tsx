import * as React from 'react';

import { SecretKey, GpgKey } from '../../gpg';

export interface SecButtonsProps {
  sk: SecretKey;
  gpgKey: GpgKey;
}

export function SecButtons(props: SecButtonsProps): JSX.Element {
  return (
    <td className="action">
      <a
        title="pem-private"
        onClick={this.requestAsciiWithPassphrase(props.gpgKey, 'pem-private')}
      >
        <i className="fa fa-key" />
      </a>
      <a
        title="pem-public"
        onClick={this.requestAscii(props.gpgKey, 'pem-public')}
      >
        <i className="fa fa-bullhorn" />
      </a>
      <a
        title="ssh-public"
        onClick={this.requestAscii(props.gpgKey, 'ssh-public')}
      >
        <i className="fa fa-terminal" />
      </a>
      <a
        title="pem-revoke"
        onClick={this.requestAscii(props.gpgKey, 'pem-revoke')}
      >
        <i className="fa fa-bug" />
      </a>
      <a title="delete" onClick={this.deleteSecretKey(props.sk)}>
        <i className="fa fa-trash" />
      </a>
    </td>
  );
}
