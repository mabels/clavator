import * as React from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { Diced } from '../../../dice-ware/dice-ware';
import { InputPassPhraseProps } from '../controls';
import { DoublePassword } from '../../model';

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

class InputDiceWareState {
  // @observable public diceValue: StringValue;
}

export interface InputDiceWareProps extends InputPassPhraseProps {
  // value: StringValue;
  // diceWare: DiceWare;
  doublePassword: DoublePassword;
  onDiceResult: (diced: Diced, props: InputDiceWareProps) => void;
  readable: boolean;
}

@observer
export class InputDiceWare extends
  React.Component<InputDiceWareProps, {}> {
  private readonly key: string;

  constructor(props: InputDiceWareProps) {
    super(props);
  }

  private setDice(val: string): void {
    const diceValue = this.props.doublePassword.diceValue;
    diceValue.value = val;
    // this.state.diceValue.setDicedValue(val);
    // console.log('diceWare:1:', this.state.diceValue.dicedValue());
    if (diceValue.valid()) {
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
        <input type="text"
          key={this.key}
          name={this.key}
          className={classnames({ InputDiceWareValue: true })}
          readOnly={this.props.readOnly.is}
          disabled={this.props.readOnly.is}
          value={this.props.doublePassword.diceValue.value}
          pattern={this.props.doublePassword.diceValue.match.source}
          placeholder="enter diced value"
          onChange={(e: any) => this.setDice(e.target.value)} />
        <button className="fa fa-random"
          onClick={this.randomDice}></button>
      </div>
    );
  }

}
