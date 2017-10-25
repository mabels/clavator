import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import ApprovableWarrents from '../../model/approvable-warrents';
import ApprovableWarrent from '../../model/approvable-warrent';
import BooleanValue from '../../../model/boolean-value';

interface RcCheckWarrentsState {
}

interface RcCheckWarrentsProps extends React.Props<RcCheckWarrents> {
  approvableWarrents: ApprovableWarrents;
  classNames?: string[];
  valid?: boolean;
  completed?: boolean;
  readonly: BooleanValue;
}

@observer export class RcCheckWarrents extends
  React.Component<RcCheckWarrentsProps, RcCheckWarrentsState> {

  constructor() {
    super();
    this.state = { };
  }

  private checkWarrents(ap: ApprovableWarrent): void {
    if (!this.props.approvableWarrents.valid()) {
      this.props.readonly.set(true);
    }
    ap.approved.set(true);
    // this.state.checkedWarrents.push(i);
    // this.setState(this.state);
  }

  private renderWarrents(): JSX.Element {
    if (this.props.approvableWarrents.length() <= 1) {
      return null;
    }
    return <div className={classnames({row: true})} >
      {this.props.approvableWarrents.map((i, idx) => {
        const good = i.approved.value;
        const disabled = !this.props.valid;
        {/* console.log('renderWarrents:', good, disabled); */}
        return <button disabled={disabled || good}
                className={classnames({ fail: this.props.valid && !good, good: good })}
                key={i.key} type="button"
                onClick={() => this.checkWarrents(i)}>{i.warrent.value()}</button>;
      })}
    </div>;
  }

  public render(): JSX.Element {
    const clazz: any = { good: this.props.valid,
                         completed: this.props.completed };
    if (this.props.classNames) {
      this.props.classNames.forEach(cz => { clazz[cz] = true; });
    }
    return (
      <div className={classnames(clazz)} >
        {this.props.children}
        {this.renderWarrents()}
      </div>
    );
  }

}

export default RcCheckWarrents;
