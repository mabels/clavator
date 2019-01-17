import * as React from 'react';
import {
    KeyGenUid,
    KeyGen } from '../../../gpg';
import { NestedFlag } from '../../../model/nested-flag';
import { RcDoublePassword,
InputExpireDate } from '../controls';

import { CreateKeyCreate } from './create-key-create';
import { CreateKeyUid } from './create-key-uid';
import { CreateKeyLong } from './create-key-long';
import { CreateKeyCompact } from './create-key-compact';
import { AppState } from '../../model';
import { Message } from '../../../model';
import { CreateKey } from './create-key';

export interface CreateKeyFormProps {
  readonly compact: boolean;
  readonly keyGen: KeyGen;
  readonly readOnly: NestedFlag;
  readonly appState: AppState;
  readonly createKey: CreateKey;
  readonly transaction: Message.Transaction<KeyGen>;
  readonly renderSubmit?: (ck: CreateKey) => JSX.Element;
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
      <CreateKeyLong  compact={props.compact} keyGen={props.keyGen} />
      <CreateKeyCompact compact={props.compact} keyGen={props.keyGen} />
      <div className="row">
        <CreateKeyCreate
          createKey={props.createKey}
          renderSubmit={props.renderSubmit}
          appState={props.appState}
          createDialog={}
          transaction={props.transaction}
        />
      </div>
    </form>
  );
}
