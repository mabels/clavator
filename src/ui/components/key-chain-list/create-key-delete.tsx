import * as React from 'react';
import { ButtonToProgressor } from '../controls/button-to-progressor';
import KeyGen from '../../../gpg/key-gen';

export interface CreateKeyDeleteProps {
  readonly idx: number;
  readonly keyGen: KeyGen;
}

function handleDelUid(props: CreateKeyDeleteProps): void {
  if (props.keyGen.uids.length() > 1) {
    props.keyGen.uids.del(props.idx);
    /*
      this.setState(Object.assign({}, this.state, {
        keyGen: this.keyGen
      }));
      */
  }
}

export function CreateKeyCreate(props: CreateKeyDeleteProps): JSX.Element {
  if (props.keyGen.uids.length() > 1) {
    return (
      <button type="button" onClick={() => handleDelUid(props)}>
        Delete Uid
      </button>
    );
  }
  return null;
}
