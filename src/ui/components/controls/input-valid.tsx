import * as React from 'react';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { action, IObservableValue, observable } from 'mobx';
import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton,
  TextField
} from '@material-ui/core';
import Done from '@material-ui/icons/Done';
import { InputProps } from '@material-ui/core/Input';

export enum InputType {
  Text = 'text',
  Password = 'password',
  Date = 'Date',
  Email = 'Email'
}

export const InputTypeObservable  = {
  Text: observable.box(InputType.Text),
  Password: observable.box(InputType.Password),
  Date: observable.box(InputType.Date),
  Email: observable.box(InputType.Email)
};

export interface InputValidProps<T = string | number> extends InputProps {
  readonly label: string;
  readonly activeType?: IObservableValue<InputType>;
  readonly activeValue: IObservableValue<T>;
  readonly value?: string | number;
  readonly name?: string;
  readonly valid?: boolean;
  readonly readOnly?: boolean;
  readonly autoComplete?: 'on' | 'off';
  readonly endAdornment?: React.ReactNode;
  // readonly defaultValue?: string;
  // readonly onChange?: (e: any) => void;
}

export const InputValid = observer((props: InputValidProps) => {
  return (
    <FormControl>
      <InputLabel htmlFor="adornment-password">{props.label}</InputLabel>
      <Input
        {...(props as InputProps)}
        type={props.type || props.activeType.get()}
        name={props.name}
        readOnly={(typeof(props.readOnly) === 'boolean' && props.readOnly)}
        disabled={(typeof(props.readOnly) === 'boolean' && props.readOnly)}
        autoComplete={props.autoComplete || 'on'}
        // defaultValue={props.defaultValue || ''}
        onKeyPress={props.onKeyPress}
        onChange={action((e: any) => {
          if (props.onChange) {
            props.onChange(e);
            return;
          }
          props.activeValue.set(e.target.value);
        })}
        // pattern={props.passwordControl.password.match.source}
        value={props.activeValue.get()}
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
