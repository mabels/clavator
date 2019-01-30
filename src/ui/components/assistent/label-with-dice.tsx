import * as React from 'react';
import { observer } from 'mobx-react';

import { RcOption } from '../controls';
import { PassPhrase } from '../../model';
import { Option, NestedFlag } from '../../../model';
import { DiceWare } from '../../../dice-ware';
import { action } from 'mobx';
import { Button } from '@material-ui/core';

export interface LabelWithDiceProps {
  readonly label: string | JSX.Element;
  readonly passPhrase: PassPhrase;
  readonly diceWares: DiceWare[];
  readonly readOnly: NestedFlag;
}

function diceAll(props: LabelWithDiceProps): void {
  props.passPhrase.doublePasswords.forEach(dp => dp.inputDiceWare.randomDice());
}

export const LabelWithDice = observer(
  (props: LabelWithDiceProps): JSX.Element => {
    let diceWareOption: string | JSX.Element = '';
    if (props.diceWares.length == 1) {
      diceWareOption = `[${props.diceWares[0].fname}]`;
      props.passPhrase.doublePasswords.forEach(dp =>
        dp.selectDiceWare(props.diceWares[0].fname)
      );
    }
    if (props.diceWares.length > 1) {
      const fnames = props.diceWares.map(dw => dw.fname);
      diceWareOption = (
        <RcOption
          onChange={action((fname: string) => {
            console.log('Switch:DiceWare:', fname);
            props.passPhrase.doublePasswords.forEach(dp =>
              dp.selectDiceWare(fname)
            );
          })}
          name="DiceWare.Fname"
          label=""
          option={new Option(fnames[0], fnames, '')}
          readOnly={props.readOnly}
        />
      );
    }
    if (props.passPhrase.warrents.length > 1) {
      return props.label as JSX.Element;
    }
    return (
      <span>
        {props.label}
        {diceWareOption}
        <Button className="fa fa-random" onClick={action(() => diceAll(props))} />
      </span>
    );
  }
);
