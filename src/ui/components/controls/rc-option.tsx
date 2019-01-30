import * as React from 'react';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { NestedFlag, Option } from '../../../model';
import { Select, MenuItem } from '@material-ui/core';

interface RcOptionProps<T> {
  name: string;
  label: string;
  option: Option<T>;
  readOnly: NestedFlag;
  onChange?: (val: T) => void;
}

function actionRcOption<T>(props: RcOptionProps<T>): JSX.Element {
    let value = '';
    const ret = props.option.map((s, o) => {
      value = s ? o.toString() : value;
      return (<MenuItem key={o.toString()} disabled={props.readOnly.is} value={o.toString()}>{o}</MenuItem>);
    });
    return (
      <span>
        <label>{props.label}:</label>
        <Select name={props.name}
          className={classnames({ 'u-full-width': true, readonly: props.readOnly.is })}
          disabled={props.readOnly.is}
          value={value}
          onChange={(e: any) => {
            props.option.options.forEach((op) => {
              let murks = op as any;
              if (murks['value']) {
                murks['value'] = e.target.value;
              } else {
                murks = e.target.value;
              }
            });
            if (props.onChange) {
              props.onChange(e.target.value);
            }
          }}>
          {ret}
        </Select>
      </span>
    );
  }

export const RcOption = observer(actionRcOption);
