import * as React from 'react';

import { CardStatusListState } from '../../model/card-status-list-state';

interface AskAdminPinState {
}

interface AskAdminPinProps extends React.Props<AskAdminPin> {
  serialNo: string;
  cardStatusListState: CardStatusListState;
}

function handleChange(e: any, props: AskAdminPinProps): void {
  this.props.cardStatusListState.adminPins.set(this.props.serialNo, e.target.value);
}

export class AskAdminPin extends React.Component<AskAdminPinProps, AskAdminPinState> {

  constructor(props: AskAdminPinProps) {
    super(props);
  }

  /*
  public getSetAdminPin(): string {
    if (!this.props.cardStatusListState.adminPins.has(this.props.serialNo)) {
      this.props.cardStatusListState.adminPins.set(this.props.serialNo, '');
    }
    const val = this.props.cardStatusListState.adminPins.get(this.props.serialNo);
    return val;
  }
  */

  public render(): JSX.Element {
    return (<span>
      <label>AdminPin:</label>
      <input type="password"
        name={`ask-${this.props.serialNo}-pin`}
        onChange={(e) => {
          handleChange(e, props);
        }}
      />
    </span>);
  }
}
