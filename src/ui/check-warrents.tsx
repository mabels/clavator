import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import SimpleYubiKey from '../gpg/simple-yubikey';
import BooleanValue from '../gpg/boolean-value';
import Warrent from '../gpg/warrent';

interface CheckWarrentsState {
  checkedWarrents: Warrent[];
}

interface CheckWarrentsProps extends React.Props<CheckWarrents> {
  simpleYubiKey: SimpleYubiKey;
  valid?: boolean;
  readonly: BooleanValue;
}

@observer export class CheckWarrents extends
  React.Component<CheckWarrentsProps, CheckWarrentsState> {

  constructor() {
    super();
    this.state = { checkedWarrents: [] };
  }

  private checkWarrents(i: Warrent): void {
    if (!this.state.checkedWarrents.length) {
      this.props.readonly.set(true);
    }
    this.state.checkedWarrents.push(i);
    this.setState(this.state);
  }

  private renderWarrents(): JSX.Element {
    return <div className={classnames({row: true})} >
      {this.props.simpleYubiKey.warrents.map((i, idx) => {
        const good = !!this.state.checkedWarrents.find(j => i === j);
        const disabled = !this.props.valid;
        {/* console.log('renderWarrents:', good, disabled); */}
        return <button disabled={disabled || good}
                className={classnames({ fail: this.props.valid && !good, good: good })}
                key={i.key} type="button"
                onClick={() => this.checkWarrents(i)}>{i.initial.value}</button>;
      })}
    </div>;
  }

  public render(): JSX.Element {
    return (
      <div className={classnames({good: this.props.valid})} >
        {this.props.children}
        {this.renderWarrents()}
      </div>
    );
  }

}

export default CheckWarrents;
