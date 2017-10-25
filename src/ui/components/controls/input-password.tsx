import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
import StringValue from '../../../model/string-value';
import BooleanValue from '../../../model/boolean-value';
// import { format_date } from '../../../model/helper';

interface InputPasswordState {
  readOnlyTimer: number;
}

interface InputPasswordProps extends React.Props<InputPassword> {
  value: StringValue;
  readonly: boolean;
}

@observer
export class InputPassword extends
  React.Component<InputPasswordProps, InputPasswordState> {

  constructor() {
    super();
    this.state = {
      // readable: false,
      readOnlyTimer: null
    };
    this.lockUnlock = this.lockUnlock.bind(this);
  }

  private lockUnlock(e: any): void {
    if (e) {
      e.preventDefault();
    }
    let readOnlyTimer: NodeJS.Timer = null;
    if (this.state.readOnlyTimer) {
      clearTimeout(this.state.readOnlyTimer);
    }
    if (!this.props.readable) {
      readOnlyTimer = setTimeout(this.lockUnlock, 1000) as any/* no browser api */;
    }
    this.props.readable = true;
    this.setState(Object.assign(this.state, {
      readable: !this.props.readable,
      readOnlyTimer: readOnlyTimer
    }));
  }

  private passwordText(): string {
    if (this.props.readonly) {
      return 'password';
    }
    return !this.props.readable ? 'password' : 'text';
  }

  private renderReadable(): JSX.Element {
    if (this.props.readonly) {
      return;
    }
    return <button className={classnames({
      fa: true,
      'fa-lock': !this.props.readable,
      'fa-unlock': this.props.readable })}
      onClick={this.lockUnlock}
      tabIndex={10000}></button>;
  }

  public render(): JSX.Element {
    return (
      <div>
        <input type={this.passwordText()}
          name={this.props.value.key}
          className={classnames({ good: !this.props.readonly && this.props.value.valid()})}
          readOnly={this.props.readonly}
          disabled={this.props.readonly}
          pattern={this.props.value.match.source}
          value={this.props.value.value}
          placeholder={this.props.value.match.source}
          onChange={(e: any) => {
            this.props.value.value = e.target.value;
          }} />{this.renderReadable()}
      </div>
    );
  }

}

export default InputPassword;
