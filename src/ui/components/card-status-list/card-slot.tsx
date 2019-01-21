import * as React from 'react';
import { observer } from 'mobx-react';

import { AppState } from '../../model';
import { KeyToYubiKey, KeyState } from '../../../gpg/types';
import { action } from 'mobx';

export interface CardSlotProps {
  readonly appState: AppState;
  readonly keyToYubiKey: KeyToYubiKey;
}

export const CardSlot = observer(
  (props: CardSlotProps): JSX.Element => {
    // let selected = `${this.state.keyToYubiKey.card_id}:Slot${this.state.keyToYubiKey.slot_id}`;
    return (
      <div className="row">
        <select
          className="three columns"
          value={this.state.keyToYubiKey.slot_id}
          onChange={action((e: any) => {
            props.keyToYubiKey._slot_id.set(~~e.target.value);
            console.log('this.state.keyToYubiKey:', this.state.keyToYubiKey);
          })}
        >
          {props.appState.cardStatusListState.cardStatusList.map(cardstatus => {
            return cardstatus.keyStates.map((ks: KeyState, idx: number) => {
              let key = `${cardstatus.reader.cardid}:Slot${idx + 1}`;
              return (
                <option value={idx + 1} key={key}>
                  {key}
                </option>
              );
            });
          })}
        </select>
      </div>
    );
  }
);
