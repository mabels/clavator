import * as React from 'react';
import './app.less';
import  './app-state';

import { KeyChainList } from './key-chain-list';

export class App extends React.Component<{}, AppState> {

  public static childContextTypes = {
   socket: React.PropTypes.object
  };

  
  getChildContext() {
    return { socket: this.state.socket };
  }

  constructor() {
    super();

    this.state = {
      messages: [],
      objectId: 4711,
      socket: null
    };
  }

  protected componentDidMount(): void {
    this.state.socket = new WebSocket(`ws://${window.location.host}/`);
    this.state.socket.onmessage = (e: MessageEvent) => {
      this.setState(Object.assign({}, this.state, {
        messages: [...this.state.messages, e.data]
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


  public render(): JSX.Element {
    return (
      <div className="app">
        Hello World
        <ul>
          {this.state.messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
        </ul>
        <KeyChainList />
      </div>
      
    );
  }

}
