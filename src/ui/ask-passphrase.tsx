
import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import MutableString from '../gpg/mutable_string';


interface AskPassphraseState {
}
//export default KeyChainListState;

interface AskPassphraseProps extends React.Props<AskPassphrase> {
  passphrase: MutableString,
  fingerprint: string,
  completed: () => void;
}

export class AskPassphrase
  extends React.Component<AskPassphraseProps, AskPassphraseState>
{
  constructor() {
    super();
    this.state = {
    };
  }
  // public static contextTypes = {
  //  socket: React.PropTypes.object
  // };
  protected componentDidMount(): void {
  }

  protected componentWillUnmount(): void {
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

  public render(): JSX.Element {
        // SecretKeys {this.state.cardStatusList.length || ""}
        //<h3>AskPassphrase.{this.props.msg}
        // <button onClick={this.handleClearClick}>Clear({this.state.progressList.length})</button>
    return (
      <form className="AskPassphrase" key={this.props.fingerprint}>
        <label>Passphrase:</label><input type="password"
          name={`ap-${this.props.key}`} required={true}
          onChange={(e:any) => {
            this.props.passphrase.value = e.target.value;
            // this.setState(this.state);
          }} />
          <button type="button" onClick={(e:any)=> {
              this.props.completed && this.props.completed()
          }}>Ready</button>
      </form>
    );
  }
}
