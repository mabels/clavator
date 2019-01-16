import * as React from 'react';
import { ButtonToProgressor } from '../controls/button-to-progressor';
import CreateKey from './create-key';
import AppState from '../../model/app-state';
import * as KeyGen from '../../../gpg/key-gen';
import * as Message from '../../../model/message';
import { observer } from 'mobx-react';

export interface CreateKeyCreateProps {
  readonly renderSubmit?: (ck: CreateKey) => JSX.Element;
  readonly appState: AppState;
  readonly transaction: Message.Transaction<KeyGen.KeyGen>;
  createDialog: boolean;
}

function create_key(props: CreateKeyCreateProps): void {
  let transaction = Message.newTransaction('CreateKeySet.Request', this.keyGen);
  props.createDialog = true;
  props.appState.channel.send(transaction.asMsg());
}

export const CreateKeyCreate = observer((props: CreateKeyCreateProps): JSX.Element => {
  if (props.renderSubmit) {
    return props.renderSubmit(this);
  }
  return (
    <ButtonToProgressor
      appState={props.appState}
      onClick={() => create_key(props)}
      transaction={props.transaction}
    >
      Create Key
    </ButtonToProgressor>
  );
});
