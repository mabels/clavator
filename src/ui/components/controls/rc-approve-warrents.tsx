import * as React from 'react';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
import ViewWarrents from '../../model/view-warrents';
import ViewWarrent from '../../model/view-warrent';
// import BooleanValue from '../../../model/boolean-value';

interface RcApproveWarrentsState {
}

interface RcApproveWarrentsProps extends React.Props<RcApproveWarrents> {
  viewWarrents: ViewWarrents;
  showWarrents: boolean;
  classNames?: string[];
  valid?: boolean;
  completed?: boolean;
  readonly?: boolean;
}

@observer export class RcApproveWarrents extends
  React.Component<RcApproveWarrentsProps, RcApproveWarrentsState> {

  constructor() {
    super();
    this.state = { };
  }

  private checkWarrents(ap: ViewWarrent): void {
    console.log('checkWarrents:', this.props, ap);
    // if (!this.props.viewWarrents.valid()) {
    //   // this.props.readonly = true;
    // }
    ap.approved = true;
    // this.state.checkedWarrents.push(i);
    // this.setState(this.state);
  }

  private renderWarrents(): JSX.Element {
    if (!this.props.showWarrents) {
      return null;
    }
    return <div className={classnames({
        row: true,
        completed: this.props.completed || this.props.viewWarrents.valid()
      })} >
      {this.props.viewWarrents.map((i, idx) => {
        const good = i.approved;
        const disabled = !this.props.valid;
        // console.log('renderWarrents:', good, disabled, this.props);
        return <button disabled={disabled || good}
                className={classnames({
                  fail: this.props.valid && !good,
                  good: good })}
                key={i.objectId()} type="button"
                onClick={() => this.checkWarrents(i)}>{i.warrent.value()}</button>;
      })}
    </div>;
  }

  public render(): JSX.Element {
    const clazz: any = { good: this.props.valid,
                         completed: this.props.completed || this.props.viewWarrents.valid() };
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

export default RcApproveWarrents;
