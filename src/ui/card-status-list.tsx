import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as CardStatus from '../gpg/card_status';

import FormatDate from './format-date'

import * as Message from '../message';

import * as WsChannel from './ws-channel';

import { ChangePin } from './change-pin';

import * as Gpg from '../gpg/gpg';

import ChangeCard from '../gpg/change_card';

import { observer } from 'mobx-react';

import { CardStatusListState } from './card-status-list-state';


// import EditableCard from './editable-card';

import { AskPassphrase } from './ask-passphrase';

import { Pin } from '../gpg/pin';

import * as classnames from 'classnames';

import * as ReactModal from 'react-modal';

import { Progressor } from './progressor';

import DialogResetYubikey from './dialog-reset-yubikey';
import DialogChangePin from './dialog-change-pin';
import DialogChangeAttributes from './dialog-change-attributes';


enum Dialogs {
  closed, changeAttributes, changeAdminPin, changeUserPin, resetYubikey
}

enum PinType {
  none, admin, user
}

interface CardStatusState {
  dialog: Dialogs;
  cardStatus: CardStatus.Gpg2CardStatus;
  transaction: Message.Transaction<ChangeCard>;
  handleTransaction: (action: Message.Header, data: string) => void;
  // currentAdminPin: string;
  // newPin: string;
  pinType: PinType;
}
//export default KeyChainListState;

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
      handleTransaction: null,
      // currentAdminPin: "12345678",
      // newPin: null,
      pinType: PinType.none
    };
    this.closeModal = this.closeModal.bind(this)
    this.changeDialog = this.changeDialog.bind(this)
  }

  // public changePin(cs: CardStatus.Gpg2CardStatus, admin_or_user: string) {
  //   return ((e: any) => {
  //     if (this.state.requestPin && admin_or_user == this.state.requestPin) {
  //       this.setState(Object.assign({}, this.state, {
  //         requestPin: null
  //       }));
  //     } else {
  //       this.setState(Object.assign({}, this.state, {
  //         requestPin: admin_or_user
  //       }));
  //     }
  //   }).bind(this)
  // }

 

  public changeDialog(dialog: Dialogs, cs: CardStatus.Gpg2CardStatus) {
    return ((e: any) => {
      this.setState({
        dialog: dialog,
        cardStatus: cs
      })
    })
  }

  public changeToAttributesDialog(cs: CardStatus.Gpg2CardStatus) {
    return ((e: any) => {
      this.setState({
        dialog: Dialogs.changeAttributes,
        cardStatus: cs
      })
    })
  }

  public render_actions(cs: CardStatus.Gpg2CardStatus): JSX.Element {
    return (<td className="action">
      <a title="change-user-pin"
        onClick={this.changeDialog(Dialogs.changeUserPin, cs)}
        name="change-user-pin">
        <i className="fa fa-user"></i>
      </a>
      <a title="change-admin-pin"
        onClick={this.changeDialog(Dialogs.changeAdminPin, cs)}
        name="change-admin-pin">
        <i className="fa fa-superpowers"></i>
      </a>
      <a title="change-attributes"
        onClick={this.changeToAttributesDialog(cs)}
        name="change-admin-attributes">
        <i className="fa fa-pencil"></i>
      </a>
      <a title="reset-yubikey"
        onClick={this.changeDialog(Dialogs.resetYubikey, cs)}
        name="reset-yubikey">
        <i className="fa fa-trash"></i>
      </a>
    </td>);
  }

  public closeModal() {
    this.setState(Object.assign({}, this.state, {
      dialog: Dialogs.closed,
    }))
  }

   handleTransaction(action: Message.Header, data: string) {
    // console.log("CreateKey:", action, this.state.transaction.header.transaction);
    if (action.transaction == this.state.transaction.header.transaction) {
      if (action.action == "CreateKeySet.Completed") {
        this.props.channel.unMessage(this.state.handleTransaction);
        this.setState({
          transaction: null,
          handleTransaction: null,
        });
      }
    }
  }

  public render_dialog(): JSX.Element {
    switch (this.state.dialog) {
      case Dialogs.changeAdminPin:
        return <DialogChangePin 
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={()=>{this.setState({dialog: Dialogs.closed})}}
          type={"admin"} />
      case Dialogs.changeUserPin:
        return <DialogChangePin 
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={()=>{this.setState({dialog: Dialogs.closed})}}
          type={"unblock"} />
      case Dialogs.changeAttributes:
        return <DialogChangeAttributes
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={()=>{this.setState({dialog: Dialogs.closed})}} />
      case Dialogs.resetYubikey:
        return <DialogResetYubikey 
          channel={this.props.channel}
          cardStatus={this.state.cardStatus}
          onClose={()=>{this.setState({dialog: Dialogs.closed})}} />
    }
    return null;
    /*if (this.state.requestPin) {
      return (<tr>
        <td colSpan={10}>
          Change Pin {this.state.requestPin}
          <ChangePin type={this.state.requestPin}
            channel={this.props.channel}
            app_id={cs.reader.cardid} />
        </td>
      </tr>);
    } else {
      // if (this.state.changeAdminPin) {
      //     return (<ChangePin pin={this.state.changeAdminPin}/>)
      // }
      // if (this.state.changeUserPin) {
      //     return (<ChangePin pin={this.state.changeUserPin}/>)
      // }
      return null
    }*/
  }

  public render(): JSX.Element {
    return (
      <div className="CardStatusList">
        {this.props.cardStatusListState.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx: number) => {
          {/*console.log("Render", cs.serial, cs.url);*/}
          let login = "" + cs.login;
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
                      {cs.keyStates.map((ks: CardStatus.KeyState, idx: number) => {
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

