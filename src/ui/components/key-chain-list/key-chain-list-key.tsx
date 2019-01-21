import * as React from 'react';
import { SecretKey, GpgKey } from '../../../gpg/types';
import { Buttons } from '../buttons';
import { FormatDate } from '../controls';
import { IObservableValue } from 'mobx';
import { KeyChainListDialogs } from './key-chain-list';
import { AppState } from '../../model';

export interface KeyChainListKeyProps {
  readonly appState: AppState;
  readonly clazz: string;
  readonly sk: SecretKey;
  readonly gpgKey: GpgKey;
  readonly idx: number;
  readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly action: IObservableValue<string>;
}

export function KeyChainListKey(props: KeyChainListKeyProps): JSX.Element {
    return (
      <tr className={props.clazz} key={props.gpgKey.key}>
        <Buttons
          appState={props.appState}
          dialogs={props.dialogs}
          clazz={props.clazz}
          sk={props.sk}
          idx={props.idx}
          gpgKey={props.gpgKey} />
        <td>{props.gpgKey.type}</td>
        <td>{props.gpgKey.trust}</td>
        <td>{props.gpgKey.cipher}</td>
        <td>{props.gpgKey.bits}</td>
        <td>{props.gpgKey.keyId}</td>
        <td>
          <FormatDate ticks={props.gpgKey.created} />
        </td>
        <td>
          <FormatDate ticks={props.gpgKey.expires} />
        </td>
        <td>{props.gpgKey.uses}</td>
      </tr>
    );
  }
