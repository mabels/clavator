import * as React from 'react';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { action, IObservableValue, observable } from 'mobx';
import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import Done from '@material-ui/icons/Done';

export enum InputType {
  Text = 'text',
  Password = 'password',
  Date = 'Date',
  Email = 'Email'
}

export interface InputValidProps<T = void> {
  readonly label: string;
  readonly value: IObservableValue<string>;
  readonly type: IObservableValue<InputType>;
  readonly name?: string;
  readonly valid?: boolean;
  readonly readOnly?: boolean;
  readonly autoComplete?: 'on' | 'off';
  readonly endAdornment?: React.ReactNode;
  readonly defaultValue?: string;
  readonly onChange?: (e: any) => void;
}

export const InputValid = observer((props: InputValidProps) => {
  return (
    <FormControl>
      <InputLabel htmlFor="adornment-password">{props.label}</InputLabel>
      <Input
        type={props.type.get()}
        name={props.name}
        readOnly={(typeof(props.readOnly) === 'boolean' && props.readOnly)}
        disabled={(typeof(props.readOnly) === 'boolean' && props.readOnly)}
        autoComplete={props.autoComplete || 'on'}
        defaultValue={props.defaultValue || ''}
        onChange={props.onChange}
        // pattern={props.passwordControl.password.match.source}
        value={props.value}
        endAdornment={
          <>
            {props.endAdornment}
            <InputAdornment position="end">
              {!!props.valid &&
                (props.valid !== undefined ? (
                  <></>
                ) : props.valid ? (
                  <Done />
                ) : (
                  <></>
                ))}
            </InputAdornment>
          </>
        }
      />
    </FormControl>
  );
});
