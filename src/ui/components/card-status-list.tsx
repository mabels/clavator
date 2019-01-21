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

export enum CardStatusListDialogs {
  closed,
  changeAttributes,
  changeAdminPin,
  changeUserPin,
  resetYubikey
}

interface CardStatusListProps extends React.Props<CardStatusList> {
  appState: AppState;
}

@observer
export class CardStatusList extends React.Component<CardStatusListProps, {}> {
  public readonly dialog: IObservableValue<CardStatusListDialogs> = observable.box(CardStatusListDialogs.closed);

  public readonly cardStatus?: IObservableValue<Gpg2CardStatus> = observable.box(undefined);

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

  public changeToAttributesDialog = (
    cs: Gpg2CardStatus
  ): ((e: any) => void) => {
    return action((e: any) => {
      this.cardStatus.set(cs);
    });
  }

  public render_actions(cs: Gpg2CardStatus): JSX.Element {
    return (
      <td className="action">
        <a
          title="change-user-pin"
          onClick={this.changeDialog(CardStatusListDialogs.changeUserPin, cs)}
        >
          <i className="fa fa-user" />
        </a>
        <a
          title="change-admin-pin"
          onClick={this.changeDialog(CardStatusListDialogs.changeAdminPin, cs)}
        >
          <i className="fa fa-superpowers" />
        </a>
        <a
          title="change-attributes"
          onClick={this.changeToAttributesDialog(cs)}
        >
          <i className="fa fa-pencil" />
        </a>
        <a
          title="reset-yubikey"
          onClick={this.changeDialog(CardStatusListDialogs.resetYubikey, cs)}
        >
          <i className="fa fa-trash" />
        </a>
      </td>
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
    console.log('card-status-list:render');
    return (
      <div className="CardStatusList">
        {this.props.appState.cardStatusListState.cardStatusList.map(
          (cs: Gpg2CardStatus, idx: number) => {
            // console.log('card-status-list:map');
            return (
              <table key={cs.serial}>
                <tbody>
                  <tr key={cs.serial}>
                    {this.render_actions(cs)}
                    <td>{cs.serial}</td>
                    <td>{cs.name}</td>
                    <td>{cs.login}</td>
                    <td>{cs.lang}</td>
                    <td>{cs.sex}</td>
                  </tr>
                  <tr>
                    <td>{cs.url}</td>
                    <td>{cs.version}</td>
                    <td>{cs.vendor}</td>
                    <td>
                      {cs.reader.cardid}
                      <br />
                      {cs.reader.model}
                      <br />
                      {cs.reader.type}
                      <br />
                    </td>
                    <td>{cs.forcepin}</td>
                    <td>{cs.sigcount}</td>
                  </tr>
                  <tr>
                    <td colSpan={11}>
                      <table>
                        <tbody>
                          {cs.keyStates.map((ks: KeyState, idxx: number) => {
                            return (
                              <tr key={ks.id}>
                                <td>{ks.id}</td>
                                <td>{ks.mode}</td>
                                <td>{ks.bits}</td>
                                <td>{ks.maxpinlen}</td>
                                <td>{ks.pinretry}</td>
                                <td>{ks.sigcount}</td>
                                <td>{ks.cafpr}</td>
                                <td>{ks.fpr}</td>
                                <td>
                                  <FormatDate ticks={ks.fprtime} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            );
          }
        )}
        {this.render_dialog()}
      </div>
    );
  }
}
