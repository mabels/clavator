import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
import NestedFlag from '../../../model/nested-flag';
import DateValue from '../../../model/date-value';
import { format_date } from '../../../model/helper';

interface InputExpireDateState {
}

interface InputExpireDateProps extends React.Props<InputExpireDate> {
  title: string;
  expireDate: DateValue;
  readOnly: NestedFlag;
  completed?: boolean;
}

@observer
export class InputExpireDate extends
  React.Component<InputExpireDateProps, InputExpireDateState> {

  constructor(props: InputExpireDateProps) {
    super(props);
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
                 readonly:  this.props.readOnly.is })}
              disabled={this.props.readOnly.is}
              readOnly={this.props.readOnly.is}
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
