import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';

import {
  NestedFlag,
  DateValue,
 format_date } from '../../../model';
import { FormControl, InputLabel } from '@material-ui/core';
import { InputValid, InputType } from './input-valid';
import { IObservable, IObservableValue, observable } from 'mobx';

export interface InputExpireDateProps {
  title: string;
  expireDate: DateValue;
  readOnly: IObservableValue<boolean>;
  // completed?: boolean;
}

const DateInputType = observable.box(InputType.Date);

export const InputExpireDate = observer((props: InputExpireDateProps) => {
    return (
        <InputValid
              label={props.title}
              type={DateInputType}
              name="expireDate"
              readOnly={props.readOnly}
              autoComplete="on"
              value={props.expireDate.value}
              // onChange={(e: any) => {
              //   props.expireDate._value.set(new Date(e.target.value));
              // }}
              defaultValue={props.expireDate.formatDate}
            />
    );
  });
