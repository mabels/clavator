import * as React from 'react';
import { observer } from 'mobx-react';

import { Message } from '../../../model';
import { Progressor } from './progressor';
import { AppState } from '../../model';
import { observable, IObservableValue } from 'mobx';

interface ButtonToProgressorProps extends React.Props<ButtonToProgressor> {
  onClick: () => void;
  appState: AppState;
  transaction: Message.Transaction<any>;
  disabled?: boolean;
}

@observer
export class ButtonToProgressor extends React.Component<ButtonToProgressorProps, {}> {

  public running: IObservableValue<boolean>;

  constructor(props: ButtonToProgressorProps) {
    super(props);
    this.running = observable.box(false);
  }

  public render(): JSX.Element {
    if (this.running.get()) {
      return <Progressor
        progressor={this.props.appState.progressorState}
        msg={'Clavator'}
        transaction={this.props.transaction.header.transaction}
        controls={true} />;
    } else {
      return <button onClick={() => {
          this.running.set(true);
          this.props.onClick(); }
        }
        disabled={this.props.disabled}
        >{this.props.children}</button>;
    }
  }
}
