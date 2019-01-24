import * as React from 'react';
import { SecretKey, GpgKey } from '../../../gpg/types';
import { FormatDate } from '../controls';
import { IObservableValue, IObservableArray } from 'mobx';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import { AppState } from '../../model';
import { Buttons } from './buttons';
import { TableRow, TableCell } from '@material-ui/core';

export interface KeyChainListKeyProps {
  readonly appState: AppState;
  readonly clazz: string;
  readonly selectedKey: SecretKey | GpgKey;
  readonly idx: number;
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  // readonly dialogs: IObservableValue<KeyChainListDialogs>;
  // readonly dialogSecKey: IObservableValue<SecretKey | GpgKey>;
  // readonly action: IObservableValue<string>;
}

export function KeyChainListKey(props: KeyChainListKeyProps): JSX.Element {
    return (
      <TableRow className={props.clazz} key={props.selectedKey.key}>
        <Buttons
          appState={props.appState}
          dialogQ={props.dialogQ}
          clazz={props.clazz}
          // dialogSecKey={props.dialogSecKey}
          idx={props.idx}
          selectedKey={props.selectedKey} />
        <TableCell>{props.selectedKey.type}</TableCell>
        <TableCell>{props.selectedKey.trust}</TableCell>
        <TableCell>{props.selectedKey.cipher}</TableCell>
        <TableCell>{props.selectedKey.bits}</TableCell>
        <TableCell>{props.selectedKey.keyId}</TableCell>
        <TableCell>
          <FormatDate ticks={props.selectedKey.created} />
        </TableCell>
        <TableCell>
          <FormatDate ticks={props.selectedKey.expires} />
        </TableCell>
        <TableCell>{props.selectedKey.uses}</TableCell>
      </TableRow>
    );
  }
