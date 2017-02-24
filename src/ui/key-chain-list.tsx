import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

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

import {CardStatusListState} from './card-status-list-state';

// import * as CopyToClipboard from 'react-copy-to-clipboard';

// interface ResponseMap {
//    { [id:string]: ResponseAscii }
// }
interface KeyChainListState {
  secretKeys: ListSecretKeys.SecretKey[];
  respondAscii: Map<string, RespondAscii>;
  requestAscii: Map<string, RequestAscii>;
  keyToYubiKeys: Map<string, KeyToYubiKey>;
}
//export default KeyChainListState;

interface KeyChainListProps extends React.Props<KeyChainList> {
  channel: WsChannel.Dispatch;
  cardStatusListState: CardStatusListState;
}

export class KeyChainList
  extends React.Component<KeyChainListProps, KeyChainListState>
  implements WsChannel.WsChannel {

  constructor() {
    super();
    this.state = {
      secretKeys: [],
      respondAscii: new Map<string, RespondAscii>(),
      requestAscii: new Map<string, RequestAscii>(),
      keyToYubiKeys: new Map<string, KeyToYubiKey>()
    };
  }
  public static contextTypes = {
    socket: React.PropTypes.object
  };

  protected componentWillMount() {
    this.props.channel.register(this)
  }

  protected componentWillUnmount(): void {
    this.setState(Object.assign({}, this.state, { secretKeys: [] }));
  }

  onOpen(e: Event) { }

  onMessage(action: Message.Header, data: string) {
    if (action.action == "KeyChainList") {
      this.setState(Object.assign({}, this.state, {
        secretKeys: JSON.parse(data)
      }));
    } else if (action.action == "RespondAscii") {
      let ra = RespondAscii.fill(JSON.parse(data));
      this.state.respondAscii.set(ra.fingerprint, ra);
      this.setState(Object.assign({}, this.state, {
        respondAscii: this.state.respondAscii
      }));
    }
  }
  onClose(e: CloseEvent) {
    this.setState(Object.assign({}, this.state, { secretKeys: [] }));
  }


  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  requestAsciiWithPassphrase(key: ListSecretKeys.Key, action: string) {
    return (() => {
      this.state.respondAscii.delete(key.fingerPrint.fpr);
      if (this.state.requestAscii.has(key.fingerPrint.fpr)) {
        this.state.requestAscii.delete(key.fingerPrint.fpr)
      } else {
        let rqa = new RequestAscii();
        rqa.action = action;
        rqa.fingerprint = key.fingerPrint.fpr;
        this.state.requestAscii.set(key.fingerPrint.fpr, rqa);
      }
      this.setState(Object.assign({}, this.state, {
        respondAscii: this.state.respondAscii,
        requestAscii: this.state.requestAscii
      }));
    }).bind(this)
  }

  requestAscii(key: ListSecretKeys.Key, action: string) {
    return (() => {
      let doRequest = true;
      if (this.state.respondAscii.has(key.fingerPrint.fpr)) {
        doRequest = this.state.respondAscii.get(key.fingerPrint.fpr).action != action;
        this.state.respondAscii.delete(key.fingerPrint.fpr);
        this.setState(Object.assign({}, this.state, {
          respondAscii: this.state.respondAscii
        }));
      }
      if (doRequest) {
        let ra = this.state.requestAscii.get(key.fingerPrint.fpr)
        if (!ra) {
          ra = new RequestAscii();
          ra.action = action;
          ra.fingerprint = key.fingerPrint.fpr;
        }
        this.props.channel.send(Message.prepare("RequestAscii", ra), null);
      }
      if (this.state.requestAscii.delete(key.fingerPrint.fpr)) {
        this.setState(Object.assign({}, this.state, { requestAscii: this.state.requestAscii }));
      }
    }).bind(this);
  }

  public deleteSecretKey(key: ListSecretKeys.SecretKey) {
    return (() => {
      if (confirm(`Really delete ${key.keyId} <${key.uids[0].email}>?`)) {
        this.props.channel.send(Message.prepare("DeleteSecretKey", key.fingerPrint),
          (error: any) => {
          });
      }
    }).bind(this);
  }

  public sendToCard(key: ListSecretKeys.Key) {
    return (() => {
      // this.state.keyToYubiKeys.delete(key.fingerPrint.fpr);
      if (this.state.keyToYubiKeys.has(key.fingerPrint.fpr)) {
        // console.log("sendToCard-delete", key.fingerPrint.fpr)
        this.state.keyToYubiKeys.delete(key.fingerPrint.fpr)
      } else {
        let rqa = new KeyToYubiKey();
        rqa.fingerprint = key.fingerPrint.fpr;
        this.state.keyToYubiKeys.set(key.fingerPrint.fpr, rqa);
        // console.log("sendToCard-add", key.fingerPrint.fpr)
      }
      this.setState(Object.assign({}, this.state, {
        keyToYubiKeys: this.state.keyToYubiKeys
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
      <a title="Send Key to Smartcard"
        onClick={this.sendToCard(key)}
        name="Send Key to Smartcard">
        <i className="fa fa-credit-card"></i>
      </a>
      <a title="delete"
        onClick={this.deleteSecretKey(sk)}
        name="delete">
        <i className="fa fa-trash"></i>
      </a>
    </td>);
  }

  public render_sub_buttons(sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key): JSX.Element {
    return (
    <td className="action">
      <a title="Send Key to Smartcard"
        onClick={this.sendToCard(key)}
        name="Send Key to Smartcard">
        <i className="fa fa-credit-card"></i>
      </a>
    </td>);
  }

  public render_buttons(clazz: string, sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key): JSX.Element {
    if (clazz == "ssb") {
      return this.render_sub_buttons(sk, key);
    } else {
      return this.render_sec_buttons(sk, key);
    }
  }

  public render_key(clazz: string, sk: ListSecretKeys.SecretKey, key: ListSecretKeys.Key): JSX.Element {
    //<td>{key.funky}</td>
    // {this.render_buttons(key)}
    return (
      <tr className={clazz} key={key.key}>
        {this.render_buttons(clazz, sk, key)}
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
    //<td>{this.format_date(uid.created)}</td>
    //<td>{uid.id}</td>
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

  public render_respondAscii(sk: ListSecretKeys.Key): JSX.Element {
    return (
      <tr>
        <td colSpan={20}>
          <pre className={
            classnames("RespondAsciiBox", this.state.respondAscii.get(sk.fingerPrint.fpr).action)
          }>
            {this.state.respondAscii.get(sk.fingerPrint.fpr).data}
          </pre>
        </td>
      </tr>
    );
  }

  public render_requestAscii(sk: ListSecretKeys.Key): JSX.Element {
    return (
      <tr>
        <td colSpan={20}>
          <AskPassphrase
            fingerprint={sk.fingerPrint.fpr}
            completed={() => {
              this.requestAscii(sk, this.state.requestAscii.get(sk.fingerPrint.fpr).action)();
            }}
            passphrase={this.state.requestAscii.get(sk.fingerPrint.fpr).passphrase} />
        </td>
      </tr>
    );
  }

  public render_keyToYubiKey(sk: ListSecretKeys.Key, idx : number): JSX.Element {
    return (
      <tr>
        <td colSpan={20}>
          <AskKeyToYubiKey
            slot_id={idx+1}
            fingerprint={sk.fingerPrint.fpr}
            channel={this.props.channel}
            cardStatusListState={this.props.cardStatusListState}
          />
        </td>
      </tr>
    );
  }

  public render_result(sk: ListSecretKeys.Key, idx: number): JSX.Element {
    if (this.state.respondAscii.has(sk.fingerPrint.fpr)) {
      return this.render_respondAscii(sk)
    } else if (this.state.requestAscii.has(sk.fingerPrint.fpr)) {
      return this.render_requestAscii(sk)
    } else if (this.state.keyToYubiKeys.has(sk.fingerPrint.fpr)) {
      return this.render_keyToYubiKey(sk, idx)
    } else {
      return null;
    }
  }


  public render(): JSX.Element {
    // SecretKeys {this.state.secretKeys.length || ""}
    return (
      <div className="KeyChainList">
        {this.state.secretKeys.map((sk: ListSecretKeys.SecretKey, idx: number) => {
          return (
            <div key={sk.key}>
              <table>
                {sk.uids.map((uid) => this.render_uid(sk, uid))}
              </table>
              <table >
                <tbody>
                  {this.render_key("sec", sk, sk)}
                  {this.render_result(sk, 0)}
                  {sk.subKeys.map((ssb, idx) => {
                    return [this.render_key("ssb", sk, ssb), this.render_result(ssb, idx)]
                  })}
                </tbody>
              </table>
            </div>);
        })}
      </div>
    );
  }

}
