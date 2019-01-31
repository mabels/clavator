import * as React from 'react';
import { TableCell } from '@material-ui/core';
import { Gpg2CardStatus } from '../../gpg/types/create-key-set';
import { CardStatusListDialogs } from './card-status-list';

import Build from '@material-ui/icons/Build';
import Delete from '@material-ui/icons/Delete';
import PersonPin from '@material-ui/icons/Person';
import AccountBox from '@material-ui/icons/AccountBox';
import { action, IObservableValue } from 'mobx';

export interface CardStatusActionsProps {
  readonly cardStatus: IObservableValue<Gpg2CardStatus>;
  readonly dialog: IObservableValue<CardStatusListDialogs>;
  readonly currentCardStatus: Gpg2CardStatus;
}

function changeDialog(
  currentDialog: CardStatusListDialogs,
  props: CardStatusActionsProps
): ((e: any) => void) {
  return action((e: any) => {
    props.dialog.set(currentDialog);
    props.cardStatus.set(props.currentCardStatus);
  });
}

function changeToAttributesDialog(props: CardStatusActionsProps): ((e: any) => void) {
  return action((e: any) => {
    props.dialog.set(CardStatusListDialogs.changeAttributes);
    props.cardStatus.set(props.currentCardStatus);
  });
}

export function CardStatusActions(props: CardStatusActionsProps): JSX.Element {
  return (
    <>
        <PersonPin
          name="change-user-pin"
          onClick={changeDialog(CardStatusListDialogs.changeUserPin, props)}
        />
        <AccountBox
          name="change-admin-pin"
          onClick={changeDialog(CardStatusListDialogs.changeAdminPin, props)}
        />
        <Build
          name="change-attributes"
          onClick={changeToAttributesDialog(props)}
        />
        <Delete
          name="reset-yubikey"
          onClick={changeDialog(CardStatusListDialogs.resetYubikey, props)}
        />
    </>
  );
}
