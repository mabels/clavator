import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../gpg/boolean-value';
import SimpleYubiKey from '../gpg/simple-yubikey';
import RcCheckWarrents from './rc-check-warrents';
import DateValue from '../gpg/date-value';
import { format_date } from '../gpg/helper';
import PassPhrase from '../gpg/pass-phrase';
import ApprovablePart from '../gpg/approvable-part';
import ApprovableWarrents from '../gpg/approvable-warrents';
import InputPassword from './input-password';

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

  constructor() {
    super();
    this.state = { };
  }

  public renderWarrent(aps: ApprovablePart[], pp: ApprovablePart): JSX.Element {
    if (aps.length == 1) {
      // pp.approved.set(true);
      return null;
    }
    if (pp.regMinMaxWarrent) {
      return <button disabled={pp.approved.value || !pp.valid()}
        onClick={(e) => {
          e.preventDefault();
          pp.approved.set(true);
        }} >{pp.regMinMaxWarrent.warrent.warrent.value}</button>;
    }
    return null;
  }

  private isApproved(part: ApprovablePart): boolean {
    if (!this.props.approvedWarrents) {
      return true;
    }
    if (part.approved.value) {
      console.log('isApproved:Part', part.regMinMaxWarrent.warrent.warrent.value);
      return false;
    }
    // this.props.approvedWarrents.completed(); // WTF update single approved
    const warrent = part.regMinMaxWarrent.warrent.warrent;
    // console.log('isApproved', this.props.approvedWarrents, warrent.value);
    return !!this.props.approvedWarrents.find(t => {
      return warrent.value === t.warrent.warrent.value && t.approved.value;
    });
  }

  public render(): JSX.Element {
    console.log('input-pass-phrase:', this.props.passPhrase.completed());
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
          let readonly = this.props.readonly || !this.isApproved(pp);
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
            {this.renderWarrent(this.props.passPhrase.parts, pp)}
          </div>;
        })}
      </div>
    </div>;
  }

}

export default InputPassPhrase;
