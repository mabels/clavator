import * as React from 'react';
import * as CardStatus from '../../gpg/card-status';
import FormatDate from './controls/format-date';
import * as Message from '../../model/message';
import * as WsChannel from '../model/ws-channel';
// import { ChangePin } from './change-pin';
// import * as Gpg from '../gpg/gpg';
import ChangeCard from '../../gpg/change-card';
import KeyState from '../../gpg/key-state';
import { observer } from 'mobx-react';
import { CardStatusListState } from '../model/card-status-list-state';
// import { AskPassphrase } from './ask-passphrase';
// import { Pin } from '../gpg/pin';
// import * as classnames from 'classnames';
// import { Progressor } from './progressor';
import DialogResetYubikey from './card-status-list/dialog-reset-yubikey';
import DialogChangePin from './card-status-list/dialog-change-pin';
import DialogChangeAttributes from './card-status-list/dialog-change-attributes';

enum Dialogs {
  closed, changeAttributes, changeAdminPin, changeUserPin, resetYubikey
}

interface CardStatusState {
  dialog: Dialogs;
  cardStatus: CardStatus.Gpg2CardStatus;
  transaction: Message.Transaction<ChangeCard>;
}

interface CardStatusListProps extends React.Props<CardStatusList> {
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

@observer
export class CardStatusList extends React.Component<CardStatusListProps, CardStatusState> {

  constructor() {
    super();
    this.state = {
      dialog: Dialogs.closed,
      cardStatus: null,
      transaction: null,
    };
    this.closeModal = this.closeModal.bind(this);
    this.changeDialog = this.changeDialog.bind(this);
  }

  public changeDialog(dialog: Dialogs, cs: CardStatus.Gpg2CardStatus): (e: any) => void {
    return ((e: any) => {
      this.setState({
        dialog: dialog,
        cardStatus: cs
      });
    });
  }

  public changeToAttributesDialog(cs: CardStatus.Gpg2CardStatus): (e: any) => void {
    return ((e: any) => {
      this.setState({
        dialog: Dialogs.changeAttributes,
        cardStatus: cs
      });
    });
  }

  public render_actions(cs: CardStatus.Gpg2CardStatus): JSX.Element {
    return (<td className="action">
      <a title="change-user-pin"
        onClick={this.changeDialog(Dialogs.changeUserPin, cs)}>
        <i className="fa fa-user"></i>
      </a>
      <a title="change-admin-pin"
        onClick={this.changeDialog(Dialogs.changeAdminPin, cs)}>
        <i className="fa fa-superpowers"></i>
      </a>
      <a title="change-attributes"
        onClick={this.changeToAttributesDialog(cs)}>
        <i className="fa fa-pencil"></i>
      </a>
      <a title="reset-yubikey"
        onClick={this.changeDialog(Dialogs.resetYubikey, cs)}>
        <i className="fa fa-trash"></i>
      </a>
    </td>);
  }

  public closeModal(): void {
    this.setState(Object.assign({}, this.state, {
      dialog: Dialogs.closed,
    }));
  }

  public render_dialog(): JSX.Element {
    switch (this.state.dialog) {
      case Dialogs.changeAdminPin:
        return <DialogChangePin
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={() => {this.setState({dialog: Dialogs.closed}); }}
          type={'admin'} />;
      case Dialogs.changeUserPin:
        return <DialogChangePin
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={() => {this.setState({dialog: Dialogs.closed}); }}
          type={'unblock'} />;
      case Dialogs.changeAttributes:
        return <DialogChangeAttributes
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={() => {this.setState({dialog: Dialogs.closed}); }} />;
      case Dialogs.resetYubikey:
        return <DialogResetYubikey
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={() => {this.setState({dialog: Dialogs.closed}); }} />;
    }
    return null;
  }

  public render(): JSX.Element {
    console.log('card-status-list:render');
    return (
      <div className="CardStatusList">
        {this.props.cardStatusListState.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx: number) => {
          console.log('card-status-list:map');
          return (<table key={cs.serial}>
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
                  {cs.reader.cardid}<br />
                  {cs.reader.model}<br />
                  {cs.reader.type}<br />
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
                            <td><FormatDate ticks={ks.fprtime} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>);
        })}
        {this.render_dialog()}
      </div>
    );
  }

}
