import * as React from 'react';
import { observer, propTypes } from 'mobx-react';

import { KeyState, Gpg2CardStatus } from '../../gpg/types';
import { FormatDate } from './controls';
import { AppState } from '../model';
// import { Message } from '../../model';
import { observable, IObservableValue, action } from 'mobx';

import { Paper, Table, TableCell, TableRow, TableBody, Card, CardActions, CardContent } from '@material-ui/core';
import { CardStatusActions } from './card-status-actions';
import { CardStatusDialog } from './card-status-dialog';

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

  public render(): JSX.Element {
    // console.log('card-status-list:render');
    return (
      <>
        {this.props.appState.cardStatusListState.cardStatusList.map(
          (cs: Gpg2CardStatus, idx: number) => {
            // console.log('card-status-list:map');
            return (
            <Card key={cs.serial}>
              <CardActions>
                  <CardStatusActions
                    cardStatus={this.cardStatus}
                    currentCardStatus={cs}
                    dialog={this.dialog} />
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
        <CardStatusDialog
          cardStatus={this.cardStatus.get()}
          appState={this.props.appState}
          dialog={this.dialog} />
        </>
    );
  }
}
