import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import StringValue from '../../../model/string-value';
// import BooleanValue from '../../../model/boolean-value';
import PasswordControl from '../../model/password-control';
import DoublePassword from '../../model/double-password';

interface InputPasswordState {
  readOnlyTimer: number;
}

interface InputPasswordProps extends React.Props<InputPassword> {
  passwordControl: PasswordControl;
  readonly: boolean;
  doublePassword: DoublePassword;
}

@observer
export class InputPassword extends
  React.Component<InputPasswordProps, InputPasswordState> {

  constructor() {
    super();
    this.state = { readOnlyTimer: null };
    this.lockUnlock = this.lockUnlock.bind(this);
  }

  public componentWillReceiveProps(next: InputPasswordProps): void {
    this.props.passwordControl.readonly = next.readonly;
  }

  private lockUnlock(e: any): void {
    if (e) {
      e.preventDefault();
    }
    let readOnlyTimer: NodeJS.Timer = null;
    if (this.state.readOnlyTimer) {
      clearTimeout(this.state.readOnlyTimer);
    }
    if (!this.props.doublePassword.readable) {
      readOnlyTimer = setTimeout(this.lockUnlock, 2000) as any/* no browser api */;
    }
    this.props.doublePassword.readable = !this.props.doublePassword.readable;
    this.setState(Object.assign(this.state, {
      readOnlyTimer: readOnlyTimer
    }));
  }

  private renderReadable(): JSX.Element {
    if (this.props.passwordControl.readonly) {
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
          className={classnames({ good: !this.props.passwordControl.readonly &&
                                        this.props.passwordControl.valid()})}
          readOnly={this.props.passwordControl.readonly}
          disabled={this.props.passwordControl.readonly}
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

export default InputPassword;
