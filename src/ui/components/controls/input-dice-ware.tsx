import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
import StringValue from '../../../model/string-value';
import BooleanValue from '../../../model/boolean-value';
import { DiceWare, Diced } from '../../../dice-ware/dice-ware';
import { format_date } from '../../../model/helper';

class InputDiceWareState {
  @observable public dicedValue: StringValue;
}

interface InputDiceWareProps extends React.Props<InputDiceWare> {
  // value: StringValue;
  readonly: boolean;
  diceWare: DiceWare;
  diceResult: (diced: Diced) => void;
}

let key = 0;

@observer
export class InputDiceWare extends
  React.Component<InputDiceWareProps, InputDiceWareState> {
  private readonly key: string;

  constructor() {
    super();
    this.state = {
      dicedValue: null
    };
    this.key = `InputDiceWare@${++key}`;
  }

  public componentWillMount(): void {
    this.setState(Object.assign(this.state, {
      dicedValue:
        new StringValue(new RegExp(
            `^[1-6]{${this.props.diceWare.dicesCount()},${this.props.diceWare.dicesCount()}}$`), '')
    }));
  }

  public render(): JSX.Element {
    if (this.props.readonly) {
      return null;
    }
    return (
        <input type="text"
          key={this.key}
          name={this.key}
          className={classnames({ InputDiceWare: true})}
          readOnly={this.props.readonly}
          disabled={this.props.readonly}
          value={this.state.dicedValue.value}
          pattern={`^[1-6]{${this.props.diceWare.dicesCount()},${this.props.diceWare.dicesCount()}}$`}
          placeholder="enter diced value"
          onChange={(e: any) => {
            this.state.dicedValue.value = e.target.value;
            if (this.state.dicedValue.valid()) {
              const diced = this.props.diceWare.dice(this.state.dicedValue.value);
              if (diced) {
                this.props.diceResult(diced);
              }
            }
          }} />
    );
  }

}

export default InputDiceWare;
