import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';
import StringValue from '../gpg/string-value';
import BooleanValue from '../gpg/boolean-value';
import { format_date } from '../gpg/helper';

interface InputPasswordState {
  readable: boolean;
}

interface InputPasswordProps extends React.Props<InputPassword> {
  value: StringValue;
  readonly: BooleanValue;
}

@observer
export class InputPassword extends
  React.Component<InputPasswordProps, InputPasswordState> {

  constructor() {
    super();
    this.state = { readable: false };
    this.lockUnlock = this.lockUnlock.bind(this);
  }

  private lockUnlock(e: any): void {
    e.preventDefault();
    this.setState(Object.assign(this.state, { readable: !this.state.readable }));
  }

  private passwordText(): string {
    if (this.props.readonly.value) {
      return 'password';
    }
    return !this.state.readable ? 'password' : 'text';
  }

  private renderReadable(): JSX.Element {
    if (this.props.readonly.value) {
      return;
    }
    return <button className={classnames({
      fa: true,
      'fa-lock': !this.state.readable,
      'fa-unlock': this.state.readable })}
      onClick={this.lockUnlock}></button>;
  }

  public render(): JSX.Element {
    return (
      <div>
        <input type={this.passwordText()}
          name={this.props.value.key}
          className={classnames({ good: !this.props.readonly.value && this.props.value.valid()})}
          readOnly={this.props.readonly.value}
          disabled={this.props.readonly.value}
          pattern={this.props.value.match.source}
          onChange={(e: any) => {
            this.props.value.value = e.target.value;
          }} />{this.renderReadable()}
      </div>
    );
  }

}

export default InputPassword;
