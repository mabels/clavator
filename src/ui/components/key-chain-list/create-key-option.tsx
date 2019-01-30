import * as React from 'react';
import { observer } from 'mobx-react';
import { Option } from '../../../model';
import { MenuItem, Select } from '@material-ui/core';

export interface CreateKeyOptionProps<T> {
  readonly title: string;
  readonly name: string;
  readonly ops: Option<T>[];
}

function actionCreateKeyOption<T>(props: CreateKeyOptionProps<T>): JSX.Element {
  let value = '';
  const ret = props.ops[0].map((s, o) => {
    value = s ? o.toString() : value;
    return (
      <MenuItem key={o.toString()} value={o.toString()}>
        {o}
      </MenuItem>
    );
  });
  return (
    <Select
      title={props.title}
      className="u-full-width"
      name={props.name}
      defaultValue={value}
      onChange={(e: any) => {
        props.ops.forEach(op => {
          op._value.set(e.target.value);
        });
      }}
    >
      {ret}
    </Select>
  );
}

export const CreateKeyOption = observer(actionCreateKeyOption);
