import * as React from 'react';

import { CardStatusListState } from '../../model';
import { Input } from '@material-ui/core';

export interface AskAdminPinProps {
  serialNo: string;
  cardStatusListState: CardStatusListState;
}

function handleChange(e: any, props: AskAdminPinProps): void {
  this.props.cardStatusListState.adminPins.set(
    this.props.serialNo,
    e.target.value
  );
}

export function AskAdminPin(props: AskAdminPinProps): JSX.Element {
  return (
    <span>
      <label>AdminPin:</label>
      <Input
        type="password"
        name={`ask-${this.props.serialNo}-pin`}
        onChange={e => {
          handleChange(e, props);
        }}
      />
    </span>
  );
}
