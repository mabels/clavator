import * as React from 'react';
import { MultiOption } from '../../../model';
import { Input, Checkbox, FormGroup } from '@material-ui/core';
import { action } from 'mobx';
import { observer } from 'mobx-react';

export interface CreateKeyMultioptionProps<T> {
  readonly title: string;
  readonly name: string;
  readonly op: MultiOption<T>;
}

function actionCreateKeyMultioption<T>(
  props: CreateKeyMultioptionProps<T>
): JSX.Element {
  // <input type='checkbox' name={name} value={v} {s?'checked':''}>{v}</input>)}
  return (
    <div>
      {props.op.map((s: boolean, v: T, i: number) => {
        return (
            <Checkbox
              key={i}
              title={v.toString()}
              className="u-full-width"
              type="checkbox"
              checked={s}
              name={name}
              value={v.toString()}
              onChange={action((e: any) => {
                const ofs = props.op.values.findIndex(a => a == v);
                console.log('create-key-multioption:', e.target.checked, props.op.values);
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
              })}
            />
        );
      })}
    </div>
  );
}

export const CreateKeyMultioption = observer(actionCreateKeyMultioption);
