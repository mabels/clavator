import * as React from 'react';
import { observer } from 'mobx-react';
import { RcOption } from '../controls';
import { PassPhrase } from '../../model';
import { DiceWare } from '../../../dice-ware';

export interface LabelWithDiceProps {
  readonly label: string | JSX.Element;
  readonly passPhrase: PassPhrase;
  readonly diceWares: DiceWare[];
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
    if (this.props.diceWares.length > 1) {
      const fnames = props.diceWares.map(dw => dw.fname);
      diceWareOption = (
        <RcOption
          onChange={(fname: string) => {
            console.log('Switch:DiceWare:', fname);
            props.passPhrase.doublePasswords.forEach(dp =>
              dp.selectDiceWare(fname)
            );
          }}
          name="DiceWare.Fname"
          label=""
          option={new Option(fnames[0], fnames, '')}
          readOnly={this.props.readOnly}
        />
      );
    }
    if (props.passPhrase.warrents.length() > 1) {
      return label;
    }
    return (
      <span>
        {label}
        {diceWareOption}
        <button className="fa fa-random" onClick={this.diceAll} />
      </span>
    );
  }
);
