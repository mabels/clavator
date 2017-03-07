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

import * as ReactModal from 'react-modal';


enum Dialogs {
  closed, changeAttributes, changeAdminPin, changeUserPin, resetYubikey
}

enum PinType {
  none, admin, user
}

interface CardStatusState {
  dialog: Dialogs;
  cs: CardStatus.Gpg2CardStatus
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
      cs: null,
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

  public resetYubikey(cs: CardStatus.Gpg2CardStatus) {
    return ((e: any) => {
      this.props.channel.send(Message.newTransaction("ResetYubikey").asMsg());
    }).bind(this)
  }

  public changeDialog(dialog: Dialogs, cs: CardStatus.Gpg2CardStatus) {
    return ((e: any) => {
      this.setState({
        dialog: dialog,
        cs: cs
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
        onClick={this.changeDialog(Dialogs.changeAttributes, cs)}
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

  public render_changeAdminPin() {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: "right" }} onClick={this.closeModal} className="fa fa-close"></i>
        <h4>ChangeAdminPin</h4>
        <h5>{this.state.cs.name}({this.state.cs.reader.cardid})</h5>
        <ChangePin type={"admin"}
          channel={this.props.channel}
          app_id={this.state.cs.reader.cardid} />
      </ReactModal>
    );
  }

  public render_changeUserPin() {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: "right" }} onClick={this.closeModal} className="fa fa-close"></i>
        <h4>ChangeUserPin</h4>
        <h5>{this.state.cs.name}({this.state.cs.reader.cardid})</h5>
        <ChangePin type={"unblock"}
          channel={this.props.channel}
          app_id={this.state.cs.reader.cardid} />
      </ReactModal>
    );
  }

  public updateAttributes(cs: CardStatus.Gpg2CardStatus) {
    return (() => {
      console.log("updateAttributes", cs)
      let cc = new ChangeCard();
      cc.adminPin.pin = "XXXX";
      cc.lang = cs.lang;
      cc.login = cs.login;
      cc.name = cs.name;
      cc.serialNo = cs.reader.cardid;
      cc.sex = cs.sex;
      cc.url = cs.url;
      this.props.channel.send(Message.newTransaction("SetCardAttributes.Request", cc).asMsg());
    }).bind(this);
  }

  public render_changeAttributes() {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: "right" }} onClick={this.closeModal} className="fa fa-close"></i>
        <h4>ChangeAttributes:</h4>
        <h5>{this.state.cs.name}({this.state.cs.reader.cardid})</h5>
        {/*<form>*/}
        <label>Name of cardholder:</label><input type="text"
          onChange={(e: any) => {
            this.state.cs.name = e.target.value;
            this.setState({ cs: this.state.cs })
          }}
          value={this.state.cs.name} />
        <label>Language prefs:</label><input type="text"
          onChange={(e: any) => {
            this.state.cs.lang = e.target.value;
            this.setState({ cs: this.state.cs })
          }}
          value={this.state.cs.lang} />
        <label>Sex:</label><select value={this.state.cs.sex[0]}
          onChange={(e) => {
            console.log("Sex:", this.state.cs, e.target.value)
            this.state.cs.sex = e.target.value[0];
            this.setState({ cs: this.state.cs })
          }}>
          <option value={'f'}>Female</option>
          <option value={'m'}>Male</option>
        </select>
        <label>Login data:</label><input type="text"
          onChange={(e: any) => {
            this.state.cs.login = e.target.value;
            this.setState({ cs: this.state.cs })
          }}
          value={this.state.cs.login} />
        <label>Url:</label><input type="text"
          onChange={(e: any) => {
            this.state.cs.url = e.target.value;
            this.setState({ cs: this.state.cs })
          }}
          value={this.state.cs.url} />
        <br />
        <button onClick={this.updateAttributes(this.state.cs)}>update</button>
      </ReactModal>
    );
  }

  public render_resetYubikey() {
    return (
      <ReactModal
        isOpen={true}
        closeTimeoutMS={150}
        onAfterOpen={() => { }}
        contentLabel="Modal"
        shouldCloseOnOverlayClick={true}
      >
        <i style={{ float: "right" }} onClick={this.closeModal} className="fa fa-close"></i>
        <h4>ResetYubikey:</h4>
        <h5>{this.state.cs.name}({this.state.cs.reader.cardid})</h5>
        <button onClick={this.resetYubikey(this.state.cs)}>REALY RESET YUBIKEY</button>
      </ReactModal>
    );
  }



  public render_dialog(): JSX.Element {
    switch (this.state.dialog) {
      case Dialogs.changeAdminPin:
        return this.render_changeAdminPin();
      case Dialogs.changeUserPin:
        return this.render_changeUserPin();
      case Dialogs.changeAttributes:
        return this.render_changeAttributes();
      case Dialogs.resetYubikey:
        return this.render_resetYubikey();
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
          console.log("Render", cs.serial);
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

