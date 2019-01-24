import * as React from 'react';
import { SecretKey, GpgKey } from '../../../gpg/types';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import { IObservableValue, action, IObservableArray } from 'mobx';
import { TableCell } from '@material-ui/core';
import CreditCard from '@material-ui/icons/CreditCard';

export interface SubButtonsProps {
  // readonly dialogSecKey: IObservableValue<SecretKey | GpgKey>;
  readonly selectedKey: GpgKey;
  // readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  readonly idx: number;
}

function sendToCard(props: SubButtonsProps): React.EventHandler<React.MouseEvent<HTMLAnchorElement>> {
  return action(() => {
    console.log('sendToCard:Activate');
    props.dialogQ.push({
      dialogs: KeyChainListDialogs.sendToCard,
      action: 'SubButtons:SendToCard',
      secKey: props.selectedKey,
      idx: props.idx
    });
    // props.dialogSecKey.set(props.selectedKey);
  });
}

export function SubButtons(props: SubButtonsProps): JSX.Element {
  return (
    <TableCell className="action">
      <a
        title="Send Key to Smartcard"
        onClick={sendToCard(props)}>
        <CreditCard />
      </a>
    </TableCell>
  );
}
