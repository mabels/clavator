import * as React from 'react';
import './app.less';
import AppState from  './app-state';

import { KeyChainList } from './key-chain-list';
import * as ListSecretKeys from '../gpg/list_secret_keys';


export class App extends React.Component<{}, AppState> {

  public static childContextTypes = {
   socket: React.PropTypes.object
  };


  getChildContext() {
    return { socket: this.state.socket };
  }

  constructor() {
    super();
    // let sk : ListSecretKeys.SecretKey[] = [];
    this.state = {
      secretKeys: [],
      objectId: 4711,
      socket: null
    };
  }

  protected componentDidMount(): void {
    this.state.socket = new WebSocket(`ws://${window.location.host}/`);
    this.state.socket.onclose = (e: CloseEvent) => {
      this.setState(Object.assign({}, this.state, {}));
      // setTimeout(this.componentDidMount.bind(this), 2000);
    }
    this.state.socket.onmessage = (e: MessageEvent) => {
      let sks = JSON.parse(e.data);
      this.setState(Object.assign({}, this.state, {
        secretKeys: sks
      }));
    };
  }

  protected componentWillUnmount(): void {
    this.state.socket.close();
    this.state.socket = null;
  }

  // componentWillReceiveProps(nextProps: any, nextContext: any) {
  //   debugger
  // }

  // shouldComponentUpdate(nextProps: any,  nextState: any,  nextContext: any) : boolean {
  //   debugger
  //   return true;
  // }

  // componentWillUpdate(nextProps: any, nextState: any, nextContext: any) {
  //   debugger
  // }

  // componentDidUpdate(prevProps: any, prevState: any, prevContext: any) {
  //   debugger
  // }

  public render_key(key: ListSecretKeys.Key) : JSX.Element {
    return (
      <ol>
    <li>{key.type}</li>
    <li>{key.trust}</li>
    <li>{key.cipher}</li>
    <li>{key.funky}</li>
    <li>{key.bits}</li>
    <li>{key.keyId}</li>
    <li>{key.created}</li>
    <li>{key.expires}</li>
    <li>{key.uses}</li>
      </ol>
  );
  }

  public render_uid(uid: ListSecretKeys.Uid) : JSX.Element {
    return (
      <ol>
    <li>{uid.trust}</li>
    <li>{uid.name}</li>
    <li>{uid.email}</li>
    <li>{uid.comment}</li>
    <li>{uid.created}</li>
    <li>{uid.id}</li>
      </ol>
  );
  }



  public render(): JSX.Element {
    return (
      <div className="app">
        SecretKeys
        <ul>
          {this.state.secretKeys.map((sk: ListSecretKeys.SecretKey, idx : number) => <li key={sk.key}>
            {this.render_key(sk)}
            <li>
            <ul>
            {sk.uids.map((uid) => <li key={uid.key}>{this.render_uid(uid)}</li> )}
            </ul>
            </li>
            <li>
            <ul>
            {sk.subKeys.map((ssb) => <li key={ssb.key}>{this.render_key(ssb)}</li> )}
            </ul>
            </li>
          </li>)}
        </ul>
      </div>

    );
  }

}
