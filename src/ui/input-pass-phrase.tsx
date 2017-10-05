import * as React from 'react';
import * as classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';
import DateValue from '../gpg/date-value';
import { format_date } from '../gpg/helper';
import PassPhrase from '../gpg/pass-phrase';
import Part from '../gpg/part';
import InputPassword from './input-password';

interface InputPassPhraseState {
}

interface InputPassPhraseProps extends React.Props<InputPassPhrase> {
  label: string;
  passPhrase: PassPhrase;
}

@observer export class InputPassPhrase extends
  React.Component<InputPassPhraseProps, InputPassPhraseState> {

  constructor() {
    super();
    this.state = {};
  }

  public renderWarrent(pp: Part): JSX.Element {
    if (pp.warrent) {
      return <button>{pp.warrent.initial.value}</button>;
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
              two: true,
              columns: true,
              good: this.props.passPhrase.valid()
            })} >
            <InputPassword value={pp.part} />
            < br />
            <InputPassword value={pp.verify} />
            < br />
            {this.renderWarrent(pp)}
          </div>;
        })}
      </div>
    </div>;
  }

}

export default InputPassPhrase;
