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
// import RcWarrent from './rc-warrent';
import { InputPassPhrase, InputPassPhraseProps } from '../controls/input-pass-phrase';

class RandomInputPassPhraseState {
}

interface RandomInputPassPhraseProps extends InputPassPhraseProps {
}

@observer
export class RandomInputPassPhrase extends
  React.Component<RandomInputPassPhraseProps, RandomInputPassPhraseState> {

  // private inputRandoms: JSX.Element[];

  constructor() {
    super();
    this.state = { /* readOnly: null */ };
    this.randomize = this.randomize.bind(this);
  }

  private randomize(e: any): void {
    // console.log('diceAll');
    this.props.passPhrase.doublePasswords.forEach(dp => dp.generateRandom());
  }

  private labelWithRandom(label: string | JSX.Element): string | JSX.Element {
    return <span>{label}<button
      className="fa fa-random"
      onClick={this.randomize}
      ></button></span>;
  }

  public render(): JSX.Element {
    return <InputPassPhrase
            label={this.labelWithRandom(this.props.label)}
            passPhrase={this.props.passPhrase}
            readOnly={this.props.readOnly} />;
  }

}

export default RandomInputPassPhrase;
