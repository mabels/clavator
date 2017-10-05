import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import SimpleYubiKey from '../gpg/simple-yubikey';
import CheckWarrents from './check-warrents';
import StringValue from '../gpg/string-value';
import { format_date } from '../gpg/helper';

interface InputPasswordState {
  readable: boolean;
}

interface InputPasswordProps extends React.Props<InputPassword> {
  value: StringValue;
}

@observer export class InputPassword extends
  React.Component<InputPasswordProps, InputPasswordState> {

  constructor() {
    super();
    this.state = { readable: false };
    this.lockUnlock = this.lockUnlock.bind(this);
  }

  private lockUnlock(): void {
    this.setState(Object.assign(this.state, { readable: !this.state.readable }));
  }

  private passwordText(): string {
    return !this.state.readable ? 'password' : 'text';
  }

  public render(): JSX.Element {
    return (
      <div className="row">
        <input type={this.passwordText()}
          name={this.props.value.key} required={true}
          pattern={this.props.value.match.source}
          className={classnames({ good: this.props.value.valid() })}
          onChange={(e: any) => {
            this.props.value.value = e.target.value;
            console.log('part', this.props.value.value, this.props.value.valid());
            {/* this.setState(this.state); */}
          }} /><button><i className={classnames({
            fa: true,
            'fa-lock': !this.state.readable,
            'fa-unlock': this.state.readable })}
            onClick={this.lockUnlock}></i></button>
      </div>
    );
  }

}

export default InputPassword;
