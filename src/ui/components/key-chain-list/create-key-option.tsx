import * as React from 'react';
// import * as KeyGen from '../../../gpg/key-gen';
import { Option } from '../../../model/option';

export interface CreateKeyOptionProps<T> {
    readonly name: string;
    readonly ops: Option<T>[];
}

export function CreateKeyOption<T>(props: CreateKeyOptionProps<T>): JSX.Element {
    let value = '';
    const ret = props.ops[0].map((s, o) => {
      value = s ? o.toString() : value;
      return (<option key={o.toString()} value={o.toString()}>{o}</option>);
    });
    return (
      <select className="u-full-width" name={name} defaultValue={value} onChange={(e: any) => {
        props.ops.forEach((op) => {
          op.value = e.target.value;
        });
        // this.setState(this.state);
      }}>
       {ret}
      </select>
    );
  }
