import * as React from 'react';
import { MultiOption } from '../../../model';
import { Input, Checkbox } from '@material-ui/core';

export interface CreateKeyMultioptionProps<T> {
  readonly title: string;
  readonly name: string;
  readonly op: MultiOption<T>;
}

export function CreateKeyMultioption<T>(
  props: CreateKeyMultioptionProps<T>
): JSX.Element {
  // <input type='checkbox' name={name} value={v} {s?'checked':''}>{v}</input>)}
  return (
    <div>
      {props.op.map((s: boolean, v: T) => {
        return (
          <span
            key={v.toString()}
            style={{ marginRight: '0.2em', float: 'left' }}
          >
            <Checkbox
              title={v.toString()}
              className="u-full-width"
              type="checkbox"
              checked={s}
              name={name}
              value={v.toString()}
              onChange={(e: any) => {
                const ofs = props.op.values.findIndex(a => a == v);
                if (e.target.checked) {
                  if (ofs < 0) {
                    props.op.values.push(v);
                    // console.log('add_value', v, e.target.checked, op.values, this.state.keyGen.keyUsage);
                  }
                } else {
                  if (ofs >= 0) {
                    props.op.values[ofs] =
                      props.op.values[props.op.values.length - 1];
                    props.op.values.replace(props.op.values.slice(0, -1));
                  }
                }
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
