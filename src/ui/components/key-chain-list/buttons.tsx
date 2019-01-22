import * as React from 'react';
import { observer } from 'mobx-react';

import { SecretKey, GpgKey } from '../../../gpg/types';
import { SubButtons } from './sub-buttons';
import { SecButtons } from './sec-buttons';
import { IObservableValue, IObservableArray } from 'mobx';
import { KeyChainListDialogs, KeyChainDialogQItem } from './key-chain-list';
import { AppState } from '../../model';

export interface BottonsProps {
  readonly appState: AppState;
  readonly clazz: string;
  readonly dialogQ: IObservableArray<KeyChainDialogQItem>;
  // readonly dialogSecKey: IObservableValue<SecretKey | GpgKey>;
  readonly selectedKey: GpgKey | SecretKey;
  // readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly idx: number;
}

export const Buttons = observer(
  (props: BottonsProps): JSX.Element => {
    if (props.clazz == 'ssb') {
      return (
        <SubButtons
          dialogQ={props.dialogQ}
          selectedKey={props.selectedKey}
          idx={props.idx}
        />
      );
    } else {
      return (
        <SecButtons
          appState={props.appState}
          dialogQ={props.dialogQ}
          // dialogSecKey={props.dialogSecKey}
          selectedKey={props.selectedKey as SecretKey}
        />
      );
    }
  }
);
