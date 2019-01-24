import * as React from 'react';
import { GpgUid } from '../../../gpg/types';
import { TableHead, TableRow, TableCell } from '@material-ui/core';

export interface KeyChainListUidProps {
  uid: GpgUid;
}

export function KeyChainListUid(props: KeyChainListUidProps): JSX.Element {
    return (
        <TableRow key={props.uid.key} className="uid">
          <TableCell>{props.uid.trust}</TableCell>
          <TableCell>{props.uid.name}</TableCell>
          <TableCell>{props.uid.email}</TableCell>
          <TableCell>{props.uid.comment}</TableCell>
        </TableRow>
    );
  }
