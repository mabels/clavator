import * as React from 'react';
import { KeyGen } from '../../../gpg/types';
import { Button } from '@material-ui/core';

export interface CreateKeyDeleteProps {
  readonly idx: number;
  readonly keyGen: KeyGen;
}

function handleDelUid(props: CreateKeyDeleteProps): void {
  if (props.keyGen.uids.length > 1) {
    props.keyGen.uids.del(props.idx);
  }
}

export function CreateKeyDelete(props: CreateKeyDeleteProps): JSX.Element {
  if (props.keyGen.uids.length > 1) {
    return (
      <Button type="button" onClick={() => handleDelUid(props)}>
        Delete Uid
      </Button>
    );
  }
  return null;
}
