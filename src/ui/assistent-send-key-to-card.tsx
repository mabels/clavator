
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';

interface AssistentSendKeyToCardState {
  current: Actions.Steps
}

interface AssistentSendKeyToCardProps extends React.Props<AssistentSendKeyToCard> {
  onNext: () => void;
}

export class AssistentSendKeyToCard
  extends React.Component<AssistentSendKeyToCardProps, AssistentSendKeyToCardState>
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
        Test Card is present 
        Test Card is empty 
        Test Card is Write 
        <button onClick={this.props.onNext}>Next</button>
      </div>
    );
  }
}

export default AssistentSendKeyToCard;