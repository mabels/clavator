import * as React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import * as classnames from 'classnames';
// import SimpleYubiKey from '../gpg/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
import StringValue from '../../../model/string-value';
// import BooleanValue from '../../../model/boolean-value';
import { DiceWare, Diced } from '../../../dice-ware/dice-ware';
// import { format_date } from '../../../model/helper';
import { InputPassPhraseProps } from '../controls/input-pass-phrase';

class InputDiceWareState {
  @observable public dicedValue: StringValue;
}

export interface InputDiceWareProps extends InputPassPhraseProps {
  // value: StringValue;
  diceWare: DiceWare;
  onDiceResult: (diced: Diced, props: InputDiceWareProps) => void;
}

@observer
export class InputDiceWare extends
  React.Component<InputDiceWareProps, InputDiceWareState> {
  private readonly key: string;

  constructor() {
    super();
    this.state = {
      dicedValue: null
    };
  }

  public componentWillMount(): void {
    this.setState(Object.assign(this.state, {
      dicedValue:
        new StringValue(new RegExp(
            `^[1-6]{${this.props.diceWare.dicesCount()},${this.props.diceWare.dicesCount()}}$`), '')
    }));
  }

  public render(): JSX.Element {
    // if (this.props.passPhrase.readOnly.value) {
    //   return null;
    // }
    return (
        <input type="text"
          key={this.key}
          name={this.key}
          className={classnames({ InputDiceWare: true})}
          readOnly={this.props.passPhrase.readOnly.value}
          disabled={this.props.passPhrase.readOnly.value}
          value={this.state.dicedValue.value}
          pattern={`^[1-6]{${this.props.diceWare.dicesCount()},${this.props.diceWare.dicesCount()}}$`}
          placeholder="enter diced value"
          onChange={(e: any) => {
            this.state.dicedValue.value = e.target.value;
            // console.log('diceWare:1:', this.state.dicedValue.value);
            if (this.state.dicedValue.valid()) {
              const diced = this.props.diceWare.dice(this.state.dicedValue.value);
              // console.log('diceWare:2:', this.state.dicedValue.value, diced);
              if (diced) {
                this.props.onDiceResult(diced, this.props);
              }
            }
          }} />
    );
  }

}

export default InputDiceWare;
