import * as React from 'react';
import { SecretKey, GpgKey } from '../../../gpg/types';
import { Buttons } from '../buttons';
import { FormatDate } from '../controls';

export interface KeyChainListKeyProps {
  clazz: string;
  sk: SecretKey;
  gpgKey: GpgKey;
  idx: number;
}

export function KeyChainListKey(props: KeyChainListKeyProps): JSX.Element {
    return (
      <tr className={props.clazz} key={props.gpgKey.key}>
        <Buttons clazz={props.clazz} sk={props.sk} idx={props.idx} gpgKey={props.gpgKey} />
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
