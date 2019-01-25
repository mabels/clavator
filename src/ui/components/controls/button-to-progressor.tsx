import * as React from 'react';
import { observer } from 'mobx-react';

import { Message } from '../../../model';
import { Progressor } from './progressor';
import { AppState } from '../../model';
import { observable, IObservableValue, action } from 'mobx';
import { Button } from '@material-ui/core';

interface ButtonToProgressorProps extends React.Props<ButtonToProgressor> {
  readonly onClick: () => void;
  readonly appState: AppState;
  readonly transaction: Message.Transaction<any>;
  readonly disabled?: boolean;
}

@observer
export class ButtonToProgressor extends React.Component<ButtonToProgressorProps, {}> {

  public readonly running: IObservableValue<boolean>;

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
      return <Button onClick={action(() => {
          this.running.set(true);
          this.props.onClick();
        })}
        disabled={this.props.disabled}
        >{this.props.children}</Button>;
    }
  }
}
