import * as React from 'react';
import * as KeyGen from '../../../gpg/key-gen';
import KeyGenUid from '../../../gpg/key-gen-uid';
import classnames = require('classnames');
import MultiOption from '../../../model/multi-option';

export interface CreateKeyMultioptionProps<T> {
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
            <label>{v}</label>
            <input
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
                    props.op.values = props.op.values.slice(0, -1);
                  }
                }
                // this.setState(this.state);
              }}
            />
          </span>
        );
      })}
    </div>
  );
}
