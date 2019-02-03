import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Diced } from '../../../dice-ware/dice-ware';
import { InputPassPhraseProps, InputValid } from '../controls';
import { DoublePassword } from '../../model';
import { action } from 'mobx';
import { Button } from '@material-ui/core';
import { InputType } from './input-valid';

// class ResetOnUnreadable {
//     private _dicedValue: StringValue;
//     private _currentReadable: boolean;

//     constructor(reg: RegExp, err: string) {
//       this._dicedValue = new StringValue(reg, err);
//       this._currentReadable = null;
//     }

//     public setDicedValue(v: string): void {
//       this._dicedValue.value = v;
//     }

//     public validDicedValue(): boolean {
//       return this._dicedValue.valid();
//     }

//     public dicedValue(readable?: boolean): string {
//       if (readable !== undefined && !readable && !this._currentReadable) {
//         // this._dicedValue.value = '';
//         return '';
//       }
//       this._currentReadable = readable;
//       return this._dicedValue.value;
//     }

// }

export interface InputDiceWareProps extends InputPassPhraseProps {
  // value: StringValue;
  // diceWare: DiceWare;
  readonly id: string;
  readonly doublePassword: DoublePassword;
  readonly onDiceResult: (diced: Diced, props: InputDiceWareProps) => void;
  readonly readable: boolean;
}

@observer
export class InputDiceWare extends
  React.Component<InputDiceWareProps, {}> {
  // private readonly key: string;

  // constructor(props: InputDiceWareProps) {
  //   super(props);
  // }

  @action
  private setDice(val: string): void {
    const diceValue = this.props.doublePassword.diceValue;
    diceValue._value.set(val);
    // this.state.diceValue.setDicedValue(val);
    // console.log('diceWare:1:', this.state.diceValue.dicedValue());
    if (diceValue.valid) {
      // debugger;
      const diced = this.props.doublePassword.diceWare().dice(diceValue.value);
      // console.log('diceWare:2:', this.state.diceValue.dicedValue(), diced);
      if (diced) {
        this.props.onDiceResult(diced, this.props);
      }
    }
  }

  public randomDice = (): void  => {
    this.setDice('' + this.props.doublePassword.diceWare().randomDice().diced);
  }

  public render(): JSX.Element {
    if (this.props.readOnly.is ||
      !(this.props.doublePassword && this.props.doublePassword.diceWare())) {
      return null;
    }
    // console.log('input-dice-ware:', this.props.doublePassword,
    //   this.props.doublePassword.diceWare,
    //   this.props.doublePassword.diceValue);
    // console.log('input-dice-ware:', this.props.readable,
    //   this.state.resetOnUnreadable.dicedValue(this.props.readable));
    // console.log('input-dice-ware:', this.props.readOnly.is);
    // const diceWare = this.props.doublePassword.diceWare();
    return (
      <div className="InputDiceWare">
        <InputValid
          type={InputType.Text}
          activeValue={this.props.doublePassword.diceValue._value}
          key={this.props.id}
          name={this.props.id}
          // className={classnames({ InputDiceWareValue: true })}
          readOnly={this.props.readOnly.is}
          disabled={this.props.readOnly.is}
          // pattern={this.props.doublePassword.diceValue.match.source}
          label="enter diced value" />
        <Button
          onClick={this.randomDice}>
          random
        </Button>
      </div>
    );
  }

}
