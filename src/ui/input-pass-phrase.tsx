import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import BooleanValue from '../gpg/boolean-value';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';
import DateValue from '../gpg/date-value';
import { format_date } from '../gpg/helper';
import PassPhrase from '../gpg/pass-phrase';
import ApprovablePart from '../gpg/approvable-part';
import InputPassword from './input-password';

class InputPassPhraseState {
}

interface InputPassPhraseProps extends React.Props<InputPassPhrase> {
  label: string;
  passPhrase: PassPhrase;
}

@observer
export class InputPassPhrase extends
  React.Component<InputPassPhraseProps, InputPassPhraseState> {

  constructor() {
    super();
    this.state = {
    };
  }

  public renderWarrent(pp: ApprovablePart): JSX.Element {
    if (pp.warrent) {
      return <button disabled={pp.approved.value || !this.props.passPhrase.valid()}
        onClick={(e) => {
          e.stopPropagation();
          pp.approved.set(true);
        }} >{pp.warrent.initial.value}</button>;
    }
    return null;
  }

  public render(): JSX.Element {
    return <div>
      <div className="row">
        <label>{this.props.label}:</label>
      </div>
      <div className="row">
        {this.props.passPhrase.parts.map((pp, idx) => {
          return <div key={`p1-${this.props.passPhrase.key}-${idx}`}
            className={classnames({
              four: true,
              columns: true,
              good: pp.valid()
            })} >
            <InputPassword readonly={pp.approved} value={pp.part} />
            <InputPassword readonly={pp.approved} value={pp.verify} />
            {this.renderWarrent(pp)}
          </div>;
        })}
      </div>
    </div>;
  }

}

export default InputPassPhrase;
