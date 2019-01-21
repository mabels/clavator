import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import {
  ViewWarrents,
  ViewWarrent } from '../../model';

import { NestedFlag } from '../../../model';

export interface RcApproveWarrentsProps {
  viewWarrents: ViewWarrents;
  showWarrents: boolean;
  classNames?: string[];
  valid?: boolean;
  completed?: boolean;
  readOnly: NestedFlag;
  approved?: (ap: ViewWarrent) => void;
  children?: JSX.Element | JSX.Element[];
}

function checkWarrents(ap: ViewWarrent): void {
  // console.log('checkWarrents:', this.props, ap);
  ap._approved.set(true);
  this.props.readOnly.is = true;
  if (this.props.approved) {
    this.props.approved(ap);
  }
}

function Warrents(props: RcApproveWarrentsProps): JSX.Element {
    if (!props.showWarrents) {
      return null;
    }
    return <div className={classnames({
        row: true,
        completed: props.completed || props.viewWarrents.valid()
      })} >
      {props.viewWarrents.map((i, idx) => {
        const good = i.approved;
        const disabled = !props.valid;
        // console.log('renderWarrents:', good, disabled, this.props);
        return <button disabled={disabled || good}
                className={classnames({
                  fail: props.valid && !good,
                  good: good })}
                key={i.objectId()} type="button"
                onClick={() => checkWarrents(i)}>{i.warrent.value()}</button>;
      })}
    </div>;
  }

export const RcApproveWarrents = observer((props: RcApproveWarrentsProps) => {
    const clazz: any = { good: props.valid,
                         completed: props.completed || props.viewWarrents.valid() };
    if (props.classNames) {
      props.classNames.forEach(cz => { clazz[cz] = true; });
    }
    return (
      <div className={classnames(clazz)} >
        {props.children}
        <Warrents {...props} />
      </div>
    );
  });
