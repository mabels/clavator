import * as React from 'react';
import classnames from 'classnames';
import { KeyGen, KeyGenUid } from '../../../gpg';
import { observer } from 'mobx-react';

export interface CreateKeyUidProps {
  readonly idx: number;
  readonly keyGenUid: KeyGenUid;
  readonly keyGen: KeyGen;
}

function handleAddUid(props: CreateKeyUidProps): void {
  const uid = new KeyGenUid();
  uid.name.value = props.keyGen.uids.last().name.value;
  props.keyGen.uids.add(uid);
}

export const CreateKeyUid = observer((props: CreateKeyUidProps): JSX.Element => {
  const { idx, keyGenUid } = props;
  return (
    // <div className={classnames({ 'u-full-width': true, 'good': uid.valid() })} key={idx}>
    <div className={classnames({ good: keyGenUid.valid() })} key={idx}>
      <div className="row">
        <div className="five columns">
          <label>Name-Real:</label>
          <input
            type="text"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.name.valid()
            })}
            name={`uid.name.{idx}`}
            onChange={(e: any) => {
              keyGenUid.name.value = e.target.value;
            }}
            value={keyGenUid.name.value}
          />
        </div>
        <div className="five columns">
          <label>Name-Email:</label>
          <input
            type="email"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.email.valid()
            })}
            autoComplete="on"
            name="email"
            onChange={(e: any) => {
              keyGenUid.email.value = e.target.value;
            }}
            value={keyGenUid.email.value}
          />
        </div>
        <div className="two columns">{this.render_delete_button(idx)}</div>
      </div>
      <div className="row">
        <div className="ten columns">
          <label>Name-Comment:</label>
          <input
            type="text"
            className={classnames({
              'u-full-width': true,
              good: keyGenUid.comment.valid()
            })}
            autoComplete="on"
            required={true}
            name="nameComment"
            onChange={(e: any) => {
              keyGenUid.comment.value = e.target.value;
            }}
            value={keyGenUid.comment.value}
          />
        </div>
        <div className="two columns">
          <button type="button" onClick={() => handleAddUid(props)}>
            Add Uid
          </button>
        </div>
      </div>
    </div>
  );
});
