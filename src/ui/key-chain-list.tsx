import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as ListSecretKeys from '../gpg/list_secret_keys';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

interface KeyChainListState {
  secretKeys: ListSecretKeys.SecretKey[];
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
      secretKeys: []
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

  onMessage(action: Message.Header, data: string) {
    if (action.action == "KeyChainList") {
      this.setState(Object.assign({}, this.state, {
        secretKeys: JSON.parse(data)
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
      {d.getFullYear()}-{d.getMonth()}-{d.getDate()}
      </span>
    )
  }


  public render_key(clazz: string, key: ListSecretKeys.Key) : JSX.Element {
    //<td>{key.funky}</td>
    return (
      <tr className={clazz} key={key.key}>
    <td>{key.type}</td>
    <td>{key.trust}</td>
    <td>{key.cipher}</td>
    <td>{key.bits}</td>
    <td>{key.keyId}</td>
    <td>{this.format_date(key.created)}</td>
    <td>{this.format_date(key.expires)}</td>
    <td>{key.uses}</td>
      </tr>
  );
  }

  public render_uid(uid: ListSecretKeys.Uid) : JSX.Element {
    //<td>{this.format_date(uid.created)}</td>
    //<td>{uid.id}</td>
    return (
      <tr className="uid" key={uid.key}>
    <td>{uid.trust}</td>
    <td>{uid.name}</td>
    <td>{uid.email}</td>
    <td>{uid.comment}</td>
      </tr>
  );
  }


  public render(): JSX.Element {
    return (
      <div className="KeyChainList">
        SecretKeys {this.state.secretKeys.length || ""}
        {this.state.secretKeys.map((sk: ListSecretKeys.SecretKey, idx : number) => {
          return (<table key={sk.key}>
            <tbody>
            {sk.uids.map((uid) => this.render_uid(uid) )}
            {this.render_key("sec", sk)}
            {sk.subKeys.map((ssb) => this.render_key("ssb", ssb))}
            </tbody>
          </table>);
        })}
      </div>
    );
  }

}

// {this.render_key(sk)}
// <li>
// <ul>
// </ul>
// </li>
// <li>
// <ul>
// {sk.subKeys.map((ssb) => <li key={ssb.key}>{this.render_key(ssb)}</li> )}
// </ul>
// </li>
// </li>)}
