import * as React from 'react';
import { SecretKey, GpgKey } from '../../../gpg/types';
import { FormatDate } from '../controls';
import { IObservableValue, IObservableArray } from 'mobx';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import { AppState } from '../../model';
import { Buttons } from './buttons';

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
      <tr className={props.clazz} key={props.selectedKey.key}>
        <Buttons
          appState={props.appState}
          dialogQ={props.dialogQ}
          clazz={props.clazz}
          // dialogSecKey={props.dialogSecKey}
          idx={props.idx}
          selectedKey={props.selectedKey} />
        <td>{props.selectedKey.type}</td>
        <td>{props.selectedKey.trust}</td>
        <td>{props.selectedKey.cipher}</td>
        <td>{props.selectedKey.bits}</td>
        <td>{props.selectedKey.keyId}</td>
        <td>
          <FormatDate ticks={props.selectedKey.created} />
        </td>
        <td>
          <FormatDate ticks={props.selectedKey.expires} />
        </td>
        <td>{props.selectedKey.uses}</td>
      </tr>
    );
  }
