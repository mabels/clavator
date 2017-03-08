import * as React from 'react';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import * as Message from '../message';
import RequestAscii from '../gpg/request_ascii';
import RespondAscii from '../respond_ascii';
import { AskPassphrase } from './ask-passphrase';
import { AskKeyToYubiKey } from './ask-key-to-yubi-key';
import KeyToYubiKey from '../gpg/key-to-yubikey';
import * as WsChannel from './ws-channel';
import FormatDate from './format-date';
import * as classnames from 'classnames';
import { KeyChainListState } from './key-chain-list-state';
import { CardStatusListState } from './card-status-list-state';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import MutableString from '../gpg/mutable_string';
import * as ReactModal from 'react-modal';
import { observer } from 'mobx-react';
import DialogSendToCard from './dialog-send-to-card';
import DialogRenderAscii from './dialog-render-ascii';
import DialogAskRenderAscii from './dialog-ask-render-ascii';


enum Dialogs {
  closed, openAscii, askPassPhraseAscii, sendToCard
}

interface KeyChainListComponentState {
  dialog: Dialogs;
  action: string;
  key: ListSecretKeys.Key;
  receiver: WsChannel.WsMessage;
  respondAscii: RespondAscii;
  passPhrase: MutableString;
  idx: number;
}

interface KeyChainListProps extends React.Props<KeyChainList> {
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
  keyChainListState: KeyChainListState;
}

@observer
export class KeyChainList
  extends React.Component<KeyChainListProps, KeyChainListComponentState> {

  constructor() {
    super();
    this.state = {
      dialog: Dialogs.closed,
      action: null,
      key: null,
      receiver: null,
      respondAscii: null,
      passPhrase: null,
      idx: null
    };
    this.closeAsciiModal = this.closeAsciiModal.bind(this)
  }
  public static contextTypes = {
    socket: React.PropTypes.object
  };

  processAscii(key: ListSecretKeys.Key, action: string, dialog: Dialogs, pp: string = null) {
    let ra = new RequestAscii();
    ra.action = action;
    ra.fingerprint = key.fingerPrint.fpr;
    ra.passphrase = new MutableString();
    ra.passphrase.value = pp;
    this.setState(Object.assign({}, this.state, {
      dialog: dialog,
      action: action,
      key: key,
      respondAscii: null,
      receiver: this.props.channel.onMessage((action: Message.Header, data: string) => {
        console.log("processAscii:", action)
        if (action.action != "RespondAscii") {
          return;
        }
        let pem = RespondAscii.fill(JSON.parse(data));
        if (key.fingerPrint.fpr != pem.fingerprint) {
          return;
        }
        console.log("Got: Respond:", pem)
        this.setState(Object.assign({}, this.state, {
          respondAscii: pem
        }));
      })
    }))
    this.props.channel.send(Message.newTransaction("RequestAscii", ra).asMsg());
  }

  requestAscii(key: ListSecretKeys.Key, action: string) {
    return (() => {
      this.processAscii(key, action, Dialogs.openAscii);
    }).bind(this);
  }


  requestAsciiWithPassphrase(key: ListSecretKeys.Key, action: string) {
    return (() => {
      this.setState(Object.assign({}, this.state, {
        dialog: Dialogs.askPassPhraseAscii,
        action: action,
        key: key,
        passPhrase: new MutableString(),
        respondAscii: null
      }))
    }).bind(this)
  }


  public deleteSecretKey(key: ListSecretKeys.SecretKey) {
    return (() => {
      if (confirm(`Really delete ${key.keyId} <${key.uids[0].email}>?`)) {
        this.props.channel.send(Message.newTransaction("DeleteSecretKey", key.fingerPrint).asMsg());
      }
    }).bind(this);
  }

  public sendToCard(key: ListSecretKeys.Key, idx: number) {
    return (() => {
      console.log("sendToCard:Activate")
      this.setState(Object.assign({}, this.state, {
        dialog: Dialogs.sendToCard,
        key: key,
        idx: idx
      }));
    }).bind(this)
  }

  public render_sec_buttons(sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key): JSX.Element {
    return (<td className="action">
      <a title="pem-private"
        onClick={this.requestAsciiWithPassphrase(key, "pem-private")}
        name="pem-private">
        <i className="fa fa-key"></i>
      </a>
      <a title="pem-public"
        onClick={this.requestAscii(key, "pem-public")}
        name="pem-public">
        <i className="fa fa-bullhorn"></i>
      </a>
      <a title="ssh-public"
        onClick={this.requestAscii(key, "ssh-public")}
        name="ssh-public">
        <i className="fa fa-terminal"></i>
      </a>
      <a title="pem-revoke"
        onClick={this.requestAscii(key, "pem-revoke")}
        name="pem-revoke">
        <i className="fa fa-bug"></i>
      </a>
      <a title="delete"
        onClick={this.deleteSecretKey(sk)}
        name="delete">
        <i className="fa fa-trash"></i>
      </a>
    </td>);
  }

  public render_sub_buttons(sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key, idx: number): JSX.Element {
    return (
      <td className="action">
        <a title="Send Key to Smartcard"
          onClick={this.sendToCard(key, idx)}
          name="Send Key to Smartcard">
          <i className="fa fa-credit-card"></i>
        </a>
      </td>);
  }

  public render_buttons(clazz: string, sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key, idx: number): JSX.Element {
    if (clazz == "ssb") {
      return this.render_sub_buttons(sk, key, idx);
    } else {
      return this.render_sec_buttons(sk, key);
    }
  }

  public render_key(clazz: string, sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key, idx: number): JSX.Element {
    return (
      <tr className={clazz} key={key.key}>
        {this.render_buttons(clazz, sk, key, idx)}
        <td>{key.type}</td>
        <td>{key.trust}</td>
        <td>{key.cipher}</td>
        <td>{key.bits}</td>
        <td>{key.keyId}</td>
        <td><FormatDate ticks={key.created} /></td>
        <td><FormatDate ticks={key.expires} /></td>
        <td>{key.uses}</td>
      </tr>);
  }

  public render_uid(key: ListSecretKeys.Key, uid: ListSecretKeys.Uid): JSX.Element {
    return (
      <tbody key={uid.key}>
        <tr className="uid">
          <td>{uid.trust}</td>
          <td>{uid.name}</td>
          <td>{uid.email}</td>
          <td>{uid.comment}</td>
        </tr>
      </tbody>);
  }


  public closeAsciiModal() {
    this.props.channel.unMessage(this.state.receiver);
    this.setState(Object.assign({}, this.state, {
      dialog: Dialogs.closed,
      action: null,
      key: null,
      receiver: null,
      respondAscii: null
    }))
  }

  // (sk: ListSecretKeys.Key, idx: number): JSX.Element {
  public render_modal(): JSX.Element {
    switch (this.state.dialog) {
      case Dialogs.openAscii:
        return <DialogRenderAscii action={this.state.action}
          secKey={this.state.key}
          onClose={() => this.setState({ dialog: Dialogs.closed })}
          channel={this.props.channel} />
      case Dialogs.askPassPhraseAscii:
        return <DialogAskRenderAscii action={this.state.action}
          secKey={this.state.key}
          onClose={() => this.setState({ dialog: Dialogs.closed })}
          channel={this.props.channel} />
      case Dialogs.sendToCard:
        return <DialogSendToCard
          idx={this.state.idx}
          onClose={() => this.setState({ dialog: Dialogs.closed })}
          cardStatusListState={this.props.cardStatusListState}
          secKey={this.state.key}
          channel={this.props.channel} />
    }
    return null;
  }

  public render(): JSX.Element {
    // SecretKeys {this.state.secretKeys.length || ""}
    // {/*{sk.subKeys.map((ssb, idx) => this.render_result(ssb, idx))}*/}
    // console.log("render.KeyChainList", this.props.keyChainListState.keyChainList.length)
    return (
      <div className="KeyChainList">
        {this.render_modal()}
        {this.props.keyChainListState.keyChainList.map((sk: ListSecretKeys.SecretKey, idx: number) => {
          return (
            <div key={sk.key}>
              <table>
                {sk.uids.map((uid) => this.render_uid(sk, uid))}
              </table>
              <table >
                <tbody>
                  {this.render_key("sec", sk, sk, -1)}
                  {sk.subKeys.map((ssb, idx) => {
                    return this.render_key("ssb", sk, ssb, idx)
                  })}
                </tbody>
              </table>
            </div>);
        })}
      </div>
    );
  }

}
