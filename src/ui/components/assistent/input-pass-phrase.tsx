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
import ApprovableWarrents from '../../model/approvable-warrents';
import InputPassword from '../controls/input-password';
import RcWarrent from './rc-warrent';

class InputPassPhraseState {
}

interface InputPassPhraseProps extends React.Props<InputPassPhrase> {
  label: string;
  passPhrase: PassPhrase;
  readonly?: boolean;
  approvedWarrents?: ApprovableWarrents;
}

@observer
export class InputPassPhrase extends
  React.Component<InputPassPhraseProps, InputPassPhraseState> {

  public static isApproved(part: ApprovablePart, approvedWarrents: ApprovableWarrents): boolean {
    if (!approvedWarrents) {
      return true;
    }
    if (part.approved.value) {
      console.log('isApproved:Part', part.regMinMaxWarrent.warrent.warrent.value);
      return false;
    }
    // this.props.approvedWarrents.completed(); // WTF update single approved
    const warrent = part.regMinMaxWarrent.warrent.warrent;
    // console.log('isApproved', this.props.approvedWarrents, warrent.value);
    return !!approvedWarrents.find(t => {
      return warrent.value === t.warrent.warrent.value && t.approved.value;
    });
  }

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    // console.log('input-pass-phrase:', this.props.passPhrase.completed());
    return <div className={classnames({
        InputPassPhrase: true,
        completed: this.props.passPhrase.completed(),
        readonly: this.props.readonly ||
                  (this.props.approvedWarrents && this.props.approvedWarrents.non())
    })}>
      <div className="row">
        <label>{this.props.label}:</label>
      </div>
      <div className="row">
        {this.props.passPhrase.parts.map((pp, idx) => {
          let readonly = this.props.readonly || !InputPassPhrase.isApproved(pp, this.props.approvedWarrents);
          // if (!readonly && this.props.passPhrase.parts.length > 1) {
          //   readonly = !this.isApproved(pp);
          // }
          // console.log('pass-phrase', readonly, this.props.readonly, this.isApproved(pp), pp.approved.value,
            // pp.regMinMaxWarrent.warrent.warrent.value);
          return <div key={`p1-${this.props.passPhrase.key}-${idx}`}
            className={classnames({
              four: true,
              readonly: readonly,
              completed: pp.valid() && pp.approved.value,
              columns: true,
              good: pp.valid()
            })} >
            <InputPassword readonly={readonly} value={pp.part} />
            <InputPassword readonly={readonly} value={pp.verify} />
            <RcWarrent approvablePart={pp}
              approvableWarrents={this.props.approvedWarrents}
              approvableParts={this.props.passPhrase.parts} />
          </div>;
        })}
      </div>
    </div>;
  }

}

export default InputPassPhrase;
