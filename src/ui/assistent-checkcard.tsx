
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import CardStatusListState from './card-status-list-state';
import * as CardStatus from '../gpg/card_status';

interface AssistentCheckcardState {
  current: Actions.Steps;
}

interface AssistentCheckcardProps extends React.Props<AssistentCheckcard> {
  onNext: () => void;
  cardStatusListState: CardStatusListState;
}

export class AssistentCheckcard
  extends React.Component<AssistentCheckcardProps, AssistentCheckcardState>
{
  constructor() {
    super();
    this.state = {
      current: Actions.Steps.CreateKey
    };
  }

  private toState() : 

  private render_card_state() {
    switch (this.toState()) {
      case OK:
      case NOCARD:
      case USED:
    }

  }

  public render(): JSX.Element {
    return (
      <div>
        AssistentCheckcard
        {this.props.cardStatusListState.cardStatusList.map((cs: CardStatus.Gpg2CardStatus, idx: number) => {
        })}
        <button onClick={this.props.onNext}>Next</button>
      </div>
    );
  }
}

export default AssistentCheckcard;