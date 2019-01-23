import * as React from 'react';
// import { observer } from 'mobx-react';
import { observable, IObservableValue, IObservableArray, action } from 'mobx';

import { Progress, Message } from '../../../model';
import { Dispatch } from '../../model';
import { observer } from 'mobx-react';

export class ProgressorState {
  public readonly open: IObservableValue<boolean> = observable.box(false);
  public readonly progressList: IObservableArray<Progress.Progress> = observable.array(
    []
  );
  private readonly channel: Dispatch;

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

  @action
  public onMessage(header: Message.Header, data: string): void {
    if (header.action.startsWith('Progressor.')) {
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

export interface ProgressorProps {
  readonly progressor: ProgressorState;
  readonly msg?: string;
  readonly transaction?: string;
  readonly controls?: boolean;
}

const Controls = observer((props: ProgressorProps): JSX.Element => {
    if (!props.controls) {
      return null;
    }
    return (
      <div className="action">
        <a
          title="reset-log"
          onClick={action(() => {
            props.progressor.progressList.clear();
          })}
        >
          <i className="fa fa-trash" />
        </a>
      </div>
    );
  }
);

export const Progressor = observer((props: ProgressorProps): JSX.Element => {
    return (
      <div className="Progressor">
        <Controls {...props} />
        <pre>
          <code>
            {props.progressor.progressList.map(
              (ps: Progress.Progress, _: number) => {
                return ps.msgs.map((msg: string, idx: number) => {
                  return (
                    <div
                      key={ps.id + ':' + idx}
                      className={ps.isOk ? 'ok' : 'fail'}
                    >
                      {msg}
                      {ps.isEndOfMessages ? '<EOM>' : ''}
                    </div>
                  );
                });
              }
            )}
          </code>
        </pre>
      </div>
    );
  }
);
