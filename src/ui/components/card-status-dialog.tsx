import * as React from 'react';

import { CardStatusListDialogs } from './card-status-list';

import { DialogChangePin } from './card-status-list/dialog-change-pin';
import { DialogChangeAttributes } from './card-status-list/dialog-change-attributes';
import { DialogResetYubiKey } from './card-status-list/dialog-reset-yubikey';
import { action, IObservableValue } from 'mobx';
import { Gpg2CardStatus } from '../../gpg/types';
import { AppState } from '../model';

export interface CardStatusDialogProps {
  readonly cardStatus: Gpg2CardStatus;
  readonly appState: AppState;
  readonly dialog: IObservableValue<CardStatusListDialogs>;
}

export function CardStatusDialog(props: CardStatusDialogProps): JSX.Element {
  const { cardStatus } = props;
  switch (props.dialog.get()) {
    case CardStatusListDialogs.changeAdminPin:
      return (
        <DialogChangePin
          appState={props.appState}
          cardStatus={cardStatus}
          onClose={action(() => {
            props.dialog.set(CardStatusListDialogs.closed);
          })}
          type={'admin'}
        />
      );
    case CardStatusListDialogs.changeUserPin:
      return (
        <DialogChangePin
          appState={props.appState}
          cardStatus={cardStatus}
          onClose={action(() => {
            props.dialog.set(CardStatusListDialogs.closed);
          })}
          type={'unblock'}
        />
      );
    case CardStatusListDialogs.changeAttributes:
      return (
        <DialogChangeAttributes
          appState={props.appState}
          cardStatus={cardStatus}
          onClose={action(() => {
            props.dialog.set(CardStatusListDialogs.closed);
          })}
        />
      );
    case CardStatusListDialogs.resetYubikey:
      return (
        <DialogResetYubiKey
          appState={props.appState}
          cardStatus={cardStatus}
          onClose={action(() => {
            props.dialog.set(CardStatusListDialogs.closed);
          })}
        />
      );
  }
  return <></>;
}
