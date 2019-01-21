import * as React from 'react';
import { observer } from 'mobx-react';

import { SecretKey, GpgKey } from '../../gpg/types';
import { SubButtons } from './sub-buttons';
import { SecButtons } from './sec-buttons';
import { IObservableValue } from 'mobx';
import { KeyChainListDialogs } from './key-chain-list';
import { AppState } from '../model';

export interface BottonsProps {
  readonly appState: AppState;
  readonly clazz: string;
  readonly sk: SecretKey;
  readonly gpgKey: GpgKey;
  readonly dialogs: IObservableValue<KeyChainListDialogs>;
  readonly idx: number;
}

export const Buttons = observer(
  (props: BottonsProps): JSX.Element => {
    if (props.clazz == 'ssb') {
      return <SubButtons dialogs={props.dialogs} sk={props.sk} gpgKey={props.gpgKey} idx={props.idx} />;
    } else {
      return <SecButtons appState={props.appState} dialogs={props.dialogs} sk={props.sk} gpgKey={props.gpgKey} />;
    }
  }
);
