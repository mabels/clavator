import * as React from 'react';
import { SecretKey, GpgKey } from '../../gpg/types';
import { KeyChainListDialogs } from './key-chain-list';
import { IObservableValue, action } from 'mobx';

function sendToCard(
  dialog: IObservableValue<KeyChainListDialogs>
): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
  return action(() => {
    console.log('sendToCard:Activate');
    dialog.set(KeyChainListDialogs.sendToCard);
  });
}

export interface SubButtonsProps {
  readonly sk: SecretKey;
  readonly gpgKey: GpgKey;
  readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly idx: number;
}

export function SubButtons(props: SubButtonsProps): JSX.Element {
  return (
    <td className="action">
      <a
        title="Send Key to Smartcard"
        onClick={sendToCard(props.dialogs)}>
        <i className="fa fa-credit-card" />
      </a>
    </td>
  );
}
