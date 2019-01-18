import * as React from 'react';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
// import StringValue from '../../../model/string-value';
import {
  NestedFlag,
} from '../../../model';
import {
  PasswordControl,
  DoublePassword } from '../../model';

interface InputPasswordProps extends React.Props<InputPassword> {
  passwordControl: PasswordControl;
  readOnly: NestedFlag;
  doublePassword: DoublePassword;
  onReadable?: (readable: boolean) => void;
}

@observer
export class InputPassword extends
  React.Component<InputPasswordProps, {}> {

  constructor(props: InputPasswordProps) {
    super(props);
  }

  private lockUnlock = (e: any): void => {
    if (e) {
      e.preventDefault();
    }
    let timeout = null;
    if (!this.props.doublePassword.readable) {
      timeout = 2000;
    }
    this.props.doublePassword.setReadableWithTimeout(!this.props.doublePassword.readable, timeout);
  }

  private renderReadable(): JSX.Element {
    if (this.props.readOnly.is) {
      return;
    }
    return <button className={classnames({
      fa: true,
      'fa-lock': !this.props.doublePassword.readable,
      'fa-unlock': this.props.doublePassword.readable })}
      onClick={this.lockUnlock}
      tabIndex={10000}></button>;
  }

  public render(): JSX.Element {
    return (
      <div>
        <input type={this.props.doublePassword.passwordInputType()}
          name={this.props.passwordControl.objectId()}
          className={classnames({ good: !this.props.readOnly.is &&
                                        this.props.passwordControl.valid()})}
          readOnly={this.props.readOnly.is}
          disabled={this.props.readOnly.is}
          pattern={this.props.passwordControl.password.match.source}
          value={this.props.passwordControl.password.value}
          placeholder={this.props.passwordControl.password.match.source}
          onChange={(e: any) => {
            this.props.passwordControl.password.value = e.target.value;
          }} />{this.renderReadable()}
      </div>
    );
  }

}
