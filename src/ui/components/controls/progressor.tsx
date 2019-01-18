import * as React from 'react';
// import { observer } from 'mobx-react';
import { observable, IObservableValue } from 'mobx';

import { Progress, Message } from '../../../model';
import { Dispatch } from '../../model';

export class ProgressorState {
  public open: IObservableValue<boolean> = observable.box(false);
  public progressList: Progress.Progress[] = observable.array([]);
  private channel: Dispatch;

  constructor(channel: Dispatch) {
    this.channel = channel;
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

interface ProgressorProps {
  progressor: ProgressorState;
  msg?: string;
  transaction?: string;
  controls?: boolean;
}

function Controls(props: ProgressorProps): JSX.Element {
    if (!props.controls) {
      return null;
    }
    return (<div className="action">
      <a title="reset-log"
        onClick={() => {
          props.progressor.progressList = [];
        }}>
        <i className="fa fa-trash"></i>
      </a>
    </div>);
  }

export const Progressor = (props: ProgressorProps): JSX.Element => {
    return (
      <div className="Progressor">
        <Controls {...props} />
        <pre><code>
          {props.progressor.progressList.map((ps: Progress.Progress, _: number) => {
            return (ps.msgs.map((msg: string, idx: number) => {
              return (<div key={ps.id + ':' + idx}
                  className={ps.isOk ? 'ok' : 'fail'}>{msg}{ps.isEndOfMessages ? '<EOM>' : ''}</div>);
            }));
          })}
        </code>
        </pre>
      </div>
    );
};
