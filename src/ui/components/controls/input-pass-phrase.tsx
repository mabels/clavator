import * as React from 'react';
import * as classnames from 'classnames';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import BooleanValue from '../../../model/boolean-value';
// import SimpleYubiKey from '../../model/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
import NestedFlag from '../../../model/nested-flag';
// import { format_date } from '../../../model/helper';
import PassPhrase from '../../model/pass-phrase';
import DoublePassword from '../../model/double-password';
import ViewWarrents from '../../model/view-warrents';
// import InputPassword from '../controls/input-password';
// import RcWarrent from './rc-warrent';
import RcDoublePassword from './rc-double-password';

class InputPassPhraseState {
}

export interface InputPassPhraseProps extends React.Props<InputPassPhrase> {
  label: string;
  passPhrase: PassPhrase;
  elementsPerRow?: number;
  readOnly: NestedFlag;
  approvedWarrents?: ViewWarrents;
  childFactory?: (dp: DoublePassword, idx: number) => JSX.Element;
}

@observer
export class InputPassPhrase extends
  React.Component<InputPassPhraseProps, InputPassPhraseState> {

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    const rows: DoublePassword[][] = [];
    const elements = this.props.elementsPerRow || 3;
    this.props.passPhrase.doublePasswords.forEach((pp, idx) => {
      let row = rows[~~(idx / elements)];
      if (!row) {
        row = [];
        rows.push(row);
      }
      row.push(pp);
    });
    console.log('input-pass-phrase:', this.props.readOnly);
    return <div
        key={`InputPassPhrase.${this.props.passPhrase.objectId()}`}
        className={classnames({
          DiceWareInputPassPhrase: true,
          completed: this.props.passPhrase.completed(),
          readonly: this.props.passPhrase.readOnly.value ||
                    (this.props.approvedWarrents && this.props.approvedWarrents.non())
    })}>
        <div className="row">
          <label>{this.props.label}:</label>
        </div>
        {rows.map((row, ridx) =>
          <div key={`${this.props.passPhrase.objectId()}.${ridx}`} className="row">
            {row.map((dp, pidx) => {
              const idx = ridx * elements + pidx;
              console.log('input-pass-phrase:render:', idx);
              return <RcDoublePassword
                readOnly={this.props.readOnly}
                key={`${this.props.passPhrase.objectId()}.${idx}`}
                doublePassword={dp} idx={idx} >
                {this.props.childFactory && this.props.childFactory(dp, idx)}
              </RcDoublePassword>;
            }
            )}
          </div>
        )}
    </div>;
  }

}

export default InputPassPhrase;
