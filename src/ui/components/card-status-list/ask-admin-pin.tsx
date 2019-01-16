import * as React from 'react';

// import * as Message from '../message';
// import ChangeCard from '../gpg/change_card';
// import * as WsChannel from './ws-channel';
import CardStatusListState from '../../model/card-status-list-state';
// import Pin from '../gpg/pin';

interface AskAdminPinState {
}

interface AskAdminPinProps extends React.Props<AskAdminPin> {
  serialNo: string;
  cardStatusListState: CardStatusListState;
}

export class AskAdminPin extends React.Component<AskAdminPinProps, AskAdminPinState> {

  constructor(props: AskAdminPinProps) {
    super(props);
    this.state = {
    };
    // this.handleChange = this.handleChange.bind(this);
  }

  public getSetAdminPin(): string {
    if (!this.props.cardStatusListState.adminPins.has(this.props.serialNo)) {
      this.props.cardStatusListState.adminPins.set(this.props.serialNo, '');
    }
    const val = this.props.cardStatusListState.adminPins.get(this.props.serialNo);
    return val;
  }

  private handleChange = (e: any): void => {
    this.props.cardStatusListState.adminPins.set(this.props.serialNo, e.target.value);
  }

  public render(): JSX.Element {
    return (<span>
      <label>AdminPin:</label>
      <input type="password"
        name={`ask-${this.props.serialNo}-pin`}
        onChange={this.handleChange}
      />
    </span>);
  }
}

export default AskAdminPin;
