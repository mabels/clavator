import * as React from 'react';
import { observer } from 'mobx-react';

import { Message } from '../../../model';
import { Progressor } from './progressor';
import { AppState } from '../../model';

interface ButtonToProgressorState {
  running: boolean;
}

interface ButtonToProgressorProps extends React.Props<ButtonToProgressor> {
  onClick: () => void;
  appState: AppState;
  transaction: Message.Transaction<any>;
  disabled?: boolean;
}

@observer
export class ButtonToProgressor extends React.Component<ButtonToProgressorProps, ButtonToProgressorState> {

  constructor(props: ButtonToProgressorProps) {
    super(props);
    this.state = {
      running: false,
    };
  }

  public render(): JSX.Element {
    if (this.state.running) {
      return <Progressor
        progressor={this.props.appState.progressorState}
        msg={'Clavator'}
        transaction={this.props.transaction.header.transaction}
        controls={true} />;
    } else {
      return <button onClick={() => {
          this.setState({running: true});
          this.props.onClick(); }
        }
        disabled={this.props.disabled}
        >{this.props.children}</button>;
    }
  }
}
