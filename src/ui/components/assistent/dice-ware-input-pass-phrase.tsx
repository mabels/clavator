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
// import InputPassword from '../controls/input-password';
import { DiceWare, Diced } from '../../../dice-ware/dice-ware';
import { InputDiceWare, InputDiceWareProps } from '../controls/input-dice-ware';
// import RcWarrent from './rc-warrent';
import { InputPassPhrase, InputPassPhraseProps } from '../controls/input-pass-phrase';

class DiceWareInputPassPhraseState {
  // @observable public readable: boolean;
}

interface DiceWareInputPassPhraseProps extends InputPassPhraseProps {
  diceWare: DiceWare;
}

@observer
export class DiceWareInputPassPhrase extends
  React.Component<DiceWareInputPassPhraseProps, DiceWareInputPassPhraseState> {

  constructor() {
    super();
    this.state = { /* readOnly: null */ };
  }

  public render(): JSX.Element {
    // console.log('dice-ware-input-pass-phrase:', this.props.readOnly);
    return <InputPassPhrase
            label={this.props.label}
            passPhrase={this.props.passPhrase}
            readOnly={this.props.readOnly}
            childFactory={(dp: DoublePassword) => {
              // dp.diceWare = this.props.diceWare;
              // const readOnly = new NestedFlag(this.props.readOnly);
              return  <InputDiceWare
                       label={null}
                       readOnly={null}
                       readable={null}
                       doublePassword={dp}
                       passPhrase={this.props.passPhrase}
                       onDiceResult={(dd: Diced, ippp: InputDiceWareProps) => {
                        // console.log('diced:', dd.password, dp.first.password.value);
                        if (
                            (dp.first.password.value.length == 0 &&
                             dp.second.password.value.length == 0) ||
                            (dp.first.password.value == dp.first.dicedPassword &&
                             dp.second.password.value == dp.second.dicedPassword)) {
                          dp.first.dicedPassword = dp.first.password.value = dd.password;
                          dp.setReadableWithTimeout(true, 10000, (v) => {
                            if (!v) {
                              dp.diceValue.value = '';
                            }
                            // console.log('readable reset', v);
                          });
                          dp.second.dicedPassword = dp.second.password.value = dd.password;
                        }
                     }} />;
            }} />;
  }

}

export default DiceWareInputPassPhrase;
