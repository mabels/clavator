import * as React from 'react';
import { KeyGen } from '../../../gpg';

export interface CreateKeyDeleteProps {
  readonly idx: number;
  readonly keyGen: KeyGen;
}

function handleDelUid(props: CreateKeyDeleteProps): void {
  if (props.keyGen.uids.length() > 1) {
    props.keyGen.uids.del(props.idx);
  }
}

export function CreateKeyDelete(props: CreateKeyDeleteProps): JSX.Element {
  if (props.keyGen.uids.length() > 1) {
    return (
      <button type="button" onClick={() => handleDelUid(props)}>
        Delete Uid
      </button>
    );
  }
  return null;
}
