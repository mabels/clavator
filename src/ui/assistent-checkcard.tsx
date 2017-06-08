
import * as React from 'react';
import MutableString from '../gpg/mutable_string';
import * as Actions from './actions';
import CardStatusListState from './card-status-list-state';
import * as ListSecretKeys from '../gpg/list_secret_keys';
import * as CardStatus from '../gpg/card_status';

export enum Status {
  UNKNOWN = 0x0,
  NOCARD = 0x1,
  USED = 0x2,
  OK = 0x4,
  UNMATCHED = 0x8
}

interface AssistentCheckcardState {
  current: Actions.Steps;
}

interface AssistentCheckcardProps extends React.Props<AssistentCheckcard> {
  onNext: () => void;
  cardStatusListState: CardStatusListState;
  secretKey: ListSecretKeys.SecretKey;
}

export class AssistentCheckcard
  extends React.Component<AssistentCheckcardProps, AssistentCheckcardState> {
  constructor() {
    super();
    this.state = {
      current: Actions.Steps.CreateKey
    };
  }

  private toState(): Status[] {
    return this.props.cardStatusListState.cardStatusList.map((csl, idx) => {
      // debugger;
      if (csl.keyStates.length != this.props.secretKey.subKeys.length) {
        return Status.UNMATCHED;
      }
      let used = csl.keyStates.find((ks): boolean => {
        return ks.fpr != undefined && ks.fpr.length != 0;
      });
      if (used) {
        return Status.USED;
      }
      return Status.OK;
    });
  }

  private render_card_state(): JSX.Element {
    let status = this.toState();
    if (status.length > 1) {
      return <b>Unable to handle Multiple-Cards</b>;
    }
    if (status.length == 0) {
        return <b>no-card</b>;
    }
    switch (status[0]) {
      case Status.OK:
        return <b>OK</b>;
      case Status.USED:
        return <b>card has keys installed</b>;
      case Status.UNMATCHED:
        return <b>card is not matching to key</b>;
    }
    return <b>unknown card state</b>;
  }

  public render(): JSX.Element {
    return (
      <div>
        AssistentCheckcard:<br />
        {this.render_card_state()}<br />
        <button onClick={this.props.onNext}>Next</button>
      </div>
    );
  }
}

export default AssistentCheckcard;
