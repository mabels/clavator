import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
import { format_date, NestedFlag, DateValue } from '../../../model';

export interface InputExpireDateProps {
  title: string;
  expireDate: DateValue;
  readOnly: NestedFlag;
  completed?: boolean;
}

export const InputExpireDate = observer((props: InputExpireDateProps) => {
    return (
      <div className={classnames({row: true, completed: props.completed})}>
          <div className="three columns">
            <label>{props.title}:</label><input type="date" name="expireDate"
              className={classnames({
                 InputExpireDate: true,
                 good: props.expireDate.valid(),
                 readonly:  props.readOnly.is })}
              disabled={props.readOnly.is}
              readOnly={props.readOnly.is}
              autoComplete="on"
              min={Date.now()}
              onChange={(e: any) => {
                props.expireDate.value = new Date(e.target.value);
              }}
              defaultValue={format_date(props.expireDate.value)}
            />
          </div>
        </div>
    );
  });
