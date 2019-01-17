import * as React from 'react';
import { observer } from 'mobx-react';

import { KeyState, ChangeCard, Gpg2CardStatus } from '../../gpg';
import { FormatDate } from './controls';
import { AppState } from '../model';
import { Message } from '../../model';
import { DialogChangePin } from './card-status-list/dialog-change-pin';
import { DialogChangeAttributes } from './card-status-list/dialog-change-attributes';
import { DialogResetYubiKey } from './card-status-list/dialog-reset-yubikey';
import { observable } from 'mobx';

export enum Dialogs {
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
  @observable
  public dialog: Dialogs = Dialogs.closed;

  @observable
  public cardStatus?: Gpg2CardStatus;
  private transaction?: Message.Transaction<ChangeCard>;

  constructor(props: CardStatusListProps) {
    super(props);
    this.closeModal = this.closeModal.bind(this);
  }

  public changeDialog = (
    dialog: Dialogs,
    cs: Gpg2CardStatus
  ): ((e: any) => void) => {
    return (e: any) => {
      this.dialog = dialog;
      this.cardStatus = cs;
    };
  }

  public closeModal = (): void => {
    this.dialog = Dialogs.closed;
  }

  public changeToAttributesDialog = (
    cs: Gpg2CardStatus
  ): ((e: any) => void) => {
    return (e: any) => {
      this.cardStatus = cs;
    };
  }

  public render_actions(cs: Gpg2CardStatus): JSX.Element {
    return (
      <td className="action">
        <a
          title="change-user-pin"
          onClick={this.changeDialog(Dialogs.changeUserPin, cs)}
        >
          <i className="fa fa-user" />
        </a>
        <a
          title="change-admin-pin"
          onClick={this.changeDialog(Dialogs.changeAdminPin, cs)}
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
          onClick={this.changeDialog(Dialogs.resetYubikey, cs)}
        >
          <i className="fa fa-trash" />
        </a>
      </td>
    );
  }

  public render_dialog(): JSX.Element {
    switch (this.dialog) {
      case Dialogs.changeAdminPin:
        return (
          <DialogChangePin
            appState={this.props.appState}
            cardStatus={this.cardStatus}
            onClose={() => {
              this.dialog = Dialogs.closed;
            }}
            type={'admin'}
          />
        );
      case Dialogs.changeUserPin:
        return (
          <DialogChangePin
            appState={this.props.appState}
            cardStatus={this.cardStatus}
            onClose={() => {
              this.dialog = Dialogs.closed;
            }}
            type={'unblock'}
          />
        );
      case Dialogs.changeAttributes:
        return (
          <DialogChangeAttributes
            appState={this.props.appState}
            cardStatus={this.cardStatus}
            onClose={() => {
              this.dialog = Dialogs.closed;
            }}
          />
        );
      case Dialogs.resetYubikey:
        return (
          <DialogResetYubiKey
            appState={this.props.appState}
            cardStatus={this.cardStatus}
            onClose={() => {
              this.dialog = Dialogs.closed;
            }}
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
            console.log('card-status-list:map');
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
