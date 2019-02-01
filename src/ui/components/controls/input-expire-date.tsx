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
  readonly title: string;
  readonly expireDate: DateValue;
  readonly readOnly: boolean;
  // completed?: boolean;
}

export const InputExpireDate = observer((props: InputExpireDateProps) => {
    return (
        <InputValid
              label={props.title}
              type={InputType.Date}
              name="expireDate"
              readOnly={props.readOnly}
              // autoComplete="on"
              activeValue={props.expireDate.formatDate}
              // onChange={(e: any) => {
              //   props.expireDate._value.set(new Date(e.target.value));
              // }}
              // defaultValue={props.expireDate.formatDate.get()}
            />
    );
  });
