import * as React from 'react';
import classnames from 'classnames';
import { KeyGen, KeyGenUid } from '../../../gpg/types';
import { observer } from 'mobx-react';
import { CreateKeyDelete } from './create-key-delete';
import { Input, Button } from '@material-ui/core';

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

export const CreateKeyUid = observer((props: CreateKeyUidProps): JSX.Element => {
  const { idx, keyGenUid } = props;
  return (
    // <div className={classnames({ 'u-full-width': true, 'good': uid.valid() })} key={idx}>
    <div className={classnames({ good: keyGenUid.valid() })} key={idx}>
      <div className="row">
        <div className="five columns">
          <Input
            title="Name-Real"
            type="text"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.name.valid()
            })}
            name={`uid.name.{idx}`}
            onChange={(e: any) => {
              keyGenUid.name._value.set(e.target.value);
            }}
            value={keyGenUid.name.value}
          />
        </div>
        <div className="five columns">
          <Input
            title="Name-Email"
            type="email"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.email.valid()
            })}
            autoComplete="on"
            name="email"
            onChange={(e: any) => {
              keyGenUid.email._value.set(e.target.value);
            }}
            value={keyGenUid.email.value}
          />
        </div>
        <div className="two columns"><CreateKeyDelete
          keyGen={props.keyGen}
          idx={idx} /></div>
      </div>
      <div className="row">
        <div className="ten columns">
          <Input
            title="Name-Comment"
            type="text"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.comment.valid()
            })}
            autoComplete="on"
            required={true}
            name="nameComment"
            onChange={(e: any) => {
              keyGenUid.comment._value.set(e.target.value);
            }}
            value={keyGenUid.comment.value}
          />
        </div>
        <div className="two columns">
          <Button type="button" onClick={() => handleAddUid(props)}>
            Add Uid
          </Button>
        </div>
      </div>
    </div>
  );
});
