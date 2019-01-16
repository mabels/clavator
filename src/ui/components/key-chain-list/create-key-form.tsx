import * as React from 'react';
import InputExpireDate from '../controls/input-expire-date';
import KeyGenUid from '../../../gpg/key-gen-uid';
import RcDoublePassword from '../controls/rc-double-password';
import { CreateKeyCreate } from './create-key-create';
import KeyGen from '../../../gpg/key-gen';
import NestedFlag from '../../../model/nested-flag';
import { CreateKeyUid } from './create-key-uid';
import { CreateKeyLong } from './create-key-long';
import { CreateKeyCompact } from './create-key-compact';

export interface CreateKeyFormProps {
    readonly keyGen: KeyGen;
    readonly readOnly: NestedFlag;
}

export function CreateKeyForm(props: CreateKeyFormProps): JSX.Element {
  return (
    <form
      onSubmit={e => {
        // debugger;
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <InputExpireDate
        readOnly={props.readOnly}
        title="Expire-Date"
        expireDate={props.keyGen.expireDate}
      />
      {props.keyGen.uids.map((sb: KeyGenUid, i: number) => {
        if (sb) {
          return <CreateKeyUid idx={i} keyGenUid={sb} keyGen={props.keyGen} />;
        }
      })}
      <RcDoublePassword
        readOnly={this.props.readOnly}
        key={this.state.passPhrase.objectId()}
        doublePassword={this.state.passPhrase.doublePasswords[0]}
        idx={null}
      />
      ;
      {/*
        <div className={classnames({ row: true, good: this.state.keyGen.password.valid() })}>
          {this.render_password('Password', 'cq-password', this.state.keyGen.password)}
          {this.render_verify_password('Password', 'cq-password', this.state.keyGen.password)}
        </div>
        */}
      <CreateKeyLong  compact={props} />
      <CreateKeyCompact compact={props} />
      // {this.render_long()}
      // {this.render_compact()}
      <div className="row">
        <CreateKeyCreate  />
      </div>
    </form>
  );
}
