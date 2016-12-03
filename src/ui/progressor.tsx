import * as React from 'react';
import './app.less';
//import KeyChainListState from './key-chain-list-state';

import * as Progress from '../progress';

import * as Message from '../message';

import * as WsChannel from './ws-channel';

interface ProgressorState {
  progressList: Progress.Progress[];
}
//export default KeyChainListState;

interface ProgressorProps extends React.Props<Progressor> {
  channel: WsChannel.Dispatch;
  msg: string;
}

export class Progressor
  extends React.Component<ProgressorProps, ProgressorState>
  implements WsChannel.WsChannel
{

  constructor() {
    super();
    this.state = {
      progressList: []
    };
    this.handleClearClick = this.handleClearClick.bind(this)
  }
  // public static contextTypes = {
  //  socket: React.PropTypes.object
  // };
  protected componentDidMount(): void {
  }

  protected componentWillUnmount(): void {
    this.setState(Object.assign({}, this.state, { progressList: [] }));
  }

  onOpen() {
  }

  onMessage(action: Message.Header, data: string) {
    // console.log("Progressor."+this.props.msg, action.action)
    if (action.action == "Progressor."+this.props.msg) {
      let js = JSON.parse(data);
      this.state.progressList.push(Progress.fill(js));
      this.setState(Object.assign({}, this.state, {
        progressList: this.state.progressList
      }));
    }
  }
  onClose(e:CloseEvent) {
    //this.setState(Object.assign({}, this.state, { cardStatusList: [] }));
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

  private handleClearClick() {
    this.setState(Object.assign({}, this.state, {
      progressList: []
    }));
  }


  public render(): JSX.Element {
        // SecretKeys {this.state.cardStatusList.length || ""}
        //<h3>Progressor.{this.props.msg}
        // <button onClick={this.handleClearClick}>Clear({this.state.progressList.length})</button>
    return (
      <div className="Progressor">
        <pre><code>
        {this.state.progressList.map((ps: Progress.Progress, idx : number) => {
          // console.log("pl", ps)
          // debugger
          return (ps.msgs.map((msg: string, idx: number) => {
            return (<div key={ps.id+":"+idx} className={ps.isOk?"ok":"fail"}>{msg}{ps.isEndOfMessages?"<EOM>":""}</div>);
          }));
        })}
        </code>
        </pre>
      </div>
    );
  }

}