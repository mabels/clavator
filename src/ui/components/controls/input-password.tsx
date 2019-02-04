import * as React from 'react';
import * as uuid from 'uuid';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
// import StringValue from '../../../model/string-value';
import { NestedFlag } from '../../../model';
import { PasswordControl, DoublePassword } from '../../model';
import { action, IObservableValue, observable } from 'mobx';
import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { InputType, InputValid } from './input-valid';

export interface InputPasswordProps extends React.Props<InputPassword> {
  readonly label: string;
  readonly activeValue: IObservableValue<string>;
  readonly name?: string;
  readonly inputType?: IObservableValue<InputType>;
  readonly readOnly?: boolean;
  readonly valid?: boolean;
}

@observer
export class InputPassword extends React.Component<InputPasswordProps, {}> {

  private readonly readable: IObservableValue<boolean>;
  private readonly inputType: IObservableValue<InputType>;
  private readonly readOnly: boolean;
  private readonly valid: boolean;
  private readonly name: string;
  private readableTimer: any = undefined;

  constructor(props: InputPasswordProps) {
    super(props);
    this.readable = observable.box(true);
    this.name = props.name || uuid.v4();
    this.inputType = props.inputType || observable.box(InputType.Password);
    this.readOnly = props.readOnly || false;
    this.valid = props.valid || undefined;
  }

  @action
  private lockUnlock = (e: any): void => {
    if (e) {
      e.preventDefault();
    }
    let timeout = null;
    if (!this.readable.get()) {
      timeout = 2000;
      this.readable.set(true);
      this.inputType.set(InputType.Text);
      this.readableTimer = setTimeout(action(() => {
        this.readable.set(false);
        this.inputType.set(InputType.Password);
        this.readableTimer = undefined;
      }), timeout);
    } else {
      if (this.readableTimer) {
        clearTimeout(this.readableTimer);
      }
      this.readable.set(false);
      this.inputType.set(InputType.Text);
    }

 // @action
  // public setReadableWithTimeout(v: boolean, timeout: number, cb?: (v: boolean) => void): void {
  //   this._readable.set(v);
  //   if (this.readableTimer) {
  //     if (this.readableCb) {
  //       this.readableCb(this.readable);
  //     }
  //     clearTimeout(this.readableTimer);
  //   }
  //   // console.log('setReadableWithTimeout:', v, timeout);
  //   if (timeout) {
  //     this.readableCb = cb;
  //     this.readableTimer = setTimeout(action(() => {
  //       this._readable.set(!v);
  //       if (cb) {
  //         cb(this.readable);
  //       }
  //     }), timeout);
  //   } else {
  //     this._readable.set(v);
  //   }
  // }
    // this.props.doublePassword.setReadableWithTimeout(
    //   !this.props.doublePassword.readable,
    //   timeout
    // );
  }

  public render(): JSX.Element {
    return (
      <FormControl>
        <InputLabel htmlFor={this.props.name}>{this.props.label}</InputLabel>
        <InputValid
          label={this.props.label}
          activeType={this.inputType}
          name={this.props.name}
          readOnly={this.props.readOnly}
          // pattern={this.props.passwordControl.password.match.source}
          activeValue={this.props.activeValue}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="Toggle password visibility"
                onClick={action(this.lockUnlock)}
              >
                {this.inputType.get() === InputType.Text ? (
                  <Visibility />
                ) : (
                  <VisibilityOff />
                )}
              </IconButton>
              {/* {this.valid !== undefined  ? <></> :
                (this.valid ? (
                  <Visibility />
                ) : (
                  <VisibilityOff />
                ))} */}
            </InputAdornment>
          }
        />
      </FormControl>
    );
  }
}
