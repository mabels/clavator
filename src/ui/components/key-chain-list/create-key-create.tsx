import * as React from 'react';
import { observer } from 'mobx-react';

import { ButtonToProgressor } from '../controls';
import { CreateKey } from './create-key';
import { AppState } from '../../model';
import { Message } from '../../../model';
import { KeyGen } from '../../../gpg/types';

export interface CreateKeyCreateProps {
  readonly renderSubmit?: (ck: CreateKey) => JSX.Element;
  readonly appState: AppState;
  // createDialog: boolean;
  readonly transaction: Message.Transaction<KeyGen>;
  readonly createKey: CreateKey;
}

function create_key(props: CreateKeyCreateProps): void {
  const transaction = Message.newTransaction('CreateKeySet.Request', this.keyGen);
  // props.createDialog = true;
  props.appState.channel.send(transaction.asMsg());
}

export const CreateKeyCreate = observer((props: CreateKeyCreateProps): JSX.Element => {
  if (props.renderSubmit) {
    return props.renderSubmit(props.createKey);
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
