import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../../../model/boolean-value';
import SimpleYubiKey from '../../model/simple-yubikey';
import RcCheckWarrents from './rc-check-warrents';
import DateValue from '../../../model/date-value';
import { format_date } from '../../../model/helper';
import PassPhrase from '../../model/pass-phrase';
import ApprovablePart from '../../model/approvable-part';
import ApprovableWarrents from '../../model//approvable-warrents';
import InputPassword from '../controls/input-password';
import { DiceWare, Diced } from '../../../dice-ware/dice-ware';
import InputDiceWare from '../controls/input-dice-ware';
import RcWarrent from './rc-warrent';
import InputPassPhrase from './input-pass-phrase';

class DiceWareInputPassPhraseState {
  @observable public readable: boolean;
}

interface DiceWareInputPassPhraseProps extends React.Props<DiceWareInputPassPhrase> {
  label: string;
  passPhrase: PassPhrase;
  readonly?: boolean;
  approvedWarrents?: ApprovableWarrents;
  diceWare: DiceWare;
}

@observer
export class DiceWareInputPassPhrase extends
  React.Component<DiceWareInputPassPhraseProps, DiceWareInputPassPhraseState> {

  constructor() {
    super();
    this.state = { readable: false };
  }

  private renderRow(pp: ApprovablePart, idx: number): JSX.Element {
    let readonly = this.props.readonly || !InputPassPhrase.isApproved(pp, this.props.approvedWarrents);
    // console.log('renderRow:', this.props.diceWare);
    return <rect key={`p1-${this.props.passPhrase.key}-${idx}`}
      className={classnames({
        four: true,
        readonly: readonly,
        completed: pp.valid() && pp.approved.value,
        columns: true,
        good: pp.valid()
      })} >
      <label>{idx + 1}</label>
      <InputDiceWare readonly={readonly}
                     diceResult={(dd: Diced) => {
                        if (pp.part.value.length == 0 &&
                           pp.verify.value.length == 0) {
                          pp.part.value = dd.part;
                          pp.verify.value = dd.part;
                        }
                     }}
                     diceWare={this.props.diceWare} />
      <InputPassword readonly={readonly} value={pp.part} />
      <InputPassword readonly={readonly} value={pp.verify} />
      <RcWarrent approvablePart={pp}
        approvableWarrents={this.props.approvedWarrents}
        approvableParts={this.props.passPhrase.parts} />
    </rect>;
  }

  public render(): JSX.Element {
    // console.log('input-pass-phrase:', this.props.passPhrase.completed());
    const rows: ApprovablePart[][] = [];
    const elements = 3;
    this.props.passPhrase.parts.forEach((pp, idx) => {
      let row = rows[~~(idx / elements)];
      if (!row) {
        row = [];
        rows.push(row);
      }
      row.push(pp);
    });
    return <div className={classnames({
        DiceWareInputPassPhrase: true,
        completed: this.props.passPhrase.completed(),
        readonly: this.props.readonly ||
                  (this.props.approvedWarrents && this.props.approvedWarrents.non())
    })}>
        <div className="row">
          <label>{this.props.label}:</label>
        </div>
        {rows.map((row, ridx) =>
          <div className="row">
            {row.map((pp, pidx) => this.renderRow(pp, ridx * elements + pidx))}
          </div>
        )}
    </div>;
  }

}

export default DiceWareInputPassPhrase;
