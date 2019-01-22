import * as React from 'react';
import { observer } from 'mobx-react';
import { DoublePassword } from '../../model';
import { RcOption, InputDiceWare, InputDiceWareProps } from '../controls';
import { DiceWare, Diced } from '../../../dice-ware';
import {
  InputPassPhrase,
  InputPassPhraseProps
} from '../controls/input-pass-phrase';
import { LabelWithDice } from './label-with-dice';

export interface DiceWareInputPassPhraseProps extends InputPassPhraseProps {
  diceWares: DiceWare[];
}

/*
  private diceAll = (e: any): void => {
    // console.log('diceAll');
    .props.passPhrase.doublePasswords.forEach(dp => dp.inputDiceWare.randomDice());
  }
  */

export const DiceWareInputPassPhrase = observer(
  (props: DiceWareInputPassPhraseProps) => {
    // console.log('dice-ware-input-pass-phrase:', .props.readOnly);
    return (
      <InputPassPhrase
        label={
          <LabelWithDice
            label={props.label}
            diceWares={props.diceWares}
            passPhrase={props.passPhrase}
            readOnly={props.readOnly}
          />
        }
        passPhrase={props.passPhrase}
        readOnly={props.readOnly}
        childFactory={(dp: DoublePassword) => {
          // dp.diceWare = .props.diceWare;
          // const readOnly = new NestedFlag(.props.readOnly);
          return (
            <InputDiceWare
              label={null}
              readOnly={null}
              readable={null}
              doublePassword={dp}
              ref={(input: InputDiceWare) => {
                dp.setInputDiceWare(input);
              }}
              passPhrase={props.passPhrase}
              onDiceResult={(dd: Diced, ippp: InputDiceWareProps) => {
                // console.log('diced:', dd.password, dp.first.password.value);
                if (
                  (dp.first.password.value.length == 0 &&
                    dp.second.password.value.length == 0) ||
                  (dp.first.password.value == dp.first.prevPassword &&
                    dp.second.password.value == dp.second.prevPassword)
                ) {
                  dp.setPassword(dd.password);
                  dp.setReadableWithTimeout(true, 10000, v => {
                    if (!v) {
                      dp.diceValue._value.set('');
                    }
                    // console.log('readable reset', v);
                  });
                }
              }}
            />
          );
        }}
      />
    );
  }
);
