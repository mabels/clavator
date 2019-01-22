import * as React from 'react';
import classnames from 'classnames';
import {
  NestedFlag
} from '../../../model';
import { KeyParams } from '../../../gpg/types';
import { RcOption } from '../controls';

export interface RcKeyParamsProps {
  // extends React.Props<RcKeyParams> {
  readonly keyParams: KeyParams;
  readonly readOnly: NestedFlag;
  readonly completed: boolean;
}

export function RcKeyParams(props: RcKeyParamsProps): JSX.Element {
  return (
    <div
      className={classnames({
        row: true,
        RcKeyParams: true,
        completed: props.completed
      })}
    >
      <div className="three columns">
        <RcOption
          name="KeyType"
          label="Key-Type"
          option={props.keyParams.type}
          readOnly={props.readOnly}
        />
      </div>
      <div className="three columns">
        <RcOption
          name="MasterKeyLength"
          label="Master-Key-Length"
          option={props.keyParams.masterLen}
          readOnly={props.readOnly}
        />
      </div>
      <div className="three columns">
        <RcOption
          name="SubKeyLength"
          label="Sub-Key-Length"
          option={props.keyParams.subLen}
          readOnly={props.readOnly}
        />
      </div>
    </div>
  );
}
