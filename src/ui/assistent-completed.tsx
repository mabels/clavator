
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';

interface AssistentCompletedState {
  current: Actions.Steps
}

interface AssistentCompletedProps extends React.Props<AssistentCompleted> {
}

export class AssistentCompleted
  extends React.Component<AssistentCompletedProps, AssistentCompletedState>
{
  constructor() {
    super();
    this.state = {
      current: Actions.Steps.CreateKey
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        AssistentCompleted
      </div>
    );
  }
}

export default AssistentCompleted;