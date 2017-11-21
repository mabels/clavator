import * as React from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import * as Progress from '../../../model/progress';
import * as Message from '../../../model/message';
import { Dispatch  } from '../../model/ws-channel';

export class ProgressorState {
  @observable public progressList: Progress.Progress[];
  private channel: Dispatch;

  constructor(channel: Dispatch) {
    this.channel = channel;
    this.progressList = [];
    this.channel.register({
      onClose: this.onClose.bind(this),
      onOpen: this.onOpen.bind(this),
      onMessage: this.onMessage.bind(this)
    });
  }

  public onOpen(): void {
    return;
  }

  public onMessage(action: Message.Header, data: string): void {
    if (action.action.startsWith('Progressor.')) {
      // if (!this.props.transaction || action.transaction == this.props.transaction) {
        // console.log('Progressor.', this.props, action, data);
        const js = JSON.parse(data);
        this.progressList.push(Progress.fill(js));
      // }
    }
  }

  public onClose(e: CloseEvent): void {
    return;
  }
}

interface ProgressorProps extends React.Props<Progressor> {
  progressor: ProgressorState;
  msg?: string;
  transaction?: string;
  controls?: boolean;
}

@observer
export class Progressor extends React.Component<ProgressorProps> {

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
        }}>
        <i className="fa fa-trash"></i>
      </a>
    </div>);
  }

  public render(): JSX.Element {
    return (
      <div className="Progressor">
        {this.controls()}
        <pre><code>
          {this.props.progressor.progressList.map((ps: Progress.Progress, _: number) => {
            return (ps.msgs.map((msg: string, idx: number) => {
              return (<div key={ps.id + ':' + idx}
                  className={ps.isOk ? 'ok' : 'fail'}>{msg}{ps.isEndOfMessages ? '<EOM>' : ''}</div>);
            }));
          })}
        </code>
        </pre>
      </div>
    );
  }

}

export default Progressor;
