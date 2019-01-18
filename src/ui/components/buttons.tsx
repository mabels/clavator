import * as React from 'react';
import { observer } from 'mobx-react';

import { SecretKey, GpgKey } from '../../gpg/types';
import { SubButtons } from './sub-buttons';
import { SecButtons } from './sec-buttons';

export interface BottonsProps {
  clazz: string;
  sk: SecretKey;
  gpgKey: GpgKey;
  idx: number;
}

export const Buttons = observer(
  (props: BottonsProps): JSX.Element => {
    if (props.clazz == 'ssb') {
      return <SubButtons sk={props.sk} gpgKey={props.gpgKey} idx={props.idx} />;
    } else {
      return <SecButtons sk={props.sk} gpgKey={props.gpgKey} />;
    }
  }
);
