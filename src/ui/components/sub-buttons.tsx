import * as React from 'react';
import { SecretKey, GpgKey } from '../../gpg';
import { Dialogs } from './key-chain-list';

function sendToCard(
  gpgKey: GpgKey,
  idx: number
): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
  return (() => {
    console.log('sendToCard:Activate');
    this.setState(
      Object.assign({}, this.state, {
        dialog: Dialogs.sendToCard,
      })
    );
  }).bind(this);
}

export interface SubButtonsProps {
  sk: SecretKey;
  gpgKey: GpgKey;
  idx: number;
}

export function SubButtons(props: SubButtonsProps): JSX.Element {
  return (
    <td className="action">
      <a
        title="Send Key to Smartcard"
        onClick={() => sendToCard(props.gpgKey, props.idx)}
      >
        <i className="fa fa-credit-card" />
      </a>
    </td>
  );
}
