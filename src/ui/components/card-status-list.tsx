import * as React from 'react';
import { observer } from 'mobx-react';

import { KeyState, Gpg2CardStatus } from '../../gpg/types';
import { FormatDate } from './controls';
import { AppState } from '../model';
// import { Message } from '../../model';
import { DialogChangePin } from './card-status-list/dialog-change-pin';
import { DialogChangeAttributes } from './card-status-list/dialog-change-attributes';
import { DialogResetYubiKey } from './card-status-list/dialog-reset-yubikey';
import { observable, IObservableValue, action } from 'mobx';

import { Paper, Table, TableCell, TableRow, TableBody, Card, CardActions, CardContent } from '@material-ui/core';
import Build from '@material-ui/icons/Build';
import Delete from '@material-ui/icons/Delete';
import PersonPin from '@material-ui/icons/Person';
import AccountBox from '@material-ui/icons/AccountBox';

export enum CardStatusListDialogs {
  closed,
  changeAttributes,
  changeAdminPin,
  changeUserPin,
  resetYubikey
}

interface CardStatusListProps extends React.Props<CardStatusList> {
  readonly appState: AppState;
}

@observer
export class CardStatusList extends React.Component<CardStatusListProps, {}> {
  public readonly dialog: IObservableValue<CardStatusListDialogs> = observable.box(CardStatusListDialogs.closed);

  public readonly cardStatus: IObservableValue<Gpg2CardStatus> = observable.box(undefined);

  constructor(props: CardStatusListProps) {
    super(props);
  }

  public changeDialog = (
    dialog: CardStatusListDialogs,
    cs: Gpg2CardStatus
  ): ((e: any) => void) => {
    return action((e: any) => {
      this.dialog.set(dialog);
      this.cardStatus.set(cs);
    });
  }

  /*
  public closeModal = (): void => {
    this.dialog.set(Dialogs.closed);
  }
  */

  public changeToAttributesDialog = (cs: Gpg2CardStatus): ((e: any) => void) => {
    return action((e: any) => {
      this.dialog.set(CardStatusListDialogs.changeAttributes);
      this.cardStatus.set(cs);
    });
  }

  public render_actions(cs: Gpg2CardStatus): JSX.Element {
    return (
      <TableCell className="action">
        <a
          title="change-user-pin"
          onClick={this.changeDialog(CardStatusListDialogs.changeUserPin, cs)}
        >
          <PersonPin />
        </a>
        <a
          title="change-admin-pin"
          onClick={this.changeDialog(CardStatusListDialogs.changeAdminPin, cs)}
        >
          <AccountBox />
        </a>
        <a
          title="change-attributes"
          onClick={this.changeToAttributesDialog(cs)}
        >
          <Build />
        </a>
        <a
          title="reset-yubikey"
          onClick={this.changeDialog(CardStatusListDialogs.resetYubikey, cs)}
        >
          <Delete />
        </a>
      </TableCell>
    );
  }

  public render_dialog(): JSX.Element {
    switch (this.dialog.get()) {
      case CardStatusListDialogs.changeAdminPin:
        return (
          <DialogChangePin
            appState={this.props.appState}
            cardStatus={this.cardStatus.get()}
            onClose={action(() => {
              this.dialog.set(CardStatusListDialogs.closed);
            })}
            type={'admin'}
          />
        );
      case CardStatusListDialogs.changeUserPin:
        return (
          <DialogChangePin
            appState={this.props.appState}
            cardStatus={this.cardStatus.get()}
            onClose={action(() => {
              this.dialog.set(CardStatusListDialogs.closed);
            })}
            type={'unblock'}
          />
        );
      case CardStatusListDialogs.changeAttributes:
        return (
          <DialogChangeAttributes
            appState={this.props.appState}
            cardStatus={this.cardStatus.get()}
            onClose={action(() => {
              this.dialog.set(CardStatusListDialogs.closed);
            })}
          />
        );
      case CardStatusListDialogs.resetYubikey:
        return (
          <DialogResetYubiKey
            appState={this.props.appState}
            cardStatus={this.cardStatus.get()}
            onClose={action(() => {
              this.dialog.set(CardStatusListDialogs.closed);
            })}
          />
        );
    }
    return null;
  }

  public render(): JSX.Element {
    // console.log('card-status-list:render');
    return (
      <>
        {this.props.appState.cardStatusListState.cardStatusList.map(
          (cs: Gpg2CardStatus, idx: number) => {
            // console.log('card-status-list:map');
            return (
            <Card>
              <CardActions>
                    {this.render_actions(cs)}
              </CardActions>
              <CardContent>
              <Table key={cs.serial}>
                <TableBody>
                  <TableRow key={cs.serial}>
                    <TableCell>{cs.serial}</TableCell>
                    <TableCell>{cs.name}</TableCell>
                    <TableCell>{cs.login}</TableCell>
                    <TableCell>{cs.lang}</TableCell>
                    <TableCell>{cs.sex}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{cs.url}</TableCell>
                    <TableCell>{cs.version}</TableCell>
                    <TableCell>{cs.vendor}</TableCell>
                    <TableCell>
                      {cs.reader.cardid}
                      <br />
                      {cs.reader.model}
                      <br />
                      {cs.reader.type}
                      <br />
                    </TableCell>
                    <TableCell>{cs.forcepin}</TableCell>
                    <TableCell>{cs.sigcount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={11}>
                      <Table>
                        <TableBody>
                          {cs.keyStates.map((ks: KeyState, idxx: number) => {
                            return (
                              <TableRow key={ks.id}>
                                <TableCell>{ks.id}</TableCell>
                                <TableCell>{ks.mode}</TableCell>
                                <TableCell>{ks.bits}</TableCell>
                                <TableCell>{ks.maxpinlen}</TableCell>
                                <TableCell>{ks.pinretry}</TableCell>
                                <TableCell>{ks.sigcount}</TableCell>
                                <TableCell>{ks.cafpr}</TableCell>
                                <TableCell>{ks.fpr}</TableCell>
                                <TableCell>
                                  <FormatDate ticks={ks.fprtime} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              </CardContent>
      </Card>
            );
          }
        )}
        {this.render_dialog()}
        </>
    );
  }
}
