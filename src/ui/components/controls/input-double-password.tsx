import * as React from 'react';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
import classnames from 'classnames';
// import StringValue from '../../../model/string-value';
import { NestedFlag } from '../../../model';
import { PasswordControl, DoublePassword } from '../../model';
import { action, IObservableValue } from 'mobx';
import {
  FormControl,
  InputLabel,
  Input,
  InputAdornment,
  IconButton
} from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { InputPassword } from './input-password';

interface InputDoublePasswordProps extends React.Props<InputDoublePassword> {
  readonly label: string;
  readonly passwordControl: PasswordControl;
  readonly readOnly: IObservableValue<boolean>;
  readonly doublePassword: DoublePassword;
  readonly onReadable?: (readable: boolean) => void;
}

@observer
export class InputDoublePassword extends React.Component<InputDoublePasswordProps, {}> {
  constructor(props: InputDoublePasswordProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <InputPassword
        label={this.props.label}
        inputType={this.props.doublePassword.passwordInputType}
        value={this.props.passwordControl.password._value}
        readOnly={this.props.readOnly}
      />
      // <FormControl>
      //   <InputLabel htmlFor="adornment-password">{this.props.label}</InputLabel>
      //   <Input
      //     type={this.props.doublePassword.passwordInputType()}
      //     name={this.props.passwordControl.objectId()}
      //     className={classnames({
      //       good: !this.props.readOnly.is && this.props.passwordControl.valid()
      //     })}
      //     readOnly={this.props.readOnly.is}
      //     disabled={this.props.readOnly.is}
      //     // pattern={this.props.passwordControl.password.match.source}
      //     value={this.props.passwordControl.password.value}
      //     placeholder={this.props.passwordControl.password.match.source}
      //     endAdornment={
      //       <InputAdornment position="end">
      //         <IconButton
      //           aria-label="Toggle password visibility"
      //           onClick={action(this.lockUnlock)}
      //         >
      //           {this.props.doublePassword.passwordInputType() === 'text' ? (
      //             <Visibility />
      //           ) : (
      //             <VisibilityOff />
      //           )}
      //         </IconButton>
      //       </InputAdornment>
      //     }
      //   />
      // </FormControl>
    );
  }
}
