import * as React from 'react';
import './app.less';

interface AppState {
  messages: string[];
}

export class App extends React.Component<{}, AppState> {

  private socket: WebSocket;

  constructor() {
    super();

    this.state = {
      messages: []
    };
  }

  protected componentDidMount(): void {
    this.socket = new WebSocket(`ws://${window.location.host}/`);
    this.socket.onmessage = (e: MessageEvent) => {
      this.setState(Object.assign({}, this.state, {
        messages: [...this.state.messages, e.data]
      }));
    };
  }

  protected componentWillUnmount(): void {
    this.socket.close();
    this.socket = null;
  }

  public render(): JSX.Element {
    return (
      <div className="app">
        Hello World
        <ul>
          {this.state.messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
        </ul>
      </div>
    );
  }

}
