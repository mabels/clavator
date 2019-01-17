import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import {
  NestedFlag,
  DateValue,
 format_date } from '../../../model';

export interface InputExpireDateProps {
  title: string;
  expireDate: DateValue;
  readOnly: NestedFlag;
  completed?: boolean;
}

export const InputExpireDate = observer((props: InputExpireDateProps) => {
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
                props.expireDate.value = new Date(e.target.value);
              }}
              defaultValue={format_date(this.props.expireDate.value)}
            />
          </div>
        </div>
    );
  });
