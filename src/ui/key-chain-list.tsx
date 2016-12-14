import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as ListSecretKeys from '../gpg/list_secret_keys';

import * as Message from '../message';
import RequestAscii from '../gpg/request_ascii';
import RespondAscii from '../respond_ascii';

import { AskPassphrase } from './ask-passphrase';

import * as WsChannel from './ws-channel';

import * as classnames from 'classnames';

// import * as CopyToClipboard from 'react-copy-to-clipboard';

// interface ResponseMap {
//    { [id:string]: ResponseAscii }
// }
interface KeyChainListState {
  secretKeys: ListSecretKeys.SecretKey[];
  respondAscii: Map<string, RespondAscii>;
  requestAscii: Map<string, RequestAscii>;
}
//export default KeyChainListState;

interface KeyChainListProps extends React.Props<KeyChainList> {
  channel: WsChannel.Dispatch;
}

export class KeyChainList
  extends React.Component<KeyChainListProps, KeyChainListState>
  implements WsChannel.WsChannel
{

  constructor() {
    super();
    this.state = {
      secretKeys: [],
      respondAscii: new Map<string, RespondAscii>(),
      requestAscii: new Map<string, RequestAscii>()
    };

  }
  public static contextTypes = {
   socket: React.PropTypes.object
  };


  protected componentDidMount(): void {

  }

  protected componentWillUnmount(): void {
    this.setState(Object.assign({}, this.state, { secretKeys: [] }));
  }

  onOpen(e: Event) {}

  onMessage(action: Message.Header, data: string) {
    if (action.action == "KeyChainList") {
      this.setState(Object.assign({}, this.state, {
        secretKeys: JSON.parse(data)
      }));
    } else if (action.action == "RespondAscii") {
      let ra = RespondAscii.fill(JSON.parse(data));
      this.state.respondAscii.set(ra.fingerprint, ra);
      // debugger
      this.setState(Object.assign({}, this.state, {
        result: this.state.respondAscii
      }));
    }
  }
  onClose(e:CloseEvent) {
    this.setState(Object.assign({}, this.state, { secretKeys: [] }));
  }


  componentWillReceiveProps(nextProps: any, nextContext: any) {
    if (nextProps.channel) {
      nextProps.channel.register(this);
    }
  }

  shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
    // debugger
    return true;
  }

  componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
    // debugger
  }

  componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
    // debugger
  }

  format_date(ticks: number) : JSX.Element {
    let d = new Date(1000*ticks);
    return (
      <span key={ticks}>
      {d.getFullYear()}-{d.getMonth() + 1}-{d.getDate()}
      </span>
    )
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

requestAscii(key: ListSecretKeys.Key, action: string)  {
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

public deleteSecretKey(key: ListSecretKeys.Key) {
  return (() => {
    this.props.channel.send(Message.prepare("DeleteSecretKey", key.fingerPrint),
      (error: any) => {

    });
  }).bind(this);
}

public sendToCard(key: ListSecretKeys.Key) {
  return (() => {
  }).bind(this);
}

public render_buttons(key: ListSecretKeys.Key) : JSX.Element {
  return (<td className="action">
    <a onClick={this.requestAsciiWithPassphrase(key, "pem-private")} name="pem-private">
     <i className="fa fa-key"></i>
    </a>
    <a onClick={this.requestAscii(key, "pem-public")} name="pem-public">
      <i className="fa fa-bullhorn"></i>
    </a>
    <a onClick={this.requestAscii(key, "ssh-public")} name="ssh-public">
      <i className="fa fa-terminal"></i>
    </a>
    <a  onClick={this.requestAscii(key, "pem-revoke")} name="pem-revoke">
      <i className="fa fa-bug"></i>
    </a>
    <a  onClick={this.sendToCard(key)} name="Send Key to Smartcard">
      <i className="fa fa-credit-card"></i>
    </a>
    <a  onClick={this.deleteSecretKey(key)} name="delete">
      <i className="fa fa-trash"></i>
    </a>

  </td>);
}

  public render_key(clazz: string, key: ListSecretKeys.Key) : JSX.Element {
    //<td>{key.funky}</td>
      // {this.render_buttons(key)}
    return (
      <tr className={clazz} key={key.key}>
        {this.render_buttons(key)}
        <td>{key.type}</td>
        <td>{key.trust}</td>
        <td>{key.cipher}</td>
        <td>{key.bits}</td>
        <td>{key.keyId}</td>
        <td>{this.format_date(key.created)}</td>
        <td>{this.format_date(key.expires)}</td>
        <td>{key.uses}</td>
      </tr>);
  }



  public render_uid(key: ListSecretKeys.Key, uid: ListSecretKeys.Uid) : JSX.Element {
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

  public render_result(sk: ListSecretKeys.Key) : JSX.Element {
    if (this.state.respondAscii.has(sk.fingerPrint.fpr)) {
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
    } else if (this.state.requestAscii.has(sk.fingerPrint.fpr)) {
      return (
        <tr>
            <td colSpan={20}>

        <AskPassphrase
          fingerprint={sk.fingerPrint.fpr}
          completed={() => {
            this.requestAscii(sk, this.state.requestAscii.get(sk.fingerPrint.fpr).action)();
          }}
          passphrase={this.state.requestAscii.get(sk.fingerPrint.fpr).passphrase}/>
          </td>
        </tr>
      );
    } else {
      return null;
    }
  }


  public render(): JSX.Element {
    // SecretKeys {this.state.secretKeys.length || ""}
    return (
      <div className="KeyChainList">
        {this.state.secretKeys.map((sk: ListSecretKeys.SecretKey, idx : number) => {
          return (
            <div key={sk.key}>
              <table>
              {sk.uids.map((uid) => this.render_uid(sk, uid) )}
              </table>
              <table >
              <tbody>
              {this.render_key("sec", sk)}
              {this.render_result(sk)}
              {sk.subKeys.map((ssb) => {
                  return [this.render_key("ssb", ssb), this.render_result(ssb)]
                })}
              </tbody>
            </table>
          </div>);
        })}
      </div>
    );
  }

}
