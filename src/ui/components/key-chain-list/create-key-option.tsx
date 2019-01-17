import * as React from 'react';
import { observer } from 'mobx-react';
import { Option } from '../../../model';

export interface CreateKeyOptionProps<T> {
  readonly name: string;
  readonly ops: Option<T>[];
}

function actionCreateKeyOption<T>(props: CreateKeyOptionProps<T>): JSX.Element {
  let value = '';
  const ret = props.ops[0].map((s, o) => {
    value = s ? o.toString() : value;
    return (
      <option key={o.toString()} value={o.toString()}>
        {o}
      </option>
    );
  });
  return (
    <select
      className="u-full-width"
      name={name}
      defaultValue={value}
      onChange={(e: any) => {
        props.ops.forEach(op => {
          op.value = e.target.value;
        });
      }}
    >
      {ret}
    </select>
  );
}

export const CreateKeyOption = observer(actionCreateKeyOption);
