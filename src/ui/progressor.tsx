import * as React from 'react';
import * as Progress from '../progress';
import * as Message from '../message';
import * as WsChannel from './ws-channel';

interface ProgressorState {
  progressList: Progress.Progress[];
}

interface ProgressorProps extends React.Props<Progressor> {
  channel: WsChannel.Dispatch;
  msg?: string;
  transaction?: string;
  controls?: boolean;
}

export class Progressor
  extends React.Component<ProgressorProps, ProgressorState>
  implements WsChannel.WsChannel {

  constructor() {
    super();
    this.state = {
      progressList: []
    };
  }

  protected componentWillMount() {
    this.props.channel.register(this);
  }

  protected componentWillUnmount(): void {
    this.setState({ progressList: [] });
    this.props.channel.unregister(this)
  }

  onOpen() {
  }

  onMessage(action: Message.Header, data: string) {
    if ((action.action == "Progressor." + this.props.msg)) {
      if (!this.props.transaction || action.transaction == this.props.transaction) {
        console.log("Progressor.", this.props, action, data)
        let js = JSON.parse(data);
        this.state.progressList.push(Progress.fill(js));
        this.setState(Object.assign({}, this.state, {
          progressList: this.state.progressList
        }));
      }
    }
  }

  onClose(e: CloseEvent) {
  }

  private controls(): JSX.Element {
    if (!this.props.controls) {
      return null;
    }
    return (<div className="action">
      <a title="reset-log"
        onClick={() => {
          this.setState(Object.assign({}, this.state, {
            progressList: []
          }));
        }}
        name="reset-log">
        <i className="fa fa-trash"></i>
      </a>
    </div>)
  }

  public render(): JSX.Element {
    return (
      <div className="Progressor">
        {this.controls()}
        <pre><code>
          {this.state.progressList.map((ps: Progress.Progress, idx: number) => {
            return (ps.msgs.map((msg: string, idx: number) => {
              return (<div key={ps.id + ":" + idx} className={ps.isOk ? "ok" : "fail"}>{msg}{ps.isEndOfMessages ? "<EOM>" : ""}</div>);
            }));
          })}
        </code>
        </pre>
      </div>
    );
  }

}
