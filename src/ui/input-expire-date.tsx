import * as React from 'react';
import * as classnames from 'classnames';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';
import DateValue from '../gpg/date-value';
import { format_date } from '../gpg/helper';

interface InputExpireDateState {
}

interface InputExpireDateProps extends React.Props<InputExpireDate> {
  title: string;
  expireDate: DateValue;
}

export class InputExpireDate extends
  React.Component<InputExpireDateProps, InputExpireDateState> {

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    return (
      <div className="row">
          <div className="three columns">
            <label>{this.props.title}:</label><input type="date" name="expireDate"
              className={classnames({ good: this.props.expireDate.valid() })}
              autoComplete="on"
              required={true}
              min={Date.now()}
              onChange={(e: any) => {
                this.props.expireDate.value = new Date(e.target.value);
                this.setState(this.state);
              }}
              defaultValue={format_date(this.props.expireDate.value)}
            />
          </div>
        </div>
    );
  }

}

export default InputExpireDate;
