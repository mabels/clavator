import * as React from 'react';
import classnames from 'classnames';
import { KeyGen, KeyGenUid } from '../../../gpg/types';
import { observer } from 'mobx-react';
import { CreateKeyDelete } from './create-key-delete';
import { Input, Button, TextField } from '@material-ui/core';
import { action } from 'mobx';

export interface CreateKeyUidProps {
  readonly idx: number;
  readonly keyGenUid: KeyGenUid;
  readonly keyGen: KeyGen;
}

function handleAddUid(props: CreateKeyUidProps): void {
  const uid = new KeyGenUid();
  uid.name._value.set(props.keyGen.uids.last().name.value);
  props.keyGen.uids.add(uid);
}

export const CreateKeyUid = observer(
  (props: CreateKeyUidProps): JSX.Element => {
    const { idx, keyGenUid } = props;
    return (
      // <div className={classnames({ 'u-full-width': true, 'good': uid.valid() })} key={idx}>
      <>
        <TextField
          id={`uid.name.{idx}`}
          label="Name-Real"
          onChange={action((e: any) => {
            keyGenUid.name._value.set(e.target.value);
          })}
          value={keyGenUid.name.value}
          margin="normal"
        />
        <TextField
          label="Name-Email"
          type="email"
          onChange={action((e: any) => {
            keyGenUid.email._value.set(e.target.value);
          })}
          value={keyGenUid.email.value}
        />
        <CreateKeyDelete keyGen={props.keyGen} idx={idx} />
        <TextField
          label="Name-Comment"
          type="text"
          required={true}
          name="nameComment"
          onChange={action((e: any) => {
            keyGenUid.comment._value.set(e.target.value);
          })}
          value={keyGenUid.comment.value}
        />
        <Button type="button" onClick={action(() => handleAddUid(props))}>
          Add Uid
        </Button>
      </>
    );
  }
);
