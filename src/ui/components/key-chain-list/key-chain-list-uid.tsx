import * as React from 'react';
import { GpgUid } from '../../../gpg/types';

export interface KeyChainListUidProps {
    uid: GpgUid;
}

export function KeyChainListUid(props: KeyChainListUidProps): JSX.Element {
    return (
      <tbody key={props.uid.key}>
        <tr className="uid">
          <td>{props.uid.trust}</td>
          <td>{props.uid.name}</td>
          <td>{props.uid.email}</td>
          <td>{props.uid.comment}</td>
        </tr>
      </tbody>
    );
  }
