import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
// import BooleanValue from '../../../model/boolean-value';
import DateValue from '../../../model/date-value';
import { format_date } from '../../../model/helper';

interface InputExpireDateState {
}

interface InputExpireDateProps extends React.Props<InputExpireDate> {
  title: string;
  expireDate: DateValue;
  readonly?: boolean;
  completed?: boolean;
}

@observer
export class InputExpireDate extends
  React.Component<InputExpireDateProps, InputExpireDateState> {

  constructor() {
    super();
    this.state = { };
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({row: true, completed: this.props.completed})}>
          <div className="three columns">
            <label>{this.props.title}:</label><input type="date" name="expireDate"
              className={classnames({
                 InputExpireDate: true,
                 good: this.props.expireDate.valid(),
                 readonly:  this.props.readonly })}
              disabled={this.props.readonly}
              readOnly={this.props.readonly}
              autoComplete="on"
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
