import * as React from 'react';
// import * as classnames from 'classnames';
// import { observable } from 'mobx';
import { observer } from 'mobx-react';
// import NestedFlag from '../../../model/nested-flag';
// import SimpleYubiKey from '../../model/simple-yubikey';
// import RcCheckWarrents from './rc-check-warrents';
// import DateValue from '../../../model/date-value';
// import { format_date } from '../../../model/helper';
// import PassPhrase from '../../model/pass-phrase';
import DoublePassword from '../../model/double-password';
// import ViewWarrents from '../../model//view-warrents';
import RcOption from '../controls/rc-option';
import Option from '../../../model/option';
import { DiceWare, Diced } from '../../../dice-ware/dice-ware';
import { InputDiceWare, InputDiceWareProps } from '../controls/input-dice-ware';
// import RcWarrent from './rc-warrent';
import { InputPassPhrase, InputPassPhraseProps } from '../controls/input-pass-phrase';

class DiceWareInputPassPhraseState {
  // @observable public readable: boolean;
}

interface DiceWareInputPassPhraseProps extends InputPassPhraseProps {
  diceWares: DiceWare[];
}

@observer
export class DiceWareInputPassPhrase extends
  React.Component<DiceWareInputPassPhraseProps, DiceWareInputPassPhraseState> {

  // private inputDiceWares: JSX.Element[];

  constructor() {
    super();
    this.state = { /* readOnly: null */ };
    this.diceAll = this.diceAll.bind(this);
  }

  private diceAll(e: any): void {
    // console.log('diceAll');
    this.props.passPhrase.doublePasswords.forEach(dp => dp.inputDiceWare.randomDice());
  }

  private labelWithDice(label: string | JSX.Element): string | JSX.Element {
    let diceWareOption: string | JSX.Element = '';
    if (this.props.diceWares.length == 1) {
      diceWareOption = `[${this.props.diceWares[0].fname}]`;
      this.props.passPhrase.doublePasswords.forEach(dp => dp.selectDiceWare(this.props.diceWares[0].fname));
    }
    if (this.props.diceWares.length > 1) {
      const fnames = this.props.diceWares.map(dw => dw.fname);
      diceWareOption = <RcOption
        onChange={(fname: string) => {
          console.log('Switch:DiceWare:', fname);
          this.props.passPhrase.doublePasswords.forEach(dp => dp.selectDiceWare(fname));
        }}
        name="DiceWare.Fname" label=""
        option={new Option(fnames[0], fnames, '')}
        readOnly={this.props.readOnly} />;
    }
    if (this.props.passPhrase.warrents.length() > 1) {
      return label;
    }
    return <span>{label}{diceWareOption}<button
      className="fa fa-random"
      onClick={this.diceAll}
      ></button></span>;
  }

  public render(): JSX.Element {
    // console.log('dice-ware-input-pass-phrase:', this.props.readOnly);
    return <InputPassPhrase
            label={this.labelWithDice(this.props.label)}
            passPhrase={this.props.passPhrase}
            readOnly={this.props.readOnly}
            childFactory={(dp: DoublePassword) => {
              // dp.diceWare = this.props.diceWare;
              // const readOnly = new NestedFlag(this.props.readOnly);
              return <InputDiceWare
                       label={null}
                       readOnly={null}
                       readable={null}
                       doublePassword={dp}
                       ref={(input: InputDiceWare) => { dp.setInputDiceWare(input); }}
                       passPhrase={this.props.passPhrase}
                       onDiceResult={(dd: Diced, ippp: InputDiceWareProps) => {
                        // console.log('diced:', dd.password, dp.first.password.value);
                        if (
                            (dp.first.password.value.length == 0 &&
                             dp.second.password.value.length == 0) ||
                            (dp.first.password.value == dp.first.prevPassword &&
                             dp.second.password.value == dp.second.prevPassword)) {
                          dp.setPassword(dd.password);
                          dp.setReadableWithTimeout(true, 10000, (v) => {
                            if (!v) {
                              dp.diceValue.value = '';
                            }
                            // console.log('readable reset', v);
                          });
                        }
                      }} />;
            }} />;
  }

}

export default DiceWareInputPassPhrase;
